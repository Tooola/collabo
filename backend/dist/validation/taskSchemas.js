"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatusSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    projectId: zod_1.z.string(),
    parentId: zod_1.z.string().optional().nullable(),
    assignedTo: zod_1.z.string().optional(),
    assignedToUserId: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().optional(),
    status: zod_1.z.enum(['To Do', 'In Progress', 'Blocked', 'Done', 'A_FAIRE', 'EN_COURS', 'BLOQUE', 'TERMINE']).default('To Do')
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    projectId: zod_1.z.string().optional(),
    parentId: zod_1.z.string().optional().nullable(),
    assignedTo: zod_1.z.string().optional(),
    assignedToUserId: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().optional(),
    status: zod_1.z.enum(['To Do', 'In Progress', 'Blocked', 'Done', 'A_FAIRE', 'EN_COURS', 'BLOQUE', 'TERMINE']).optional()
});
exports.updateTaskStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['To Do', 'In Progress', 'Blocked', 'Done', 'A_FAIRE', 'EN_COURS', 'BLOQUE', 'TERMINE'])
});
