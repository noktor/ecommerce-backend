import { Request, Response, NextFunction } from 'express';
import { GetProductsUseCase } from '../../application/use-cases/GetProductsUseCase';
import { GetProductByIdUseCase } from '../../application/use-cases/GetProductByIdUseCase';
import { AppError } from '../middleware/errorHandler';

export class ProductsController {
  constructor(
    private getProductsUseCase: GetProductsUseCase,
    private getProductByIdUseCase: GetProductByIdUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const useCache = req.query.useCache !== 'false';

      const products = await this.getProductsUseCase.execute({
        category,
        useCache
      });

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const useCache = req.query.useCache !== 'false';

      const product = await this.getProductByIdUseCase.execute(id, useCache);

      if (!product) {
        throw new AppError(404, 'Product not found');
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }
}

