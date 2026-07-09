import mongoose, { Schema, Document } from 'mongoose';

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

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Task', default: null },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    dueDate: { type: Date, default: null },
    status: { type: String, enum: ['A_FAIRE', 'EN_COURS', 'BLOQUE', 'TERMINE'], default: 'A_FAIRE' },
    workspaceId: { type: Schema.Types.ObjectId, required: true }
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

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);
