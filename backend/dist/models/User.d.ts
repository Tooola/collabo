import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'ADMIN' | 'LEAD' | 'DEV';
    teamId?: mongoose.Types.ObjectId;
    workspaceId: mongoose.Types.ObjectId;
    otpCode?: string;
    otpExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=User.d.ts.map