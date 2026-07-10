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
        if (req.user?.role !== 'ADMIN' && !req.user?.teamId)
            return [];
        const query = { workspaceId: wid };
        if (req.user?.role !== 'ADMIN')
            query._id = req.user.teamId;
        const teams = await Team_1.Team.find(query).sort({ createdAt: 1 });
        const results = [];
        for (const team of teams) {
            const usersCount = await User_1.User.countDocuments({ teamId: team._id, workspaceId: wid });
            const projectsCount = await Project_1.Project.countDocuments({ teamId: team._id, workspaceId: wid });
            results.push((0, formatters_1.formatTeam)({ ...team.toJSON(), memberCount: usersCount, projectCount: projectsCount }));
        }
        return results;
    },
    async getById(id, req) {
        if (req?.user?.role !== 'ADMIN' && req?.user?.teamId !== id) {
            throw (0, httpError_1.forbidden)('Access to this team is restricted');
        }
        const team = await Team_1.Team.findById(id);
        if (!team)
            return null;
        const wid = req?.user?.workspaceId;
        const usersCount = await User_1.User.countDocuments({ teamId: id, workspaceId: wid });
        const projectsCount = await Project_1.Project.countDocuments({ teamId: id, workspaceId: wid });
        return (0, formatters_1.formatTeam)({ ...team.toJSON(), memberCount: usersCount, projectCount: projectsCount });
    },
    async create(data, req) {
        const team = await Team_1.Team.create({ ...data, workspaceId: req.user.workspaceId });
        return (0, formatters_1.formatTeam)(team);
    },
    async update(id, data) {
        const team = await Team_1.Team.findByIdAndUpdate(id, data, { new: true });
        return team ? (0, formatters_1.formatTeam)(team) : null;
    },
    async delete(id) {
        const projects = await Project_1.Project.find({ teamId: id }, '_id');
        const projectIds = projects.map(p => p._id);
        await Task_1.Task.deleteMany({ projectId: { $in: projectIds } });
        await Project_1.Project.deleteMany({ teamId: id });
        await User_1.User.updateMany({ teamId: id }, { $set: { teamId: null } });
        await Team_1.Team.findByIdAndDelete(id);
        return { success: true };
    },
    async addMember(teamId, userId, role) {
        const updateData = { teamId };
        if (role) {
            const parsedRole = (0, formatters_1.roleFromClient)(role);
            if (parsedRole)
                updateData.role = parsedRole;
        }
        const member = await User_1.User.findByIdAndUpdate(userId, updateData, { new: true });
        return member ? (0, formatters_1.formatUser)(member) : null;
    },
    async removeMember(teamId, userId) {
        const member = await User_1.User.findByIdAndUpdate(userId, { $set: { teamId: null } }, { new: true });
        return member ? (0, formatters_1.formatUser)(member) : null;
    },
    async getMembers(teamId, req) {
        if (req.user?.role !== 'ADMIN' && req.user?.teamId?.toString() !== teamId.toString()) {
            throw (0, httpError_1.forbidden)('Access to this team is restricted');
        }
        const members = await User_1.User.find({ teamId, workspaceId: req.user.workspaceId }).sort({ name: 1 });
        return members.map(formatters_1.formatUser);
    }
};
