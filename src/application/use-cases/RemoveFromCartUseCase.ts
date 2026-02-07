import { Cart } from '../../domain/Cart';
import { CartRepository } from '../../domain/repositories/CartRepository';
import { CacheService } from '../../domain/services/CacheService';
import { LockService } from '../../domain/services/LockService';
import { EventPublisher } from '../../domain/events/EventPublisher';

export interface RemoveFromCartRequest {
  customerId: string;
  productId: string;
}

export class RemoveFromCartUseCase {
  private readonly CART_LOCK_TTL = 30; // 30 seconds lock

  constructor(
    private cartRepository: CartRepository,
    private cacheService: CacheService,
    private lockService: LockService,
    private eventPublisher: EventPublisher
  ) {}

  async execute(request: RemoveFromCartRequest): Promise<Cart> {
    const lockKey = `cart:${request.customerId}`;
    const lockAcquired = await this.lockService.acquireLock(lockKey, this.CART_LOCK_TTL);
    
    if (!lockAcquired) {
      throw new Error('Cart is currently being modified by another request. Please try again.');
    }

    try {
      // Get cart
      let cart = await this.cartRepository.findByCustomerId(request.customerId);
      
      if (!cart) {
        throw new Error('Cart not found');
      }

      // Check if cart expired
      if (cart.isExpired()) {
        throw new Error('Cart has expired. Please add items again.');
      }

      // Check if item exists
      const itemExists = cart.items.some(item => item.productId === request.productId);
      if (!itemExists) {
        throw new Error('Item not found in cart');
      }

      // Remove item
      const updatedItems = cart.removeItem(request.productId);

      // Create updated cart (preserve expiration)
      const updatedCart = new Cart(
        cart.id,
        cart.customerId,
        updatedItems,
        new Date(),
        cart.expiresAt
      );

      // Save cart
      await this.cartRepository.save(updatedCart);

      // Cache the cart with TTL matching expiration
      const cacheKey = `cart:${request.customerId}`;
      const cacheTTL = updatedCart.getExpiresInSeconds();
      await this.cacheService.set(cacheKey, updatedCart, cacheTTL);

      // Publish event for cart update
      await this.eventPublisher.publish('cart.updated', {
        cartId: updatedCart.id,
        customerId: updatedCart.customerId,
        productId: request.productId,
        action: 'remove'
      });

      return updatedCart;
    } finally {
      await this.lockService.releaseLock(lockKey);
    }
  }
}

