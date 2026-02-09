// Load environment variables
import 'dotenv/config';

import { UserModel, UserStatus } from '../models/UserModel';
import { UserRole } from '../../domain/User';
import { ProductModel } from '../models/ProductModel';

export async function seedDatabase(): Promise<void> {
  try {
    const existingProducts = await ProductModel.countDocuments();

    if (existingProducts === 0) {
      const mockProducts = [
        {
          id: '1',
          name: 'Laptop',
          description: 'High-performance laptop',
          price: 999.99,
          stock: 10,
          category: 'Electronics',
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'Mouse',
          description: 'Wireless mouse',
          price: 29.99,
          stock: 50,
          category: 'Electronics',
          createdAt: new Date(),
        },
        {
          id: '3',
          name: 'Keyboard',
          description: 'Mechanical keyboard',
          price: 79.99,
          stock: 30,
          category: 'Electronics',
          createdAt: new Date(),
        },
        {
          id: '4',
          name: 'T-Shirt',
          description: 'Cotton t-shirt',
          price: 19.99,
          stock: 100,
          category: 'Clothing',
          createdAt: new Date(),
        },
        {
          id: '5',
          name: 'Jeans',
          description: 'Blue jeans',
          price: 49.99,
          stock: 75,
          category: 'Clothing',
          createdAt: new Date(),
        },
      ];

      await ProductModel.insertMany(mockProducts);
      console.log('✅ Seeded products collection');
    } else {
      console.log('ℹ️  Products collection already has data, skipping seed');
    }

    // Seed Users
    const existingUsers = await UserModel.countDocuments();

    if (existingUsers === 0) {
      const mockUsers = [
        {
          id: '1',
          email: 'john@example.com',
          name: 'John Doe',
          status: UserStatus.ACTIVE,
          createdAt: new Date(),
          role: UserRole.CUSTOMER,
        },
        {
          id: '2',
          email: 'retailer@example.com',
          name: 'Retailer User',
          status: UserStatus.ACTIVE,
          createdAt: new Date(),
          role: UserRole.RETAILER,
        },
      ];

      await UserModel.insertMany(mockUsers);
      console.log('✅ Seeded users collection');
    } else {
      console.log('ℹ️  Users collection already has data, skipping seed');
    }

    console.log('✅ Database seeding completed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if executed directly
if (require.main === module) {
  import('./mongodb').then(async ({ connectToMongoDB, closeMongoDBConnection }) => {
    try {
      await connectToMongoDB();
      await seedDatabase();
      await closeMongoDBConnection();
      console.log('✅ Database seeding completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    }
  });
}
