import mongoose, { Schema } from 'mongoose';
const taskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    dueDate: { type: Date, default: null },
    status: { type: String, enum: ['A_FAIRE', 'EN_COURS', 'BLOQUE', 'TERMINE'], default: 'A_FAIRE' }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    }
});
export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
