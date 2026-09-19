import { setAccessToken } from '@/config/axios-config';
import { getApiErrorMessage } from '@/shared/utils/get-api-error-message';
import {
  loginResponseSchema,
  usePostQuery,
  type LoginResponse,
} from '@repo/api';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { useForm, zodResolver } from '@repo/ui/lib/form';
import { useNavigate } from '@tanstack/react-router';
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  loginFormSchema,
  type LoginFormValues,
} from '../schemas/login-form.schema';

export const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
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

  const { mutate, isPending } = usePostQuery<LoginFormValues, LoginResponse>({
    key: 'login',
    schema: loginResponseSchema,
  });

  useEffect(() => {
    if (formError) {
      formErrorRef.current?.focus();
    }
  }, [formError]);

  const onSubmit = (params: LoginFormValues) => {
    setFormError(null);
    mutate(
      { url: 'auth/login', attributes: params },
      {
        onError(error) {
          setFormError(getApiErrorMessage(error));
        },
        onSuccess(data) {
          setAccessToken(data.data.accessToken);
          navigate({ to: '/home' });
        },
      },
    );
  };

  const handlePasswordKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (typeof event.getModifierState === 'function') {
      setCapsLockOn(event.getModifierState('CapsLock'));
    }
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
                autoFocus
                required
                aria-required='true'
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
                  spellCheck={false}
                  required
                  aria-required='true'
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={
                    errors.password ? 'password-error' : undefined
                  }
                  onKeyUp={handlePasswordKey}
                  onKeyDown={handlePasswordKey}
                  className='pr-11'
                  {...register('password')}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className='absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
                >
                  {showPassword ? (
                    <EyeOffIcon className='size-4' aria-hidden='true' />
                  ) : (
                    <EyeIcon className='size-4' aria-hidden='true' />
                  )}
                </button>
              </div>
              {capsLockOn && (
                <p className='text-sm text-foreground/70'>Caps Lock is on.</p>
              )}
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

          {formError && (
            <p
              ref={formErrorRef}
              tabIndex={-1}
              role='alert'
              className='rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive outline-none'
            >
              {formError}
            </p>
          )}

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
