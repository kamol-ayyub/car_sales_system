import { carDetailsRoute } from '@/app/routes';
import { CarDetailsView } from '@/features/inventory';

export const CarDetailsPage = () => {
  const { carId } = carDetailsRoute.useParams();

  return <CarDetailsView carId={carId} />;
};
