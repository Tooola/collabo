import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { badRequest, forbidden, notFound } from '../utils/httpError';
import { formatTask, taskStatusFromClient } from '../utils/formatters';
export const taskService = {
    async getAll(req) {
        let query = {};
        if (req.user?.role === 'ADMIN') {
            // no filter
        }
        else if (req.user?.role === 'LEAD') {
            if (!req.user.teamId)
                return [];
            const projects = await Project.find({ teamId: req.user.teamId }, '_id');
            const projectIds = projects.map(p => p._id);
            query = { projectId: { $in: projectIds } };
        }
        else if (req.user?.role === 'DEV') {
            query = { assignedTo: req.user.id };
        }
        else {
            return [];
        }
        const tasks = await Task.find(query).populate('project').populate('assignedTo').sort({ createdAt: 1 });
        return tasks.map(t => formatTask({ ...t.toJSON(), assignedToUser: t.populated('assignedTo') ? t.assignedTo : null }));
    },
    async getByProject(projectId, req) {
        const query = { projectId };
        if (req.user?.role === 'DEV') {
            query.assignedTo = req.user.id;
        }
        const tasks = await Task.find(query).populate('project').populate('assignedTo').sort({ createdAt: 1 });
        return tasks.map(t => formatTask({ ...t.toJSON(), assignedToUser: t.populated('assignedTo') ? t.assignedTo : null }));
    },
    async getById(id) {
        const task = await Task.findById(id).populate('project').populate('assignedTo');
        if (!task)
            return null;
        return formatTask({ ...task.toJSON(), assignedToUser: task.populated('assignedTo') ? task.assignedTo : null });
    },
    async create(data, req) {
        await assertLeadCanWriteProject(req, data.projectId);
        const assignedTo = data.assignedToUserId ?? data.assignedTo;
        if (assignedTo)
            await assertAssigneeInProjectTeam(data.projectId, assignedTo);
        const task = await Task.create({
            title: data.title,
            description: data.description,
            projectId: data.projectId,
            assignedTo: assignedTo || null,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            status: taskStatusFromClient(data.status) ?? 'A_FAIRE'
        });
        const populated = await task.populate('assignedTo');
        return formatTask({ ...populated.toJSON(), assignedToUser: populated.populated('assignedTo') ? populated.assignedTo : null });
    },
    async update(id, data, req) {
        const existing = await Task.findById(id).populate('project');
        if (!existing)
            throw notFound('Task not found');
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
        if (assignedTo !== undefined)
            updateData.assignedTo = assignedTo || null;
        if (data.dueDate !== undefined)
            updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        if (data.status !== undefined) {
            const s = taskStatusFromClient(data.status);
            if (s)
                updateData.status = s;
        }
        const task = await Task.findByIdAndUpdate(id, updateData, { new: true }).populate('assignedTo');
        if (!task)
            throw notFound('Task not found');
        return formatTask({ ...task.toJSON(), assignedToUser: task.populated('assignedTo') ? task.assignedTo : null });
    },
    async updateStatus(id, status, req) {
        const existing = await Task.findById(id).populate('project');
        if (!existing)
            throw notFound('Task not found');
        if (req.user?.role === 'DEV' && existing.assignedTo?.toString() !== req.user.id) {
            throw forbidden('You can only update your own assigned tasks');
        }
        const project = existing.populated('project') ? existing.project : await Project.findById(existing.projectId);
        if (req.user?.role === 'LEAD' && project?.teamId?.toString() !== req.user.teamId) {
            throw forbidden('You can only update tasks from your team');
        }
        const nextStatus = taskStatusFromClient(status);
        if (!nextStatus)
            throw badRequest('Invalid task status');
        const task = await Task.findByIdAndUpdate(id, { status: nextStatus }, { new: true }).populate('assignedTo');
        if (!task)
            throw notFound('Task not found');
        return formatTask({ ...task.toJSON(), assignedToUser: task.populated('assignedTo') ? task.assignedTo : null });
    },
    async delete(id) {
        await Task.findByIdAndDelete(id);
        return { success: true };
    }
};
async function assertLeadCanWriteProject(req, projectId) {
    if (req.user?.role === 'ADMIN')
        return;
    if (req.user?.role !== 'LEAD')
        throw forbidden('Only admin and lead can write tasks');
    if (!req.user.teamId)
        throw forbidden('Lead must belong to a team');
    const project = await Project.findById(projectId);
    if (!project)
        throw notFound('Project not found');
    if (project.teamId.toString() !== req.user.teamId)
        throw forbidden('You can only write tasks from your team');
}
async function assertAssigneeInProjectTeam(projectId, userId) {
    const project = await Project.findById(projectId);
    const user = await User.findById(userId);
    if (!project)
        throw notFound('Project not found');
    if (!user)
        throw notFound('Assigned user not found');
    if (user.teamId?.toString() !== project.teamId.toString())
        throw badRequest('Assigned user must belong to the project team');
}
