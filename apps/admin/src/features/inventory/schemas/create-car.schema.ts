import { z } from '@repo/api';

const MAX_IMAGES = 8;

export const parseImageUrls = (value: string): string[] => [
  ...new Set(
    value
      .split(/[\s,]+/)
      .map((entry) => entry.trim())
      .filter((entry) => entry !== ''),
  ),
];

export const createCarFormSchema = z.object({
  brand: z.string().trim().min(1, 'Enter the brand').max(100),
  model: z.string().trim().min(1, 'Enter the model').max(100),
  year: z
    .string()
    .trim()
    .min(1, 'Enter the year')
    .refine((value) => {
      const year = Number(value);
      return Number.isInteger(year) && year >= 1886 && year <= 2100;
    }, 'Enter a year between 1886 and 2100'),
  price: z
    .string()
    .trim()
    .min(1, 'Enter the price')
    .refine(
      (value) => !Number.isNaN(Number(value)) && Number(value) >= 0,
      'Enter a valid price',
    ),
  vin: z.string().trim().length(17, 'VIN must be exactly 17 characters'),
  images: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      const urls = parseImageUrls(value);

      if (urls.length > MAX_IMAGES) {
        ctx.addIssue({
          code: 'custom',
          message: `Add at most ${MAX_IMAGES} image URLs`,
        });
        return;
      }

      for (const url of urls) {
        if (!z.url().safeParse(url).success) {
          ctx.addIssue({
            code: 'custom',
            message: `"${url}" is not a valid image URL`,
          });
        }
      }
    }),
});

export type CreateCarFormValues = z.infer<typeof createCarFormSchema>;

export type CreateCarBody = {
  brand: string;
  model: string;
  year: number;
  price: number;
  vin: string;
  images?: string[];
};
