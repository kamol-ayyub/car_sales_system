import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { meResponseSchema, type MeResponse } from '@/shared/schemas/auth.schema';
import {
  createClientFormSchema,
  type CreateClientFormValues,
} from '@/shared/schemas/create-client.schema';
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@repo/ui/components/field';
import { Input } from '@repo/ui/components/input';
import { Spinner } from '@repo/ui/components/spinner';
import { toast } from '@repo/ui/components/toast';
import { useForm, zodResolver } from '@repo/ui/lib/form';
import { UserPlusIcon } from 'lucide-react';
import { useState } from 'react';

type CreateCustomerBody = Omit<CreateClientFormValues, 'email'> & {
  email?: string;
};

export const CreateCustomerDialog = () => {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate: createCustomer, isPending } = usePostQuery<
    CreateCustomerBody,
    MeResponse
  >({
    key: QUERY_KEYS.clients,
    schema: meResponseSchema,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientFormSchema),
    defaultValues: { name: '', phone: '', email: '' },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setFormError(null);
      reset();
    }
    setOpen(next);
  };

  const onSubmit = (values: CreateClientFormValues) => {
    setFormError(null);
    createCustomer(
      {
        url: '/user/clients',
        attributes: {
          name: values.name,
          phone: values.phone,
          email: values.email.trim() === '' ? undefined : values.email.trim(),
        },
      },
      {
        onSuccess(response) {
          setOpen(false);
          reset();
          toast.add({
            type: 'success',
            title: 'Customer added',
            description: `${response.data.name} can now be linked to a sale.`,
          });
        },
        onError(error) {
          setFormError(getApiErrorMessage(error));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <UserPlusIcon data-icon='inline-start' />
        Add customer
      </DialogTrigger>
      <DialogContent className='motion-reduce:animate-none'>
        <DialogHeader>
          <DialogTitle>New customer</DialogTitle>
          <DialogDescription>
            Add a customer so they can be selected as the buyer when recording a
            sale.
          </DialogDescription>
        </DialogHeader>

        <form
          className='flex flex-col gap-4'
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <FieldGroup className='gap-4'>
            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor='customer-name'>Name</FieldLabel>
              <Input
                id='customer-name'
                autoFocus
                required
                aria-required='true'
                autoComplete='off'
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={
                  errors.name ? 'customer-name-error' : undefined
                }
                {...register('name')}
              />
              <FieldError
                id='customer-name-error'
                errors={errors.name ? [errors.name] : undefined}
              />
            </Field>

            <Field data-invalid={errors.phone ? true : undefined}>
              <FieldLabel htmlFor='customer-phone'>Phone</FieldLabel>
              <Input
                id='customer-phone'
                type='tel'
                inputMode='tel'
                required
                aria-required='true'
                autoComplete='off'
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={
                  errors.phone ? 'customer-phone-error' : undefined
                }
                {...register('phone')}
              />
              <FieldError
                id='customer-phone-error'
                errors={errors.phone ? [errors.phone] : undefined}
              />
            </Field>

            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor='customer-email'>
                Email (optional)
              </FieldLabel>
              <Input
                id='customer-email'
                type='email'
                autoComplete='off'
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={
                  errors.email ? 'customer-email-error' : undefined
                }
                {...register('email')}
              />
              <FieldError
                id='customer-email-error'
                errors={errors.email ? [errors.email] : undefined}
              />
            </Field>
          </FieldGroup>

          {formError ? (
            <p
              role='alert'
              className='rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive'
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
            <Button type='submit' disabled={isPending} aria-busy={isPending}>
              {isPending ? (
                <>
                  <Spinner data-icon='inline-start' />
                  Saving…
                </>
              ) : (
                'Save customer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
