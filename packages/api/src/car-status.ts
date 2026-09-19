import { z } from 'zod';

export const CarStatus = {
  AVAILABLE: 'available',
  SOLD: 'sold',
} as const;

export type CarStatus = (typeof CarStatus)[keyof typeof CarStatus];

export const carStatusSchema = z.enum([
  CarStatus.AVAILABLE,
  CarStatus.SOLD,
] as const);
