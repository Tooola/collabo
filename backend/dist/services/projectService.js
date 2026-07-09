import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { forbidden, notFound } from '../utils/httpError';
import { formatProject, projectStatusFromClient } from '../utils/formatters';
export const projectService = {
    async getAll(req) {
        if (req.user?.role !== 'ADMIN' && !req.user?.teamId)
            return [];
        const query = req.user?.role === 'ADMIN' ? {} : { teamId: req.user.teamId };
        const projects = await Project.find(query).populate('team').sort({ createdAt: 1 });
        return projects.map(formatProject);
    },
    async getById(id) {
        const project = await Project.findById(id).populate('team');
        return project ? formatProject(project) : null;
    },
    async create(data) {
        const project = await Project.create({
            name: data.name,
            description: data.description,
            teamId: data.teamId,
            status: projectStatusFromClient(data.status) ?? 'EN_COURS'
        });
        const populated = await project.populate('team');
        return formatProject(populated);
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
            const s = projectStatusFromClient(data.status);
            if (s)
                updateData.status = s;
        }
        const project = await Project.findByIdAndUpdate(id, updateData, { new: true }).populate('team');
        return project ? formatProject(project) : null;
    },
    async delete(id) {
        await Task.deleteMany({ projectId: id });
        await Project.findByIdAndDelete(id);
        return { success: true };
    },
    async assertProjectVisible(user, projectId) {
        const project = await Project.findById(projectId);
        if (!project)
            throw notFound('Project not found');
        if (user?.role !== 'ADMIN' && project.teamId.toString() !== user?.teamId) {
            throw forbidden('Access to this project is restricted to your team');
        }
        return project;
    }
};
