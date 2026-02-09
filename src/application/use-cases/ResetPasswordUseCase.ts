import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { EmailService } from '../../domain/services/EmailService';
import type { PasswordService } from '../../domain/services/PasswordService';

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface ResetPasswordOutput {
  success: boolean;
  message: string;
}

const PASSWORD_HISTORY_SIZE = parseInt(process.env.PASSWORD_HISTORY_SIZE || '5', 10);

export class ResetPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private emailService: EmailService
  ) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    const user = await this.userRepository.findByResetToken(input.token);

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    if (user.passwordHash) {
      const isSameAsCurrent = await this.passwordService.verifyPassword(
        input.newPassword,
        user.passwordHash
      );
      if (isSameAsCurrent) {
        throw new Error('New password must be different from your current password');
      }
    }

    if (user.passwordHistory && user.passwordHistory.length > 0) {
      for (const historyEntry of user.passwordHistory) {
        const isSameAsHistory = await this.passwordService.verifyPassword(
          input.newPassword,
          historyEntry.hash
        );
        if (isSameAsHistory) {
          throw new Error(
            `New password must be different from your recent passwords. ` +
              `Please choose a password you have not used in the last ${PASSWORD_HISTORY_SIZE} password changes.`
          );
        }
      }
    }

    const passwordHash = await this.passwordService.hashPassword(input.newPassword);
    const updatedUser = user
      .withPasswordHash(passwordHash, PASSWORD_HISTORY_SIZE)
      .clearResetToken();

    await this.userRepository.save(updatedUser);
    await this.emailService.sendPasswordResetConfirmation(user.email, user.name);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}
