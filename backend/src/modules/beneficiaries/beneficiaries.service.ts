import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';

export class BeneficiariesService {
  static async create(
    userId: string,
    dto: {
      name: string;
      email?: string;
      accountNumberMasked?: string;
      routingNumber?: string;
      bankName?: string;
      isDefault?: boolean;
    },
    req?: any
  ) {
    let beneficiaryUserId: string | null = null;
    let isVerified = false;

    // Check if email belongs to an existing FinPay customer
    if (dto.email) {
      const targetUser = await prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (targetUser) {
        if (targetUser.id === userId) {
          throw new ApiError('You cannot add yourself as a beneficiary', 400, 'INVALID_BENEFICIARY');
        }
        beneficiaryUserId = targetUser.id;
        isVerified = true; // Registered internal user verified automatically
      }
    }

    if (dto.isDefault) {
      await prisma.beneficiary.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const beneficiary = await prisma.beneficiary.create({
      data: {
        userId,
        name: dto.name,
        email: dto.email?.toLowerCase() || null,
        beneficiaryUserId,
        accountNumberMasked: dto.accountNumberMasked || null,
        routingNumber: dto.routingNumber || null,
        bankName: dto.bankName || null,
        isVerified,
        isDefault: dto.isDefault || false,
      },
    });

    await AuditService.log({
      userId,
      action: 'BENEFICIARY_CREATED',
      entityType: 'Beneficiary',
      entityId: beneficiary.id,
      details: { name: beneficiary.name, email: beneficiary.email },
      req,
    });

    return beneficiary;
  }

  static async getAll(userId: string) {
    return prisma.beneficiary.findMany({
      where: { userId },
      include: {
        beneficiaryUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async remove(userId: string, beneficiaryId: string, req?: any) {
    const b = await prisma.beneficiary.findFirst({
      where: { id: beneficiaryId, userId },
    });

    if (!b) {
      throw new ApiError('Beneficiary not found', 404, 'NOT_FOUND');
    }

    await prisma.beneficiary.delete({
      where: { id: beneficiaryId },
    });

    await AuditService.log({
      userId,
      action: 'BENEFICIARY_DELETED',
      entityType: 'Beneficiary',
      entityId: beneficiaryId,
      req,
    });

    return { message: 'Beneficiary removed successfully' };
  }
}
