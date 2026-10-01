import type { AxiosResponse } from 'axios';
import { queryClient } from './query-client';
import {
  buildGetQueryKey,
  createGetQueryFn,
  type GetQueryConfig,
} from './use-get-query';

export interface PrefetchGetQueryProps extends GetQueryConfig {
  staleTime?: number;
}

export const prefetchGetQuery = <T = unknown>({
  key = 'list',
  url,
  params,
  config,
  schema,
  staleTime,
}: PrefetchGetQueryProps): Promise<void> => {
  return queryClient
    .query<AxiosResponse<T>>({
      queryKey: buildGetQueryKey(key, params),
      queryFn: createGetQueryFn<T>(url, params, config, schema),
      staleTime,
    })
    .then(() => undefined)
    .catch(() => undefined);
};
