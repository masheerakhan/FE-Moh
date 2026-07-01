import { axiosInstance } from "./axiosInstance";

export interface InventoryItem {
  id?: string;
  sku: string;
  name: string;
  batch: string;
  expiry: string;
  stock: number;
  status: "OK" | "Low" | "Critical";
}

export const pharmacyApi = {
  // Fetch active inventory levels (SKUs, batches, status)
  getInventory: async () => {
    const response = await axiosInstance.get<InventoryItem[]>("/pharmacy/inventory/");
    return response.data;
  },

  // Add new SKU inventory registry item
  addInventoryItem: async (data: Omit<InventoryItem, "id">) => {
    const response = await axiosInstance.post<InventoryItem>("/pharmacy/inventory/", data);
    return response.data;
  },

  // Delete inventory item SKU
  deleteInventoryItem: async (id: string) => {
    const response = await axiosInstance.delete(`/pharmacy/inventory/${id}/`);
    return response.data;
  },

  // Trigger manual or automatic stock level adjustments
  updateStock: async (id: string, stock: number) => {
    const response = await axiosInstance.patch<InventoryItem>(`/pharmacy/inventory/${id}/`, {
      stock,
    });
    return response.data;
  },

  // Force database level auto-decrements on signing/sealing EMR charts
  decrementStockForPrescriptions: async (prescriptionIds: string[]) => {
    const response = await axiosInstance.post<{ message: string }>(
      "/pharmacy/inventory/decrement/",
      { prescription_ids: prescriptionIds }
    );
    return response.data;
  },
};
