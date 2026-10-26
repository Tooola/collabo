import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'ADMIN' | 'LEAD' | 'DEV';
    teams: {
        teamId: mongoose.Types.ObjectId;
        role: 'LEAD' | 'DEV';
    }[];
    workspaceId: mongoose.Types.ObjectId;
    otpCode?: string;
    otpExpiresAt?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=User.d.ts.map