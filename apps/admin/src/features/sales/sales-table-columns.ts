export interface SalesTableColumn {
  label: string;
  headerClassName?: string;
  skeletonClassName?: string;
}

export const getSalesTableColumns = (
  showSalesperson: boolean,
): SalesTableColumn[] => [
  { label: 'Car', headerClassName: 'w-40', skeletonClassName: 'h-5 w-32' },
  { label: 'VIN', headerClassName: 'w-44', skeletonClassName: 'h-5 w-36' },
  { label: 'Customer', headerClassName: 'w-40', skeletonClassName: 'h-5 w-28' },
  ...(showSalesperson
    ? [
        {
          label: 'Salesperson',
          headerClassName: 'w-40',
          skeletonClassName: 'h-5 w-28',
        },
      ]
    : []),
  { label: 'Sold', headerClassName: 'w-28', skeletonClassName: 'h-5 w-20' },
  {
    label: 'Price',
    headerClassName: 'w-32 text-right',
    skeletonClassName: 'ml-auto h-5 w-20',
  },
];
