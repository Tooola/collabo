import mongoose, { Document } from 'mongoose';
export interface ITask extends Document {
    title: string;
    description?: string;
    projectId: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId | null;
    assignedTo?: mongoose.Types.ObjectId;
    dueDate?: Date;
    status: 'A_FAIRE' | 'EN_COURS' | 'BLOQUE' | 'TERMINE';
    workspaceId: mongoose.Types.ObjectId;
    createdAt: Date;
}
export declare const Task: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=Task.d.ts.map