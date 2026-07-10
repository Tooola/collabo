"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = void 0;
const Project_1 = require("../models/Project");
const Task_1 = require("../models/Task");
const httpError_1 = require("../utils/httpError");
const formatters_1 = require("../utils/formatters");
exports.projectService = {
    async getAll(req) {
        const wid = req.user.workspaceId;
        if (req.user?.role !== 'ADMIN' && !req.user?.teamId)
            return [];
        const query = { workspaceId: wid };
        if (req.user?.role !== 'ADMIN')
            query.teamId = req.user.teamId;
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
        const project = await Project_1.Project.findByIdAndUpdate(id, updateData, { new: true }).populate('teamId');
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
        if (user?.role !== 'ADMIN' && project.teamId.toString() !== user?.teamId) {
            throw (0, httpError_1.forbidden)('Access to this project is restricted to your team');
        }
        return project;
    }
};
