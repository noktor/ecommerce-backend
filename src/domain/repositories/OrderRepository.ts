import type { Order } from '../Order';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  updateStatus(orderId: string, status: Order['status']): Promise<void>;
}
