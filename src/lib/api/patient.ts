import { axiosInstance } from "./axiosInstance";

export interface PatientProfile {
  id?: string;
  first_name: string;
  last_name?: string;
  phone: string;
  gender: string;
  date_of_birth?: string;
  abha_number?: string;
  abha_address?: string;
  abha_status?: string;
}

export interface PatientFamilyLink {
  id?: string;
  primary_patient: string;
  member_patient: string;
  relationship: "SPOUSE" | "CHILD" | "PARENT" | "SIBLING" | "OTHER";
}

export const patientApi = {
  getAll: async () => {
    const response = await axiosInstance.get<PatientProfile[]>("/patients/");
    return response.data;
  },

  create: async (data: PatientProfile) => {
    const response = await axiosInstance.post<PatientProfile>("/patients/", data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<PatientProfile>(`/patients/${id}/`);
    return response.data;
  },

  update: async (id: string, data: Partial<PatientProfile>) => {
    const response = await axiosInstance.put<PatientProfile>(`/patients/${id}/`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await axiosInstance.delete(`/patients/${id}/`);
    return response.data;
  },

  // ABHA handshake
  generateOtp: async (aadhaarOrMobile: string) => {
    const response = await axiosInstance.post<{ message: string; txn_id: string }>(
      "/patients/abha/generate-otp/",
      { aadhaar_or_mobile: aadhaarOrMobile }
    );
    return response.data;
  },

  verifyOtp: async (txnId: string, otp: string) => {
    const response = await axiosInstance.post<{
      message: string;
      demographics: {
        first_name: string;
        last_name: string;
        gender: string;
        date_of_birth: string;
        phone: string;
        abha_number: string;
        abha_address: string;
        abha_status: string;
      };
    }>("/patients/abha/verify-otp/", { txn_id: txnId, otp });
    return response.data;
  },

  // Family linkages
  getFamilyLinks: async () => {
    const response = await axiosInstance.get<PatientFamilyLink[]>("/patients/family-links/");
    return response.data;
  },

  createFamilyLink: async (data: PatientFamilyLink) => {
    const response = await axiosInstance.post<PatientFamilyLink>("/patients/family-links/", data);
    return response.data;
  },
};
