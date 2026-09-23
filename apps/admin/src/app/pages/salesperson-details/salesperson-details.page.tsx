import { salespersonDetailsRoute } from '@/app/routes';
import { SalespersonDetailsView } from '@/features/salespeople';

export const SalespersonDetailsPage = () => {
  const { salesPersonId } = salespersonDetailsRoute.useParams();

  return <SalespersonDetailsView salesPersonId={salesPersonId} />;
};
