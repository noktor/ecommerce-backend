import { Cart } from '../../domain/Cart';
import type { EventPublisher } from '../../domain/events/EventPublisher';
import type { CartRepository } from '../../domain/repositories/CartRepository';
import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';
import type { CacheService } from '../../domain/services/CacheService';
import type { LockService } from '../../domain/services/LockService';

export interface AddToCartRequest {
  userId: string;
  productId: string;
  quantity: number;
}

export class AddToCartUseCase {
  private readonly CART_LOCK_TTL = 10;
  private readonly CART_EXPIRY_MINUTES = 15;
  private readonly MAX_RETRY_ATTEMPTS = 5;
  private readonly INITIAL_RETRY_DELAY = 50;
  private readonly MAX_RETRY_DELAY = 500;

  constructor(
    private cartRepository: CartRepository,
    private userRepository: UserRepository,
    private productRepository: ProductRepository,
    private cacheService: CacheService,
    private lockService: LockService,
    private eventPublisher: EventPublisher
  ) {}

  private async acquireLockWithRetry(lockKey: string, ttlSeconds: number): Promise<boolean> {
    for (let attempt = 0; attempt < this.MAX_RETRY_ATTEMPTS; attempt++) {
      const lockAcquired = await this.lockService.acquireLock(lockKey, ttlSeconds);
      if (lockAcquired) return true;
      if (attempt < this.MAX_RETRY_ATTEMPTS - 1) {
        const delay = Math.min(this.INITIAL_RETRY_DELAY * 2 ** attempt, this.MAX_RETRY_DELAY);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    return false;
  }

  async execute(request: AddToCartRequest): Promise<Cart> {
    const lockKey = `cart:${request.userId}`;
    const lockAcquired = await this.acquireLockWithRetry(lockKey, this.CART_LOCK_TTL);

    if (!lockAcquired) {
      throw new Error(
        'Cart is currently being modified by another request. Please try again in a moment.'
      );
    }

    try {
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const product = await this.productRepository.findById(request.productId);
      if (!product) {
        throw new Error('Product not found');
      }
      if (!product.hasStock(request.quantity)) {
        throw new Error(`Insufficient stock. Available: ${product.stock}`);
      }

      let cart = await this.cartRepository.findByUserId(request.userId);

      if (cart && cart.isExpired()) {
        await this.cartRepository.clear(request.userId);
        await this.cacheService.delete(`cart:${request.userId}`);
        cart = null;
      }

      if (!cart) {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.CART_EXPIRY_MINUTES);
        cart = new Cart(this.generateCartId(), request.userId, [], new Date(), expiresAt);
      }

      cart.addItem(request.productId, request.quantity);
      await this.cartRepository.save(cart);

      const cacheTTL = cart.getExpiresInSeconds();
      await this.cacheService.set(`cart:${request.userId}`, cart, cacheTTL);

      await this.eventPublisher.publish('cart.updated', {
        cartId: cart.id,
        userId: cart.userId,
        productId: request.productId,
        quantity: request.quantity,
        action: 'add',
        expiresAt: cart.expiresAt?.toISOString(),
      });

      return cart;
    } finally {
      await this.lockService.releaseLock(lockKey);
    }
  }

  private generateCartId(): string {
    return `CART-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
