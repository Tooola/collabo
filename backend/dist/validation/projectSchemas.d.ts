import { z } from 'zod';
export declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["active", "on_hold", "completed", "EN_COURS", "TERMINE", "SUSPENDU"]>>;
    teamId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    teamId: string;
    status: "EN_COURS" | "TERMINE" | "SUSPENDU" | "active" | "on_hold" | "completed";
    description?: string | undefined;
}, {
    name: string;
    teamId: string;
    description?: string | undefined;
    status?: "EN_COURS" | "TERMINE" | "SUSPENDU" | "active" | "on_hold" | "completed" | undefined;
}>;
export declare const updateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "on_hold", "completed", "EN_COURS", "TERMINE", "SUSPENDU"]>>;
    teamId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    teamId?: string | undefined;
    description?: string | undefined;
    status?: "EN_COURS" | "TERMINE" | "SUSPENDU" | "active" | "on_hold" | "completed" | undefined;
}, {
    name?: string | undefined;
    teamId?: string | undefined;
    description?: string | undefined;
    status?: "EN_COURS" | "TERMINE" | "SUSPENDU" | "active" | "on_hold" | "completed" | undefined;
}>;
//# sourceMappingURL=projectSchemas.d.ts.map