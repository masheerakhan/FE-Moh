import { axiosInstance } from "./axiosInstance";

export interface LabOrder {
  id?: string;
  orderNo?: string;
  patient: string;
  patient_id?: string;
  panel: string;
  collected?: string;
  status: "Pending" | "Processing" | "Ready";
}

export interface LabReportParseResult {
  order_id: string;
  parsed_parameters: Record<string, string | number>;
  status: "success" | "warning" | "error";
}

export const labApi = {
  // Fetch active lab orders
  getOrders: async () => {
    const response = await axiosInstance.get<LabOrder[]>("/labs/orders/");
    return response.data;
  },

  // Create new lab order (e.g. CBC, HbA1c panel)
  createOrder: async (data: Omit<LabOrder, "id">) => {
    const response = await axiosInstance.post<LabOrder>("/labs/orders/", data);
    return response.data;
  },

  // Advance lab status (Pending -> Processing -> Ready)
  updateOrderStatus: async (id: string, status: string) => {
    const response = await axiosInstance.patch<LabOrder>(`/labs/orders/${id}/`, {
      status,
    });
    return response.data;
  },

  // Delete lab order
  deleteOrder: async (id: string) => {
    const response = await axiosInstance.delete(`/labs/orders/${id}/`);
    return response.data;
  },

  // Author automatic PDF report parsing and FHIR data extraction
  parseReportPDF: async (orderId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);



    const response = await axiosInstance.post<LabReportParseResult>(
      `/labs/orders/${orderId}/parse-pdf/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
  saveResults: async (id: string, results: string) => {
    const response = await axiosInstance.post(
      `/labs/orders/${id}/results/`,
      {
        results,
      }
    );

    return response.data;
  },
  getDashboard: async () => {
    const response = await axiosInstance.get("/labs/dashboard/");
    return response.data;
  },
  scheduleHomeCollection: async (data: { patient: string; address: string; slot: string }) => {
    const response = await axiosInstance.post("/labs/home-collections/", {
      patient_name: data.patient,
      address: data.address,
      slot: data.slot,
    });
    return response.data;
  },
  getHomeCollections: async () => {
    const response = await axiosInstance.get("/labs/home-collections/");
    return response.data;
  },
  updateHomeCollection: async (id: string, data: { patient?: string; address?: string; slot?: string; status?: string }) => {
    const payload: any = {};
    if (data.patient !== undefined) payload.patient_name = data.patient;
    if (data.address !== undefined) payload.address = data.address;
    if (data.slot !== undefined) payload.slot = data.slot;
    if (data.status !== undefined) payload.status = data.status;

    const response = await axiosInstance.patch(`/labs/home-collections/${id}/`, payload);
    return response.data;
  },
  deleteHomeCollection: async (id: string) => {
    const response = await axiosInstance.delete(`/labs/home-collections/${id}/`);
    return response.data;
  },
};
