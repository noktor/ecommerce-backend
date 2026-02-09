import { Order } from '../../domain/Order';
import type { OrderRepository } from '../../domain/repositories/OrderRepository';

// Mock implementation
export class MysqlOrderRepository implements OrderRepository {
  private orders: Map<string, Order> = new Map();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter((o) => o.userId === userId);
  }

  async updateStatus(orderId: string, status: Order['status']): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const updatedOrder = new Order(
      order.id,
      order.userId,
      order.items,
      order.total,
      status,
      order.createdAt,
      order.shippingAddress,
      order.guestEmail,
      order.guestName
    );
    this.orders.set(orderId, updatedOrder);
  }
}
