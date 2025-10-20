import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { API_CONFIG } from "@/src/config/api";
import { tokenStorage } from "@/src/utils/storage";

// For React Native, we use our API configuration
const isProd = API_CONFIG.isProduction;
const baseURL = `${API_CONFIG.baseURL}/api`;


const MAX_RETRIES = API_CONFIG.retry.maxRetries;
function shouldRetry(error: AxiosError) {
  if (!error || !error.config) return false;
  const status = error.response?.status;
  return (
    error.code === "ECONNABORTED" ||
    !error.response ||
    (status !== undefined && status >= 500 && status < 600)
  );
}

async function retryRequest(originalConfig: AxiosRequestConfig) {
  const config: any = originalConfig;
  config.__retryCount = config.__retryCount || 0;

  if (config.__retryCount >= MAX_RETRIES) {
    throw new Error("Max retries exceeded");
  }

  config.__retryCount += 1;
  const backoff = API_CONFIG.retry.baseDelay * Math.pow(API_CONFIG.retry.backoffMultiplier, config.__retryCount);
  await new Promise((res) => setTimeout(res, backoff));
  return api.request(config);
}

const defaultTimeout = isProd ? API_CONFIG.timeout.production : API_CONFIG.timeout.default;
const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: defaultTimeout,
});

api.interceptors.request.use(
  async (config) => {
    // Add auth token to requests
    const token = await tokenStorage.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.url?.includes("/auth/")) {
      config.params = { ...config.params, _t: Date.now() };
    }
    if (!isProd) {
      console.debug("[api] request:", {
        url: config.url,
        method: config.method,
        params: config.params,
      });
    }
    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (!isProd) {
      console.debug("[api] response:", {
        url: response.config.url,
        method: response.config.method,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    if (shouldRetry(error) && error.config) {
      try {
        if (!isProd) {
          console.debug("[api] retrying request", {
            url: error.config.url,
            retryCount: (error.config as any).__retryCount || 0,
          });
        }
        return await retryRequest(error.config);
      } catch (error) {
        if (!isProd)
          console.warn(
            "[api] retries exhausted for",
            (error as AxiosError).config?.url
          );
      }
    }
    return Promise.reject(error);
  }
);

export default api;
