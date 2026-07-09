import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<["ADMIN", "LEAD", "DEV", "admin", "lead", "dev"]>;
    teamId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev";
    teamId?: string | null | undefined;
}, {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev";
    teamId?: string | null | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["ADMIN", "LEAD", "DEV", "admin", "lead", "dev"]>>;
    teamId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    password?: string | undefined;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
    teamId?: string | null | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    password?: string | undefined;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
    teamId?: string | null | undefined;
}>;
//# sourceMappingURL=userSchemas.d.ts.map