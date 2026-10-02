import { salesRoute } from '@/app/routes';
import { SalesView } from '@/features/sales';

export const SalesPage = () => {
  const { salesPersonId } = salesRoute.useSearch();
  const navigate = salesRoute.useNavigate();

  const handleSalesPersonChange = (value?: string) => {
    navigate({
      search: (previous) => ({ ...previous, salesPersonId: value }),
      replace: true,
    });
  };

  return (
    <SalesView
      salesPersonId={salesPersonId}
      onSalesPersonChange={handleSalesPersonChange}
    />
  );
};
