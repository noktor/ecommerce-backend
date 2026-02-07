import { Router } from 'express';
import { CartController } from '../controllers/CartController';

export function createCartRouter(controller: CartController): Router {
  const router = Router();

  router.get('/:customerId', (req, res, next) => controller.getByCustomerId(req, res, next));
  router.post('/', (req, res, next) => controller.addItem(req, res, next));
  router.delete('/item', (req, res, next) => controller.removeItem(req, res, next));

  return router;
}

