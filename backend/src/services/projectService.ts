import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { AuthRequest } from '../middlewares/authenticate';
import { forbidden, notFound } from '../utils/httpError';
import { formatProject, projectStatusFromClient } from '../utils/formatters';

export const projectService = {
  async getAll(req: AuthRequest) {
    const wid = req.user!.workspaceId;

    if (req.user?.role !== 'ADMIN' && !req.user?.teamId) return [];

    const query: any = { workspaceId: wid };
    if (req.user?.role !== 'ADMIN') query.teamId = req.user!.teamId;

    const projects = await Project.find(query).populate('teamId').sort({ createdAt: 1 });
    return projects.map(formatProject);
  },

  async getById(id: string) {
    const project = await Project.findById(id).populate('teamId');
    return project ? formatProject(project) : null;
  },

  async create(data: { name: string; description?: string; teamId: string; status?: string }, req: AuthRequest) {
    const project = await Project.create({
      name: data.name,
      description: data.description,
      teamId: data.teamId,
      status: projectStatusFromClient(data.status) ?? 'EN_COURS',
      workspaceId: req.user!.workspaceId
    });
    const populated = await project.populate('teamId');
    return formatProject(populated);
  },

  async update(id: string, data: { name?: string; description?: string; teamId?: string; status?: string }) {
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.teamId !== undefined) updateData.teamId = data.teamId;
    if (data.status !== undefined) {
      const s = projectStatusFromClient(data.status);
      if (s) updateData.status = s;
    }

    const project = await Project.findByIdAndUpdate(id, updateData, { new: true }).populate('teamId');
    return project ? formatProject(project) : null;
  },

  async delete(id: string) {
    await Task.deleteMany({ projectId: id });
    await Project.findByIdAndDelete(id);
    return { success: true };
  },

  async assertProjectVisible(user: AuthRequest['user'], projectId: string) {
    const project = await Project.findById(projectId);
    if (!project) throw notFound('Project not found');
    if (user?.role !== 'ADMIN' && project.teamId.toString() !== user?.teamId) {
      throw forbidden('Access to this project is restricted to your team');
    }
    return project;
  }
};
