import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { Task } from '../models/Task';
import { Project } from '../models/Project';

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
    }

    next();
  };
};

export const authorizeTaskAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params.id).populate('projectId');

    if (!task) {
      return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
    }

    const user = req.user!;
    
    if (user.role === 'ADMIN') return next();
    
    const project: any = task.populated('projectId') ? task.projectId : await Project.findById(task.projectId);
    const isTeamMember = user.teams?.some((t: any) => t.teamId === project?.teamId?.toString());
    const isTeamLead = user.teams?.some((t: any) => t.teamId === project?.teamId?.toString() && t.role === 'LEAD');

    if (user.role === 'LEAD' || isTeamLead) {
      if (isTeamMember) return next();
      return res.status(403).json({ error: 'Forbidden', message: 'Access to this task is restricted to your team' });
    }

    if (user.role === 'DEV') {
      if (task.assignedTo?.toString() === user.id) return next();
      return res.status(403).json({ error: 'Forbidden', message: 'You can only access your assigned tasks' });
    }
  } catch (error) {
    next(error);
  }
};

export const authorizeProjectAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Not Found', message: 'Project not found' });
    }

    const user = req.user!;
    
    if (user.role === 'ADMIN') return next();
    
    if (!user.teams?.some((t: any) => t.teamId === project.teamId?.toString())) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access to this project is restricted to your team' });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
