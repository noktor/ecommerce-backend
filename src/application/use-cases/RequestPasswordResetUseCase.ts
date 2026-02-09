import { randomUUID } from 'crypto';
import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { EmailService } from '../../domain/services/EmailService';

export interface RequestPasswordResetInput {
  email: string;
}

export interface RequestPasswordResetOutput {
  success: boolean;
  message: string;
}

export class RequestPasswordResetUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private frontendUrl: string
  ) {}

  async execute(input: RequestPasswordResetInput): Promise<RequestPasswordResetOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    const resetToken = randomUUID();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    const updatedUser = user.withResetToken(resetToken, resetTokenExpiry);
    await this.userRepository.save(updatedUser);

    const resetUrl = `${this.frontendUrl}/reset-password/${resetToken}`;
    await this.emailService.sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetToken,
      resetUrl,
    });

    return {
      success: true,
      message: 'If the email exists, a password reset link has been sent.',
    };
  }
}
