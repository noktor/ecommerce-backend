import { Router } from 'express';
import { ProductsController } from '../controllers/ProductsController';
import { CartController } from '../controllers/CartController';
import { OrdersController } from '../controllers/OrdersController';
import { createProductsRouter } from './products.routes';
import { createCartRouter } from './cart.routes';
import { createOrdersRouter } from './orders.routes';

export function createApiRouter(
  productsController: ProductsController,
  cartController: CartController,
  ordersController: OrdersController
): Router {
  const router = Router();

  router.use('/products', createProductsRouter(productsController));
  router.use('/cart', createCartRouter(cartController));
  router.use('/orders', createOrdersRouter(ordersController));

  return router;
}

