import { CarStatus } from '@repo/api/car-status';

export const carStatusFilterOptions = [
  { value: 'all', label: 'All' },
  { value: CarStatus.AVAILABLE, label: 'Available' },
  { value: CarStatus.SOLD, label: 'Sold' },
] as const;

export type CarStatusFilterValue =
  (typeof carStatusFilterOptions)[number]['value'];
