import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';

export const LoginForm = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm border border-gray-100'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold tracking-tight text-gray-900'>
            Sign in to your account
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Car Sales Management System
          </p>
        </div>

        <form className='mt-8 space-y-6'>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Email address
              </label>
              <Input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                placeholder='admin@example.com'
                className='mt-1'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Password
              </label>
              <Input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                placeholder='••••••••'
                className='mt-1'
              />
            </div>
          </div>

          <Button type='submit' className='w-full'>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};
