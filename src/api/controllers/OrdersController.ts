import { Request, Response, NextFunction } from 'express';
import { CreateOrderUseCase } from '../../application/use-cases/CreateOrderUseCase';
import { OrderRepository } from '../../domain/repositories/OrderRepository';
import { AppError } from '../middleware/errorHandler';

export class OrdersController {
  constructor(
    private createOrderUseCase: CreateOrderUseCase,
    private orderRepository: OrderRepository
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId, items, shippingAddress } = req.body;

      if (!customerId || !items || !shippingAddress) {
        throw new AppError(400, 'Missing required fields: customerId, items, shippingAddress');
      }

      if (!Array.isArray(items) || items.length === 0) {
        throw new AppError(400, 'Items must be a non-empty array');
      }

      const order = await this.createOrderUseCase.execute({
        customerId,
        items,
        shippingAddress
      });

      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const order = await this.orderRepository.findById(id);

      if (!order) {
        throw new AppError(404, 'Order not found');
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
}

