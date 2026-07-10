"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTask = exports.formatProject = exports.formatTeam = exports.formatUser = exports.formatDate = exports.taskStatusFromClient = exports.projectStatusFromClient = exports.roleFromClient = void 0;
const roleToClient = {
    ADMIN: 'admin',
    LEAD: 'lead',
    DEV: 'dev'
};
const projectStatusToClient = {
    EN_COURS: 'active',
    SUSPENDU: 'on_hold',
    TERMINE: 'completed'
};
const taskStatusToClient = {
    A_FAIRE: 'To Do',
    EN_COURS: 'In Progress',
    BLOQUE: 'Blocked',
    TERMINE: 'Done'
};
const roleFromClient = (role) => {
    if (!role)
        return undefined;
    const normalized = role.toUpperCase();
    if (normalized === 'ADMIN' || normalized === 'LEAD' || normalized === 'DEV')
        return normalized;
    return undefined;
};
exports.roleFromClient = roleFromClient;
const projectStatusFromClient = (status) => {
    if (!status)
        return undefined;
    const map = {
        active: 'EN_COURS',
        on_hold: 'SUSPENDU',
        completed: 'TERMINE',
        EN_COURS: 'EN_COURS',
        SUSPENDU: 'SUSPENDU',
        TERMINE: 'TERMINE'
    };
    return map[status];
};
exports.projectStatusFromClient = projectStatusFromClient;
const taskStatusFromClient = (status) => {
    if (!status)
        return undefined;
    const map = {
        'To Do': 'A_FAIRE',
        'In Progress': 'EN_COURS',
        Blocked: 'BLOQUE',
        Done: 'TERMINE',
        A_FAIRE: 'A_FAIRE',
        EN_COURS: 'EN_COURS',
        BLOQUE: 'BLOQUE',
        TERMINE: 'TERMINE'
    };
    return map[status];
};
exports.taskStatusFromClient = taskStatusFromClient;
const formatDate = (date) => date ? new Date(date).toISOString().slice(0, 10) : null;
exports.formatDate = formatDate;
const formatUser = (user) => ({
    id: user.id || user._id?.toString(),
    name: user.name,
    email: user.email,
    role: roleToClient[user.role] || 'dev',
    teamId: user.teamId?.toString() || null,
    createdAt: (0, exports.formatDate)(user.createdAt),
    updatedAt: (0, exports.formatDate)(user.updatedAt)
});
exports.formatUser = formatUser;
const formatTeam = (team) => ({
    id: team.id || team._id?.toString(),
    name: team.name,
    description: team.description ?? '',
    createdAt: (0, exports.formatDate)(team.createdAt),
    memberCount: team.users?.length || team.memberCount || 0,
    projectCount: team.projects?.length || team.projectCount || 0
});
exports.formatTeam = formatTeam;
const formatProject = (project) => ({
    id: project.id || project._id?.toString(),
    name: project.name,
    description: project.description ?? '',
    status: projectStatusToClient[project.status] || 'active',
    teamId: project.teamId?._id ? project.teamId._id.toString() : project.teamId?.toString(),
    createdAt: (0, exports.formatDate)(project.createdAt),
    team: project.team ? (0, exports.formatTeam)(project.team) : undefined
});
exports.formatProject = formatProject;
const formatTask = (task) => ({
    id: task.id || task._id?.toString(),
    title: task.title,
    description: task.description ?? '',
    projectId: task.projectId?.toString(),
    parentId: task.parentId ? task.parentId.toString() : null,
    assignedToUserId: task.assignedTo?.toString() || null,
    dueDate: (0, exports.formatDate)(task.dueDate),
    status: taskStatusToClient[task.status] || 'To Do',
    createdAt: (0, exports.formatDate)(task.createdAt),
    assignedToUser: task.assignedToUser ? (0, exports.formatUser)(task.assignedToUser) : null
});
exports.formatTask = formatTask;
