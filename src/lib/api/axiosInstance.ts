import axios from "axios";
import { currentUser } from "../tenant-context";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to dynamically inject active Tenant and Auth context headers
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Inject Tenant parameters from the active context context
    if (currentUser.organization_id) {
      config.headers["X-Organization-ID"] = currentUser.organization_id;
    }
    if (currentUser.clinic_id) {
      config.headers["X-Clinic-ID"] = currentUser.clinic_id;
    }

    // 2. Inject Auth Token if present in local storage
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
