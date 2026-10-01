import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAxiosInstance } from "./axios-instance";
import type { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";
import { validateResponse, type ValidatableSchema } from "./validate-response";

export interface GetQueryConfig {
  key?: string;
  url: string;
  params?: Record<string, unknown>;
  config?: AxiosRequestConfig;
  schema?: ValidatableSchema;
}

export const buildGetQueryKey = (
  key: string,
  params?: Record<string, unknown>,
): unknown[] =>
  params && Object.keys(params).length > 0 ? [key, params] : [key];

export const createGetQueryFn =
  <T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
    schema?: ValidatableSchema,
  ) =>
  async () => {
    const response = await getAxiosInstance().get<T>(url, {
      params,
      ...config,
    });
    return validateResponse(response, schema, url);
  };

export interface UseGetAllQueryProps extends GetQueryConfig {
  enabled?: boolean;
  refetchInterval?: number;
}

export const useGetAllQuery = <T = unknown>({
  key = "list",
  url,
  params,
  config,
  enabled = true,
  refetchInterval,
  schema,
}: UseGetAllQueryProps): UseQueryResult<AxiosResponse<T>, AxiosError> => {
  return useQuery<AxiosResponse<T>, AxiosError>({
    queryKey: buildGetQueryKey(key, params),
    queryFn: createGetQueryFn<T>(url, params, config, schema),
    enabled,
    refetchInterval,
  });
};