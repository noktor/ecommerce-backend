import { randomUUID } from 'crypto';
import { User, UserRole, type UserStatus } from '../../domain/User';
import type { UserRepository } from '../../domain/repositories/UserRepository';
import { UserModel, type IUser } from '../models/UserModel';

export class MongoUserRepository implements UserRepository {
  private documentToUser(doc: IUser): User {
    return new User(
      doc.id,
      doc.email,
      doc.name,
      doc.status as UserStatus,
      doc.createdAt,
      doc.passwordHash,
      doc.passwordHistory || [],
      doc.emailVerified || false,
      doc.verificationToken,
      doc.verificationTokenExpiry,
      doc.resetToken,
      doc.resetTokenExpiry,
      (doc.role as UserRole) || UserRole.CUSTOMER
    );
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findOne({ id }).exec();
    return doc ? this.documentToUser(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).exec();
    return doc ? this.documentToUser(doc) : null;
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const doc = await UserModel.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    }).exec();
    return doc ? this.documentToUser(doc) : null;
  }

  async findByResetToken(token: string): Promise<User | null> {
    const doc = await UserModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    }).exec();
    return doc ? this.documentToUser(doc) : null;
  }

  async save(user: User): Promise<User> {
    const existing = await UserModel.findOne({ id: user.id }).exec();

    if (existing) {
      existing.email = user.email;
      existing.name = user.name;
      existing.status = user.status;
      existing.role = user.role;
      existing.passwordHash = user.passwordHash;
      existing.passwordHistory = user.passwordHistory || [];
      existing.emailVerified = user.emailVerified;
      existing.verificationToken = user.verificationToken;
      existing.verificationTokenExpiry = user.verificationTokenExpiry;
      existing.resetToken = user.resetToken;
      existing.resetTokenExpiry = user.resetTokenExpiry;

      const updated = await existing.save();
      return this.documentToUser(updated);
    } else {
      const newUser = new UserModel({
        id: user.id || randomUUID(),
        email: user.email,
        name: user.name,
        status: user.status,
        role: user.role,
        createdAt: user.createdAt || new Date(),
        passwordHash: user.passwordHash,
        passwordHistory: user.passwordHistory || [],
        emailVerified: user.emailVerified,
        verificationToken: user.verificationToken,
        verificationTokenExpiry: user.verificationTokenExpiry,
        resetToken: user.resetToken,
        resetTokenExpiry: user.resetTokenExpiry,
      });

      const saved = await newUser.save();
      return this.documentToUser(saved);
    }
  }
}
