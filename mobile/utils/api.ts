import axios, { AxiosError, AxiosRequestConfig } from "axios";
import https from "https";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
const isProd = process.env.NODE_ENV === "production";
const baseURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

const httpsAgent = new https.Agent({ keepAlive: true });

const MAX_RETRIES = 1;
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
  const backoff = 200 * Math.pow(2, config.__retryCount);
  await new Promise((res) => setTimeout(res, backoff));
  return api.request(config);
}

const defaultTimeout = isProd ? 30000 : 10000;
const api = axios.create({
  baseURL,
  httpsAgent,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: defaultTimeout,
});

api.interceptors.request.use(
  (config) => {
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
