import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.post('/register', authController.register);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.put('/change-password', authenticate, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
