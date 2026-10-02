import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { userListSchema, type PaginatedUsers } from '@/shared/schemas/user.schema';
import { UserRole } from '@/shared/types/auth-types';
import { useGetAllQuery } from '@repo/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';

const ALL_SALESPEOPLE = 'all';

interface SalespersonFilterProps {
  value?: string;
  onChange: (salesPersonId?: string) => void;
}

export const SalespersonFilter = ({
  value,
  onChange,
}: SalespersonFilterProps) => {
  const { data } = useGetAllQuery<PaginatedUsers>({
    key: QUERY_KEYS.salespeople,
    url: '/user',
    params: { role: UserRole.SalesPerson, limit: 100 },
    schema: userListSchema,
  });

  const salespeople = data?.data.data ?? [];
  const items = [
    { value: ALL_SALESPEOPLE, label: 'All salespeople' },
    ...salespeople.map((salesperson) => ({
      value: salesperson.id,
      label: salesperson.name,
    })),
  ];

  return (
    <Select
      items={items}
      value={value ?? ALL_SALESPEOPLE}
      onValueChange={(next) =>
        onChange(
          next === null || next === ALL_SALESPEOPLE ? undefined : next,
        )
      }
    >
      <SelectTrigger
        aria-label='Filter sales by salesperson'
        className='w-full sm:w-52'
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
