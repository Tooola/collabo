import { getData, saveData } from './mockData';

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

function nextId(collection, prefix) {
  const num = collection.map(x => parseInt(x.id.replace(/\D/g, ''), 10)).reduce((a, b) => Math.max(a, b), 0) + 1;
  return `${prefix}${num}`;
}

function getUserFromHeaders(headers) {
  const token = headers?.Authorization?.replace('Bearer ', '');
  if (!token) return null;
  const userId = token.replace('mock-token-', '');
  const data = getData();
  return data.users.find(u => u.id === userId) || null;
}

const handlers = {
  'POST /login': async (body) => {
    const data = getData();
    const user = data.users.find(u => u.email === body.email);
    if (!user) return { status: 401, data: { error: 'Invalid credentials' } };
    return { status: 200, data: { user, token: `mock-token-${user.id}` } };
  },

  'GET /me': async (_, headers) => {
    const user = getUserFromHeaders(headers);
    if (!user) return { status: 401, data: { error: 'Unauthorized' } };
    return { status: 200, data: { user } };
  },

  'GET /projects': async (_, headers) => {
    const user = getUserFromHeaders(headers);
    const data = getData();
    let projects = data.projects;
    if (user?.role !== 'admin') {
      projects = projects.filter(p => p.teamId === user?.teamId);
    }
    return { status: 200, data: { projects } };
  },

  'POST /projects': async (body) => {
    const data = getData();
    const project = { id: nextId(data.projects, 'p'), ...body, createdAt: new Date().toISOString().slice(0, 10) };
    data.projects.push(project);
    saveData(data);
    return { status: 201, data: { project } };
  },

  'PUT /projects/:id': async (body, headers, params) => {
    const data = getData();
    const idx = data.projects.findIndex(p => p.id === params.id);
    if (idx === -1) return { status: 404, data: { error: 'Project not found' } };
    data.projects[idx] = { ...data.projects[idx], ...body };
    saveData(data);
    return { status: 200, data: { project: data.projects[idx] } };
  },

  'DELETE /projects/:id': async (_, headers, params) => {
    const data = getData();
    data.projects = data.projects.filter(p => p.id !== params.id);
    data.tasks = data.tasks.filter(t => t.projectId !== params.id);
    saveData(data);
    return { status: 200, data: { success: true } };
  },

  'GET /projects/:id/tasks': async (_, headers, params) => {
    const data = getData();
    const tasks = data.tasks.filter(t => t.projectId === params.id);
    return { status: 200, data: { tasks } };
  },

  'POST /tasks': async (body) => {
    const data = getData();
    const task = { id: nextId(data.tasks, 'tk'), ...body, createdAt: new Date().toISOString().slice(0, 10) };
    data.tasks.push(task);
    saveData(data);
    return { status: 201, data: { task } };
  },

  'PUT /tasks/:id': async (body, _, params) => {
    const data = getData();
    const idx = data.tasks.findIndex(t => t.id === params.id);
    if (idx === -1) return { status: 404, data: { error: 'Task not found' } };
    data.tasks[idx] = { ...data.tasks[idx], ...body };
    saveData(data);
    return { status: 200, data: { task: data.tasks[idx] } };
  },

  'DELETE /tasks/:id': async (_, __, params) => {
    const data = getData();
    data.tasks = data.tasks.filter(t => t.id !== params.id);
    saveData(data);
    return { status: 200, data: { success: true } };
  },

  'PATCH /tasks/:id/status': async (body, _, params) => {
    const data = getData();
    const idx = data.tasks.findIndex(t => t.id === params.id);
    if (idx === -1) return { status: 404, data: { error: 'Task not found' } };
    data.tasks[idx].status = body.status;
    saveData(data);
    return { status: 200, data: { task: data.tasks[idx] } };
  },

  'GET /teams': async (_, headers) => {
    const user = getUserFromHeaders(headers);
    const data = getData();
    let teams = data.teams;
    if (user?.role !== 'admin') {
      teams = teams.filter(t => t.id === user?.teamId);
    }
    return { status: 200, data: { teams } };
  },

  'POST /teams': async (body) => {
    const data = getData();
    const team = { id: nextId(data.teams, 't'), ...body, createdAt: new Date().toISOString().slice(0, 10) };
    data.teams.push(team);
    saveData(data);
    return { status: 201, data: { team } };
  },

  'PUT /teams/:id': async (body, _, params) => {
    const data = getData();
    const idx = data.teams.findIndex(t => t.id === params.id);
    if (idx === -1) return { status: 404, data: { error: 'Team not found' } };
    data.teams[idx] = { ...data.teams[idx], ...body };
    saveData(data);
    return { status: 200, data: { team: data.teams[idx] } };
  },

  'DELETE /teams/:id': async (_, __, params) => {
    const data = getData();
    data.teams = data.teams.filter(t => t.id !== params.id);
    saveData(data);
    return { status: 200, data: { success: true } };
  },

  'GET /teams/:id/members': async (_, headers, params) => {
    const data = getData();
    const members = data.users.filter(u => u.teamId === params.id);
    return { status: 200, data: { members } };
  },

  'POST /teams/:id/members': async (body, _, params) => {
    const data = getData();
    const userIdx = data.users.findIndex(u => u.id === body.userId);
    if (userIdx === -1) return { status: 404, data: { error: 'User not found' } };
    data.users[userIdx].teamId = params.id;
    if (body.role) data.users[userIdx].role = body.role;
    saveData(data);
    return { status: 200, data: { user: data.users[userIdx] } };
  },

  'DELETE /teams/:id/members/:userId': async (_, __, params) => {
    const data = getData();
    const userIdx = data.users.findIndex(u => u.id === params.userId);
    if (userIdx === -1) return { status: 404, data: { error: 'User not found' } };
    data.users[userIdx].teamId = null;
    saveData(data);
    return { status: 200, data: { success: true } };
  },

  'GET /users': async (_, headers) => {
    const user = getUserFromHeaders(headers);
    if (user?.role !== 'admin') return { status: 403, data: { error: 'Forbidden' } };
    const data = getData();
    return { status: 200, data: { users: data.users } };
  },
};

function matchRoute(method, url) {
  const path = url.replace(/^\/api/, '');
  for (const key of Object.keys(handlers)) {
    const [hMethod, hPattern] = key.split(' ');
    if (hMethod !== method) continue;
    const hParts = hPattern.split('/').filter(Boolean);
    const pParts = path.split('/').filter(Boolean);
    if (hParts.length !== pParts.length) continue;
    let match = true;
    const params = {};
    for (let i = 0; i < hParts.length; i++) {
      if (hParts[i].startsWith(':')) {
        params[hParts[i].slice(1)] = pParts[i];
      } else if (hParts[i] !== pParts[i]) {
        match = false;
        break;
      }
    }
    if (match) return { key, params };
  }
  return null;
}

let authToken = localStorage.getItem('auth_token') || null;

export function setAuthToken(token) {
  authToken = token;
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}

export async function api(method, url, body = null) {
  await delay(150 + Math.random() * 200);
  const route = matchRoute(method, url);
  if (!route) return { ok: false, status: 404, data: { error: 'Endpoint not found' } };
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  try {
    const result = await handlers[route.key](body, headers, route.params);
    if (result.status >= 400) return { ok: false, status: result.status, data: result.data };
    return { ok: true, status: result.status, data: result.data };
  } catch (err) {
    return { ok: false, status: 500, data: { error: err.message } };
  }
}
