import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'LEAD' | 'DEV';
  teamId?: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  otpCode?: string;
  otpExpiresAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'LEAD', 'DEV'], default: 'DEV' },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    workspaceId: { type: Schema.Types.ObjectId, required: true },
    otpCode: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
