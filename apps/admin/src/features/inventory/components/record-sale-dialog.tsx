import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import {
  meResponseSchema,
  type MeResponse,
} from '@/shared/schemas/auth.schema';
import { carSchema, type Car } from '@/shared/schemas/car.schema';
import {
  userListSchema,
  type PaginatedUsers,
} from '@/shared/schemas/user.schema';
import { formatCurrency } from '@/shared/utils/format-currency';
import { getApiErrorMessage } from '@/shared/utils/get-api-error-message';
import { useGetAllQuery, usePostQuery } from '@repo/api';
import { Button } from '@repo/ui/components/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@repo/ui/components/combobox';
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
import { toast } from '@repo/ui/components/toast';
import { Controller, useForm, zodResolver } from '@repo/ui/lib/form';
import { UserPlusIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createClientFormSchema,
  type CreateClientFormValues,
} from '../schemas/create-client.schema';
import {
  sellCarFormSchema,
  type SellCarFormValues,
} from '../schemas/sell-car.schema';

interface RecordSaleDialogProps {
  car: Car;
  onUndo: () => void;
}

interface SellCarBody {
  clientId: string;
  salePrice?: number;
}

interface CreateClientBody {
  name: string;
  phone: string;
  email?: string;
}

interface ClientOption {
  value: string;
  label: string;
}

const getClientLabel = (client: MeResponse): string => {
  const contact = [client.email, client.phone].filter(Boolean).join(' · ');
  return contact ? `${client.name} · ${contact}` : client.name;
};

export const RecordSaleDialog = ({ car, onUndo }: RecordSaleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [searchInput, setSearchInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdClients, setCreatedClients] = useState<MeResponse[]>([]);
  const [previousClients, setPreviousClients] = useState<MeResponse[]>([]);
  const [selectedClient, setSelectedClient] = useState<MeResponse | null>(null);
  const clientInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebouncedValue(searchInput, 250);

  const {
    data: clientsResponse,
    isPending: areClientsPending,
    isError: areClientsError,
    refetch: refetchClients,
  } = useGetAllQuery<PaginatedUsers>({
    key: 'clients',
    url: '/user/clients',
    params: debouncedSearch
      ? { limit: 100, search: debouncedSearch.slice(0, 100) }
      : { limit: 100 },
    schema: userListSchema,
    enabled: open,
  });

  useEffect(() => {
    if (clientsResponse) {
      setPreviousClients(clientsResponse.data.data);
    }
  }, [clientsResponse]);

  useEffect(() => {
    if (open && mode === 'select') {
      clientInputRef.current?.focus();
    }
  }, [open, mode]);

  const { mutate: recordSale, isPending: isRecording } = usePostQuery<
    SellCarBody,
    Car
  >({
    key: `car-${car.id}`,
    listKey: 'cars',
    schema: carSchema,
  });

  const { mutate: createClient, isPending: isCreating } = usePostQuery<
    CreateClientBody,
    MeResponse
  >({
    key: 'clients',
    schema: meResponseSchema,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset: resetSaleForm,
    formState: { errors },
  } = useForm<SellCarFormValues>({
    resolver: zodResolver(sellCarFormSchema),
    defaultValues: { clientId: '', salePrice: '' },
  });

  const {
    register: registerClient,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
    formState: { errors: clientErrors },
  } = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientFormSchema),
    defaultValues: { name: '', phone: '', email: '' },
  });

  const clients = useMemo<MeResponse[]>(() => {
    const map = new Map<string, MeResponse>();
    const all = [
      ...(clientsResponse?.data.data ?? previousClients),
      ...createdClients,
      ...(selectedClient ? [selectedClient] : []),
    ];

    for (const client of all) {
      map.set(client.id, client);
    }

    return Array.from(map.values());
  }, [clientsResponse, previousClients, createdClients, selectedClient]);

  const clientItems = useMemo<ClientOption[]>(
    () =>
      clients.map((client) => ({
        value: client.id,
        label: getClientLabel(client),
      })),
    [clients],
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setFormError(null);
      setCreateError(null);
      setMode('select');
      setSearchInput('');
      setCreatedClients([]);
      setPreviousClients([]);
      setSelectedClient(null);
      resetSaleForm();
      resetCreateForm();
    }
    setOpen(next);
  };

  const onSubmit = (values: SellCarFormValues) => {
    setFormError(null);
    const buyer = clients.find((client) => client.id === values.clientId);
    recordSale(
      {
        url: `/car/${car.id}/sell`,
        attributes: {
          clientId: values.clientId,
          salePrice:
            values.salePrice.trim() === ''
              ? undefined
              : Number(values.salePrice),
        },
      },
      {
        onSuccess() {
          setOpen(false);
          toast.add({
            type: 'success',
            title: 'Sale recorded',
            description: buyer
              ? `${car.brand} ${car.model} sold to ${buyer.name}.`
              : `${car.brand} ${car.model} marked as sold.`,
            timeout: 10000,
            actionProps: { children: 'Undo', onClick: onUndo },
          });
        },
        onError(error) {
          setFormError(getApiErrorMessage(error));
        },
      },
    );
  };

  const onCreateClient = (values: CreateClientFormValues) => {
    setCreateError(null);
    createClient(
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
          setCreatedClients((previous) => [...previous, response.data]);
          setSelectedClient(response.data);
          setValue('clientId', response.data.id);
          resetCreateForm();
          setMode('select');
          toast.add({
            type: 'success',
            title: 'Buyer added',
            description: `${response.data.name} is selected for this sale. Record the sale to finish.`,
          });
        },
        onError(error) {
          setCreateError(getApiErrorMessage(error));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className='w-full' />}>
        Record sale
      </DialogTrigger>
      <DialogContent className='motion-reduce:animate-none max-h-[calc(100vh-2rem)] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'New buyer' : 'Record sale'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add the buyer\u2019s details to record this sale. They can be given online access later.'
              : `Mark ${car.brand} ${car.model} as sold to a buyer.`}
          </DialogDescription>
        </DialogHeader>

        <form
          className='flex flex-col gap-4'
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {mode === 'select' ? (
            <div className='flex flex-col gap-4'>
              <Field data-invalid={errors.clientId ? true : undefined}>
                <FieldLabel htmlFor='clientId'>Buyer</FieldLabel>
                <Controller
                  control={control}
                  name='clientId'
                  render={({ field }) => (
                    <Combobox
                      items={clientItems}
                      value={
                        clientItems.find(
                          (option) => option.value === field.value,
                        ) ?? null
                      }
                      onValueChange={(item) => {
                        setSelectedClient(
                          item
                            ? (clients.find(
                                (client) => client.id === item.value,
                              ) ?? null)
                            : null,
                        );
                        field.onChange(item?.value ?? '');
                      }}
                      onInputValueChange={(value, details) => {
                        if (
                          details.reason === 'input-change' ||
                          details.reason === 'input-clear'
                        ) {
                          setSearchInput(value);
                        }
                      }}
                      isItemEqualToValue={(item, selected) =>
                        item.value === selected.value
                      }
                    >
                      <ComboboxInput
                        ref={clientInputRef}
                        id='clientId'
                        autoComplete='off'
                        showClear
                        placeholder='Search by name, email, or phone'
                        aria-invalid={errors.clientId ? true : undefined}
                        aria-describedby={
                          errors.clientId ? 'clientId-error' : undefined
                        }
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>
                          {areClientsPending
                            ? 'Searching buyers…'
                            : 'No matching buyers.'}
                        </ComboboxEmpty>
                        <ComboboxList>
                          {(item: ClientOption) => (
                            <ComboboxItem key={item.value} value={item}>
                              <span className='min-w-0 flex-1 truncate'>
                                {item.label}
                              </span>
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )}
                />
                <FieldError
                  id='clientId-error'
                  errors={errors.clientId ? [errors.clientId] : undefined}
                />
                <p role='status' className='sr-only'>
                  {areClientsPending ? 'Loading buyers' : ''}
                </p>
                {areClientsError ? (
                  <div className='flex items-center gap-2'>
                    <p
                      role='alert'
                      className='text-sm font-medium text-destructive'
                    >
                      We couldn&apos;t load the buyer list.
                    </p>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => void refetchClients()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : null}
              </Field>
              <Button
                type='button'
                variant='link'
                size='sm'
                className='self-start px-0'
                onClick={() => setMode('create')}
              >
                <UserPlusIcon data-icon='inline-start' />
                Add a new buyer
              </Button>
            </div>
          ) : (
            <FieldGroup className='gap-4'>
              <Field data-invalid={clientErrors.name ? true : undefined}>
                <FieldLabel htmlFor='new-client-name'>Name</FieldLabel>
                <Input
                  id='new-client-name'
                  autoFocus
                  required
                  aria-required='true'
                  autoComplete='off'
                  aria-invalid={clientErrors.name ? true : undefined}
                  aria-describedby={
                    clientErrors.name ? 'new-client-name-error' : undefined
                  }
                  {...registerClient('name')}
                />
                <FieldError
                  id='new-client-name-error'
                  errors={clientErrors.name ? [clientErrors.name] : undefined}
                />
              </Field>

              <Field data-invalid={clientErrors.phone ? true : undefined}>
                <FieldLabel htmlFor='new-client-phone'>Phone</FieldLabel>
                <Input
                  id='new-client-phone'
                  type='tel'
                  inputMode='tel'
                  required
                  aria-required='true'
                  autoComplete='off'
                  aria-invalid={clientErrors.phone ? true : undefined}
                  aria-describedby={
                    clientErrors.phone ? 'new-client-phone-error' : undefined
                  }
                  {...registerClient('phone')}
                />
                <FieldError
                  id='new-client-phone-error'
                  errors={clientErrors.phone ? [clientErrors.phone] : undefined}
                />
              </Field>

              <Field data-invalid={clientErrors.email ? true : undefined}>
                <FieldLabel htmlFor='new-client-email'>
                  Email (optional)
                </FieldLabel>
                <Input
                  id='new-client-email'
                  type='email'
                  autoComplete='off'
                  aria-invalid={clientErrors.email ? true : undefined}
                  aria-describedby={
                    clientErrors.email ? 'new-client-email-error' : undefined
                  }
                  {...registerClient('email')}
                />
                <FieldError
                  id='new-client-email-error'
                  errors={clientErrors.email ? [clientErrors.email] : undefined}
                />
              </Field>

              {createError ? (
                <p
                  role='alert'
                  className='rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive'
                >
                  {createError}
                </p>
              ) : null}
            </FieldGroup>
          )}

          {mode === 'select' ? (
            <Field data-invalid={errors.salePrice ? true : undefined}>
              <FieldLabel htmlFor='salePrice'>Sale price (optional)</FieldLabel>
              <Input
                id='salePrice'
                type='number'
                min={0}
                step='0.01'
                inputMode='decimal'
                placeholder={String(car.price)}
                aria-invalid={errors.salePrice ? true : undefined}
                aria-describedby={
                  errors.salePrice
                    ? 'salePrice-hint salePrice-error'
                    : 'salePrice-hint'
                }
                {...register('salePrice')}
              />
              <FieldDescription id='salePrice-hint'>
                Leave blank to use the asking price of{' '}
                {formatCurrency(car.price)}.
              </FieldDescription>
              <FieldError
                id='salePrice-error'
                errors={errors.salePrice ? [errors.salePrice] : undefined}
              />
            </Field>
          ) : null}

          {formError ? (
            <p
              role='alert'
              className='rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive'
            >
              {formError}
            </p>
          ) : null}

          <DialogFooter>
            {mode === 'create' ? (
              <>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setCreateError(null);
                    resetCreateForm();
                    setMode('select');
                  }}
                  disabled={isCreating}
                >
                  Back to search
                </Button>
                <Button
                  type='button'
                  onClick={handleCreateSubmit(onCreateClient)}
                  disabled={isCreating}
                  aria-busy={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Spinner data-icon='inline-start' />
                      Saving…
                    </>
                  ) : (
                    'Save buyer & continue'
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => handleOpenChange(false)}
                  disabled={isRecording}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={isRecording}
                  aria-busy={isRecording}
                >
                  {isRecording ? (
                    <>
                      <Spinner data-icon='inline-start' />
                      Recording…
                    </>
                  ) : (
                    'Record sale'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
