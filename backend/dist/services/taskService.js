"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = void 0;
exports.buildVisibleTaskQuery = buildVisibleTaskQuery;
const Task_1 = require("../models/Task");
const Project_1 = require("../models/Project");
const User_1 = require("../models/User");
const httpError_1 = require("../utils/httpError");
const formatters_1 = require("../utils/formatters");
/**
 * Visibility rule shared by GET /tasks and the analytics aggregations, so a
 * caller can never read more through an analytics endpoint than through the
 * task list itself.
 */
async function buildVisibleTaskQuery(req) {
    const wid = req.user.workspaceId;
    if (req.user?.role === 'ADMIN')
        return { workspaceId: wid };
    // Use JWT teams array (always fresh via /me token refresh on page load)
    const userTeams = req.user?.teams || [];
    const leadTeamIds = userTeams.filter(t => t.role === 'LEAD').map(t => t.teamId);
    if (leadTeamIds.length > 0) {
        // DEV who is also a team lead: see all tasks from led teams + their own assigned tasks
        const projects = await Project_1.Project.find({ teamId: { $in: leadTeamIds }, workspaceId: wid }, '_id');
        return {
            workspaceId: wid,
            $or: [{ assignedTo: req.user.id }, { projectId: { $in: projects.map(p => p._id) } }]
        };
    }
    return { workspaceId: wid, assignedTo: req.user.id };
}
exports.taskService = {
    async getAll(req) {
        const query = await buildVisibleTaskQuery(req);
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
        const task = await Task_1.Task.findByIdAndUpdate(id, updateData, { returnDocument: 'after' }).populate('assignedTo');
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
        const project = existing.projectId && typeof existing.projectId === 'object' && existing.projectId.name
            ? existing.projectId
            : await Project_1.Project.findById(existing.projectId);
        // Check if user is a member of the project's team (either DEV or LEAD)
        const userTeams = req.user?.teams || [];
        const teamMember = userTeams.find((t) => t.teamId === project?.teamId?.toString());
        if (req.user?.role !== 'ADMIN' && !teamMember) {
            throw (0, httpError_1.forbidden)('You can only update tasks from your team');
        }
        const nextStatus = (0, formatters_1.taskStatusFromClient)(status);
        if (!nextStatus)
            throw (0, httpError_1.badRequest)('Invalid task status');
        const task = await Task_1.Task.findByIdAndUpdate(id, { status: nextStatus }, { returnDocument: 'after' }).populate('assignedTo');
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
    const project = await Project_1.Project.findById(projectId);
    if (!project)
        throw (0, httpError_1.notFound)('Project not found');
    const userTeams = req.user?.teams || [];
    const teamMember = userTeams.find((t) => t.teamId === project.teamId.toString());
    if (!teamMember)
        throw (0, httpError_1.forbidden)('You can only write tasks from your team');
    if (teamMember.role !== 'LEAD')
        throw (0, httpError_1.forbidden)('Only admin and lead can write tasks');
}
async function assertAssigneeInProjectTeam(projectId, userId) {
    const project = await Project_1.Project.findById(projectId);
    const user = await User_1.User.findById(userId);
    if (!project)
        throw (0, httpError_1.notFound)('Project not found');
    if (!user)
        throw (0, httpError_1.notFound)('Assigned user not found');
    const userTeams = user.teams || [];
    const isMember = userTeams.some((t) => t.teamId.toString() === project.teamId.toString());
    if (!isMember)
        throw (0, httpError_1.badRequest)('Assigned user must belong to the project team');
}
