import mongoose, { Schema } from 'mongoose';
const projectSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['EN_COURS', 'TERMINE', 'SUSPENDU'], default: 'EN_COURS' },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true }
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
export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
