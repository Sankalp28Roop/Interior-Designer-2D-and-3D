import { Router } from 'express';
import { listProjects, getProjectById, createProject, updateProject, getProjectChat } from '../controllers/projectController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

router.get('/', listProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.get('/:id/chat', getProjectChat);

export default router;
