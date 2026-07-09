import mongoose, { Document } from 'mongoose';
export interface ITeam extends Document {
    name: string;
    description?: string;
    createdAt: Date;
}
export declare const Team: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=Team.d.ts.map