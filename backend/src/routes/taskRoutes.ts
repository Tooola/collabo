import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticate } from '../middlewares/authenticate';
import { authorize, authorizeTaskAccess } from '../middlewares/authorize';

const router = Router();

router.use(authenticate);
router.get('/', taskController.getAll);
router.get('/:id', authorizeTaskAccess, taskController.getById);
router.post('/', authorize(['ADMIN', 'LEAD']), taskController.create);
router.put('/:id', authorize(['ADMIN', 'LEAD']), authorizeTaskAccess, taskController.update);
router.patch('/:id/status', authorizeTaskAccess, taskController.updateStatus);
router.delete('/:id', authorize(['ADMIN', 'LEAD']), authorizeTaskAccess, taskController.delete);

export default router;
