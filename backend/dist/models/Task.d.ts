import mongoose, { Document } from 'mongoose';
export interface ITask extends Document {
    title: string;
    description?: string;
    projectId: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    dueDate?: Date;
    status: 'A_FAIRE' | 'EN_COURS' | 'BLOQUE' | 'TERMINE';
    createdAt: Date;
}
export declare const Task: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=Task.d.ts.map