import { randomUUID } from 'crypto';
import { User, UserRole, UserStatus } from '../../domain/User';
import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { EmailService } from '../../domain/services/EmailService';
import type { PasswordService } from '../../domain/services/PasswordService';

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
  /** Optional role; defaults to customer if not provided or invalid. */
  role?: 'customer' | 'retailer';
}

export interface RegisterUserOutput {
  user: User;
  message: string;
}

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private emailService: EmailService,
    private frontendUrl: string
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const passwordHash = await this.passwordService.hashPassword(input.password);

    const verificationToken = randomUUID();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

    const user = new User(
      randomUUID(),
      input.email,
      input.name,
      UserStatus.ACTIVE,
      new Date(),
      passwordHash,
      [],
      false,
      verificationToken,
      verificationTokenExpiry,
      undefined,
      undefined,
      input.role === 'retailer' ? UserRole.RETAILER : UserRole.CUSTOMER
    );

    const savedUser = await this.userRepository.save(user);

    const verificationUrl = `${this.frontendUrl}/verify-email/${verificationToken}`;
    console.log(`📧 Generating verification email with URL: ${verificationUrl}`);
    console.log(`   Frontend URL from config: ${this.frontendUrl}`);
    await this.emailService.sendVerificationEmail({
      email: savedUser.email,
      name: savedUser.name,
      verificationToken: savedUser.verificationToken!,
      verificationUrl,
    });

    return {
      user: savedUser,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }
}
