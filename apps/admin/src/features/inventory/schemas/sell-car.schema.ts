import { z } from '@repo/api';

export const sellCarFormSchema = z.object({
  clientId: z.string().min(1, 'Select a client'),
  salePrice: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      'Enter a valid price',
    ),
});

export type SellCarFormValues = z.infer<typeof sellCarFormSchema>;
