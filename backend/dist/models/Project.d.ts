import mongoose, { Document } from 'mongoose';
export interface IProject extends Document {
    name: string;
    description?: string;
    status: 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
    teamId: mongoose.Types.ObjectId;
    workspaceId: mongoose.Types.ObjectId;
    createdAt: Date;
}
export declare const Project: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=Project.d.ts.map