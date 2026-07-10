"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'on_hold', 'completed', 'EN_COURS', 'TERMINE', 'SUSPENDU']).default('active'),
    teamId: zod_1.z.string()
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'on_hold', 'completed', 'EN_COURS', 'TERMINE', 'SUSPENDU']).optional(),
    teamId: zod_1.z.string().optional()
});
