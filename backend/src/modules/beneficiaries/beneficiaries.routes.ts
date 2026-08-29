import { Router } from 'express';
import { BeneficiariesController } from './beneficiaries.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createBeneficiarySchema } from './beneficiaries.validation';

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: createBeneficiarySchema }), BeneficiariesController.create);
router.get('/', BeneficiariesController.getAll);
router.delete('/:id', BeneficiariesController.remove);

export default router;
