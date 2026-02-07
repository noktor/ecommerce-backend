import { Cart } from '../../domain/Cart';
import { Product } from '../../domain/Product';
import { Customer } from '../../domain/Customer';
import { CartRepository } from '../../domain/repositories/CartRepository';
import { CustomerRepository } from '../../domain/repositories/CustomerRepository';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { CacheService } from '../../domain/services/CacheService';
import { LockService } from '../../domain/services/LockService';
import { EventPublisher } from '../../domain/events/EventPublisher';

export interface AddToCartRequest {
  customerId: string;
  productId: string;
  quantity: number;
}

export class AddToCartUseCase {
  private readonly CART_LOCK_TTL = 30; // 30 seconds lock
  private readonly CART_EXPIRY_MINUTES = 15; // Cart expires in 15 minutes (Ticketmaster-style)

  constructor(
    private cartRepository: CartRepository,
    private customerRepository: CustomerRepository,
    private productRepository: ProductRepository,
    private cacheService: CacheService,
    private lockService: LockService,
    private eventPublisher: EventPublisher
  ) {}

  async execute(request: AddToCartRequest): Promise<Cart> {
    const lockKey = `cart:${request.customerId}`;
    const lockAcquired = await this.lockService.acquireLock(lockKey, this.CART_LOCK_TTL);
    
    if (!lockAcquired) {
      throw new Error('Cart is currently being modified by another request. Please try again.');
    }

    try {
      // Validate customer
      const customer = await this.customerRepository.findById(request.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Validate product
      const product = await this.productRepository.findById(request.productId);
      if (!product) {
        throw new Error('Product not found');
      }
      if (!product.hasStock(request.quantity)) {
        throw new Error(`Insufficient stock. Available: ${product.stock}`);
      }

      // Get or create cart
      let cart = await this.cartRepository.findByCustomerId(request.customerId);
      
      // Check if cart expired
      if (cart && cart.isExpired()) {
        // Clear expired cart
        await this.cartRepository.clear(request.customerId);
        const cacheKey = `cart:${request.customerId}`;
        await this.cacheService.delete(cacheKey);
        cart = null;
      }
      
      if (!cart) {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.CART_EXPIRY_MINUTES);
        
        cart = new Cart(
          this.generateCartId(),
          request.customerId,
          [],
          new Date(),
          expiresAt
        );
      }

      // Add item to cart
      cart.addItem(request.productId, request.quantity);

      // Save cart
      await this.cartRepository.save(cart);

      // Cache the cart with TTL matching expiration
      const cacheKey = `cart:${request.customerId}`;
      const cacheTTL = cart.getExpiresInSeconds();
      await this.cacheService.set(cacheKey, cart, cacheTTL);

      // Publish event for cart update
      await this.eventPublisher.publish('cart.updated', {
        cartId: cart.id,
        customerId: cart.customerId,
        productId: request.productId,
        quantity: request.quantity,
        action: 'add',
        expiresAt: cart.expiresAt?.toISOString()
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

