import type { UserRepository } from '../../domain/repositories/UserRepository';

export interface VerifyEmailInput {
  token: string;
}

export interface VerifyEmailOutput {
  success: boolean;
  message: string;
}

export class VerifyEmailUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: VerifyEmailInput): Promise<VerifyEmailOutput> {
    const user = await this.userRepository.findByVerificationToken(input.token);

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    if (user.isEmailVerified()) {
      return {
        success: true,
        message: 'Email already verified',
      };
    }

    const verifiedUser = user.verifyEmail().clearVerificationToken();
    await this.userRepository.save(verifiedUser);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }
}
