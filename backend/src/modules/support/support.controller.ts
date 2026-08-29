import { Response, NextFunction } from 'express';
import { SupportService } from './support.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class SupportController {
  static async createTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await SupportService.createTicket(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Support ticket created', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getUserTickets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await SupportService.getUserTickets(req.user!.userId);
      return ApiResponse.success(res, 'Support tickets retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async getAllTickets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await SupportService.getAllTickets();
      return ApiResponse.success(res, 'All tickets retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async updateTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await SupportService.updateTicket(req.user!.userId, id, req.body, req);
      return ApiResponse.success(res, 'Ticket updated', result);
    } catch (error) {
      next(error);
    }
  }
}
