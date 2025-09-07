import axios from "axios";
import https from "https";
import { getSession } from "next-auth/react";

// Re-use TCP connection for better latency
const httpsAgent = new https.Agent({ keepAlive: true });

// Dynamically resolve base URL (client & server safe)
const baseURL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"
    : "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  httpsAgent,
});

// Inject auth token automatically if available in localStorage / cookies
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers["Authorization"] = `Bearer ${session.accessToken}`;
  }
  return config;
});

export default api;
