import { Order, OrderStatus, OrderItem } from '../../domain/Order';
import { Customer } from '../../domain/Customer';
import { Product } from '../../domain/Product';
import { OrderRepository } from '../../domain/repositories/OrderRepository';
import { CustomerRepository } from '../../domain/repositories/CustomerRepository';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { EventPublisher } from '../../domain/events/EventPublisher';

export interface CreateOrderRequest {
  customerId: string;
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: string;
}

export class CreateOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private customerRepository: CustomerRepository,
    private productRepository: ProductRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(request: CreateOrderRequest): Promise<Order> {
    // Validate customer
    const customer = await this.customerRepository.findById(request.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    if (!customer.canPlaceOrder()) {
      throw new Error(`Customer cannot place orders. Status: ${customer.status}`);
    }

    // Validate products and build order items
    const orderItems: OrderItem[] = [];
    let total = 0;

    for (const item of request.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (!product.hasStock(item.quantity)) {
        throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}`);
      }

      const subtotal = product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal
      });
      total += subtotal;
    }

    // Create order
    const order = new Order(
      this.generateOrderId(),
      customer.id,
      orderItems,
      total,
      OrderStatus.PENDING,
      new Date(),
      request.shippingAddress
    );

    // Save order
    await this.orderRepository.save(order);

    // Update stock (with retry mechanism via events)
    for (const item of request.items) {
      await this.productRepository.updateStock(item.productId, -item.quantity);
    }

    // Publish event with retry
    await this.eventPublisher.publishWithRetry('order.created', {
      orderId: order.id,
      customerId: order.customerId,
      total: order.total,
      items: order.items,
      status: order.status
    });

    return order;
  }

  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

