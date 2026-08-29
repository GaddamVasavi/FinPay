import { Response, NextFunction } from 'express';
import { BankAccountsService } from './bank-accounts.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class BankAccountsController {
  static async linkAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BankAccountsService.linkBankAccount(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Bank account linked successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BankAccountsService.getBankAccounts(req.user!.userId);
      return ApiResponse.success(res, 'Bank accounts retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async setDefault(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await BankAccountsService.setDefault(req.user!.userId, id, req);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async removeAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await BankAccountsService.remove(req.user!.userId, id, req);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}
