import { Router } from 'express';
import { OrdersController } from '../controllers/OrdersController';

export function createOrdersRouter(controller: OrdersController): Router {
  const router = Router();

  router.post('/', (req, res, next) => controller.create(req, res, next));
  router.get('/:id', (req, res, next) => controller.getById(req, res, next));

  return router;
}

