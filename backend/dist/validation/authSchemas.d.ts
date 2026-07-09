import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["ADMIN", "LEAD", "DEV", "admin", "lead", "dev"]>>;
    teamId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
    teamId?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
    teamId?: string | undefined;
}>;
//# sourceMappingURL=authSchemas.d.ts.map