import axios from "axios";
import { currentUser } from "../tenant-context";

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000/api/v1`;
  }
  return "http://127.0.0.1:8000/api/v1";
};

const API_BASE_URL = getApiBaseUrl();

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to dynamically inject active Tenant and Auth context headers
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Inject Tenant parameters dynamically from the active user profile context
    let activeOrgId = currentUser.organization_id;
    let activeClinicId = currentUser.clinic_id;

    const savedUserStr = localStorage.getItem("active_user");
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        if (parsed.organization_id) activeOrgId = parsed.organization_id;
        if (parsed.clinic_id !== undefined) activeClinicId = parsed.clinic_id;
      } catch (e) {}
    }

    if (activeOrgId) {
      config.headers["X-Organization-ID"] = activeOrgId;
    }
    if (activeClinicId) {
      config.headers["X-Clinic-ID"] = activeClinicId;
    }

    // 2. Inject Auth Token if present in local storage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
