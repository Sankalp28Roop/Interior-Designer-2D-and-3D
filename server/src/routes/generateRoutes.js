import { Router } from 'express';
import {
  generate2DHandler,
  generateInpaintHandler,
  generate3DHandler,
  getJobStatusHandler,
  getGenerationPresets
} from '../controllers/generateController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

router.get('/presets', getGenerationPresets);
router.post('/2d', generate2DHandler);
router.post('/inpaint', generateInpaintHandler);
router.post('/3d', generate3DHandler);
router.get('/status/:jobId', getJobStatusHandler);

export default router;
