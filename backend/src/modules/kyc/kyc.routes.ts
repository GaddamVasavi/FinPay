import { Router } from 'express';
import { KYCController } from './kyc.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin, requireSupport } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { submitKYCSchema, reviewKYCSchema } from './kyc.validation';

const router = Router();

router.use(authenticate);

router.get('/profile', KYCController.getProfile);
router.post('/submit', validate({ body: submitKYCSchema }), KYCController.submitKYC);

// Staff Reviewer endpoints
router.get('/pending', requireSupport, KYCController.getPendingSubmissions);
router.patch('/:id/review', requireAdmin, validate({ body: reviewKYCSchema }), KYCController.reviewKYC);

export default router;
