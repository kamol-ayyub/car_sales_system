import {
  useMutation,
  useQueryClient,
  type UseMutateFunction,
  type UseMutationResult,
} from "@tanstack/react-query";
import { getAxiosInstance } from "./axios-instance";
import type { AxiosResponse, AxiosRequestConfig } from "axios";
import { validateResponse, type ValidatableSchema } from "./validate-response";

export interface UseDeleteQueryProps {
  key?: string;
  schema?: ValidatableSchema;
}

export interface DeleteMutationArgs {
  url: string;
  id?: string | number;
  config?: AxiosRequestConfig;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export interface UseDeleteQueryResult<T = unknown> {
  mutate: UseMutateFunction<AxiosResponse<T>, unknown, DeleteMutationArgs>;
  mutateMany: (args: DeleteMutationArgs[]) => Promise<AxiosResponse<T>[]>;
  data?: AxiosResponse<T>;
  error?: unknown;
  isPending: boolean;
}

export const useDeleteQuery = <T = unknown>({
  key = "list",
  schema,
}: UseDeleteQueryProps): UseDeleteQueryResult<T> => {
  const queryClient = useQueryClient();

  const deleteRequest = async (
    url: string,
    config: AxiosRequestConfig = {},
  ) => {
    const response = await getAxiosInstance().delete<T>(url, config);
    return validateResponse(response, schema, url);
  };

  const mutation: UseMutationResult<
    AxiosResponse<T>,
    unknown,
    DeleteMutationArgs
  > = useMutation({
    mutationFn: ({ url, id, config = {} }: DeleteMutationArgs) => {
      const endpoint = id !== undefined ? `${url}/${id}` : url;
      return deleteRequest(endpoint, config);
    },
    onSuccess: (_, { onSuccess }) => {
      if (key) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      onSuccess?.();
    },
    onError: (error, { onError }) => {
      console.error("Delete failed:", error);
      onError?.(error);
    },
  });

  const mutateMany = async (
    args: DeleteMutationArgs[],
  ): Promise<AxiosResponse<T>[]> => {
    const results = await Promise.all(
      args.map(({ url, id, config = {} }) => {
        const endpoint = id !== undefined ? `${url}/${id}` : url;
        return deleteRequest(endpoint, config);
      }),
    );
    if (key) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
    return results;
  };

  return {
    mutate: mutation.mutate,
    mutateMany,
    data: mutation.data,
    error: mutation.error,
    isPending: mutation.isPending,
  };
};
