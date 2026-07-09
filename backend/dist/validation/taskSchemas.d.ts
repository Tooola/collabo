import { z } from 'zod';
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
    assignedTo: z.ZodOptional<z.ZodString>;
    assignedToUserId: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["To Do", "In Progress", "Blocked", "Done", "A_FAIRE", "EN_COURS", "BLOQUE", "TERMINE"]>>;
}, "strip", z.ZodTypeAny, {
    status: "EN_COURS" | "TERMINE" | "A_FAIRE" | "BLOQUE" | "To Do" | "In Progress" | "Blocked" | "Done";
    title: string;
    projectId: string;
    description?: string | undefined;
    assignedTo?: string | undefined;
    dueDate?: string | undefined;
    assignedToUserId?: string | undefined;
}, {
    title: string;
    projectId: string;
    description?: string | undefined;
    status?: "EN_COURS" | "TERMINE" | "A_FAIRE" | "BLOQUE" | "To Do" | "In Progress" | "Blocked" | "Done" | undefined;
    assignedTo?: string | undefined;
    dueDate?: string | undefined;
    assignedToUserId?: string | undefined;
}>;
export declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    assignedTo: z.ZodOptional<z.ZodString>;
    assignedToUserId: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["To Do", "In Progress", "Blocked", "Done", "A_FAIRE", "EN_COURS", "BLOQUE", "TERMINE"]>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    status?: "EN_COURS" | "TERMINE" | "A_FAIRE" | "BLOQUE" | "To Do" | "In Progress" | "Blocked" | "Done" | undefined;
    title?: string | undefined;
    projectId?: string | undefined;
    assignedTo?: string | undefined;
    dueDate?: string | undefined;
    assignedToUserId?: string | undefined;
}, {
    description?: string | undefined;
    status?: "EN_COURS" | "TERMINE" | "A_FAIRE" | "BLOQUE" | "To Do" | "In Progress" | "Blocked" | "Done" | undefined;
    title?: string | undefined;
    projectId?: string | undefined;
    assignedTo?: string | undefined;
    dueDate?: string | undefined;
    assignedToUserId?: string | undefined;
}>;
export declare const updateTaskStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["To Do", "In Progress", "Blocked", "Done", "A_FAIRE", "EN_COURS", "BLOQUE", "TERMINE"]>;
}, "strip", z.ZodTypeAny, {
    status: "EN_COURS" | "TERMINE" | "A_FAIRE" | "BLOQUE" | "To Do" | "In Progress" | "Blocked" | "Done";
}, {
    status: "EN_COURS" | "TERMINE" | "A_FAIRE" | "BLOQUE" | "To Do" | "In Progress" | "Blocked" | "Done";
}>;
//# sourceMappingURL=taskSchemas.d.ts.map