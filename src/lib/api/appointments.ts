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
    const response = await axiosInstance.get<Appointment[]>("/scheduling/appointments/");
    return response.data;
  },

  // Create new appointment
  createAppointment: async (data: Omit<Appointment, "id">) => {
    const response = await axiosInstance.post<Appointment>("/scheduling/appointments/", data);
    return response.data;
  },

  // Update appointment details
  updateAppointment: async (id: string, data: Partial<Appointment>) => {
    const response = await axiosInstance.patch<Appointment>(
      `/scheduling/appointments/${id}/`,
      data
    );
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id: string) => {
    const response = await axiosInstance.post<{ message: string }>(
      `/scheduling/appointments/${id}/cancel/`
    );
    return response.data;
  },
};
