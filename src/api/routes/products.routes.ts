import { Router } from 'express';
import { ProductsController } from '../controllers/ProductsController';

export function createProductsRouter(controller: ProductsController): Router {
  const router = Router();

  router.get('/', (req, res, next) => controller.getAll(req, res, next));
  router.get('/:id', (req, res, next) => controller.getById(req, res, next));

  return router;
}

