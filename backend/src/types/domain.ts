export type Role = 'ADMIN' | 'LEAD' | 'DEV';
export type ProjectStatus = 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
export type TaskStatus = 'A_FAIRE' | 'EN_COURS' | 'BLOQUE' | 'TERMINE';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  teamId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  teamId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  assignedTo: string | null;
  dueDate: string | null;
  status: TaskStatus;
  createdAt: string;
}

export interface Database {
  users: User[];
  teams: Team[];
  projects: Project[];
  tasks: Task[];
}
