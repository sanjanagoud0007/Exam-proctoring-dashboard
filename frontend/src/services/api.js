import axios from "axios";
import { getApiErrorMessage } from "../utils/apiError.js";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 90000,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((req) => {
  try {
    const raw = localStorage.getItem("userInfo");
    if (raw) {
      const userInfo = JSON.parse(raw);
      if (userInfo?.token) {
        req.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    }
  } catch {
    /* invalid stored session */
  }
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401) {
      localStorage.removeItem("userInfo");
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export { getApiErrorMessage };
export default API;
