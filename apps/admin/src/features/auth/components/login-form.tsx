import { getApiErrorMessage } from '@/shared/utils/get-api-error-message';
import { usePostQuery } from '@repo/api';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { toast } from '@repo/ui/components/toast';
import { useForm, zodResolver } from '@repo/ui/lib/form';
import {
  loginFormSchema,
  type LoginFormValues,
} from '../schemas/login-form.schema';

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate } = usePostQuery({ key: 'login' });

  const onSubmit = (params: LoginFormValues) => {
    mutate(
      { url: 'auth/login', attributes: params },
      {
        onError(error) {
          toast.add({ title: getApiErrorMessage(error), type: 'error' });
        },
      },
    );
  };

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

        <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
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
                type='email'
                autoComplete='email'
                placeholder='admin@example.com'
                className='mt-1'
                {...register('email')}
              />
              {errors.email && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.email.message}
                </p>
              )}
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
                type='password'
                autoComplete='current-password'
                placeholder='••••••••'
                className='mt-1'
                {...register('password')}
              />
              {errors.password && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.password.message}
                </p>
              )}
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
