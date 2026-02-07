import { Customer, CustomerStatus } from '../../domain/Customer';
import { CustomerRepository } from '../../domain/repositories/CustomerRepository';

// Mock implementation with simulated latency to emulate real database
export class MysqlCustomerRepository implements CustomerRepository {
  private customers: Map<string, Customer> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // Simulate database latency (50-150ms typical for MySQL queries)
  private async simulateLatency(min: number = 50, max: number = 150): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async findById(id: string): Promise<Customer | null> {
    await this.simulateLatency();
    return this.customers.get(id) || null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    await this.simulateLatency();
    return Array.from(this.customers.values()).find(c => c.email === email) || null;
  }

  private initializeMockData(): void {
    const mockCustomers = [
      new Customer('1', 'john@example.com', 'John Doe', CustomerStatus.ACTIVE, new Date()),
      new Customer('2', 'jane@example.com', 'Jane Smith', CustomerStatus.ACTIVE, new Date()),
      new Customer('3', 'bob@example.com', 'Bob Johnson', CustomerStatus.INACTIVE, new Date()),
    ];

    mockCustomers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });
  }
}

