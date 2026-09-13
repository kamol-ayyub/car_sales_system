import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { getAxiosInstance } from "./axios-instance";
import type { AxiosResponse, AxiosRequestConfig } from "axios";
import { validateResponse, type ValidatableSchema } from "./validate-response";

export interface UsePutQueryProps {
  key?: string;
  listKey?: string;
  id?: string | number;
  schema?: ValidatableSchema;
}

export interface PutMutationArgs<T = unknown> {
  url: string;
  attributes: T;
  config?: AxiosRequestConfig;
}

export interface UsePutQueryResult<T = unknown> {
  mutate: UseMutationResult<
    AxiosResponse<T>,
    unknown,
    PutMutationArgs<T>
  >["mutate"];
  mutateAsync: UseMutationResult<
    AxiosResponse<T>,
    unknown,
    PutMutationArgs<T>
  >["mutateAsync"];
  isPending: boolean;
}

export const usePutQuery = <T = unknown>({
  key = "list",
  listKey = "",
  id,
  schema,
}: UsePutQueryProps): UsePutQueryResult<T> => {
  const queryClient = useQueryClient();

  const putRequest = async (
    url: string,
    attributes: T,
    config: AxiosRequestConfig = {},
  ) => {
    const response = await getAxiosInstance().put<T>(url, attributes, config);
    return validateResponse(response, schema, url);
  };

  const mutation: UseMutationResult<
    AxiosResponse<T>,
    unknown,
    PutMutationArgs<T>
  > = useMutation({
    mutationFn: ({ url, attributes, config = {} }: PutMutationArgs<T>) =>
      putRequest(url, attributes, config),
    onError: (error) => {
      console.error("PUT mutation error:", error);
      return error;
    },
    onSuccess: () => {
      if (key) {
        queryClient.invalidateQueries({ queryKey: id ? [key, id] : [key] });
      }
      if (listKey) {
        queryClient.invalidateQueries({ queryKey: [listKey] });
      }
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
