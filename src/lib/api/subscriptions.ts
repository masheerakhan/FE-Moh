import { axiosInstance } from "./axiosInstance";

export interface SaaSPlan {
  id: string;
  name: string; // starter, growth, enterprise
  max_clinics: number;
  max_doctors: number;
  price_mrr: number;
  features_gated: string[];
}

export interface SubscriptionStatus {
  id?: string;
  organization: string;
  active_plan: SaaSPlan;
  status: "ACTIVE" | "PAST_DUE" | "CANCELED";
  mrr: number;
  billing_cycle_start: string;
  billing_cycle_end: string;
  failed_renewals_count: number;
}

export const subscriptionApi = {
  // Fetch active plans list
  getPlans: async () => {
    const response = await axiosInstance.get<SaaSPlan[]>("/subscriptions/plans/");
    return response.data;
  },

  // Create/Update SaaS Plan configurations
  createPlan: async (data: SaaSPlan) => {
    const response = await axiosInstance.post<SaaSPlan>("/subscriptions/plans/", data);
    return response.data;
  },

  // Fetch active SaaS subscription status for current organization
  getSubscriptionStatus: async () => {
    const response = await axiosInstance.get<SubscriptionStatus>("/subscriptions/status/");
    return response.data;
  },
};
