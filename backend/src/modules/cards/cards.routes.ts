import { Router } from 'express';
import { CardsController } from './cards.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createCardSchema,
  updateCardLimitsSchema,
  simulateCardTxSchema,
} from './cards.validation';

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: createCardSchema }), CardsController.createCard);
router.get('/', CardsController.getCards);
router.patch('/:id/freeze', CardsController.toggleFreeze);
router.patch('/:id/limits', validate({ body: updateCardLimitsSchema }), CardsController.updateLimits);
router.post('/:id/simulate-auth', validate({ body: simulateCardTxSchema }), CardsController.simulateAuthorization);

export default router;
