"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = void 0;
const Task_1 = require("../models/Task");
const Project_1 = require("../models/Project");
const User_1 = require("../models/User");
const httpError_1 = require("../utils/httpError");
const formatters_1 = require("../utils/formatters");
exports.taskService = {
    async getAll(req) {
        const wid = req.user.workspaceId;
        let query = { workspaceId: wid };
        if (req.user?.role === 'ADMIN') {
            // no additional filter - just workspaceId
        }
        else if (req.user?.role === 'LEAD') {
            if (!req.user.teamId)
                return [];
            const projects = await Project_1.Project.find({ teamId: req.user.teamId, workspaceId: wid }, '_id');
            const projectIds = projects.map(p => p._id);
            query.projectId = { $in: projectIds };
        }
        else if (req.user?.role === 'DEV') {
            query.assignedTo = req.user.id;
        }
        else {
            return [];
        }
        const tasks = await Task_1.Task.find(query).populate('projectId').populate('assignedTo').sort({ createdAt: 1 });
        return tasks.map(t => (0, formatters_1.formatTask)({ ...t.toJSON(), assignedToUser: t.populated('assignedTo') ? t.assignedTo : null }));
    },
    async getByProject(projectId, req) {
        const query = { projectId, workspaceId: req.user.workspaceId };
        if (req.user?.role === 'DEV') {
            query.assignedTo = req.user.id;
        }
        const tasks = await Task_1.Task.find(query).populate('projectId').populate('assignedTo').sort({ createdAt: 1 });
        return tasks.map(t => (0, formatters_1.formatTask)({ ...t.toJSON(), assignedToUser: t.populated('assignedTo') ? t.assignedTo : null }));
    },
    async getById(id) {
        const task = await Task_1.Task.findById(id).populate('projectId').populate('assignedTo');
        if (!task)
            return null;
        return (0, formatters_1.formatTask)({ ...task.toJSON(), assignedToUser: task.populated('assignedTo') ? task.assignedTo : null });
    },
    async create(data, req) {
        await assertLeadCanWriteProject(req, data.projectId);
        const assignedTo = data.assignedToUserId ?? data.assignedTo;
        if (assignedTo)
            await assertAssigneeInProjectTeam(data.projectId, assignedTo);
        const task = await Task_1.Task.create({
            title: data.title,
            description: data.description,
            projectId: data.projectId,
            parentId: data.parentId || null,
            assignedTo: assignedTo || null,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            status: (0, formatters_1.taskStatusFromClient)(data.status) ?? 'A_FAIRE',
            workspaceId: req.user.workspaceId
        });
        const populated = await task.populate('assignedTo');
        return (0, formatters_1.formatTask)({ ...populated.toJSON(), assignedToUser: populated.populated('assignedTo') ? populated.assignedTo : null });
    },
    async update(id, data, req) {
        const existing = await Task_1.Task.findById(id).populate('projectId');
        if (!existing)
            throw (0, httpError_1.notFound)('Task not found');
        await assertLeadCanWriteProject(req, existing.projectId.toString());
        const targetProjectId = data.projectId ?? existing.projectId.toString();
        if (data.projectId)
            await assertLeadCanWriteProject(req, data.projectId);
        const assignedTo = data.assignedToUserId ?? data.assignedTo;
        if (assignedTo)
            await assertAssigneeInProjectTeam(targetProjectId, assignedTo);
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.projectId !== undefined)
            updateData.projectId = data.projectId;
        if ('parentId' in data)
            updateData.parentId = data.parentId || null;
        if (assignedTo !== undefined)
            updateData.assignedTo = assignedTo || null;
        if (data.dueDate !== undefined)
            updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        if (data.status !== undefined) {
            const s = (0, formatters_1.taskStatusFromClient)(data.status);
            if (s)
                updateData.status = s;
        }
        const task = await Task_1.Task.findByIdAndUpdate(id, updateData, { new: true }).populate('assignedTo');
        if (!task)
            throw (0, httpError_1.notFound)('Task not found');
        return (0, formatters_1.formatTask)({ ...task.toJSON(), assignedToUser: task.populated('assignedTo') ? task.assignedTo : null });
    },
    async updateStatus(id, status, req) {
        const existing = await Task_1.Task.findById(id).populate('projectId');
        if (!existing)
            throw (0, httpError_1.notFound)('Task not found');
        if (req.user?.role === 'DEV' && existing.assignedTo?.toString() !== req.user.id) {
            throw (0, httpError_1.forbidden)('You can only update your own assigned tasks');
        }
        const project = existing.populated('projectId') ? existing.projectId : await Project_1.Project.findById(existing.projectId);
        if (req.user?.role === 'LEAD' && project?.teamId?.toString() !== req.user.teamId) {
            throw (0, httpError_1.forbidden)('You can only update tasks from your team');
        }
        const nextStatus = (0, formatters_1.taskStatusFromClient)(status);
        if (!nextStatus)
            throw (0, httpError_1.badRequest)('Invalid task status');
        const task = await Task_1.Task.findByIdAndUpdate(id, { status: nextStatus }, { new: true }).populate('assignedTo');
        if (!task)
            throw (0, httpError_1.notFound)('Task not found');
        return (0, formatters_1.formatTask)({ ...task.toJSON(), assignedToUser: task.populated('assignedTo') ? task.assignedTo : null });
    },
    async delete(id) {
        await Task_1.Task.findByIdAndDelete(id);
        return { success: true };
    }
};
async function assertLeadCanWriteProject(req, projectId) {
    if (req.user?.role === 'ADMIN')
        return;
    if (req.user?.role !== 'LEAD')
        throw (0, httpError_1.forbidden)('Only admin and lead can write tasks');
    if (!req.user.teamId)
        throw (0, httpError_1.forbidden)('Lead must belong to a team');
    const project = await Project_1.Project.findById(projectId);
    if (!project)
        throw (0, httpError_1.notFound)('Project not found');
    if (project.teamId.toString() !== req.user.teamId)
        throw (0, httpError_1.forbidden)('You can only write tasks from your team');
}
async function assertAssigneeInProjectTeam(projectId, userId) {
    const project = await Project_1.Project.findById(projectId);
    const user = await User_1.User.findById(userId);
    if (!project)
        throw (0, httpError_1.notFound)('Project not found');
    if (!user)
        throw (0, httpError_1.notFound)('Assigned user not found');
    if (user.teamId?.toString() !== project.teamId.toString())
        throw (0, httpError_1.badRequest)('Assigned user must belong to the project team');
}
