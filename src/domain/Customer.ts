export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export class Customer {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly status: CustomerStatus,
    public readonly createdAt: Date
  ) {}

  canPlaceOrder(): boolean {
    return this.status === CustomerStatus.ACTIVE;
  }
}

