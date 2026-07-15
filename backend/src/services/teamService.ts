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

    if (req.user?.role === 'ADMIN') {
      const teams = await Team.find({ workspaceId: wid }).sort({ createdAt: 1 });
      const results = [];
      for (const team of teams) {
        const usersCount = await User.countDocuments({ 'teams.teamId': team._id, workspaceId: wid });
        const projectsCount = await Project.countDocuments({ teamId: team._id, workspaceId: wid });
        results.push(formatTeam({ ...team.toJSON(), memberCount: usersCount, projectCount: projectsCount }));
      }
      return results;
    }

    // Non-admins: use JWT teams array (always fresh after page load via /me token refresh)
    const userTeams: { teamId: string; role: string }[] = req.user?.teams || [];
    if (userTeams.length === 0) return [];

    const teamIds = userTeams.map(t => t.teamId);
    const teams = await Team.find({ _id: { $in: teamIds }, workspaceId: wid }).sort({ createdAt: 1 });

    const results = [];
    for (const team of teams) {
      const usersCount = await User.countDocuments({ 'teams.teamId': team._id, workspaceId: wid });
      const projectsCount = await Project.countDocuments({ teamId: team._id, workspaceId: wid });
      results.push(formatTeam({ ...team.toJSON(), memberCount: usersCount, projectCount: projectsCount }));
    }
    return results;
  },

  async getById(id: string, req?: AuthRequest) {
    if (req?.user?.role !== 'ADMIN') {
      const isMember = (req?.user?.teams || []).some((t: any) => t.teamId === id);
      if (!isMember) throw forbidden('Access to this team is restricted');
    }

    const team = await Team.findById(id);
    if (!team) return null;

    const wid = req?.user?.workspaceId;
    const usersCount = await User.countDocuments({ 'teams.teamId': id, workspaceId: wid });
    const projectsCount = await Project.countDocuments({ teamId: id, workspaceId: wid });

    return formatTeam({ ...team.toJSON(), memberCount: usersCount, projectCount: projectsCount });
  },

  async create(data: { name: string; description?: string }, req: AuthRequest) {
    const team = await Team.create({ ...data, workspaceId: req.user!.workspaceId });
    return formatTeam(team);
  },

  async update(id: string, data: { name?: string; description?: string }) {
    const team = await Team.findByIdAndUpdate(id, data, { returnDocument: 'after' });
    return team ? formatTeam(team) : null;
  },

  async delete(id: string) {
    const projects = await Project.find({ teamId: id }, '_id');
    const projectIds = projects.map(p => p._id);

    await Task.deleteMany({ projectId: { $in: projectIds } });
    await Project.deleteMany({ teamId: id });
    // Remove this team from all users' teams arrays
    await User.updateMany({ 'teams.teamId': id }, { $pull: { teams: { teamId: id } } } as any);
    await Team.findByIdAndDelete(id);

    return { success: true };
  },

  async addMember(teamId: string, userId: string, role?: string) {
    const user = await User.findById(userId);
    if (!user) return null;

    const parsedRole = role ? (roleFromClient(role) ?? 'DEV') : 'DEV';

    // If assigning LEAD, demote any existing lead in this team first
    if (parsedRole === 'LEAD') {
      await User.updateOne(
        { 'teams.teamId': teamId, 'teams.role': 'LEAD' },
        { $set: { 'teams.$.role': 'DEV' } }
      );
    }

    const hasTeam = user.teams.some((t: any) => t.teamId.toString() === teamId.toString());

    if (hasTeam) {
      // Already a member — just update their role in this team
      await User.updateOne(
        { _id: userId, 'teams.teamId': teamId },
        { $set: { 'teams.$.role': parsedRole } }
      );
    } else {
      // New member — push new team entry
      await User.updateOne(
        { _id: userId },
        { $push: { teams: { teamId, role: parsedRole } } } as any
      );
    }

    const member = await User.findById(userId);
    return member ? formatUser(member) : null;
  },

  async removeMember(teamId: string, userId: string) {
    const member = await User.findByIdAndUpdate(
      userId,
      { $pull: { teams: { teamId } } } as any,
      { returnDocument: 'after' }
    );
    return member ? formatUser(member) : null;
  },

  async getMembers(teamId: string, req: AuthRequest) {
    if (req.user?.role !== 'ADMIN') {
      const isMember = (req.user?.teams || []).some((t: any) => t.teamId.toString() === teamId.toString());
      if (!isMember) throw forbidden('Access to this team is restricted');
    }

    const members = await User.find({ 'teams.teamId': teamId, workspaceId: req.user!.workspaceId }).sort({ name: 1 });
    return members.map(formatUser);
  }
};
