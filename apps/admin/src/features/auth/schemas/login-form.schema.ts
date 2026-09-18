import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: 'Email is required' })
    .pipe(z.email({ error: 'Invalid email address' })),
  password: z
    .string()
    .min(1, { error: 'Password is required' })
    .max(100, { error: 'Password must be 100 characters or fewer' }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
