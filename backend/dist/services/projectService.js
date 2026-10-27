"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = void 0;
exports.buildVisibleProjectQuery = buildVisibleProjectQuery;
const Project_1 = require("../models/Project");
const Task_1 = require("../models/Task");
const httpError_1 = require("../utils/httpError");
const formatters_1 = require("../utils/formatters");
/**
 * Visibility rule shared by GET /projects and the analytics aggregations, so
 * the portfolio view can never expose a project the caller cannot open.
 */
function buildVisibleProjectQuery(req) {
    const wid = req.user.workspaceId;
    if (req.user?.role === 'ADMIN')
        return { workspaceId: wid };
    const userTeams = req.user?.teams || [];
    if (userTeams.length === 0)
        return { workspaceId: wid, _id: { $in: [] } };
    return { workspaceId: wid, teamId: { $in: userTeams.map((t) => t.teamId) } };
}
exports.projectService = {
    async getAll(req) {
        const query = buildVisibleProjectQuery(req);
        if (query._id?.$in?.length === 0)
            return [];
        const projects = await Project_1.Project.find(query).populate('teamId').sort({ createdAt: 1 });
        return projects.map(formatters_1.formatProject);
    },
    async getById(id) {
        const project = await Project_1.Project.findById(id).populate('teamId');
        return project ? (0, formatters_1.formatProject)(project) : null;
    },
    async create(data, req) {
        const project = await Project_1.Project.create({
            name: data.name,
            description: data.description,
            teamId: data.teamId,
            status: (0, formatters_1.projectStatusFromClient)(data.status) ?? 'EN_COURS',
            workspaceId: req.user.workspaceId
        });
        const populated = await project.populate('teamId');
        return (0, formatters_1.formatProject)(populated);
    },
    async update(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.teamId !== undefined)
            updateData.teamId = data.teamId;
        if (data.status !== undefined) {
            const s = (0, formatters_1.projectStatusFromClient)(data.status);
            if (s)
                updateData.status = s;
        }
        const project = await Project_1.Project.findByIdAndUpdate(id, updateData, { returnDocument: 'after' }).populate('teamId');
        return project ? (0, formatters_1.formatProject)(project) : null;
    },
    async delete(id) {
        await Task_1.Task.deleteMany({ projectId: id });
        await Project_1.Project.findByIdAndDelete(id);
        return { success: true };
    },
    async assertProjectVisible(user, projectId) {
        const project = await Project_1.Project.findById(projectId);
        if (!project)
            throw (0, httpError_1.notFound)('Project not found');
        const userTeams = user?.teams || [];
        const isMember = userTeams.some((t) => t.teamId === project.teamId.toString());
        if (user?.role !== 'ADMIN' && !isMember) {
            throw (0, httpError_1.forbidden)('Access to this project is restricted to your team');
        }
        return project;
    }
};
