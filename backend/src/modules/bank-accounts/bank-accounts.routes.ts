import { Router } from 'express';
import { BankAccountsController } from './bank-accounts.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { linkBankAccountSchema } from './bank-accounts.validation';

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: linkBankAccountSchema }), BankAccountsController.linkAccount);
router.get('/', BankAccountsController.getAccounts);
router.patch('/:id/default', BankAccountsController.setDefault);
router.delete('/:id', BankAccountsController.removeAccount);

export default router;
