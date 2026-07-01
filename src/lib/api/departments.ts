import { axiosInstance } from "./axiosInstance";

export interface Department {
  id?: string;
  name: string;
  code: string;
  clinic: string; // Clinic ID/Foreign key
  description?: string;
  status: "ACTIVE" | "INACTIVE";
}

export const departmentApi = {
  getDepartments: async (): Promise<Department[]> => {
    const response = await axiosInstance.get<Department[]>("/departments/");
    return response.data;
  },

  createDepartment: async (data: Omit<Department, "id">): Promise<Department> => {
    const response = await axiosInstance.post<Department>("/departments/", data);
    return response.data;
  },

  deleteDepartment: async (id: string): Promise<any> => {
    const response = await axiosInstance.delete(`/departments/${id}/`);
    return response.data;
  },
};
