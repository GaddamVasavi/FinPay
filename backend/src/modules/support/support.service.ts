import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';

export class SupportService {
  /**
   * Create a customer support ticket
   */
  static async createTicket(
    userId: string,
    dto: {
      subject: string;
      message: string;
      category?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    },
    req?: any
  ) {
    const ticketNumber = 'TCK-' + Math.floor(100000 + Math.random() * 900000).toString();

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        ticketNumber,
        subject: dto.subject,
        message: dto.message,
        category: dto.category || 'ACCOUNT',
        priority: dto.priority || 'MEDIUM',
        status: 'OPEN',
      },
    });

    await AuditService.log({
      userId,
      action: 'SUPPORT_TICKET_CREATED',
      entityType: 'SupportTicket',
      entityId: ticket.id,
      details: { subject: dto.subject, ticketNumber },
      req,
    });

    return ticket;
  }

  /**
   * Get customer's support tickets
   */
  static async getUserTickets(userId: string) {
    return prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Support agent / Admin: Get all open support tickets
   */
  static async getAllTickets() {
    return prisma.supportTicket.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update support ticket status / resolve
   */
  static async updateTicket(
    agentId: string,
    ticketId: string,
    dto: { status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'; resolution?: string },
    req?: any
  ) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new ApiError('Ticket not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: dto.status,
        ...(dto.status === 'RESOLVED' && { resolvedAt: new Date() }),
      },
    });

    await AuditService.log({
      userId: agentId,
      action: 'SUPPORT_TICKET_UPDATED',
      entityType: 'SupportTicket',
      entityId: ticketId,
      details: dto,
      req,
    });

    return updated;
  }
}
