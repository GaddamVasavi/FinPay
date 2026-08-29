import { prisma } from '../../database/prisma';
import { Money } from '../../utils/decimal';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';

export class DisputesService {
  /**
   * File a formal dispute against a completed transaction
   */
  static async createDispute(
    userId: string,
    dto: {
      transactionId: string;
      reason: string;
      description: string;
      evidenceUrl?: string;
    },
    req?: any
  ) {
    const tx = await prisma.transaction.findFirst({
      where: {
        id: dto.transactionId,
        wallet: { userId },
      },
    });

    if (!tx) {
      throw new ApiError('Transaction not found or does not belong to user', 404, 'NOT_FOUND');
    }

    const existingDispute = await prisma.dispute.findUnique({
      where: { transactionId: dto.transactionId },
    });

    if (existingDispute) {
      throw new ApiError('A dispute has already been filed for this transaction', 400, 'ALREADY_EXISTS');
    }

    const dispute = await prisma.dispute.create({
      data: {
        transactionId: dto.transactionId,
        userId,
        reason: dto.reason,
        description: dto.description,
        evidence: dto.evidenceUrl ? { url: dto.evidenceUrl } : {},
        status: 'OPEN',
      },
    });

    await AuditService.log({
      userId,
      action: 'DISPUTE_FILED',
      entityType: 'Dispute',
      entityId: dispute.id,
      details: { transactionId: dto.transactionId, reason: dto.reason },
      req,
    });

    return dispute;
  }

  /**
   * Get disputes filed by user
   */
  static async getUserDisputes(userId: string) {
    return prisma.dispute.findMany({
      where: { userId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Get all platform disputes
   */
  static async getAllDisputes() {
    return prisma.dispute.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Resolve or reject dispute
   */
  static async resolveDispute(
    adminId: string,
    disputeId: string,
    dto: { status: 'RESOLVED' | 'REJECTED'; resolutionNotes?: string },
    req?: any
  ) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new ApiError('Dispute not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: dto.status,
      },
    });

    await AuditService.log({
      userId: adminId,
      action: 'ADMIN_DISPUTE_RESOLVED',
      entityType: 'Dispute',
      entityId: disputeId,
      details: dto,
      req,
    });

    return updated;
  }
}
