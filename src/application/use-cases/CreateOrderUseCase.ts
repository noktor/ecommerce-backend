import type { EventPublisher } from '../../domain/events/EventPublisher';
import { Order, type OrderItem, OrderStatus } from '../../domain/Order';
import type { CartRepository } from '../../domain/repositories/CartRepository';
import type { OrderRepository } from '../../domain/repositories/OrderRepository';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';
import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { CacheService } from '../../domain/services/CacheService';
import type { EmailService } from '../../domain/services/EmailService';

export interface CreateOrderRequest {
  userId?: string | null;
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: string;
  guestEmail?: string;
  guestName?: string;
}

export class CreateOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private userRepository: UserRepository,
    private productRepository: ProductRepository,
    private cartRepository: CartRepository,
    private eventPublisher: EventPublisher,
    private cacheService: CacheService,
    private emailService: EmailService | null
  ) {}

  async execute(request: CreateOrderRequest): Promise<Order> {
    let userId: string | null = null;
    if (request.userId) {
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        throw new Error('User not found');
      }
      if (!user.canPlaceOrder()) {
        throw new Error(`User cannot place orders. Status: ${user.status}`);
      }
      userId = user.id;
    } else {
      if (!request.guestEmail || !request.guestName) {
        throw new Error('Guest email and name are required for guest orders');
      }
      userId = null;
    }

    const orderItems: OrderItem[] = [];
    let total = 0;

    for (const item of request.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (!product.hasStock(item.quantity)) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}`
        );
      }

      const subtotal = product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });
      total += subtotal;
    }

    const order = new Order(
      this.generateOrderId(),
      userId,
      orderItems,
      total,
      OrderStatus.PENDING,
      new Date(),
      request.shippingAddress,
      request.guestEmail,
      request.guestName
    );

    await this.orderRepository.save(order);

    const affectedCategories = new Set<string>();
    for (const item of request.items) {
      const product = await this.productRepository.findById(item.productId);
      if (product) {
        affectedCategories.add(product.category);
      }
      await this.productRepository.updateStock(item.productId, -item.quantity);
      await this.cacheService.delete(`product:${item.productId}`);
    }

    await this.cacheService.delete('products:all');
    for (const category of affectedCategories) {
      await this.cacheService.delete(`products:category:${category}`);
    }

    if (userId) {
      await this.cartRepository.clear(userId);
      await this.cacheService.delete(`cart:${userId}`);
    }

    if (!userId && order.guestEmail && order.guestName && this.emailService) {
      try {
        await this.emailService.sendOrderConfirmationEmail({
          email: order.guestEmail,
          name: order.guestName,
          orderId: order.id,
          total: order.total,
          items: order.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),
          shippingAddress: order.shippingAddress,
        });
      } catch (error) {
        console.error('⚠️  Error sending order confirmation email (non-critical):', error);
      }
    }

    await this.eventPublisher.publishWithRetry('order.created', {
      orderId: order.id,
      userId: order.userId || 'guest',
      total: order.total,
      items: order.items,
      status: order.status,
      guestEmail: order.guestEmail,
      guestName: order.guestName,
    });

    return order;
  }

  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
