import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const res = await api('GET', '/projects');
    if (res.ok) setProjects(res.data.projects);
    const taskRes = await api('GET', '/tasks');
    if (taskRes.ok) setTasks(taskRes.data.tasks);
    setLoading(false);
    return res;
  }, []);

  const createProject = useCallback(async (data) => {
    const res = await api('POST', '/projects', data);
    if (res.ok) setProjects(prev => [...prev, res.data.project]);
    return res;
  }, []);

  const updateProject = useCallback(async (id, data) => {
    const res = await api('PUT', `/projects/${id}`, data);
    if (res.ok) setProjects(prev => prev.map(p => p.id === id ? res.data.project : p));
    return res;
  }, []);

  const deleteProject = useCallback(async (id) => {
    const res = await api('DELETE', `/projects/${id}`);
    if (res.ok) setProjects(prev => prev.filter(p => p.id !== id));
    return res;
  }, []);

  // Tasks
  const fetchTasks = useCallback(async (projectId) => {
    const res = await api('GET', `/projects/${projectId}/tasks`);
    if (res.ok) setTasks(res.data.tasks);
    return res;
  }, []);

  const createTask = useCallback(async (data) => {
    const res = await api('POST', '/tasks', data);
    if (res.ok) setTasks(prev => [...prev, res.data.task]);
    return res;
  }, []);

  const updateTask = useCallback(async (id, data) => {
    const res = await api('PUT', `/tasks/${id}`, data);
    if (res.ok) setTasks(prev => prev.map(t => t.id === id ? res.data.task : t));
    return res;
  }, []);

  const deleteTask = useCallback(async (id) => {
    const res = await api('DELETE', `/tasks/${id}`);
    if (res.ok) setTasks(prev => prev.filter(t => t.id !== id));
    return res;
  }, []);

  const updateTaskStatus = useCallback(async (id, status) => {
    const res = await api('PATCH', `/tasks/${id}/status`, { status });
    if (res.ok) setTasks(prev => prev.map(t => t.id === id ? res.data.task : t));
    return res;
  }, []);

  // Teams
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    const res = await api('GET', '/teams');
    if (res.ok) setTeams(res.data.teams);
    setLoading(false);
    return res;
  }, []);

  const createTeam = useCallback(async (data) => {
    const res = await api('POST', '/teams', data);
    if (res.ok) setTeams(prev => [...prev, res.data.team]);
    return res;
  }, []);

  const updateTeam = useCallback(async (id, data) => {
    const res = await api('PUT', `/teams/${id}`, data);
    if (res.ok) setTeams(prev => prev.map(t => t.id === id ? res.data.team : t));
    return res;
  }, []);

  const deleteTeam = useCallback(async (id) => {
    const res = await api('DELETE', `/teams/${id}`);
    if (res.ok) setTeams(prev => prev.filter(t => t.id !== id));
    return res;
  }, []);

  const fetchTeamMembers = useCallback(async (teamId) => {
    return await api('GET', `/teams/${teamId}/members`);
  }, []);

  const addTeamMember = useCallback(async (teamId, userId, role) => {
    return await api('POST', `/teams/${teamId}/members`, { userId, role });
  }, []);

  const removeTeamMember = useCallback(async (teamId, userId) => {
    return await api('DELETE', `/teams/${teamId}/members/${userId}`);
  }, []);

  // Users
  const fetchUsers = useCallback(async () => {
    const res = await api('GET', '/users');
    if (res.ok) setUsers(res.data.users);
    return res;
  }, []);

  const createUser = useCallback(async (data) => {
    const res = await api('POST', '/users', data);
    if (res.ok) setUsers(prev => [...prev, res.data.user]);
    return res;
  }, []);

  const updateUser = useCallback(async (id, data) => {
    const res = await api('PUT', `/users/${id}`, data);
    if (res.ok) setUsers(prev => prev.map(u => u.id === id ? res.data.user : u));
    return res;
  }, []);

  const deleteUser = useCallback(async (id) => {
    const res = await api('DELETE', `/users/${id}`);
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== id));
    return res;
  }, []);

  // Computed stats
  const getProjectStats = useCallback((projectId) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);

    // Find all task IDs that ARE a parent of something (Epics = containers, not work items)
    const parentIds = new Set(projectTasks.map(t => t.parentId).filter(Boolean));
    // A task is a real work item if no other task has it as a parent
    const workItems = projectTasks.filter(t => !parentIds.has(t.id));

    const total = workItems.length;
    // Backend statuses: A_FAIRE | EN_COURS | BLOQUE | TERMINE
    const completed = workItems.filter(t => t.status === 'TERMINE').length;
    const overdue = workItems.filter(t => t.status !== 'TERMINE' && t.dueDate && new Date(t.dueDate) < new Date()).length;
    const blocked = workItems.filter(t => t.status === 'BLOQUE').length;
    const inProgress = workItems.filter(t => t.status === 'EN_COURS').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, overdue, blocked, inProgress, percent };
  }, [tasks]);

  const getTeamMemberStats = useCallback((userId) => {
    // Only count real work items (not epics that are containers)
    const parentIds = new Set(tasks.map(t => t.parentId).filter(Boolean));
    const userTasks = tasks.filter(t => t.assignedToUserId === userId && !parentIds.has(t.id));
    const total = userTasks.length;
    // Backend statuses: A_FAIRE | EN_COURS | BLOQUE | TERMINE
    const completed = userTasks.filter(t => t.status === 'TERMINE').length;
    const inProgress = userTasks.filter(t => t.status === 'EN_COURS').length;
    return { total, completed, inProgress };
  }, [tasks]);

  return (
    <DataContext.Provider value={{
      projects, teams, tasks, users, loading,
      fetchProjects, createProject, updateProject, deleteProject,
      fetchTasks, createTask, updateTask, deleteTask, updateTaskStatus,
      fetchTeams, createTeam, updateTeam, deleteTeam,
      fetchTeamMembers, addTeamMember, removeTeamMember,
      fetchUsers, createUser, updateUser, deleteUser, getProjectStats, getTeamMemberStats,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
