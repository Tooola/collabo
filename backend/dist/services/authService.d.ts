export declare const authService: {
    login(email: string, password: string, requestedRole?: string): Promise<{
        error: string;
        requireOtp?: undefined;
    } | {
        requireOtp: boolean;
        error?: undefined;
    } | null>;
    verifyOtp(data: {
        email: string;
        password: string;
        role?: string;
        otp: string;
    }): Promise<{
        error: string;
        user?: undefined;
        token?: undefined;
    } | {
        user: {
            id: any;
            name: any;
            email: any;
            role: "admin" | "lead" | "dev";
            teams: any;
            createdAt: string | null;
            updatedAt: string | null;
        };
        token: string;
        error?: undefined;
    } | null>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    register(data: {
        name: string;
        email: string;
        password: string;
        role?: string;
        teamId?: string;
        workspaceId?: string;
    }): Promise<{
        id: any;
        name: any;
        email: any;
        role: "admin" | "lead" | "dev";
        teams: any;
        createdAt: string | null;
        updatedAt: string | null;
    }>;
    me(id: string): Promise<{
        id: any;
        name: any;
        email: any;
        role: "admin" | "lead" | "dev";
        teams: any;
        createdAt: string | null;
        updatedAt: string | null;
    } | null>;
    refreshToken(id: string): Promise<{
        user: {
            id: any;
            name: any;
            email: any;
            role: "admin" | "lead" | "dev";
            teams: any;
            createdAt: string | null;
            updatedAt: string | null;
        };
        token: string;
    } | null>;
    forgotPassword(email: string): Promise<{
        success: boolean;
    }>;
    resetPassword(data: {
        email: string;
        token: string;
        newPassword: string;
    }): Promise<{
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    }>;
};
//# sourceMappingURL=authService.d.ts.map