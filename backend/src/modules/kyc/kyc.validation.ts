import { z } from 'zod';

export const submitKYCSchema = z.object({
  documentType: z.enum(['PASSPORT', 'DRIVING_LICENSE', 'NATIONAL_ID', 'UTILITY_BILL']),
  documentNumber: z.string().min(4, 'Valid document number is required'),
  documentExpiry: z.string().optional(),
  documentFrontUrl: z.string().url('Document front image URL is required'),
  documentBackUrl: z.string().url().optional(),
  selfieUrl: z.string().url().optional(),
});

export const reviewKYCSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED', 'UNDER_REVIEW']),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
});
