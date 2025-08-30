import axios from "axios";
import https from "https";

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
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken"); // adjust according to auth implementation
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
