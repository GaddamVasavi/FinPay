import { Response, NextFunction } from 'express';
import { CardsService } from './cards.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class CardsController {
  static async createCard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await CardsService.createCard(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Card issued successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getCards(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await CardsService.getCards(req.user!.userId);
      return ApiResponse.success(res, 'Cards retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async toggleFreeze(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CardsService.toggleFreeze(req.user!.userId, id, req);
      return ApiResponse.success(res, result.message, result.card);
    } catch (error) {
      next(error);
    }
  }

  static async updateLimits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CardsService.updateLimits(req.user!.userId, id, req.body, req);
      return ApiResponse.success(res, 'Card limits updated', result);
    } catch (error) {
      next(error);
    }
  }

  static async simulateAuthorization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CardsService.simulateAuthorization(req.user!.userId, id, req.body, req);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }
}
