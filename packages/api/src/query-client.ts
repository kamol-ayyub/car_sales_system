import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
};

export const queryClient = createQueryClient();
