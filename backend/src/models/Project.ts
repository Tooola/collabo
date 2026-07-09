import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  status: 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
  teamId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['EN_COURS', 'TERMINE', 'SUSPENDU'], default: 'EN_COURS' },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
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

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);
