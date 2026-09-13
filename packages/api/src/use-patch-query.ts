import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { getAxiosInstance } from "./axios-instance";
import type { AxiosResponse, AxiosRequestConfig } from "axios";
import { validateResponse, type ValidatableSchema } from "./validate-response";

export interface UsePatchQueryProps {
  key?: string;
  listKey?: string;
  id?: string | number;
  schema?: ValidatableSchema;
}

export interface PatchMutationArgs<T = unknown> {
  url: string;
  attributes: T;
  config?: AxiosRequestConfig;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export interface UsePatchQueryResult<T = unknown> {
  mutate: UseMutationResult<
    AxiosResponse<T>,
    unknown,
    PatchMutationArgs<T>
  >["mutate"];
  mutateAsync: UseMutationResult<
    AxiosResponse<T>,
    unknown,
    PatchMutationArgs<T>
  >["mutateAsync"];
  mutateMany: (args: PatchMutationArgs<T>[]) => Promise<AxiosResponse<T>[]>;
  isPending: boolean;
}

export const usePatchQuery = <T = unknown>({
  key = "list",
  listKey = "",
  id,
  schema,
}: UsePatchQueryProps): UsePatchQueryResult<T> => {
  const queryClient = useQueryClient();

  const patchRequest = async (
    url: string,
    attributes: T,
    config: AxiosRequestConfig = {},
  ) => {
    const response = await getAxiosInstance().patch<T>(url, attributes, config);
    return validateResponse(response, schema, url);
  };

  const mutation: UseMutationResult<
    AxiosResponse<T>,
    unknown,
    PatchMutationArgs<T>
  > = useMutation({
    mutationFn: ({ url, attributes, config = {} }: PatchMutationArgs<T>) =>
      patchRequest(url, attributes, config),
    onError: (error, { onError }) => {
      console.error("PATCH mutation error:", error);
      onError?.(error);
    },
    onSuccess: (_, { onSuccess }) => {
      if (key) {
        queryClient.invalidateQueries({ queryKey: id ? [key, id] : [key] });
      }
      if (listKey) {
        queryClient.invalidateQueries({ queryKey: [listKey] });
      }
      onSuccess?.();
    },
  });

  const mutateMany = async (
    args: PatchMutationArgs<T>[],
  ): Promise<AxiosResponse<T>[]> => {
    const results = await Promise.all(
      args.map(({ url, attributes, config = {} }) =>
        patchRequest(url, attributes, config),
      ),
    );
    if (key) {
      queryClient.invalidateQueries({ queryKey: id ? [key, id] : [key] });
    }
    if (listKey) {
      queryClient.invalidateQueries({ queryKey: [listKey] });
    }
    return results;
  };

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    mutateMany,
    isPending: mutation.isPending,
  };
};
