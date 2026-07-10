import { AuthRequest } from '../middlewares/authenticate';
export declare const userService: {
    getAll(req: AuthRequest): Promise<{
        id: any;
        name: any;
        email: any;
        role: "admin" | "lead" | "dev";
        teamId: any;
        createdAt: string | null;
        updatedAt: string | null;
    }[]>;
    getById(id: string): Promise<{
        id: any;
        name: any;
        email: any;
        role: "admin" | "lead" | "dev";
        teamId: any;
        createdAt: string | null;
        updatedAt: string | null;
    } | null>;
    create(data: {
        name: string;
        email: string;
        password: string;
        role?: string;
        teamId?: string | null;
    }, req: AuthRequest): Promise<{
        id: any;
        name: any;
        email: any;
        role: "admin" | "lead" | "dev";
        teamId: any;
        createdAt: string | null;
        updatedAt: string | null;
    }>;
    update(id: string, data: {
        name?: string;
        email?: string;
        password?: string;
        role?: string;
        teamId?: string | null;
    }): Promise<{
        id: any;
        name: any;
        email: any;
        role: "admin" | "lead" | "dev";
        teamId: any;
        createdAt: string | null;
        updatedAt: string | null;
    } | null>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
};
//# sourceMappingURL=userService.d.ts.map