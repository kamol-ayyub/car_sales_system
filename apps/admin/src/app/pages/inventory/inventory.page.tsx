import { inventoryRoute } from '@/app/routes';
import {
  InventoryView,
  type CarStatusFilterValue,
} from '@/features/inventory';

export const InventoryPage = () => {
  const { status } = inventoryRoute.useSearch();
  const navigate = inventoryRoute.useNavigate();

  const handleStatusFilterChange = (value: CarStatusFilterValue) => {
    navigate({
      search: (previous) => ({ ...previous, status: value }),
      replace: true,
    });
  };

  return (
    <InventoryView
      statusFilter={status ?? 'all'}
      onStatusFilterChange={handleStatusFilterChange}
    />
  );
};
