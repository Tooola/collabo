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
      // no additional filter
    } else {
      // Use JWT teams array (always fresh via /me token refresh on page load)
      const userTeams: { teamId: string; role: string }[] = req.user?.teams || [];
      const leadTeamIds = userTeams.filter(t => t.role === 'LEAD').map(t => t.teamId);

      if (leadTeamIds.length > 0) {
        // DEV who is also a team lead: see all tasks from led teams + their own assigned tasks
        const projects = await Project.find({ teamId: { $in: leadTeamIds }, workspaceId: wid }, '_id');
        const projectIds = projects.map(p => p._id);
        query = { workspaceId: wid, $or: [{ assignedTo: req.user!.id }, { projectId: { $in: projectIds } }] };
      } else {
        query.assignedTo = req.user!.id;
      }
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
    
    // Check if user is a member of the project's team (either DEV or LEAD)
    const userTeams = req.user?.teams || [];
    const teamMember = userTeams.find((t: any) => t.teamId === project?.teamId?.toString());
    
    if (req.user?.role !== 'ADMIN' && !teamMember) {
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

  const project = await Project.findById(projectId);
  if (!project) throw notFound('Project not found');

  const userTeams = req.user?.teams || [];
  const teamMember = userTeams.find((t: any) => t.teamId === project.teamId.toString());

  if (!teamMember) throw forbidden('You can only write tasks from your team');
  if (teamMember.role !== 'LEAD') throw forbidden('Only admin and lead can write tasks');
}

async function assertAssigneeInProjectTeam(projectId: string, userId: string) {
  const project = await Project.findById(projectId);
  const user = await User.findById(userId);
  if (!project) throw notFound('Project not found');
  if (!user) throw notFound('Assigned user not found');

  const userTeams = user.teams || [];
  const isMember = userTeams.some((t: any) => t.teamId.toString() === project.teamId.toString());

  if (!isMember) throw badRequest('Assigned user must belong to the project team');
}
