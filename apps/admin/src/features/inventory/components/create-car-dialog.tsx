import { apiErrorSchema } from '@/shared/schemas/api-error.schema';
import { carSchema, type Car } from '@/shared/schemas/car.schema';
import { getApiErrorMessage } from '@/shared/utils/get-api-error-message';
import { usePostQuery } from '@repo/api';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@repo/ui/components/field';
import { Input } from '@repo/ui/components/input';
import { Spinner } from '@repo/ui/components/spinner';
import { Textarea } from '@repo/ui/components/textarea';
import { toast } from '@repo/ui/components/toast';
import { useForm, zodResolver } from '@repo/ui/lib/form';
import { PlusIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  createCarFormSchema,
  parseImageUrls,
  type CreateCarBody,
  type CreateCarFormValues,
} from '../schemas/create-car.schema';
import { CarImagePreview } from './car-image-preview';

export const CreateCarDialog = () => {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);

  const { mutate: createCar, isPending } = usePostQuery<CreateCarBody, Car>({
    key: 'cars',
    schema: carSchema,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<CreateCarFormValues>({
    resolver: zodResolver(createCarFormSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: '',
      price: '',
      vin: '',
      images: '',
    },
  });

  const vinLength = (watch('vin') ?? '').trim().length;
  const imageUrls = parseImageUrls(watch('images') ?? '');

  useEffect(() => {
    if (formError) {
      formErrorRef.current?.focus();
    }
  }, [formError]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setFormError(null);
      reset();
    }
    setOpen(next);
  };

  const onSubmit = (
    values: CreateCarFormValues,
    options?: { keepOpen?: boolean },
  ) => {
    setFormError(null);
    const images = parseImageUrls(values.images);

    createCar(
      {
        url: '/car',
        attributes: {
          brand: values.brand,
          model: values.model,
          year: Number(values.year),
          price: Number(values.price),
          vin: values.vin.toUpperCase(),
          images: images.length > 0 ? images : undefined,
        },
      },
      {
        onSuccess(response) {
          reset();
          toast.add({
            type: 'success',
            title: 'Car added to inventory',
            description: `${response.data.brand} ${response.data.model} is ready to sell.`,
          });

          if (options?.keepOpen) {
            setFocus('brand');
            return;
          }

          setOpen(false);
        },
        onError(error) {
          const apiError = apiErrorSchema.safeParse(error.response?.data);

          if (
            apiError.success &&
            apiError.data.error.code === 'RESOURCE_ALREADY_EXISTS'
          ) {
            setError('vin', {
              type: 'server',
              message: 'A car with this VIN already exists.',
            });
            return;
          }

          setFormError(getApiErrorMessage(error));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon='inline-start' />
        Add car
      </DialogTrigger>
      <DialogContent className='motion-reduce:animate-none flex max-h-[calc(100vh-2rem)] flex-col gap-4 overflow-hidden sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Add a car</DialogTitle>
          <DialogDescription>
            Add a vehicle to inventory. It becomes available for sale right away.
          </DialogDescription>
        </DialogHeader>

        <form
          className='flex min-h-0 flex-1 flex-col gap-4'
          onSubmit={handleSubmit((values) => onSubmit(values))}
          noValidate
        >
          <FieldGroup className='min-h-0 flex-1 gap-4 overflow-y-auto pr-1'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <Field data-invalid={errors.brand ? true : undefined}>
                <FieldLabel htmlFor='car-brand'>Brand</FieldLabel>
                <Input
                  id='car-brand'
                  autoFocus
                  required
                  aria-required='true'
                  autoComplete='off'
                  placeholder='Toyota'
                  aria-invalid={errors.brand ? true : undefined}
                  aria-describedby={errors.brand ? 'car-brand-error' : undefined}
                  {...register('brand')}
                />
                <FieldError
                  id='car-brand-error'
                  errors={errors.brand ? [errors.brand] : undefined}
                />
              </Field>

              <Field data-invalid={errors.model ? true : undefined}>
                <FieldLabel htmlFor='car-model'>Model</FieldLabel>
                <Input
                  id='car-model'
                  required
                  aria-required='true'
                  autoComplete='off'
                  placeholder='Corolla'
                  aria-invalid={errors.model ? true : undefined}
                  aria-describedby={errors.model ? 'car-model-error' : undefined}
                  {...register('model')}
                />
                <FieldError
                  id='car-model-error'
                  errors={errors.model ? [errors.model] : undefined}
                />
              </Field>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <Field data-invalid={errors.year ? true : undefined}>
                <FieldLabel htmlFor='car-year'>Year</FieldLabel>
                <Input
                  id='car-year'
                  type='number'
                  inputMode='numeric'
                  min={1886}
                  max={2100}
                  step={1}
                  required
                  aria-required='true'
                  placeholder='2024'
                  aria-invalid={errors.year ? true : undefined}
                  aria-describedby={
                    errors.year ? 'car-year-hint car-year-error' : 'car-year-hint'
                  }
                  {...register('year')}
                />
                <FieldDescription id='car-year-hint'>
                  Between 1886 and 2100.
                </FieldDescription>
                <FieldError
                  id='car-year-error'
                  errors={errors.year ? [errors.year] : undefined}
                />
              </Field>

              <Field data-invalid={errors.price ? true : undefined}>
                <FieldLabel htmlFor='car-price'>Asking price</FieldLabel>
                <Input
                  id='car-price'
                  type='number'
                  inputMode='numeric'
                  min={0}
                  step={1}
                  required
                  aria-required='true'
                  placeholder='25000'
                  aria-invalid={errors.price ? true : undefined}
                  aria-describedby={
                    errors.price
                      ? 'car-price-hint car-price-error'
                      : 'car-price-hint'
                  }
                  {...register('price')}
                />
                <FieldDescription id='car-price-hint'>
                  In US dollars.
                </FieldDescription>
                <FieldError
                  id='car-price-error'
                  errors={errors.price ? [errors.price] : undefined}
                />
              </Field>
            </div>

            <Field data-invalid={errors.vin ? true : undefined}>
              <FieldLabel htmlFor='car-vin'>VIN</FieldLabel>
              <Input
                id='car-vin'
                autoComplete='off'
                autoCapitalize='characters'
                spellCheck={false}
                placeholder='1HGCM82633A004352'
                className='font-mono'
                required
                aria-required='true'
                aria-invalid={errors.vin ? true : undefined}
                aria-describedby={
                  errors.vin ? 'car-vin-hint car-vin-error' : 'car-vin-hint'
                }
                {...register('vin')}
              />
              <FieldDescription id='car-vin-hint'>
                {vinLength}/17 characters. Letters and numbers only.
              </FieldDescription>
              <FieldError
                id='car-vin-error'
                errors={errors.vin ? [errors.vin] : undefined}
              />
            </Field>

            <Field data-invalid={errors.images ? true : undefined}>
              <FieldLabel htmlFor='car-images'>Photo URLs (optional)</FieldLabel>
              <Textarea
                id='car-images'
                rows={3}
                autoComplete='off'
                spellCheck={false}
                placeholder={'https://example.com/car-front.jpg\nhttps://example.com/car-rear.jpg'}
                className='font-mono text-sm'
                aria-invalid={errors.images ? true : undefined}
                aria-describedby={
                  errors.images
                    ? 'car-images-hint car-images-error'
                    : 'car-images-hint'
                }
                {...register('images')}
              />
              <FieldDescription id='car-images-hint'>
                Paste image links separated by spaces, commas, or new lines. Up
                to 8.
              </FieldDescription>
              <FieldError
                id='car-images-error'
                errors={errors.images ? [errors.images] : undefined}
              />
              <CarImagePreview urls={imageUrls} />
            </Field>
          </FieldGroup>

          {formError ? (
            <p
              ref={formErrorRef}
              tabIndex={-1}
              role='alert'
              className='rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive outline-none'
            >
              {formError}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={handleSubmit((values) =>
                onSubmit(values, { keepOpen: true }),
              )}
              disabled={isPending}
            >
              Save &amp; add another
            </Button>
            <Button type='submit' disabled={isPending} aria-busy={isPending}>
              {isPending ? (
                <>
                  <Spinner data-icon='inline-start' />
                  Saving…
                </>
              ) : (
                'Add car'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
