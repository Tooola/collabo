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
export const roleFromClient = (role) => {
    if (!role)
        return undefined;
    const normalized = role.toUpperCase();
    if (normalized === 'ADMIN' || normalized === 'LEAD' || normalized === 'DEV')
        return normalized;
    return undefined;
};
export const projectStatusFromClient = (status) => {
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
export const taskStatusFromClient = (status) => {
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
export const formatDate = (date) => date ? new Date(date).toISOString().slice(0, 10) : null;
export const formatUser = (user) => ({
    id: user.id || user._id?.toString(),
    name: user.name,
    email: user.email,
    role: roleToClient[user.role] || 'dev',
    teamId: user.teamId?.toString() || null,
    createdAt: formatDate(user.createdAt),
    updatedAt: formatDate(user.updatedAt)
});
export const formatTeam = (team) => ({
    id: team.id || team._id?.toString(),
    name: team.name,
    description: team.description ?? '',
    createdAt: formatDate(team.createdAt),
    memberCount: team.users?.length || team.memberCount || 0,
    projectCount: team.projects?.length || team.projectCount || 0
});
export const formatProject = (project) => ({
    id: project.id || project._id?.toString(),
    name: project.name,
    description: project.description ?? '',
    status: projectStatusToClient[project.status] || 'active',
    teamId: project.teamId?.toString(),
    createdAt: formatDate(project.createdAt),
    team: project.team ? formatTeam(project.team) : undefined
});
export const formatTask = (task) => ({
    id: task.id || task._id?.toString(),
    title: task.title,
    description: task.description ?? '',
    projectId: task.projectId?.toString(),
    assignedToUserId: task.assignedTo?.toString() || null,
    dueDate: formatDate(task.dueDate),
    status: taskStatusToClient[task.status] || 'To Do',
    createdAt: formatDate(task.createdAt),
    assignedToUser: task.assignedToUser ? formatUser(task.assignedToUser) : null
});
