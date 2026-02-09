import { type NextFunction, Request, type Response } from 'express';
import type { CreateOrderUseCase } from '../../application/use-cases/CreateOrderUseCase';
import type { OrderRepository } from '../../domain/repositories/OrderRepository';
import type { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class OrdersController {
  constructor(
    private createOrderUseCase: CreateOrderUseCase,
    private orderRepository: OrderRepository
  ) {}

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { items, shippingAddress, guestEmail, guestName } = req.body;

      if (!items || !shippingAddress) {
        throw new AppError(400, 'Missing required fields: items, shippingAddress');
      }

      if (!Array.isArray(items) || items.length === 0) {
        throw new AppError(400, 'Items must be a non-empty array');
      }

      let userId: string | null = null;
      if (req.userId) {
        userId = req.userId;
      } else {
        if (!guestEmail || !guestName) {
          throw new AppError(400, 'Guest email and name are required for guest orders');
        }
      }

      const order = await this.createOrderUseCase.execute({
        userId,
        items,
        shippingAddress,
        guestEmail,
        guestName,
      });

      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const order = await this.orderRepository.findById(id);

      if (!order) {
        throw new AppError(404, 'Order not found');
      }

      if (req.userId && order.userId && order.userId !== req.userId) {
        throw new AppError(403, 'Access denied: You do not have permission to view this order');
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}
