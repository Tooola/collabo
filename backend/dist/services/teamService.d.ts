import { AuthRequest } from '../middlewares/authenticate';
export declare const teamService: {
    getAll(req: AuthRequest): Promise<{
        id: any;
        name: any;
        description: any;
        createdAt: string | null;
        memberCount: any;
        projectCount: any;
    }[]>;
    getById(id: string, req?: AuthRequest): Promise<{
        id: any;
        name: any;
        description: any;
        createdAt: string | null;
        memberCount: any;
        projectCount: any;
    } | null>;
    create(data: {
        name: string;
        description?: string;
    }, req: AuthRequest): Promise<{
        id: any;
        name: any;
        description: any;
        createdAt: string | null;
        memberCount: any;
        projectCount: any;
    }>;
    update(id: string, data: {
        name?: string;
        description?: string;
    }): Promise<{
        id: any;
        name: any;
        description: any;
        createdAt: string | null;
        memberCount: any;
        projectCount: any;
    } | null>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    addMember(teamId: string, userId: string, role?: string): Promise<{
        id: any;
        name: any;
        email: any;
        role: "admin" | "lead" | "dev";
        teamId: any;
        createdAt: string | null;
        updatedAt: string | null;
    } | null>;
    removeMember(teamId: string, userId: string): Promise<{
        id: any;
        name: any;
        email: any;
        role: "admin" | "lead" | "dev";
        teamId: any;
        createdAt: string | null;
        updatedAt: string | null;
    } | null>;
    getMembers(teamId: string, req: AuthRequest): Promise<{
        id: any;
        name: any;
        email: any;
        role: "admin" | "lead" | "dev";
        teamId: any;
        createdAt: string | null;
        updatedAt: string | null;
    }[]>;
};
//# sourceMappingURL=teamService.d.ts.map