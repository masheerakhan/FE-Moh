import { axiosInstance } from "./axiosInstance";

export interface Appointment {
  id?: string;
  patient_id: string;
  patient_name?: string;
  doctor_id: string;
  doctor_name?: string;
  date: string;
  time: string;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  type: "Consultation" | "Follow-up" | "Tele-consult";
}

export const appointmentApi = {
  // Fetch appointments list
  getAppointments: async () => {
    const response = await axiosInstance.get<Appointment[]>("/appointments/grid");
    return response.data;
  },

  // Create new appointment
  createAppointment: async (data: Omit<Appointment, "id">) => {
    const response = await axiosInstance.post<Appointment>("/appointments/create", data);
    return response.data;
  },

  // Update appointment details
  updateAppointment: async (id: string, data: Partial<Appointment>) => {
    const response = await axiosInstance.patch<Appointment>(
      `/appointments/${id}/`,
      data
    );
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id: string) => {
    const response = await axiosInstance.post<{ message: string }>(
      `/appointments/${id}/cancel/`
    );
    return response.data;
  },
};
