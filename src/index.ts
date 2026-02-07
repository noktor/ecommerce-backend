// Load environment variables first
import 'dotenv/config';

import { validateEnvironmentVariables } from './infrastructure/config/env-validator';

import { CreateOrderUseCase } from './application/use-cases/CreateOrderUseCase';
import { AddToCartUseCase } from './application/use-cases/AddToCartUseCase';
import { RemoveFromCartUseCase } from './application/use-cases/RemoveFromCartUseCase';
import { GetProductsUseCase } from './application/use-cases/GetProductsUseCase';
import { GetProductByIdUseCase } from './application/use-cases/GetProductByIdUseCase';

import { MongoProductRepository } from './infrastructure/repositories/MongoProductRepository';
import { MongoCustomerRepository } from './infrastructure/repositories/MongoCustomerRepository';
import { MongoOrderRepository } from './infrastructure/repositories/MongoOrderRepository';
import { MongoCartRepository } from './infrastructure/repositories/MongoCartRepository';
import { RabbitMQEventPublisher } from './infrastructure/events/RabbitMQEventPublisher';
import { RedisCacheService } from './infrastructure/cache/RedisCacheService';
import { RedisLockService } from './infrastructure/locks/RedisLockService';
import { connectToMongoDB, closeMongoDBConnection } from './infrastructure/database/mongodb';
import { seedDatabase } from './infrastructure/database/seed';
// Import models to ensure they are registered with Mongoose
import './infrastructure/models/ProductModel';
import './infrastructure/models/CartModel';
import './infrastructure/models/CustomerModel';
import './infrastructure/models/OrderModel';

import { createApp, startServer } from './api/server';

async function main() {
  console.log('🚀 Starting E-commerce Backend with Hexagonal Architecture...\n');

  // Validate environment variables
  try {
    validateEnvironmentVariables();
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }

  // Connect to MongoDB
  try {
    await connectToMongoDB();
    
    // Seed database if needed (only in development)
    if (process.env.NODE_ENV !== 'production') {
      await seedDatabase();
    }
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }

  // Initialize infrastructure
  const productRepository = new MongoProductRepository();
  const customerRepository = new MongoCustomerRepository();
  const orderRepository = new MongoOrderRepository();
  const cartRepository = new MongoCartRepository();
  
  const eventPublisher = new RabbitMQEventPublisher(process.env.RABBITMQ_URL || 'amqp://localhost');
  try {
    await eventPublisher.connect();
  } catch (error) {
    console.warn('Warning: Could not connect to RabbitMQ, continuing with fallback mode');
  }

  const cacheService = new RedisCacheService(process.env.REDIS_URL || 'redis://localhost:6379');
  try {
    await cacheService.connect();
  } catch (error) {
    console.warn('Warning: Could not connect to Redis, continuing with fallback mode');
  }

  const lockService = new RedisLockService(process.env.REDIS_URL || 'redis://localhost:6379');
  try {
    await lockService.connect();
  } catch (error) {
    console.warn('Warning: Could not connect to Redis Lock Service, continuing with fallback mode');
  }

  // Initialize use cases
  const createOrderUseCase = new CreateOrderUseCase(
    orderRepository,
    customerRepository,
    productRepository,
    eventPublisher
  );

  const addToCartUseCase = new AddToCartUseCase(
    cartRepository,
    customerRepository,
    productRepository,
    cacheService,
    lockService,
    eventPublisher
  );

  const removeFromCartUseCase = new RemoveFromCartUseCase(
    cartRepository,
    cacheService,
    lockService,
    eventPublisher
  );

  const getProductsUseCase = new GetProductsUseCase(
    productRepository,
    cacheService
  );

  const getProductByIdUseCase = new GetProductByIdUseCase(
    productRepository,
    cacheService
  );

  // Create Express app
  const app = createApp(
    {
      getProductsUseCase,
      getProductByIdUseCase,
      addToCartUseCase,
      removeFromCartUseCase,
      createOrderUseCase
    },
    {
      cartRepository,
      orderRepository
    },
    {
      cacheService
    }
  );

  // Start server
  const port = parseInt(process.env.PORT || '3000', 10);
  startServer(app, port);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('\n👋 Shutting down...');
    await eventPublisher.close();
    await cacheService.close();
    await lockService.close();
    await closeMongoDBConnection();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down...');
    await eventPublisher.close();
    await cacheService.close();
    await lockService.close();
    await closeMongoDBConnection();
    process.exit(0);
  });
}

// Run the application
main().catch(console.error);
