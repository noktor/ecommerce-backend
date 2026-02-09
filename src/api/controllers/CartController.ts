import type { NextFunction, Response } from 'express';
import type { AddToCartUseCase } from '../../application/use-cases/AddToCartUseCase';
import type { RemoveFromCartUseCase } from '../../application/use-cases/RemoveFromCartUseCase';
import type { Cart } from '../../domain/Cart';
import type { CartRepository } from '../../domain/repositories/CartRepository';
import type { CacheService } from '../../domain/services/CacheService';
import type { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class CartController {
  constructor(
    private addToCartUseCase: AddToCartUseCase,
    private removeFromCartUseCase: RemoveFromCartUseCase,
    private cartRepository: CartRepository,
    private cacheService: CacheService
  ) {}

  async getByUserId(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError(401, 'Authentication required');
      }
      const userId = req.userId;
      const cacheKey = `cart:${userId}`;

      const cachedCart = await this.cacheService.get<Cart>(cacheKey);
      if (cachedCart) {
        const cart = {
          ...cachedCart,
          updatedAt: new Date(cachedCart.updatedAt),
          expiresAt: cachedCart.expiresAt ? new Date(cachedCart.expiresAt) : undefined,
        };

        if (cart.expiresAt && new Date() > cart.expiresAt) {
          await this.cartRepository.clear(userId);
          await this.cacheService.delete(cacheKey);
          res.json({
            success: true,
            data: {
              id: null,
              userId,
              items: [],
              updatedAt: new Date(),
            },
          });
          return;
        }

        res.json({
          success: true,
          data: cart,
        });
        return;
      }

      const cart = await this.cartRepository.findByUserId(userId);

      if (!cart) {
        res.json({
          success: true,
          data: {
            id: null,
            userId,
            items: [],
            updatedAt: new Date(),
          },
        });
        return;
      }

      if (cart.isExpired()) {
        await this.cartRepository.clear(userId);
        res.json({
          success: true,
          data: {
            id: null,
            userId,
            items: [],
            updatedAt: new Date(),
          },
        });
        return;
      }

      // Cache the cart with TTL matching expiration
      const cacheTTL = cart.getExpiresInSeconds();
      await this.cacheService.set(cacheKey, cart, cacheTTL);

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError(401, 'Authentication required');
      }

      const { productId, quantity } = req.body;

      if (!productId || !quantity) {
        throw new AppError(400, 'Missing required fields: productId, quantity');
      }

      if (quantity <= 0) {
        throw new AppError(400, 'Quantity must be greater than 0');
      }

      const cart = await this.addToCartUseCase.execute({
        userId: req.userId,
        productId,
        quantity,
      });

      res.status(201).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      // Handle lock acquisition failures with 429 status
      if (error instanceof Error && error.message.includes('currently being modified')) {
        throw new AppError(429, error.message);
      }
      next(error);
    }
  }

  async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError(401, 'Authentication required');
      }

      const { productId } = req.body;

      if (!productId) {
        throw new AppError(400, 'Missing required field: productId');
      }

      const cart = await this.removeFromCartUseCase.execute({
        userId: req.userId,
        productId,
      });

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      // Handle lock acquisition failures with 429 status
      if (error instanceof Error && error.message.includes('currently being modified')) {
        throw new AppError(429, error.message);
      }
      next(error);
    }
  }
}
