const ELLIPSIS = '…';

export const truncateLabel = (value: string, maxLength = 14): string =>
  value.length > maxLength
    ? `${value.slice(0, maxLength - 1)}${ELLIPSIS}`
    : value;
