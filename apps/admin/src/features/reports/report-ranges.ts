export const reportRangePresets = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'year', label: 'This year' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom' },
] as const;

export type ReportRangePreset = (typeof reportRangePresets)[number]['value'];

export interface ReportRange {
  from?: string;
  to?: string;
}

const pad = (value: number): string => String(value).padStart(2, '0');

export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toIsoDate(date);
};

export const getReportRange = (
  preset: Exclude<ReportRangePreset, 'custom'>,
): ReportRange => {
  const today = toIsoDate(new Date());

  switch (preset) {
    case '7d':
      return { from: daysAgo(6), to: today };
    case '30d':
      return { from: daysAgo(29), to: today };
    case '90d':
      return { from: daysAgo(89), to: today };
    case 'year':
      return { from: `${new Date().getFullYear()}-01-01`, to: today };
    case 'all':
      return { from: '2000-01-01', to: today };
  }
};
