import { Router } from 'express';
import { register, login, logout } from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
} from '../middleware/validationMiddleware.js';

const router = Router();

router.post('/auth/register', validateRegister, register);
router.post('/auth/login', validateLogin, login);
router.post('/auth/logout', logout);

export default router;
