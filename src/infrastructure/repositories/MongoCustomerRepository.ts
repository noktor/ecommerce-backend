import { Customer, CustomerStatus } from '../../domain/Customer';
import { CustomerRepository } from '../../domain/repositories/CustomerRepository';
import { CustomerModel, ICustomer } from '../models/CustomerModel';

export class MongoCustomerRepository implements CustomerRepository {
  private documentToCustomer(doc: ICustomer): Customer {
    return new Customer(
      doc.id,
      doc.email,
      doc.name,
      doc.status as CustomerStatus,
      doc.createdAt
    );
  }

  async findById(id: string): Promise<Customer | null> {
    const doc = await CustomerModel.findOne({ id }).exec();
    return doc ? this.documentToCustomer(doc) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const doc = await CustomerModel.findOne({ email }).exec();
    return doc ? this.documentToCustomer(doc) : null;
  }
}
