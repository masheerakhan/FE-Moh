import { axiosInstance } from "./axiosInstance";

export interface PatientDocument {
  id?: string;
  patient: string;
  name: string;
  file: string; // URL of the uploaded document (pre-signed secure MinIO link)
  uploaded_at?: string;
}

export const documentApi = {
  // Fetch patient health records list
  getDocuments: async (patientId: string) => {
    const response = await axiosInstance.get<PatientDocument[]>("/patients/documents/", {
      params: { patient_id: patientId },
    });
    return response.data;
  },

  // Upload clinical records/PDFs directly to multi-tenant S3/MinIO
  uploadDocument: async (patientId: string, name: string, file: File) => {
    const formData = new FormData();
    formData.append("patient", patientId);
    formData.append("name", name);
    formData.append("file", file);

    const response = await axiosInstance.post<PatientDocument>(
      "/patients/documents/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Remove a health record from storage bucket and database registry
  deleteDocument: async (id: string) => {
    const response = await axiosInstance.delete(`/patients/documents/${id}/`);
    return response.data;
  },
};
