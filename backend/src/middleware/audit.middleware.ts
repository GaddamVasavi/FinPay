import { Request } from 'express';
import { prisma } from '../database/prisma';
import { logger } from '../utils/logger';

export interface AuditParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any>;
  req?: Request;
}

export class AuditService {
  static async log({
    userId,
    action,
    entityType,
    entityId,
    details,
    req,
  }: AuditParams): Promise<void> {
    try {
      const ipAddress = req?.ip || req?.socket.remoteAddress || 'unknown';
      const userAgent = req?.headers['user-agent'] || 'unknown';

      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          action,
          entityType,
          entityId: entityId || null,
          ipAddress,
          userAgent,
          details: details ? (details as any) : undefined,
        },
      });

      logger.info(`[AUDIT] Action: ${action} | Entity: ${entityType}:${entityId || 'N/A'} | User: ${userId || 'SYSTEM'}`);
    } catch (error) {
      // Audit log failures should never crash the main transaction, but must be logged
      logger.error('Failed to write audit log entry:', error);
    }
  }
}
