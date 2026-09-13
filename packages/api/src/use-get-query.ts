import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAxiosInstance } from "./axios-instance";
import type { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";
import { validateResponse, type ValidatableSchema } from "./validate-response";

export interface UseGetAllQueryProps {
  key?: string;
  url: string;
  params?: Record<string, unknown>;
  config?: AxiosRequestConfig;
  enabled?: boolean;
  refetchInterval?: number;
  schema?: ValidatableSchema;
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
  const queryKey =
    params && Object.keys(params).length > 0 ? [key, params] : [key];

  return useQuery<AxiosResponse<T>, AxiosError>({
    queryKey,
    queryFn: async () => {
      const response = await getAxiosInstance().get<T>(url, {
        params,
        ...config,
      });
      return validateResponse(response, schema, url);
    },
    enabled,
    refetchInterval,
  });
};
