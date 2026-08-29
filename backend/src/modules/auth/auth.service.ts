import { prisma } from '../../database/prisma';
import { PasswordUtil } from '../../utils/password';
import { JwtUtil, TokenPayload } from '../../utils/jwt';
import { ApiError } from '../../utils/response';
import { AuditService } from '../../middleware/audit.middleware';
import { config } from '../../config';
import crypto from 'crypto';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: 'CUSTOMER' | 'ADMIN' | 'SUPPORT_AGENT';
}

export interface LoginDto {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export class AuthService {
  /**
   * Register a new user and automatically initialize default wallet
   */
  static async register(dto: RegisterDto, req?: any) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email.toLowerCase() },
          ...(dto.phoneNumber ? [{ phoneNumber: dto.phoneNumber }] : []),
        ],
      },
    });

    if (existing) {
      throw new ApiError('User with this email or phone number already exists', 409, 'USER_EXISTS');
    }

    const passwordHash = await PasswordUtil.hash(dto.password);
    const role = dto.role || 'CUSTOMER';

    // Generate unique 12-digit wallet account number
    const walletNumber = 'FP' + Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phoneNumber: dto.phoneNumber || null,
          role,
          status: 'ACTIVE',
        },
      });

      // Create default customer wallet if role is CUSTOMER
      if (role === 'CUSTOMER') {
        const wallet = await tx.wallet.create({
          data: {
            userId: newUser.id,
            walletNumber,
            currency: 'USD',
            status: 'ACTIVE',
            dailyLimit: 50000.0,
            monthlyLimit: 500000.0,
          },
        });

        await tx.walletBalance.create({
          data: {
            walletId: wallet.id,
            currency: 'USD',
            currentBalance: 0.0,
            availableBalance: 0.0,
            lockedBalance: 0.0,
          },
        });
      }

      return newUser;
    });

    await AuditService.log({
      userId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      details: { email: user.email, role: user.role },
      req,
    });

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      message: 'Registration completed successfully.',
    };
  }

  /**
   * Secure login with rate protection and session issuance
   */
  static async login(dto: LoginDto, req?: any) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        wallets: {
          include: {
            balances: true,
          },
        },
        kycProfile: true,
      },
    });

    if (!user) {
      throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check account lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
      throw new ApiError(
        `Account is temporarily locked due to excessive failed attempts. Please retry in ${remainingMinutes} minutes.`,
        403,
        'ACCOUNT_LOCKED'
      );
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new ApiError('Account has been suspended or deactivated. Contact support.', 403, 'ACCOUNT_SUSPENDED');
    }

    const isMatch = await PasswordUtil.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      const failedAttempts = user.failedLoginAttempts + 1;
      let lockoutDate: Date | null = null;

      if (failedAttempts >= config.security.maxLoginAttempts) {
        lockoutDate = new Date(Date.now() + config.security.lockTimeMinutes * 60 * 1000);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockoutUntil: lockoutDate,
          status: lockoutDate ? 'LOCKED' : user.status,
        },
      });

      await AuditService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'User',
        entityId: user.id,
        details: { failedAttempts, locked: !!lockoutDate },
        req,
      });

      throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Reset failed attempts on successful authentication
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
    };

    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockoutUntil: null,
          status: user.status === 'LOCKED' ? 'ACTIVE' : user.status,
          lastLoginAt: new Date(),
        },
      }),
      prisma.userSession.create({
        data: {
          userId: user.id,
          refreshToken,
          userAgent: dto.userAgent || req?.headers['user-agent'] || 'unknown',
          ipAddress: dto.ipAddress || req?.ip || 'unknown',
          expiresAt,
        },
      }),
    ]);

    await AuditService.log({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      details: { email: user.email, role: user.role },
      req,
    });

    const defaultWallet = user.wallets[0] || null;

    return {
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: config.jwt.expiresIn,
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        kycStatus: user.kycProfile?.status || 'PENDING',
        wallet: defaultWallet
          ? {
              id: defaultWallet.id,
              walletNumber: defaultWallet.walletNumber,
              currency: defaultWallet.currency,
              status: defaultWallet.status,
              balances: defaultWallet.balances,
            }
          : null,
      },
    };
  }

  /**
   * Refresh JWT access token with token rotation
   */
  static async refreshToken(refreshToken: string, req?: any) {
    let payload: TokenPayload;
    try {
      payload = JwtUtil.verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new ApiError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    const session = await prisma.userSession.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new ApiError('Session has expired or was revoked', 401, 'SESSION_EXPIRED');
    }

    const newAccessToken = JwtUtil.generateAccessToken({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role as any,
    });

    const newRefreshToken = JwtUtil.generateRefreshToken({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role as any,
    });

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    // Rotate refresh token
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: config.jwt.expiresIn,
    };
  }

  /**
   * Logout and revoke session
   */
  static async logout(refreshToken?: string, userId?: string, req?: any) {
    if (refreshToken) {
      await prisma.userSession.updateMany({
        where: { refreshToken },
        data: { isRevoked: true },
      });
    }

    if (userId) {
      await AuditService.log({
        userId,
        action: 'USER_LOGOUT',
        entityType: 'UserSession',
        details: { revokedSession: !!refreshToken },
        req,
      });
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Get current authenticated user profile
   */
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        address: true,
        kycProfile: true,
        wallets: {
          include: {
            balances: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      address: user.address,
      kyc: user.kycProfile
        ? {
            status: user.kycProfile.status,
            documentType: user.kycProfile.documentType,
            submittedAt: user.kycProfile.submittedAt,
            verifiedAt: user.kycProfile.verifiedAt,
            rejectionReason: user.kycProfile.rejectionReason,
          }
        : null,
      wallets: user.wallets,
    };
  }
}
