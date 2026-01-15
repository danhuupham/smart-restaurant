import axios from "axios";

const api = axios.create({
  // Backend runs on http://localhost:5000 by default (see backend/src/main.ts)
  // You can override via NEXT_PUBLIC_API_BASE_URL in frontend/.env.local
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export { api };
