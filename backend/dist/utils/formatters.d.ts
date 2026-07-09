export declare const roleFromClient: (role?: string) => string | undefined;
export declare const projectStatusFromClient: (status?: string) => string | undefined;
export declare const taskStatusFromClient: (status?: string) => string | undefined;
export declare const formatDate: (date?: Date | null) => string | null;
export declare const formatUser: (user: any) => {
    id: any;
    name: any;
    email: any;
    role: "admin" | "lead" | "dev";
    teamId: any;
    createdAt: string | null;
    updatedAt: string | null;
};
export declare const formatTeam: (team: any) => {
    id: any;
    name: any;
    description: any;
    createdAt: string | null;
    memberCount: any;
    projectCount: any;
};
export declare const formatProject: (project: any) => {
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
};
export declare const formatTask: (task: any) => {
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
};
//# sourceMappingURL=formatters.d.ts.map