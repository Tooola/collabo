"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamService = void 0;
const Team_1 = require("../models/Team");
const User_1 = require("../models/User");
const Project_1 = require("../models/Project");
const Task_1 = require("../models/Task");
const httpError_1 = require("../utils/httpError");
const formatters_1 = require("../utils/formatters");
exports.teamService = {
    async getAll(req) {
        const wid = req.user.workspaceId;
        if (req.user?.role === 'ADMIN') {
            const teams = await Team_1.Team.find({ workspaceId: wid }).sort({ createdAt: 1 });
            const results = [];
            for (const team of teams) {
                const usersCount = await User_1.User.countDocuments({ 'teams.teamId': team._id, workspaceId: wid });
                const projectsCount = await Project_1.Project.countDocuments({ teamId: team._id, workspaceId: wid });
                results.push((0, formatters_1.formatTeam)({ ...team.toJSON(), memberCount: usersCount, projectCount: projectsCount }));
            }
            return results;
        }
        // Non-admins: use JWT teams array (always fresh after page load via /me token refresh)
        const userTeams = req.user?.teams || [];
        if (userTeams.length === 0)
            return [];
        const teamIds = userTeams.map(t => t.teamId);
        const teams = await Team_1.Team.find({ _id: { $in: teamIds }, workspaceId: wid }).sort({ createdAt: 1 });
        const results = [];
        for (const team of teams) {
            const usersCount = await User_1.User.countDocuments({ 'teams.teamId': team._id, workspaceId: wid });
            const projectsCount = await Project_1.Project.countDocuments({ teamId: team._id, workspaceId: wid });
            results.push((0, formatters_1.formatTeam)({ ...team.toJSON(), memberCount: usersCount, projectCount: projectsCount }));
        }
        return results;
    },
    async getById(id, req) {
        if (req?.user?.role !== 'ADMIN') {
            const isMember = (req?.user?.teams || []).some((t) => t.teamId === id);
            if (!isMember)
                throw (0, httpError_1.forbidden)('Access to this team is restricted');
        }
        const team = await Team_1.Team.findById(id);
        if (!team)
            return null;
        const wid = req?.user?.workspaceId;
        const usersCount = await User_1.User.countDocuments({ 'teams.teamId': id, workspaceId: wid });
        const projectsCount = await Project_1.Project.countDocuments({ teamId: id, workspaceId: wid });
        return (0, formatters_1.formatTeam)({ ...team.toJSON(), memberCount: usersCount, projectCount: projectsCount });
    },
    async create(data, req) {
        const team = await Team_1.Team.create({ ...data, workspaceId: req.user.workspaceId });
        return (0, formatters_1.formatTeam)(team);
    },
    async update(id, data) {
        const team = await Team_1.Team.findByIdAndUpdate(id, data, { returnDocument: 'after' });
        return team ? (0, formatters_1.formatTeam)(team) : null;
    },
    async delete(id) {
        const projects = await Project_1.Project.find({ teamId: id }, '_id');
        const projectIds = projects.map(p => p._id);
        await Task_1.Task.deleteMany({ projectId: { $in: projectIds } });
        await Project_1.Project.deleteMany({ teamId: id });
        // Remove this team from all users' teams arrays
        await User_1.User.updateMany({ 'teams.teamId': id }, { $pull: { teams: { teamId: id } } });
        await Team_1.Team.findByIdAndDelete(id);
        return { success: true };
    },
    async addMember(teamId, userId, role) {
        const user = await User_1.User.findById(userId);
        if (!user)
            return null;
        const parsedRole = role ? ((0, formatters_1.roleFromClient)(role) ?? 'DEV') : 'DEV';
        // If assigning LEAD, demote any existing lead in this team first
        if (parsedRole === 'LEAD') {
            await User_1.User.updateOne({ 'teams.teamId': teamId, 'teams.role': 'LEAD' }, { $set: { 'teams.$.role': 'DEV' } });
        }
        const hasTeam = user.teams.some((t) => t.teamId.toString() === teamId.toString());
        if (hasTeam) {
            // Already a member — just update their role in this team
            await User_1.User.updateOne({ _id: userId, 'teams.teamId': teamId }, { $set: { 'teams.$.role': parsedRole } });
        }
        else {
            // New member — push new team entry
            await User_1.User.updateOne({ _id: userId }, { $push: { teams: { teamId, role: parsedRole } } });
        }
        const member = await User_1.User.findById(userId);
        return member ? (0, formatters_1.formatUser)(member) : null;
    },
    async removeMember(teamId, userId) {
        const member = await User_1.User.findByIdAndUpdate(userId, { $pull: { teams: { teamId } } }, { returnDocument: 'after' });
        return member ? (0, formatters_1.formatUser)(member) : null;
    },
    async getMembers(teamId, req) {
        if (req.user?.role !== 'ADMIN') {
            const isMember = (req.user?.teams || []).some((t) => t.teamId.toString() === teamId.toString());
            if (!isMember)
                throw (0, httpError_1.forbidden)('Access to this team is restricted');
        }
        const members = await User_1.User.find({ 'teams.teamId': teamId, workspaceId: req.user.workspaceId }).sort({ name: 1 });
        return members.map(formatters_1.formatUser);
    }
};
