import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FinPay database seed with fictional demo data...');

  // Hash demo passwords
  const passwordHash = await bcrypt.hash('FintechDemo#2026', 10);

  // 1. Create System Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@finpay.local' },
    update: {},
    create: {
      email: 'admin@finpay.local',
      passwordHash,
      firstName: 'FinPay',
      lastName: 'Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
      phoneNumber: '+18005550100',
    },
  });
  console.log(`Created Admin user: ${admin.email}`);

  // 2. Create Support Agent
  const support = await prisma.user.upsert({
    where: { email: 'support@finpay.local' },
    update: {},
    create: {
      email: 'support@finpay.local',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Support',
      role: 'SUPPORT_AGENT',
      status: 'ACTIVE',
      isEmailVerified: true,
      phoneNumber: '+18005550101',
    },
  });
  console.log(`Created Support Agent: ${support.email}`);

  // 3. Create Demo Customer (Alex Morgan)
  const customer = await prisma.user.upsert({
    where: { email: 'alex.morgan@finpay.local' },
    update: {},
    create: {
      email: 'alex.morgan@finpay.local',
      passwordHash,
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isEmailVerified: true,
      phoneNumber: '+12025550143',
      address: {
        create: {
          addressLine1: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          postalCode: '97477',
          country: 'USA',
        },
      },
    },
  });
  console.log(`Created Customer user: ${customer.email}`);

  // 4. Create Customer Wallet & Balances
  const wallet = await prisma.wallet.upsert({
    where: { walletNumber: 'FP1002003004' },
    update: {},
    create: {
      userId: customer.id,
      walletNumber: 'FP1002003004',
      currency: 'USD',
      status: 'ACTIVE',
      dailyLimit: 50000.0,
      monthlyLimit: 500000.0,
      balances: {
        create: {
          currency: 'USD',
          currentBalance: 12500.0,
          availableBalance: 12500.0,
          lockedBalance: 0.0,
        },
      },
    },
  });
  console.log(`Created Wallet for ${customer.firstName}: ${wallet.walletNumber}`);

  // 5. Create Expense Categories
  const categories = [
    { name: 'Food & Dining', icon: 'Utensils', color: '#EF4444' },
    { name: 'Shopping', icon: 'ShoppingBag', color: '#3B82F6' },
    { name: 'Transportation', icon: 'Car', color: '#F59E0B' },
    { name: 'Bills & Utilities', icon: 'Zap', color: '#10B981' },
    { name: 'Entertainment', icon: 'Film', color: '#8B5CF6' },
    { name: 'Healthcare', icon: 'Activity', color: '#EC4899' },
    { name: 'Education', icon: 'BookOpen', color: '#6366F1' },
    { name: 'Travel', icon: 'Plane', color: '#14B8A6' },
    { name: 'Housing', icon: 'Home', color: '#64748B' },
    { name: 'Other', icon: 'MoreHorizontal', color: '#9CA3AF' },
  ];

  for (const cat of categories) {
    await prisma.expenseCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`Created ${categories.length} standard expense categories`);

  // 6. Create Verified KYC Profile for Alex Morgan
  await prisma.kycProfile.upsert({
    where: { userId: customer.id },
    update: {},
    create: {
      userId: customer.id,
      status: 'VERIFIED',
      documentType: 'PASSPORT',
      documentNumber: 'P987654321',
      documentExpiry: new Date('2030-01-01'),
      documentFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
      verifiedAt: new Date(),
    },
  });

  console.log('✅ FinPay database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
