import { Router } from 'express';
import { enhancePromptHandler } from '../controllers/promptController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/enhance', optionalAuth, enhancePromptHandler);

export default router;
