import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["admin", "lead", "dev", "ADMIN", "LEAD", "DEV"]>>;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
}, {
    password: string;
    email: string;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
}>;
export declare const verifyOtpSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["admin", "lead", "dev", "ADMIN", "LEAD", "DEV"]>>;
    otp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    otp: string;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
}, {
    password: string;
    email: string;
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
    password: string;
    name: string;
    email: string;
    role?: "ADMIN" | "LEAD" | "DEV" | "admin" | "lead" | "dev" | undefined;
    teamId?: string | undefined;
}, {
    password: string;
    name: string;
    email: string;
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
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    email: z.ZodString;
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    token: string;
    newPassword: string;
}, {
    email: string;
    token: string;
    newPassword: string;
}>;
//# sourceMappingURL=authSchemas.d.ts.map