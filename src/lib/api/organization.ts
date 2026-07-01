import { axiosInstance } from "./axiosInstance";
import type {
  Organization,
  OrganizationPayload,
} from "@/types/organization";

export const organizationApi = {
  getAll: async () => {
    const response = await axiosInstance.get<Organization[]>("/organizations/");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<Organization>(`/organizations/${id}/`);
    return response.data;
  },

  create: async (data: OrganizationPayload) => {
    const response = await axiosInstance.post<Organization>("/organizations/", data);
    return response.data;
  },

  update: async (id: string, data: OrganizationPayload) => {
    const response = await axiosInstance.put<Organization>(`/organizations/${id}/`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await axiosInstance.delete(`/organizations/${id}/`);
    return response.data;
  },
};