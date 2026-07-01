import { axiosInstance } from "./axiosInstance";

export interface OutboundReferral {
  id?: string;
  patient_id: string;
  patient_name?: string;
  target_provider: string; // Target doctor or clinic network
  target_facility: string; // Target hospital/diagnostic grid name
  reason: string;
  scope: "FULL_RECORD" | "ACTIVE_CASE_ONLY";
  status?: "PENDING" | "ACCEPTED" | "COMPLETED";
  created_at?: string;
}

export const referralApi = {
  // Publish a new outbound clinical handoff to external networks
  createReferral: async (data: OutboundReferral) => {
    const response = await axiosInstance.post<OutboundReferral>("/scheduling/referrals/", data);
    return response.data;
  },

  // Retrieve outbound referrals sent by active physician
  getReferrals: async () => {
    const response = await axiosInstance.get<OutboundReferral[]>("/scheduling/referrals/");
    return response.data;
  },
};
