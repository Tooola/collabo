import { Team } from '../models/Team';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { forbidden } from '../utils/httpError';
import { formatTeam, formatUser, roleFromClient } from '../utils/formatters';
export const teamService = {
    async getAll(req) {
        if (req.user?.role !== 'ADMIN' && !req.user?.teamId)
            return [];
        const query = req.user?.role === 'ADMIN' ? {} : { _id: req.user.teamId };
        const teams = await Team.find(query).sort({ createdAt: 1 });
        // Pour chaque équipe, on compte les utilisateurs et projets
        const results = [];
        for (const team of teams) {
            const usersCount = await User.countDocuments({ teamId: team._id });
            const projectsCount = await Project.countDocuments({ teamId: team._id });
            results.push(formatTeam({ ...team.toJSON(), memberCount: usersCount, projectCount: projectsCount }));
        }
        return results;
    },
    async getById(id, req) {
        if (req?.user?.role !== 'ADMIN' && req?.user?.teamId !== id) {
            throw forbidden('Access to this team is restricted');
        }
        const team = await Team.findById(id);
        if (!team)
            return null;
        const usersCount = await User.countDocuments({ teamId: id });
        const projectsCount = await Project.countDocuments({ teamId: id });
        return formatTeam({ ...team.toJSON(), memberCount: usersCount, projectCount: projectsCount });
    },
    async create(data) {
        const team = await Team.create(data);
        return formatTeam(team);
    },
    async update(id, data) {
        const team = await Team.findByIdAndUpdate(id, data, { new: true });
        return team ? formatTeam(team) : null;
    },
    async delete(id) {
        const projects = await Project.find({ teamId: id }, '_id');
        const projectIds = projects.map(p => p._id);
        await Task.deleteMany({ projectId: { $in: projectIds } });
        await Project.deleteMany({ teamId: id });
        await User.updateMany({ teamId: id }, { $set: { teamId: null } });
        await Team.findByIdAndDelete(id);
        return { success: true };
    },
    async addMember(teamId, userId, role) {
        const updateData = { teamId };
        if (role) {
            const parsedRole = roleFromClient(role);
            if (parsedRole)
                updateData.role = parsedRole;
        }
        const member = await User.findByIdAndUpdate(userId, updateData, { new: true });
        return member ? formatUser(member) : null;
    },
    async removeMember(teamId, userId) {
        const member = await User.findByIdAndUpdate(userId, { $set: { teamId: null } }, { new: true });
        return member ? formatUser(member) : null;
    },
    async getMembers(teamId, req) {
        if (req.user?.role !== 'ADMIN' && req.user?.teamId !== teamId) {
            throw forbidden('Access to this team is restricted');
        }
        const members = await User.find({ teamId }).sort({ name: 1 });
        return members.map(formatUser);
    }
};
