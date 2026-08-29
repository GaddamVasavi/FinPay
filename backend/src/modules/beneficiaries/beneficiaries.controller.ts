import { Response, NextFunction } from 'express';
import { BeneficiariesService } from './beneficiaries.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class BeneficiariesController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BeneficiariesService.create(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Beneficiary added successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BeneficiariesService.getAll(req.user!.userId);
      return ApiResponse.success(res, 'Beneficiaries retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await BeneficiariesService.remove(req.user!.userId, id, req);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}
