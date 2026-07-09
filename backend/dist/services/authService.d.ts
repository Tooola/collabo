export declare const authService: {
    login(email: string, password: string): Promise<{
        user: {
            id: any;
            name: any;
            email: any;
            role: "admin" | "lead" | "dev";
            teamId: any;
            createdAt: string | null;
            updatedAt: string | null;
        };
        token: string;
    } | null>;
    register(data: {
        name: string;
        email: string;
        password: string;
        role?: string;
        teamId?: string;
    }): Promise<{
        id: any;
        name: any;
        email: any;
        role: "admin" | "lead" | "dev";
        teamId: any;
        createdAt: string | null;
        updatedAt: string | null;
    }>;
    me(id: string): Promise<{
        id: any;
        name: any;
        email: any;
        role: "admin" | "lead" | "dev";
        teamId: any;
        createdAt: string | null;
        updatedAt: string | null;
    } | null>;
};
//# sourceMappingURL=authService.d.ts.map