import { useState } from 'react';
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
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

  const { mutate, isPending } = usePostQuery({ key: 'login' });

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
    <main className='flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12'>
      <div className='w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-sm'>
        <header className='space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight text-balance'>
            Sign in to your account
          </h1>
          <p className='text-sm text-foreground/70'>
            Car Sales Management System
          </p>
        </header>

        <form
          className='space-y-6'
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className='space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='email' className='text-sm font-medium'>
                Email address
              </label>
              <Input
                id='email'
                type='email'
                autoComplete='email'
                autoCapitalize='none'
                spellCheck={false}
                placeholder='admin@example.com'
                autoFocus
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p
                  id='email-error'
                  role='alert'
                  className='text-sm font-medium text-destructive'
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <label htmlFor='password' className='text-sm font-medium'>
                Password
              </label>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  placeholder='••••••••'
                  className='pr-10'
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={
                    errors.password ? 'password-error' : undefined
                  }
                  {...register('password')}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className='absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                >
                  {showPassword ? (
                    <EyeOffIcon className='size-4' aria-hidden='true' />
                  ) : (
                    <EyeIcon className='size-4' aria-hidden='true' />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id='password-error'
                  role='alert'
                  className='text-sm font-medium text-destructive'
                >
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? (
              <>
                <Loader2Icon
                  className='animate-spin motion-reduce:animate-none'
                  aria-hidden='true'
                />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </div>
    </main>
  );
};
