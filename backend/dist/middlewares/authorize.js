"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeProjectAccess = exports.authorizeTaskAccess = exports.authorize = void 0;
const Task_1 = require("../models/Task");
const Project_1 = require("../models/Project");
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
        }
        next();
    };
};
exports.authorize = authorize;
const authorizeTaskAccess = async (req, res, next) => {
    try {
        const task = await Task_1.Task.findById(req.params.id).populate('projectId');
        if (!task) {
            return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
        }
        const user = req.user;
        if (user.role === 'ADMIN')
            return next();
        const project = task.populated('projectId') ? task.projectId : await Project_1.Project.findById(task.projectId);
        const isTeamMember = user.teams?.some((t) => t.teamId === project?.teamId?.toString());
        const isTeamLead = user.teams?.some((t) => t.teamId === project?.teamId?.toString() && t.role === 'LEAD');
        if (user.role === 'LEAD' || isTeamLead) {
            if (isTeamMember)
                return next();
            return res.status(403).json({ error: 'Forbidden', message: 'Access to this task is restricted to your team' });
        }
        if (user.role === 'DEV') {
            if (task.assignedTo?.toString() === user.id)
                return next();
            return res.status(403).json({ error: 'Forbidden', message: 'You can only access your assigned tasks' });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.authorizeTaskAccess = authorizeTaskAccess;
const authorizeProjectAccess = async (req, res, next) => {
    try {
        const project = await Project_1.Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Not Found', message: 'Project not found' });
        }
        const user = req.user;
        if (user.role === 'ADMIN')
            return next();
        if (!user.teams?.some((t) => t.teamId === project.teamId?.toString())) {
            return res.status(403).json({ error: 'Forbidden', message: 'Access to this project is restricted to your team' });
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authorizeProjectAccess = authorizeProjectAccess;
