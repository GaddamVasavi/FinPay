import { prisma } from '../../database/prisma';
import { Money } from '../../utils/decimal';
import { ApiError } from '../../utils/response';
import { TransfersService } from '../transfers/transfers.service';
import { AuditService } from '../../middleware/audit.middleware';

export class PaymentRequestsService {
  /**
   * Request money from another FinPay user by email
   */
  static async createRequest(
    requesterId: string,
    dto: {
      payerEmail: string;
      amount: number;
      currency?: string;
      description?: string;
      expiryDays?: number;
    },
    req?: any
  ) {
    const currency = dto.currency || 'USD';
    const amountDec = Money.parse(dto.amount);
    const payerEmail = dto.payerEmail.toLowerCase().trim();

    const payer = await prisma.user.findUnique({
      where: { email: payerEmail },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (dto.expiryDays || 7));

    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        requesterId,
        payerId: payer?.id || null,
        payerEmail,
        amount: amountDec.toFixed(4),
        currency,
        description: dto.description || null,
        status: 'PENDING',
        expiresAt,
      },
    });

    if (payer) {
      await prisma.notification.create({
        data: {
          userId: payer.id,
          title: 'New Payment Request',
          message: `You have received a money request for ${Money.formatDisplay(amountDec, currency)}.`,
          type: 'PAYMENT',
          linkUrl: '/transfers',
        },
      });
    }

    await AuditService.log({
      userId: requesterId,
      action: 'PAYMENT_REQUEST_CREATED',
      entityType: 'PaymentRequest',
      entityId: paymentRequest.id,
      details: { amount: dto.amount, payerEmail },
      req,
    });

    return paymentRequest;
  }

  /**
   * Accept and fulfill payment request
   */
  static async acceptRequest(payerId: string, requestId: string, req?: any) {
    const request = await prisma.paymentRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: true,
      },
    });

    if (!request) {
      throw new ApiError('Payment request not found', 404, 'NOT_FOUND');
    }

    if (request.status !== 'PENDING') {
      throw new ApiError(`Request is already ${request.status}`, 400, 'INVALID_REQUEST_STATUS');
    }

    if (request.expiresAt < new Date()) {
      await prisma.paymentRequest.update({
        where: { id: requestId },
        data: { status: 'EXPIRED' },
      });
      throw new ApiError('This payment request has expired', 400, 'REQUEST_EXPIRED');
    }

    // Execute transfer from payer to requester
    const idempotencyKey = 'PR-FULFILL-' + requestId + '-' + Date.now();
    const transferResult = await TransfersService.sendTransfer(
      payerId,
      {
        recipientEmail: request.requester.email,
        amount: parseFloat(request.amount.toString()),
        currency: request.currency,
        note: `Fulfillment of payment request #${request.id.slice(-6)}: ${request.description || ''}`,
        idempotencyKey,
      },
      req
    );

    // Mark request as ACCEPTED
    const updated = await prisma.paymentRequest.update({
      where: { id: requestId },
      data: {
        status: 'ACCEPTED',
        paidAt: new Date(),
      },
    });

    return {
      message: 'Payment request accepted and fulfilled successfully',
      paymentRequest: updated,
      transfer: transferResult,
    };
  }

  /**
   * Reject payment request
   */
  static async rejectRequest(userId: string, requestId: string, req?: any) {
    const request = await prisma.paymentRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new ApiError('Payment request not found', 404, 'NOT_FOUND');
    }

    if (request.status !== 'PENDING') {
      throw new ApiError('Only pending requests can be rejected', 400, 'INVALID_STATUS');
    }

    const updated = await prisma.paymentRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    await AuditService.log({
      userId,
      action: 'PAYMENT_REQUEST_REJECTED',
      entityType: 'PaymentRequest',
      entityId: requestId,
      req,
    });

    return updated;
  }

  /**
   * Get user's incoming and outgoing payment requests
   */
  static async getRequests(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { sent: [], received: [] };

    const sent = await prisma.paymentRequest.findMany({
      where: { requesterId: userId },
      include: {
        payer: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const received = await prisma.paymentRequest.findMany({
      where: {
        OR: [{ payerId: userId }, { payerEmail: user.email.toLowerCase() }],
      },
      include: {
        requester: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { sent, received };
  }
}
