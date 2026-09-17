export const HomePage = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
          Dashboard
        </h1>
        <p className='text-sm text-gray-500'>
          Welcome to the Car Sales System admin portal.
        </p>
      </div>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='text-sm font-medium text-gray-500'>System Status</h3>
          <p className='mt-2 text-2xl font-semibold text-gray-900'>
            Operational
          </p>
        </div>
      </div>
    </div>
  );
};
