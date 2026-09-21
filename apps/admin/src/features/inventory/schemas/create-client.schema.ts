import { z } from '@repo/api';

export const createClientFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter the client name').max(100),
  phone: z.string().trim().min(1, 'Enter a phone number').max(20),
  email: z
    .string()
    .trim()
    .max(255)
    .refine(
      (value) => value === '' || z.email().safeParse(value).success,
      'Enter a valid email address',
    ),
});

export type CreateClientFormValues = z.infer<typeof createClientFormSchema>;
