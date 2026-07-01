import { axiosInstance } from "./axiosInstance";

export interface AnalyticsMetrics {
  active_patients: string;
  tele_share: string;
  nps: string;
  readmit_rate: string;
}

export interface VisitTrendItem {
  day: string;
  visits: number;
}

export interface CohortItem {
  week: string;
  retained: number;
}

export interface DiagnosisTrendItem {
  d: string;
  n: number;
}

export const analyticsApi = {
  // Aggregate multi-clinic metrics (active patients, NPS, outcomes)
  getMetrics: async () => {
    const response = await axiosInstance.get<AnalyticsMetrics>("/analytics/metrics/");
    return response.data;
  },

  // Retrive visits volume trends over time
  getVisitsTrend: async () => {
    const response = await axiosInstance.get<VisitTrendItem[]>("/analytics/visits-trend/");
    return response.data;
  },

  // Retrieve patient cohort retention ratios
  getRetentions: async () => {
    const response = await axiosInstance.get<CohortItem[]>("/analytics/cohorts/");
    return response.data;
  },

  // Retrieve top diagnostic network categories (ICD-10, SNOMED)
  getTopDiagnoses: async () => {
    const response = await axiosInstance.get<DiagnosisTrendItem[]>("/analytics/diagnoses/");
    return response.data;
  },
};
