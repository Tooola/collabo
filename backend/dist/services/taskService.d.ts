import { AuthRequest } from '../middlewares/authenticate';
export declare const taskService: {
    getAll(req: AuthRequest): Promise<{
        id: any;
        title: any;
        description: any;
        projectId: any;
        assignedToUserId: any;
        dueDate: string | null;
        status: "To Do" | "In Progress" | "Blocked" | "Done";
        createdAt: string | null;
        assignedToUser: {
            id: any;
            name: any;
            email: any;
            role: "admin" | "lead" | "dev";
            teamId: any;
            createdAt: string | null;
            updatedAt: string | null;
        } | null;
    }[]>;
    getByProject(projectId: string, req: AuthRequest): Promise<{
        id: any;
        title: any;
        description: any;
        projectId: any;
        assignedToUserId: any;
        dueDate: string | null;
        status: "To Do" | "In Progress" | "Blocked" | "Done";
        createdAt: string | null;
        assignedToUser: {
            id: any;
            name: any;
            email: any;
            role: "admin" | "lead" | "dev";
            teamId: any;
            createdAt: string | null;
            updatedAt: string | null;
        } | null;
    }[]>;
    getById(id: string): Promise<{
        id: any;
        title: any;
        description: any;
        projectId: any;
        assignedToUserId: any;
        dueDate: string | null;
        status: "To Do" | "In Progress" | "Blocked" | "Done";
        createdAt: string | null;
        assignedToUser: {
            id: any;
            name: any;
            email: any;
            role: "admin" | "lead" | "dev";
            teamId: any;
            createdAt: string | null;
            updatedAt: string | null;
        } | null;
    } | null>;
    create(data: {
        title: string;
        description?: string;
        projectId: string;
        assignedTo?: string;
        assignedToUserId?: string;
        dueDate?: string | Date;
        status?: string;
    }, req: AuthRequest): Promise<{
        id: any;
        title: any;
        description: any;
        projectId: any;
        assignedToUserId: any;
        dueDate: string | null;
        status: "To Do" | "In Progress" | "Blocked" | "Done";
        createdAt: string | null;
        assignedToUser: {
            id: any;
            name: any;
            email: any;
            role: "admin" | "lead" | "dev";
            teamId: any;
            createdAt: string | null;
            updatedAt: string | null;
        } | null;
    }>;
    update(id: string, data: {
        title?: string;
        description?: string;
        projectId?: string;
        assignedTo?: string;
        assignedToUserId?: string;
        dueDate?: string | Date;
        status?: string;
    }, req: AuthRequest): Promise<{
        id: any;
        title: any;
        description: any;
        projectId: any;
        assignedToUserId: any;
        dueDate: string | null;
        status: "To Do" | "In Progress" | "Blocked" | "Done";
        createdAt: string | null;
        assignedToUser: {
            id: any;
            name: any;
            email: any;
            role: "admin" | "lead" | "dev";
            teamId: any;
            createdAt: string | null;
            updatedAt: string | null;
        } | null;
    }>;
    updateStatus(id: string, status: string, req: AuthRequest): Promise<{
        id: any;
        title: any;
        description: any;
        projectId: any;
        assignedToUserId: any;
        dueDate: string | null;
        status: "To Do" | "In Progress" | "Blocked" | "Done";
        createdAt: string | null;
        assignedToUser: {
            id: any;
            name: any;
            email: any;
            role: "admin" | "lead" | "dev";
            teamId: any;
            createdAt: string | null;
            updatedAt: string | null;
        } | null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
};
//# sourceMappingURL=taskService.d.ts.map