import { refreshResponseSchema } from "@/shared/schemas/auth.schema";
import { validateResponse } from "@/shared/hooks/api/validate-response";
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import { setAxiosInstance } from "@repo/api";

export const config: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
} as const;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: config.baseURL,
  withCredentials: true,
  headers: config.headers,
});
setAxiosInstance(axiosInstance);

const refreshAccessToken = async (): Promise<string | undefined> => {
  try {
    const response = await axios.post<{
      accessToken: string;
      refreshToken: string;
      children: unknown;
    }>(
      `${config.baseURL}/auth/refresh`,
      {
        oldRefreshToken: localStorage.getItem("refreshToken"),
      },
      { withCredentials: true, headers: config.headers },
    );
    const { accessToken, refreshToken } = validateResponse(
      response,
      refreshResponseSchema,
      "/auth/refresh",
    ).data;

    // A refresh response without tokens is untrustworthy — force logout
    if (!accessToken || !refreshToken) {
      throw new Error("Malformed refresh response: missing tokens");
    }

    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("accessToken", accessToken);

    return accessToken;
  } catch {
    // Refresh token is invalid/expired — clear tokens and force logout
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.replace("/login");
  }
};

// Attach access token to every request
axiosInstance.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken && reqConfig.headers) {
      reqConfig.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return reqConfig;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// On 401, silently refresh and retry the original request once
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // prevent infinite retry loop

      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest); // retry original request with new token
      }
    }

    return Promise.reject(error);
  },
);

export { axiosInstance };
