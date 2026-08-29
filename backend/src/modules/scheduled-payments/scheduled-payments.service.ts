import { prisma } from '../../database/prisma';
import { Money } from '../../utils/decimal';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';

export class ScheduledPaymentsService {
  /**
   * Create an automated recurring scheduled payment
   */
  static async create(
    userId: string,
    dto: {
      recipientName: string;
      recipientAccount: string;
      amount: number;
      currency?: string;
      frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
      startDate: string;
      endDate?: string;
      description?: string;
    },
    req?: any
  ) {
    const currency = dto.currency || 'USD';
    const amountDec = Money.parse(dto.amount);
    const startDate = new Date(dto.startDate);

    const scheduled = await prisma.scheduledPayment.create({
      data: {
        userId,
        recipientName: dto.recipientName,
        recipientAccount: dto.recipientAccount,
        amount: amountDec.toFixed(4),
        currency,
        frequency: dto.frequency,
        startDate,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        nextExecution: startDate,
        isActive: true,
        description: dto.description || null,
      },
    });

    await AuditService.log({
      userId,
      action: 'SCHEDULED_PAYMENT_CREATED',
      entityType: 'ScheduledPayment',
      entityId: scheduled.id,
      details: { frequency: dto.frequency, amount: dto.amount },
      req,
    });

    return scheduled;
  }

  /**
   * Get active scheduled recurring payments for user
   */
  static async getAll(userId: string) {
    return prisma.scheduledPayment.findMany({
      where: { userId },
      orderBy: { nextExecution: 'asc' },
    });
  }

  /**
   * Cancel a scheduled recurring payment
   */
  static async cancel(userId: string, id: string, req?: any) {
    const scheduled = await prisma.scheduledPayment.findFirst({
      where: { id, userId },
    });

    if (!scheduled) {
      throw new ApiError('Scheduled payment not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.scheduledPayment.update({
      where: { id },
      data: { isActive: false },
    });

    await AuditService.log({
      userId,
      action: 'SCHEDULED_PAYMENT_CANCELLED',
      entityType: 'ScheduledPayment',
      entityId: id,
      req,
    });

    return { message: 'Scheduled payment cancelled successfully', scheduledPayment: updated };
  }
}
