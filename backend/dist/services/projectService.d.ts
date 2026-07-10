import { AuthRequest } from '../middlewares/authenticate';
export declare const projectService: {
    getAll(req: AuthRequest): Promise<{
        id: any;
        name: any;
        description: any;
        status: "active" | "on_hold" | "completed";
        teamId: any;
        createdAt: string | null;
        team: {
            id: any;
            name: any;
            description: any;
            createdAt: string | null;
            memberCount: any;
            projectCount: any;
        } | undefined;
    }[]>;
    getById(id: string): Promise<{
        id: any;
        name: any;
        description: any;
        status: "active" | "on_hold" | "completed";
        teamId: any;
        createdAt: string | null;
        team: {
            id: any;
            name: any;
            description: any;
            createdAt: string | null;
            memberCount: any;
            projectCount: any;
        } | undefined;
    } | null>;
    create(data: {
        name: string;
        description?: string;
        teamId: string;
        status?: string;
    }, req: AuthRequest): Promise<{
        id: any;
        name: any;
        description: any;
        status: "active" | "on_hold" | "completed";
        teamId: any;
        createdAt: string | null;
        team: {
            id: any;
            name: any;
            description: any;
            createdAt: string | null;
            memberCount: any;
            projectCount: any;
        } | undefined;
    }>;
    update(id: string, data: {
        name?: string;
        description?: string;
        teamId?: string;
        status?: string;
    }): Promise<{
        id: any;
        name: any;
        description: any;
        status: "active" | "on_hold" | "completed";
        teamId: any;
        createdAt: string | null;
        team: {
            id: any;
            name: any;
            description: any;
            createdAt: string | null;
            memberCount: any;
            projectCount: any;
        } | undefined;
    } | null>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    assertProjectVisible(user: AuthRequest["user"], projectId: string): Promise<any>;
};
//# sourceMappingURL=projectService.d.ts.map