import mongoose, { type Document, Schema } from 'mongoose';
import { UserRole, UserStatus } from '../../domain/User';
export { UserStatus } from '../../domain/User';

export interface IPasswordHistory {
  hash: string;
  changedAt: Date;
}

export interface IUser extends Document {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  createdAt: Date;
  role: UserRole;
  passwordHash?: string;
  passwordHistory?: IPasswordHistory[];
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

const PasswordHistorySchema = new Schema<IPasswordHistory>(
  {
    hash: { type: String, required: true },
    changedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    required: true,
    default: UserStatus.ACTIVE,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true,
    default: UserRole.CUSTOMER,
  },
  createdAt: { type: Date, default: Date.now },
  passwordHash: { type: String, required: false },
  passwordHistory: { type: [PasswordHistorySchema], required: false, default: [] },
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String, required: false, index: true },
  verificationTokenExpiry: { type: Date, required: false },
  resetToken: { type: String, required: false, index: true },
  resetTokenExpiry: { type: Date, required: false },
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
