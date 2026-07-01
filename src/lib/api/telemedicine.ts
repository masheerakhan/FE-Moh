import { axiosInstance } from "./axiosInstance";

export interface TeleWaitingPatient {
  id: string;
  patient_id: string;
  patient_name: string;
  duration_minutes: number;
}

export interface WebRtcTokenResult {
  token: string;
  channel: string;
  app_id: string;
}

export const telemedicineApi = {
  // Fetch patients actively queuing in the WebRTC virtual waiting room
  getWaitingRoom: async () => {
    const response = await axiosInstance.get<TeleWaitingPatient[]>("/telemedicine/waiting-room/");
    return response.data;
  },

  // Admit a waiting patient and initialize signaling context
  admitPatient: async (patientId: string) => {
    const response = await axiosInstance.post<{ status: string }>(
      `/telemedicine/waiting-room/admit/`,
      { patient_id: patientId }
    );
    return response.data;
  },

  // Request Agora / Twilio WebRTC token from signaling node
  getWebrtcToken: async (channelName: string, role: "publisher" | "subscriber") => {
    const response = await axiosInstance.post<WebRtcTokenResult>(
      "/telemedicine/webrtc/token/",
      {
        channel_name: channelName,
        role,
      }
    );
    return response.data;
  },

  // Trigger encrypted cloud media archiving on signaling node
  startRecording: async (channelName: string) => {
    const response = await axiosInstance.post<{ recording_id: string }>(
      "/telemedicine/webrtc/record/start/",
      { channel_name: channelName }
    );
    return response.data;
  },

  // Stop recording and lock media session path
  stopRecording: async (recordingId: string) => {
    const response = await axiosInstance.post<{ message: string }>(
      `/telemedicine/webrtc/record/stop/`,
      { recording_id: recordingId }
    );
    return response.data;
  },
};
