import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';

export class KYCService {
  /**
   * Get user's KYC profile and verification logs
   */
  static async getProfile(userId: string) {
    const profile = await prisma.kycProfile.findUnique({
      where: { userId },
      include: {
        verifications: {
          orderBy: { reviewedAt: 'desc' },
          include: {
            reviewer: {
              select: { firstName: true, lastName: true, role: true },
            },
          },
        },
      },
    });

    return profile;
  }

  /**
   * Submit KYC identity verification documents
   */
  static async submitKYC(
    userId: string,
    dto: {
      documentType: 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID' | 'UTILITY_BILL';
      documentNumber: string;
      documentExpiry?: string;
      documentFrontUrl: string;
      documentBackUrl?: string;
      selfieUrl?: string;
    },
    req?: any
  ) {
    const profile = await prisma.kycProfile.upsert({
      where: { userId },
      update: {
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        documentExpiry: dto.documentExpiry ? new Date(dto.documentExpiry) : null,
        documentFrontUrl: dto.documentFrontUrl,
        documentBackUrl: dto.documentBackUrl || null,
        selfieUrl: dto.selfieUrl || null,
        status: 'UNDER_REVIEW',
        rejectionReason: null,
        submittedAt: new Date(),
      },
      create: {
        userId,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        documentExpiry: dto.documentExpiry ? new Date(dto.documentExpiry) : null,
        documentFrontUrl: dto.documentFrontUrl,
        documentBackUrl: dto.documentBackUrl || null,
        selfieUrl: dto.selfieUrl || null,
        status: 'UNDER_REVIEW',
      },
    });

    await AuditService.log({
      userId,
      action: 'KYC_SUBMITTED',
      entityType: 'KYCProfile',
      entityId: profile.id,
      details: { documentType: dto.documentType },
      req,
    });

    return {
      message: 'KYC documents submitted successfully. Verification is currently under review.',
      profile,
    };
  }

  /**
   * Admin / Compliance review and decision workflow
   */
  static async reviewKYC(
    reviewerId: string,
    kycProfileId: string,
    dto: {
      status: 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW';
      notes?: string;
      rejectionReason?: string;
    },
    req?: any
  ) {
    const profile = await prisma.kycProfile.findUnique({
      where: { id: kycProfileId },
    });

    if (!profile) {
      throw new ApiError('KYC profile not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.kycProfile.update({
        where: { id: kycProfileId },
        data: {
          status: dto.status,
          verifiedAt: dto.status === 'VERIFIED' ? new Date() : null,
          rejectionReason: dto.status === 'REJECTED' ? dto.rejectionReason || 'Document criteria not met' : null,
        },
      });

      await tx.kYCVerification.create({
        data: {
          kycProfileId: profile.id,
          reviewerId,
          status: dto.status,
          notes: dto.notes || null,
        },
      });

      // Send notification to user
      await tx.notification.create({
        data: {
          userId: profile.userId,
          title: `KYC Status Update: ${dto.status}`,
          message:
            dto.status === 'VERIFIED'
              ? 'Congratulations! Your identity documents have been verified.'
              : `Your KYC verification was ${dto.status}. ${dto.rejectionReason || ''}`,
          type: 'KYC',
        },
      });

      return p;
    });

    await AuditService.log({
      userId: reviewerId,
      action: `KYC_DECISION_${dto.status}`,
      entityType: 'KYCProfile',
      entityId: kycProfileId,
      details: { decision: dto.status, targetUserId: profile.userId },
      req,
    });

    return updated;
  }

  /**
   * Get all pending KYC submissions for compliance officers
   */
  static async getPendingSubmissions() {
    return prisma.kycProfile.findMany({
      where: {
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            createdAt: true,
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }
}
