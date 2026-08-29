export type RoleType = 'CUSTOMER' | 'ADMIN' | 'SUPPORT_AGENT';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED';

export type KYCStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profileImageUrl?: string;
  role: RoleType;
  status: UserStatus;
  isEmailVerified: boolean;
  twoFactorEnabled?: boolean;
  kycStatus?: KYCStatus;
  wallet?: WalletOverview;
  address?: Address;
}

export interface Address {
  id?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface WalletBalance {
  id: string;
  walletId: string;
  currency: string;
  currentBalance: string | number;
  availableBalance: string | number;
  lockedBalance: string | number;
}

export interface WalletOverview {
  id: string;
  walletNumber: string;
  currency: string;
  status: string;
  balances?: WalletBalance[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    code: string;
    details?: any;
  } | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
