import mongoose, { Schema, Document } from 'mongoose';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface IOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IOrder extends Document {
  id: string;
  customerId: string;
  items: IOrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  shippingAddress: string;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  id: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, required: true, index: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: Object.values(OrderStatus), 
    required: true,
    default: OrderStatus.PENDING,
    index: true
  },
  createdAt: { type: Date, default: Date.now },
  shippingAddress: { type: String, required: true }
});

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);

