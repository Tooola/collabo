const STORAGE_KEY = 'pm_dashboard_data';

const defaultData = {
  users: [
    { id: 'u1', name: 'Admin User', email: 'admin@test.com', role: 'admin', teamId: null },
    { id: 'u2', name: 'Sarah Lead', email: 'lead@test.com', role: 'lead', teamId: 't1' },
    { id: 'u3', name: 'John Dev', email: 'dev@test.com', role: 'dev', teamId: 't1' },
    { id: 'u4', name: 'Lisa Chen', email: 'lisa@test.com', role: 'dev', teamId: 't1' },
    { id: 'u5', name: 'Mark Lead', email: 'mark@test.com', role: 'lead', teamId: 't2' },
    { id: 'u6', name: 'Emma Dev', email: 'emma@test.com', role: 'dev', teamId: 't2' },
    { id: 'u7', name: 'Alex Dev', email: 'alex@test.com', role: 'dev', teamId: 't2' },
  ],
  teams: [
    { id: 't1', name: 'Frontend Team', description: 'Handles all UI/UX development', createdAt: '2026-01-15' },
    { id: 't2', name: 'Backend Team', description: 'API and server-side logic', createdAt: '2026-01-15' },
  ],
  projects: [
    { id: 'p1', name: 'Dashboard Redesign', description: 'Complete overhaul of the internal dashboard', status: 'active', createdAt: '2026-02-01', teamId: 't1' },
    { id: 'p2', name: 'API v2 Migration', description: 'Migrate REST endpoints to v2 schema', status: 'active', createdAt: '2026-02-10', teamId: 't2' },
    { id: 'p3', name: 'Mobile App', description: 'React Native companion app', status: 'on_hold', createdAt: '2026-03-01', teamId: 't1' },
    { id: 'p4', name: 'Auth Service', description: 'Centralized authentication microservice', status: 'completed', createdAt: '2026-01-20', teamId: 't2' },
  ],
  tasks: [
    { id: 'tk1', title: 'Design new layout', description: 'Create wireframes for the new dashboard', projectId: 'p1', assignedToUserId: 'u3', dueDate: '2026-05-20', status: 'Done', createdAt: '2026-02-05' },
    { id: 'tk2', title: 'Implement sidebar', description: 'Build collapsible sidebar component', projectId: 'p1', assignedToUserId: 'u3', dueDate: '2026-06-15', status: 'In Progress', createdAt: '2026-03-01' },
    { id: 'tk3', title: 'API endpoint refactor', description: 'Refactor user endpoints to v2', projectId: 'p2', assignedToUserId: 'u6', dueDate: '2026-06-10', status: 'In Progress', createdAt: '2026-02-15' },
    { id: 'tk4', title: 'Database schema update', description: 'Update migration files for v2', projectId: 'p2', assignedToUserId: 'u7', dueDate: '2026-05-30', status: 'Blocked', createdAt: '2026-02-20' },
    { id: 'tk5', title: 'Write unit tests', description: 'Cover auth module with tests', projectId: 'p1', assignedToUserId: 'u4', dueDate: '2026-06-20', status: 'To Do', createdAt: '2026-03-10' },
    { id: 'tk6', title: 'Setup CI pipeline', description: 'Configure GitHub Actions', projectId: 'p2', assignedToUserId: 'u6', dueDate: '2026-04-01', status: 'Done', createdAt: '2026-02-12' },
    { id: 'tk7', title: 'Mobile navigation', description: 'Implement bottom nav for mobile', projectId: 'p3', assignedToUserId: 'u3', dueDate: '2026-04-15', status: 'To Do', createdAt: '2026-03-05' },
    { id: 'tk8', title: 'Token refresh flow', description: 'Implement silent token refresh', projectId: 'p4', assignedToUserId: 'u7', dueDate: '2026-03-01', status: 'Done', createdAt: '2026-01-25' },
    { id: 'tk9', title: 'User profile page', description: 'Build profile settings page', projectId: 'p1', assignedToUserId: 'u4', dueDate: '2026-06-25', status: 'To Do', createdAt: '2026-03-15' },
    { id: 'tk10', title: 'Rate limiting middleware', description: 'Add rate limiting to API', projectId: 'p2', assignedToUserId: 'u6', dueDate: '2026-05-10', status: 'Done', createdAt: '2026-02-18' },
    { id: 'tk11', title: 'Chart components', description: 'Build reusable chart widgets', projectId: 'p1', assignedToUserId: 'u3', dueDate: '2026-06-05', status: 'Blocked', createdAt: '2026-03-20' },
    { id: 'tk12', title: 'OAuth integration', description: 'Add Google and GitHub OAuth', projectId: 'p4', assignedToUserId: 'u7', dueDate: '2026-02-28', status: 'Done', createdAt: '2026-01-22' },
  ],
};

export function getData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* ignore parse errors */ }
  }
  const data = structuredClone(defaultData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  return getData();
}
