/**
 * One-off migration: customers -> users, and customerId -> userId in orders/carts.
 * Run with: pnpm run migrate:customers-to-users
 * Ensure you have a DB backup before running.
 */
import 'dotenv/config';
import { connectToMongoDB, closeMongoDBConnection, getConnection } from './mongodb';

async function migrate() {
  console.log('Starting migration: customers -> users, customerId -> userId...');
  await connectToMongoDB();
  const db = getConnection().db;
  if (!db) throw new Error('No database connection');

  const customers = db.collection('customers');
  const users = db.collection('users');
  const orders = db.collection('orders');
  const carts = db.collection('carts');

  const customerCount = await customers.countDocuments();
  if (customerCount === 0) {
    console.log('No documents in customers collection. Creating empty users collection and updating orders/carts if needed.');
  } else {
    const docs = await customers.find({}).toArray();
    const userDocs = docs.map((d: { role?: string; [k: string]: unknown }) => ({
      ...d,
      role: d.role === 'USER' ? 'CUSTOMER' : d.role,
    }));
    if (userDocs.length > 0) {
      await users.insertMany(userDocs);
      console.log(`Copied ${userDocs.length} documents from customers to users (role USER -> CUSTOMER).`);
    }
  }

  const orderResult = await orders.updateMany(
    { customerId: { $exists: true } },
    [{ $set: { userId: '$customerId' } }, { $unset: 'customerId' }]
  );
  console.log(`Orders: updated ${orderResult.modifiedCount} documents (customerId -> userId).`);

  const cartResult = await carts.updateMany(
    { customerId: { $exists: true } },
    [{ $set: { userId: '$customerId' } }, { $unset: 'customerId' }]
  );
  console.log(`Carts: updated ${cartResult.modifiedCount} documents (customerId -> userId).`);

  if (customerCount > 0) {
    await customers.drop();
    console.log('Dropped customers collection.');
  }

  console.log('Migration completed successfully.');
}

migrate()
  .then(() => closeMongoDBConnection())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
