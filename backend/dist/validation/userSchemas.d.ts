import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    role: z.ZodEnum<["ADMIN", "LEAD", "DEV", "admin", "lead", "dev"]>;
    teamId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    role: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev";
    password?: string | undefined;
    teamId?: string | null | undefined;
}, {
    name: string;
    email: string;
    role: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev";
    password?: string | undefined;
    teamId?: string | null | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["ADMIN", "LEAD", "DEV", "admin", "lead", "dev"]>>;
    teamId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    password?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
    teamId?: string | null | undefined;
}, {
    password?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
    teamId?: string | null | undefined;
}>;
//# sourceMappingURL=userSchemas.d.ts.map