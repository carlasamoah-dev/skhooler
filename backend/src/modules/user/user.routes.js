import { Router } from 'express';
import * as userController from './user.controller.js';

const router = Router();
router.get('/:username', userController.getUserProfile);
export default router;
