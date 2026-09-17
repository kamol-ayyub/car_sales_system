import { useGetAllQuery, z } from '@repo/api';
import { Button } from '@repo/ui/components/button';

const carSchema = z
  .object({
    id: z.string(),
    brand: z.string(),
    model: z.string(),
    year: z.number(),
    price: z.union([z.number(), z.string()]),
    salePrice: z.union([z.number(), z.string()]).nullable().optional(),
    vin: z.string(),
    status: z.enum(['available', 'sold']),
    images: z.array(z.string()).optional(),
    salesPerson: z.record(z.string(), z.unknown()).nullable().optional(),
    client: z.record(z.string(), z.unknown()).nullable().optional(),
    soldAt: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .loose();

const carsResponseSchema = z.array(carSchema);

type Car = z.infer<typeof carSchema>;

export const App = () => {
  const { data } = useGetAllQuery<Car[]>({
    url: 'car',
    schema: carsResponseSchema,
  });
  if (data) console.log('all cars', data.data);
  return (
    <div className='p-6 space-y-4'>
      <h1 className='text-2xl font-bold tracking-tight'>Admin Dashboard</h1>
      <Button variant='default'>Click me</Button>
    </div>
  );
};
