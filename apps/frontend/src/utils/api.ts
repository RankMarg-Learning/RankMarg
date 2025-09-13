// api.ts
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({ keepAlive: true });

const baseURL =`${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

const api = axios.create({
  baseURL,
  httpsAgent,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, 
});

api.interceptors.request.use((config) => {
  return config;
});

export default api;
