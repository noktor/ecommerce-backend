import { Cart, type CartItem } from '../../domain/Cart';
import type { CartRepository } from '../../domain/repositories/CartRepository';
import { CartModel, type ICart } from '../models/CartModel';

export class MongoCartRepository implements CartRepository {
  private documentToCart(doc: ICart): Cart {
    return new Cart(doc.id, doc.userId, doc.items as CartItem[], doc.updatedAt, doc.expiresAt);
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    const doc = await CartModel.findOne({ userId }).exec();
    return doc ? this.documentToCart(doc) : null;
  }

  async save(cart: Cart): Promise<void> {
    await CartModel.findOneAndUpdate(
      { id: cart.id },
      {
        id: cart.id,
        userId: cart.userId,
        items: cart.items,
        updatedAt: cart.updatedAt,
        expiresAt: cart.expiresAt,
      },
      { upsert: true, new: true }
    ).exec();
  }

  async clear(userId: string): Promise<void> {
    await CartModel.deleteOne({ userId }).exec();
  }
}
