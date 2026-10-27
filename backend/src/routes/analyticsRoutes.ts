import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// Analyse réservée aux utilisateurs authentifiés : les agrégations sont
// restreintes au workspace et aux équipes visibles par l'appelant.
router.use(authenticate);

router.get('/status', analyticsController.status);
router.post('/flux', analyticsController.flux);
router.post('/taches', analyticsController.taches);
router.post('/projets', analyticsController.projets);
router.post('/synthese', analyticsController.synthese);

export default router;
