import { Schema, model, type Document, type Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ALL_ROLES, ROLES, type Role } from '@shopswift/shared';
import { applyToJSON } from '../utils/toJSON';

export interface IAddress {
  _id?: Types.ObjectId;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IRefreshToken {
  tokenHash: string;
  jti: string;
  expiresAt: Date;
  userAgent?: string;
  createdAt: Date;
  revokedAt?: Date | null;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  team?: Types.ObjectId | null;
  isApproved: boolean;
  isActive: boolean;
  addresses: IAddress[];
  refreshTokens: IRefreshToken[];
  passwordResetTokenHash?: string | null;
  passwordResetExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

export type IUserModel = Model<IUser>;

const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    tokenHash: { type: String, required: true },
    jti: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { _id: false },
);

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ALL_ROLES, default: ROLES.USER, index: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team', default: null, index: true },
    isApproved: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    addresses: { type: [addressSchema], default: [] },
    refreshTokens: { type: [refreshTokenSchema], default: [], select: false },
    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetExpires: { type: Date, default: null, select: false },
  },
  { timestamps: true },
);

userSchema.pre('validate', function (next) {
  if (this.role === ROLES.RACETEAM) {
    if (!this.team) {
      this.invalidate('team', 'team is required for a raceteam account');
    }
    if (this.isNew) {
      this.isApproved = false;
    }
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

applyToJSON(userSchema, ['password', 'refreshTokens', 'passwordResetTokenHash', 'passwordResetExpires']);

export const User = model<IUser, IUserModel>('User', userSchema);
