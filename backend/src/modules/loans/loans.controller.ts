import { Response, NextFunction } from 'express';
import { LoansService } from './loans.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class LoansController {
  static async applyLoan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await LoansService.applyLoan(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Loan application submitted successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getLoans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await LoansService.getLoans(req.user!.userId);
      return ApiResponse.success(res, 'Loans retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async reviewLoan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await LoansService.reviewLoan(req.user!.userId, id, req.body, req);
      return ApiResponse.success(res, result.message, result.loan);
    } catch (error) {
      next(error);
    }
  }

  static async repayInstallment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await LoansService.repayInstallment(req.user!.userId, req.body, req);
      return ApiResponse.success(res, result.message, result.repayment);
    } catch (error) {
      next(error);
    }
  }
}
