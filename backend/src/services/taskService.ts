import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/authenticate';
import { badRequest, forbidden, notFound } from '../utils/httpError';
import { formatTask, taskStatusFromClient } from '../utils/formatters';

export const taskService = {
  async getAll(req: AuthRequest) {
    const wid = req.user!.workspaceId;
    let query: any = { workspaceId: wid };

    if (req.user?.role === 'ADMIN') {
      // no additional filter - just workspaceId
    } else if (req.user?.role === 'LEAD') {
      if (!req.user.teamId) return [];
      const projects = await Project.find({ teamId: req.user.teamId, workspaceId: wid }, '_id');
      const projectIds = projects.map(p => p._id);
      query.projectId = { $in: projectIds };
    } else if (req.user?.role === 'DEV') {
      query.assignedTo = req.user.id;
    } else {
      return [];
    }

    const tasks = await Task.find(query).populate('projectId').populate('assignedTo').sort({ createdAt: 1 });
    return tasks.map(t => formatTask({ ...t.toJSON(), assignedToUser: t.populated('assignedTo') ? (t as any).assignedTo : null }));
  },

  async getByProject(projectId: string, req: AuthRequest) {
    const query: any = { projectId, workspaceId: req.user!.workspaceId };
    if (req.user?.role === 'DEV') {
      query.assignedTo = req.user.id;
    }

    const tasks = await Task.find(query).populate('projectId').populate('assignedTo').sort({ createdAt: 1 });
    return tasks.map(t => formatTask({ ...t.toJSON(), assignedToUser: t.populated('assignedTo') ? (t as any).assignedTo : null }));
  },

  async getById(id: string) {
    const task = await Task.findById(id).populate('projectId').populate('assignedTo');
    if (!task) return null;
    return formatTask({ ...task.toJSON(), assignedToUser: task.populated('assignedTo') ? (task as any).assignedTo : null });
  },

  async create(data: { title: string; description?: string; projectId: string; parentId?: string | null; assignedTo?: string; assignedToUserId?: string; dueDate?: string | Date; status?: string }, req: AuthRequest) {
    await assertLeadCanWriteProject(req, data.projectId);
    const assignedTo = data.assignedToUserId ?? data.assignedTo;
    if (assignedTo) await assertAssigneeInProjectTeam(data.projectId, assignedTo);

    const task = await Task.create({
      title: data.title,
      description: data.description,
      projectId: data.projectId,
      parentId: data.parentId || null,
      assignedTo: assignedTo || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: taskStatusFromClient(data.status) ?? 'A_FAIRE',
      workspaceId: req.user!.workspaceId
    });

    const populated = await task.populate('assignedTo');
    return formatTask({ ...populated.toJSON(), assignedToUser: populated.populated('assignedTo') ? (populated as any).assignedTo : null });
  },

  async update(id: string, data: { title?: string; description?: string; projectId?: string; parentId?: string | null; assignedTo?: string; assignedToUserId?: string; dueDate?: string | Date; status?: string }, req: AuthRequest) {
    const existing = await Task.findById(id).populate('projectId');
    if (!existing) throw notFound('Task not found');
    await assertLeadCanWriteProject(req, existing.projectId.toString());

    const targetProjectId = data.projectId ?? existing.projectId.toString();
    if (data.projectId) await assertLeadCanWriteProject(req, data.projectId);

    const assignedTo = data.assignedToUserId ?? data.assignedTo;
    if (assignedTo) await assertAssigneeInProjectTeam(targetProjectId, assignedTo);

    const updateData: Record<string, any> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.projectId !== undefined) updateData.projectId = data.projectId;
    if ('parentId' in data) updateData.parentId = data.parentId || null;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.status !== undefined) {
      const s = taskStatusFromClient(data.status);
      if (s) updateData.status = s;
    }

    const task = await Task.findByIdAndUpdate(id, updateData, { new: true }).populate('assignedTo');
    if (!task) throw notFound('Task not found');
    return formatTask({ ...task.toJSON(), assignedToUser: task.populated('assignedTo') ? (task as any).assignedTo : null });
  },

  async updateStatus(id: string, status: string, req: AuthRequest) {
    const existing = await Task.findById(id).populate('projectId');
    if (!existing) throw notFound('Task not found');

    if (req.user?.role === 'DEV' && existing.assignedTo?.toString() !== req.user.id) {
      throw forbidden('You can only update your own assigned tasks');
    }

    const project = existing.populated('projectId') ? (existing as any).projectId : await Project.findById(existing.projectId);
    if (req.user?.role === 'LEAD' && project?.teamId?.toString() !== req.user.teamId) {
      throw forbidden('You can only update tasks from your team');
    }

    const nextStatus = taskStatusFromClient(status);
    if (!nextStatus) throw badRequest('Invalid task status');

    const task = await Task.findByIdAndUpdate(id, { status: nextStatus }, { new: true }).populate('assignedTo');
    if (!task) throw notFound('Task not found');
    return formatTask({ ...task.toJSON(), assignedToUser: task.populated('assignedTo') ? (task as any).assignedTo : null });
  },

  async delete(id: string) {
    await Task.findByIdAndDelete(id);
    return { success: true };
  }
};

async function assertLeadCanWriteProject(req: AuthRequest, projectId: string) {
  if (req.user?.role === 'ADMIN') return;
  if (req.user?.role !== 'LEAD') throw forbidden('Only admin and lead can write tasks');
  if (!req.user.teamId) throw forbidden('Lead must belong to a team');

  const project = await Project.findById(projectId);
  if (!project) throw notFound('Project not found');
  if (project.teamId.toString() !== req.user.teamId) throw forbidden('You can only write tasks from your team');
}

async function assertAssigneeInProjectTeam(projectId: string, userId: string) {
  const project = await Project.findById(projectId);
  const user = await User.findById(userId);
  if (!project) throw notFound('Project not found');
  if (!user) throw notFound('Assigned user not found');
  if (user.teamId?.toString() !== project.teamId.toString()) throw badRequest('Assigned user must belong to the project team');
}
