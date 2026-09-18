import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z
    .email({ error: 'Invalid email address' })
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, { error: 'Password is required' })
    .max(100, { error: 'Password should be less then 100 characters' }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
