import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { AuthRequest } from '../middlewares/authenticate';
import { forbidden, notFound } from '../utils/httpError';
import { formatProject, projectStatusFromClient } from '../utils/formatters';

export const projectService = {
  async getAll(req: AuthRequest) {
    const wid = req.user!.workspaceId;

    const userTeams = req.user?.teams || [];
    if (req.user?.role !== 'ADMIN' && userTeams.length === 0) return [];

    const query: any = { workspaceId: wid };
    if (req.user?.role !== 'ADMIN') {
      const teamIds = userTeams.map((t: any) => t.teamId);
      query.teamId = { $in: teamIds };
    }

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

    const project = await Project.findByIdAndUpdate(id, updateData, { returnDocument: 'after' }).populate('teamId');
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
    const userTeams = user?.teams || [];
    const isMember = userTeams.some((t: any) => t.teamId === project.teamId.toString());
    if (user?.role !== 'ADMIN' && !isMember) {
      throw forbidden('Access to this project is restricted to your team');
    }
    return project;
  }
};
