import { setAccessToken } from '@/config/axios-config';
import { queryClient, usePostQuery } from '@repo/api';
import { useNavigate } from '@tanstack/react-router';

export const useLogout = () => {
  const navigate = useNavigate();
  const { mutate } = usePostQuery({ key: 'logout' });

  return () => {
    mutate(
      { url: 'auth/logout', attributes: {} },
      {
        onSettled: () => {
          setAccessToken(null);
          queryClient.clear();
          navigate({ to: '/login' });
        },
      },
    );
  };
};
