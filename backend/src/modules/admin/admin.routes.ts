import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateUserStatusSchema } from './admin.validation';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', validate({ body: updateUserStatusSchema }), AdminController.updateUserStatus);
router.get('/risk-alerts', AdminController.getRiskAlerts);
router.patch('/risk-alerts/:id/review', AdminController.reviewRiskAlert);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
