import { Router } from 'express';
import { SupportController } from './support.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdminOrSupport } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const createTicketSchema = z.object({
  subject: z.string().min(3),
  message: z.string().min(5),
  category: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

router.use(authenticate);

router.post('/', validate({ body: createTicketSchema }), SupportController.createTicket);
router.get('/my', SupportController.getUserTickets);
router.get('/', requireAdminOrSupport, SupportController.getAllTickets);
router.patch('/:id', requireAdminOrSupport, SupportController.updateTicket);

export default router;
