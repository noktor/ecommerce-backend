import type { UserRepository } from '../../domain/repositories/UserRepository';
import { UserRole } from '../../domain/User';

export interface GetCurrentUserInput {
  userId: string;
}

export interface GetCurrentUserOutput {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  status: string;
  role: 'customer' | 'retailer';
}

export class GetCurrentUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: GetCurrentUserInput): Promise<GetCurrentUserOutput> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      status: user.status,
      role: user.role === UserRole.RETAILER ? 'retailer' : 'customer',
    };
  }
}
