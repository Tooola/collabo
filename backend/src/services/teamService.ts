import { Team } from '../models/Team';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { AuthRequest } from '../middlewares/authenticate';
import { forbidden } from '../utils/httpError';
import { formatTeam, formatUser, roleFromClient } from '../utils/formatters';

export const teamService = {
  async getAll(req: AuthRequest) {
    const wid = req.user!.workspaceId;

    if (req.user?.role !== 'ADMIN' && !req.user?.teamId) return [];

    const query: any = { workspaceId: wid };
    if (req.user?.role !== 'ADMIN') query._id = req.user!.teamId;

    const teams = await Team.find(query).sort({ createdAt: 1 });

    const results = [];
    for (const team of teams) {
      const usersCount = await User.countDocuments({ teamId: team._id, workspaceId: wid });
      const projectsCount = await Project.countDocuments({ teamId: team._id, workspaceId: wid });
      results.push(formatTeam({ ...team.toJSON(), memberCount: usersCount, projectCount: projectsCount }));
    }

    return results;
  },

  async getById(id: string, req?: AuthRequest) {
    if (req?.user?.role !== 'ADMIN' && req?.user?.teamId !== id) {
      throw forbidden('Access to this team is restricted');
    }

    const team = await Team.findById(id);
    if (!team) return null;

    const wid = req?.user?.workspaceId;
    const usersCount = await User.countDocuments({ teamId: id, workspaceId: wid });
    const projectsCount = await Project.countDocuments({ teamId: id, workspaceId: wid });

    return formatTeam({ ...team.toJSON(), memberCount: usersCount, projectCount: projectsCount });
  },

  async create(data: { name: string; description?: string }, req: AuthRequest) {
    const team = await Team.create({ ...data, workspaceId: req.user!.workspaceId });
    return formatTeam(team);
  },

  async update(id: string, data: { name?: string; description?: string }) {
    const team = await Team.findByIdAndUpdate(id, data, { new: true });
    return team ? formatTeam(team) : null;
  },

  async delete(id: string) {
    const projects = await Project.find({ teamId: id }, '_id');
    const projectIds = projects.map(p => p._id);

    await Task.deleteMany({ projectId: { $in: projectIds } });
    await Project.deleteMany({ teamId: id });
    await User.updateMany({ teamId: id }, { $set: { teamId: null } });
    await Team.findByIdAndDelete(id);

    return { success: true };
  },

  async addMember(teamId: string, userId: string, role?: string) {
    const user = await User.findById(userId);
    if (!user) return null;

    const updateData: any = { teamId };
    if (role && user.role !== 'ADMIN') {
      const parsedRole = roleFromClient(role);
      if (parsedRole) {
        if (parsedRole === 'LEAD') {
          const existingLead = await User.findOne({ teamId, teamRole: 'LEAD' });
          if (existingLead && existingLead._id.toString() !== userId) {
            await User.findByIdAndUpdate(existingLead._id, { $set: { teamRole: 'DEV' } });
          }
        }
        updateData.teamRole = parsedRole;
      }
    }

    const member = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
    return member ? formatUser(member) : null;
  },

  async removeMember(teamId: string, userId: string) {
    const member = await User.findByIdAndUpdate(userId, { $set: { teamId: null } }, { new: true });
    return member ? formatUser(member) : null;
  },

  async getMembers(teamId: string, req: AuthRequest) {
    if (req.user?.role !== 'ADMIN' && req.user?.teamId?.toString() !== teamId.toString()) {
      throw forbidden('Access to this team is restricted');
    }

    const members = await User.find({ teamId, workspaceId: req.user!.workspaceId }).sort({ name: 1 });
    return members.map(formatUser);
  }
};
