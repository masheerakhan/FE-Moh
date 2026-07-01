import { axiosInstance } from "./axiosInstance";

export interface Clinic {
  id?: string;
  name: string;
  code: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  status: "ACTIVE" | "INACTIVE";
}

export const clinicApi = {
  // Fetch clinics under active tenant organization
  getClinics: async () => {
    const response = await axiosInstance.get<Clinic[]>("/clinics/");
    return response.data;
  },

  // Create new physical clinic facility
  createClinic: async (data: Omit<Clinic, "id">) => {
    const response = await axiosInstance.post<Clinic>("/clinics/", data);
    return response.data;
  },

  // Retrieve single clinic configuration
  getClinicById: async (id: string) => {
    const response = await axiosInstance.get<Clinic>(`/clinics/${id}/`);
    return response.data;
  },

  // Delete a clinic facility
  deleteClinic: async (id: string) => {
    const response = await axiosInstance.delete(`/clinics/${id}/`);
    return response.data;
  },
};
