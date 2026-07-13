import { IUser } from '../models/User';
import { ITeam } from '../models/Team';
import { IProject } from '../models/Project';
import { ITask } from '../models/Task';

type SafeUser = Omit<IUser, 'password'> & { id?: string };

const roleToClient: Record<string, 'admin' | 'lead' | 'dev'> = {
  ADMIN: 'admin',
  LEAD: 'lead',
  DEV: 'dev'
};

const projectStatusToClient: Record<string, 'active' | 'on_hold' | 'completed'> = {
  EN_COURS: 'active',
  SUSPENDU: 'on_hold',
  TERMINE: 'completed'
};

const taskStatusToClient: Record<string, 'To Do' | 'In Progress' | 'Blocked' | 'Done'> = {
  A_FAIRE: 'To Do',
  EN_COURS: 'In Progress',
  BLOQUE: 'Blocked',
  TERMINE: 'Done'
};

export const roleFromClient = (role?: string): string | undefined => {
  if (!role) return undefined;
  const normalized = role.toUpperCase();
  if (normalized === 'ADMIN' || normalized === 'LEAD' || normalized === 'DEV') return normalized;
  return undefined;
};

export const projectStatusFromClient = (status?: string): string | undefined => {
  if (!status) return undefined;
  const map: Record<string, string> = {
    active: 'EN_COURS',
    on_hold: 'SUSPENDU',
    completed: 'TERMINE',
    EN_COURS: 'EN_COURS',
    SUSPENDU: 'SUSPENDU',
    TERMINE: 'TERMINE'
  };
  return map[status];
};

export const taskStatusFromClient = (status?: string): string | undefined => {
  if (!status) return undefined;
  const map: Record<string, string> = {
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

export const formatDate = (date?: Date | null) => date ? new Date(date).toISOString().slice(0, 10) : null;

export const formatUser = (user: any) => ({
  id: user.id || user._id?.toString(),
  name: user.name,
  email: user.email,
  role: roleToClient[user.role] || 'dev',
  teamId: user.teamId?.toString() || null,
  createdAt: formatDate(user.createdAt),
  updatedAt: formatDate(user.updatedAt)
});

export const formatTeam = (team: any) => ({
  id: team.id || team._id?.toString(),
  name: team.name,
  description: team.description ?? '',
  createdAt: formatDate(team.createdAt),
  memberCount: team.users?.length || team.memberCount || 0,
  projectCount: team.projects?.length || team.projectCount || 0
});

export const formatProject = (project: any) => ({
  id: project.id || project._id?.toString(),
  name: project.name,
  description: project.description ?? '',
  status: projectStatusToClient[project.status] || 'active',
  teamId: project.teamId?._id ? project.teamId._id.toString() : project.teamId?.toString(),
  createdAt: formatDate(project.createdAt),
  team: project.team ? formatTeam(project.team) : undefined
});

export const formatTask = (task: any) => ({
  id: task.id || task._id?.toString(),
  title: task.title,
  description: task.description ?? '',
  projectId: task.projectId?._id ? task.projectId._id.toString() : task.projectId?.toString(),
  parentId: task.parentId ? task.parentId.toString() : null,
  assignedToUserId: task.assignedTo?._id ? task.assignedTo._id.toString() : task.assignedTo?.toString() || null,
  dueDate: formatDate(task.dueDate),
  status: taskStatusToClient[task.status] || 'To Do',
  createdAt: formatDate(task.createdAt),
  assignedToUser: task.assignedToUser ? formatUser(task.assignedToUser) : null
});
