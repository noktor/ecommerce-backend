export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  RETAILER = 'RETAILER',
}

export interface PasswordHistory {
  hash: string;
  changedAt: Date;
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly status: UserStatus,
    public readonly createdAt: Date,
    public readonly passwordHash?: string,
    public readonly passwordHistory: PasswordHistory[] = [],
    public readonly emailVerified: boolean = false,
    public readonly verificationToken?: string,
    public readonly verificationTokenExpiry?: Date,
    public readonly resetToken?: string,
    public readonly resetTokenExpiry?: Date,
    public readonly role: UserRole = UserRole.CUSTOMER
  ) {}

  canPlaceOrder(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  canLogin(): boolean {
    return this.status === UserStatus.ACTIVE && this.emailVerified;
  }

  isEmailVerified(): boolean {
    return this.emailVerified;
  }

  verifyEmail(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.status,
      this.createdAt,
      this.passwordHash,
      this.passwordHistory,
      true,
      undefined,
      undefined,
      this.resetToken,
      this.resetTokenExpiry,
      this.role
    );
  }

  withVerificationToken(token: string, expiry: Date): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.status,
      this.createdAt,
      this.passwordHash,
      this.passwordHistory,
      this.emailVerified,
      token,
      expiry,
      this.resetToken,
      this.resetTokenExpiry,
      this.role
    );
  }

  withResetToken(token: string, expiry: Date): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.status,
      this.createdAt,
      this.passwordHash,
      this.passwordHistory,
      this.emailVerified,
      this.verificationToken,
      this.verificationTokenExpiry,
      token,
      expiry,
      this.role
    );
  }

  /**
   * Updates the password and manages password history following security best practices.
   */
  withPasswordHash(passwordHash: string, maxHistorySize: number = 5): User {
    const newHistory: PasswordHistory[] = [];
    if (this.passwordHash) {
      newHistory.push({
        hash: this.passwordHash,
        changedAt: new Date(),
      });
    }
    const existingHistory = this.passwordHistory || [];
    const combinedHistory = [...newHistory, ...existingHistory];
    const trimmedHistory = combinedHistory.slice(0, maxHistorySize - 1);

    return new User(
      this.id,
      this.email,
      this.name,
      this.status,
      this.createdAt,
      passwordHash,
      trimmedHistory,
      this.emailVerified,
      this.verificationToken,
      this.verificationTokenExpiry,
      this.resetToken,
      this.resetTokenExpiry,
      this.role
    );
  }

  clearVerificationToken(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.status,
      this.createdAt,
      this.passwordHash,
      this.passwordHistory,
      this.emailVerified,
      undefined,
      undefined,
      this.resetToken,
      this.resetTokenExpiry,
      this.role
    );
  }

  clearResetToken(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.status,
      this.createdAt,
      this.passwordHash,
      this.passwordHistory,
      this.emailVerified,
      this.verificationToken,
      this.verificationTokenExpiry,
      undefined,
      undefined,
      this.role
    );
  }
}
