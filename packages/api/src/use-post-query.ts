import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { getAxiosInstance } from "./axios-instance";
import type { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";
import { validateResponse, type ValidatableSchema } from "./validate-response";

export interface UsePostQueryProps {
  key?: string;
  listKey?: string;
  showErrorMessage?: boolean;
  schema?: ValidatableSchema;
}

export interface PostMutationArgs<T = unknown> {
  url: string;
  attributes: T;
  config?: AxiosRequestConfig;
}

export interface UsePostQueryResult<TBody = unknown, TData = unknown> {
  mutate: UseMutationResult<
    AxiosResponse<TData>,
    AxiosError<unknown>,
    PostMutationArgs<TBody>
  >["mutate"];
  mutateAsync: UseMutationResult<
    AxiosResponse<TData>,
    AxiosError<unknown>,
    PostMutationArgs<TBody>
  >["mutateAsync"];
  mutateMany: (
    args: PostMutationArgs<TBody>[],
  ) => Promise<AxiosResponse<TData>[]>;
  data?: AxiosResponse<TData>;
  error?: AxiosError<unknown>;
  isPending: boolean;
}

export const usePostQuery = <TBody = unknown, TData = unknown>({
  key = "list",
  listKey,
  showErrorMessage,
  schema,
}: UsePostQueryProps): UsePostQueryResult<TBody, TData> => {
  const queryClient = useQueryClient();

  const postRequest = async (
    url: string,
    attributes: TBody,
    config: AxiosRequestConfig = {},
  ) => {
    const response = await getAxiosInstance().post<TData>(
      url,
      attributes,
      config,
    );
    return validateResponse(response, schema, url);
  };

  const mutation: UseMutationResult<
    AxiosResponse<TData>,
    AxiosError<unknown>,
    PostMutationArgs<TBody>
  > = useMutation({
    mutationFn: ({ url, attributes, config = {} }: PostMutationArgs<TBody>) =>
      postRequest(url, attributes, config),
    onError: (error) => {
      if (showErrorMessage) {
        console.error("POST mutation error:", error);
      }
      return error;
    },
    onSuccess: () => {
      if (key) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      if (listKey) {
        queryClient.invalidateQueries({ queryKey: [listKey] });
      }
    },
  });

  const mutateMany = async (
    args: PostMutationArgs<TBody>[],
  ): Promise<AxiosResponse<TData>[]> => {
    const results = await Promise.all(
      args.map(({ url, attributes, config = {} }) =>
        postRequest(url, attributes, config),
      ),
    );
    if (key) {
      queryClient.invalidateQueries({ queryKey: [key] });
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
    data: mutation.data,
    error: mutation.error ?? undefined,
    isPending: mutation.isPending,
  };
};
