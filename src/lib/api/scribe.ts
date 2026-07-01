import { axiosInstance } from "./axiosInstance";

export interface ScribeSession {
  session_id: string;
  status: "listening" | "stopped" | "processing";
  language: string;
}

export interface SOAPNoteDraft {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface DrugSafetyCheckResult {
  has_warning: boolean;
  warnings: string[];
}

export const scribeApi = {
  // Start ambient voice scribe session via Sarvam AI
  startSession: async (language: string) => {
    const response = await axiosInstance.post<ScribeSession>("/scribe/sessions/start/", {
      language,
    });
    return response.data;
  },

  // Stop session and retrieve transcription
  stopSession: async (sessionId: string) => {
    const response = await axiosInstance.post<{ transcription: string }>(
      `/scribe/sessions/${sessionId}/stop/`
    );
    return response.data;
  },

  // Synthesize transcript into SOAP note using Claude
  synthesizeSoapNote: async (transcription: string) => {
    const response = await axiosInstance.post<SOAPNoteDraft>("/scribe/soap/synthesize/", {
      transcription,
    });
    return response.data;
  },

  // Trigger safety interaction checks (allergy/drug-drug matrix overrides)
  checkDrugSafety: async (drugs: string[], patientId: string) => {
    const response = await axiosInstance.post<DrugSafetyCheckResult>("/scribe/safety/check/", {
      drugs,
      patient_id: patientId,
    });
    return response.data;
  },
};
