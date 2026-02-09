import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { PasswordService } from '../../domain/services/PasswordService';
import type { TokenService } from '../../domain/services/TokenService';
import { UserRole } from '../../domain/User';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    role: 'customer' | 'retailer';
  };
}

export class LoginUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private requireEmailVerification: boolean = true
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      input.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    if (this.requireEmailVerification && !user.isEmailVerified()) {
      throw new Error('Please verify your email before logging in');
    }

    if (!user.canLogin()) {
      throw new Error('Account is not active or email not verified');
    }

    const roleApi = user.role === UserRole.RETAILER ? 'retailer' : 'customer';
    const token = this.tokenService.generateToken({
      userId: user.id,
      email: user.email,
      role: roleApi,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: roleApi,
      },
    };
  }
}
