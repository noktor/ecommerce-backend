import type { Cart } from '../Cart';

export interface CartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
  clear(userId: string): Promise<void>;
}
