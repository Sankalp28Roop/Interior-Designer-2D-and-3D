import { Router } from 'express';
import { exportSpecPdf } from '../controllers/exportController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/spec-pdf', optionalAuth, exportSpecPdf);
router.get('/spec-pdf/:projectId', optionalAuth, (req, res) => {
  req.body.projectId = req.params.projectId;
  return exportSpecPdf(req, res);
});

export default router;
