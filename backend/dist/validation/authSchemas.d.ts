import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["admin", "lead", "dev", "ADMIN", "LEAD", "DEV"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
}, {
    email: string;
    password: string;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
}>;
export declare const verifyOtpSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["admin", "lead", "dev", "ADMIN", "LEAD", "DEV"]>>;
    otp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    otp: string;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
}, {
    email: string;
    password: string;
    otp: string;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
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
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
//# sourceMappingURL=authSchemas.d.ts.map