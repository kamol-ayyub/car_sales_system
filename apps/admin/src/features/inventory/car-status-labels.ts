import { CarStatus } from '@repo/api/car-status';

export const carStatusLabels: Record<CarStatus, string> = {
  [CarStatus.AVAILABLE]: 'Available',
  [CarStatus.SOLD]: 'Sold',
};
