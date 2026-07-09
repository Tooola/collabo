import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { authenticate } from '../middlewares/authenticate';
import { authorize, authorizeProjectAccess } from '../middlewares/authorize';
import { taskController } from '../controllers/taskController';

const router = Router();

router.use(authenticate);
router.get('/', projectController.getAll);
router.get('/:id', authorizeProjectAccess, projectController.getById);
router.post('/', authorize(['ADMIN']), projectController.create);
router.put('/:id', authorize(['ADMIN']), projectController.update);
router.delete('/:id', authorize(['ADMIN']), projectController.delete);
router.get('/:id/tasks', authorizeProjectAccess, taskController.getByProject);

export default router;
