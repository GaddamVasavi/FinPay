import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/response';
import { PasswordUtil } from '../../utils/password';
import { AuditService } from '../../middleware/audit.middleware';

export class UsersService {
  static async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    profileImageUrl?: string;
    dateOfBirth?: string;
  }, req?: any) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
        ...(data.profileImageUrl && { profileImageUrl: data.profileImageUrl }),
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        dateOfBirth: true,
        profileImageUrl: true,
        role: true,
        updatedAt: true,
      },
    });

    await AuditService.log({
      userId,
      action: 'USER_PROFILE_UPDATED',
      entityType: 'User',
      entityId: userId,
      details: { updatedFields: Object.keys(data) },
      req,
    });

    return updated;
  }

  static async updateAddress(userId: string, data: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }, req?: any) {
    const address = await prisma.address.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });

    await AuditService.log({
      userId,
      action: 'USER_ADDRESS_UPDATED',
      entityType: 'Address',
      entityId: address.id,
      req,
    });

    return address;
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string, req?: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await PasswordUtil.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new ApiError('Current password does not match', 400, 'INVALID_PASSWORD');
    }

    const newHash = await PasswordUtil.hash(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Revoke all existing sessions for security
    await prisma.userSession.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    await AuditService.log({
      userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: userId,
      req,
    });

    return { message: 'Password updated successfully. Please log in with your new password.' };
  }
}
