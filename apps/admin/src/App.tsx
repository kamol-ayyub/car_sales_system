import { useGetAllQuery } from '@repo/api';
import { Button } from '@repo/ui/components/button';

export const App = () => {
  const { data } = useGetAllQuery({
    url: 'car',
  });
  if (data) console.log('all cars', data.data);
  return (
    <div className='p-6 space-y-4'>
      <h1 className='text-2xl font-bold tracking-tight'>Admin Dashboard</h1>
      <Button variant='default'>Click me</Button>
    </div>
  );
};
