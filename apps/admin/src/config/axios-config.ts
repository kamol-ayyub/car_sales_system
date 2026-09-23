import { refreshResponseSchema } from '@/shared/schemas/auth.schema';
import { validateResponse } from '@/shared/hooks/api/validate-response';
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';
import { setAxiosInstance } from '@repo/api';

export const config: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
} as const;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: config.baseURL,
  withCredentials: true,
  headers: config.headers,
});
setAxiosInstance(axiosInstance);

let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

// Leading slash is optional: instance requests use relative URLs like 'auth/login'
const AUTH_PATH_PATTERN = /^\/?auth\/(login|refresh|logout)(?:\?|$)/;

let refreshRequest: Promise<string | undefined> | null = null;

const isAuthRequest = (url?: string): boolean =>
  Boolean(url && AUTH_PATH_PATTERN.test(url));

const logoutAndRedirect = async (): Promise<void> => {
  setAccessToken(null);
  try {
    await axios.post(
      `${config.baseURL}/auth/logout`,
      {},
      { withCredentials: true, headers: config.headers },
    );
  } catch {
    // Continue logout even if the cookie is already gone.
  }
  // window.location.replace('/login');
};

const requestNewAccessToken = async (): Promise<string | undefined> => {
  try {
    const response = await axios.post(
      `${config.baseURL}/auth/refresh`,
      {},
      { withCredentials: true, headers: config.headers },
    );
    const { accessToken: token } = validateResponse(
      response,
      refreshResponseSchema,
      '/auth/refresh',
    ).data;

    if (!token) {
      throw new Error('Malformed refresh response: missing access token');
    }

    setAccessToken(token);
    return token;
  } catch {
    await logoutAndRedirect();
  }
};

const refreshAccessToken = async (): Promise<string | undefined> => {
  if (!refreshRequest) {
    refreshRequest = requestNewAccessToken().finally(() => {
      refreshRequest = null;
    });
  }
  return refreshRequest;
};

axiosInstance.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    if (accessToken && reqConfig.headers) {
      reqConfig.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return reqConfig;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export { axiosInstance };
