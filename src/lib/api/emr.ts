import { axiosInstance } from "./axiosInstance";

export interface EMRCondition {
  id?: string;
  patient: string;
  code: string;
  name: string;
  status: "ACTIVE" | "RESOLVED" | "SUSPENDED";
  onset_date?: string;
}

export interface EMREncounter {
  id?: string;
  patient: string;
  doctor: string;
  encounter_date: string;
  type: string;
  notes?: string;
}

export interface SOAPNote {
  id?: string;
  encounter: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  created_at?: string;
}

export interface PrescriptionItem {
  id?: string;
  encounter: string;
  drug_name: string;
  dosage: string;
  duration_days: number;
  instructions?: string;
  warnings?: string;
}

export const emrApi = {
  // Encounters
  getEncounters: async (patientId: string) => {
    const response = await axiosInstance.get<EMREncounter[]>("/emr/encounters/", {
      params: { patient_id: patientId },
    });
    return response.data;
  },

  createEncounter: async (data: EMREncounter) => {
    const response = await axiosInstance.post<EMREncounter>("/emr/encounters/", data);
    return response.data;
  },

  // SOAP Notes
  getSoapNotes: async (encounterId: string) => {
    const response = await axiosInstance.get<SOAPNote[]>(
      `/emr/encounters/${encounterId}/soap/`
    );
    return response.data;
  },

  saveSoapNote: async (encounterId: string, data: Omit<SOAPNote, "encounter">) => {
    const response = await axiosInstance.post<SOAPNote>(
      `/emr/encounters/${encounterId}/soap/`,
      data
    );
    return response.data;
  },

  // Conditions
  getConditions: async (patientId: string) => {
    const response = await axiosInstance.get<EMRCondition[]>("/emr/conditions/", {
      params: { patient_id: patientId },
    });
    return response.data;
  },

  createCondition: async (data: EMRCondition) => {
    const response = await axiosInstance.post<EMRCondition>("/emr/conditions/", data);
    return response.data;
  },

  // Prescriptions
  getPrescriptions: async (encounterId: string) => {
    const response = await axiosInstance.get<PrescriptionItem[]>("/emr/prescriptions/", {
      params: { encounter_id: encounterId },
    });
    return response.data;
  },

  addPrescription: async (data: PrescriptionItem) => {
    const response = await axiosInstance.post<PrescriptionItem>("/emr/prescriptions/", data);
    return response.data;
  },
};
