import { axiosInstance } from "./axiosInstance";

export interface PhysicianSchedule {
  id?: string;
  doctor: string;
  doctor_name?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
}

export interface AppointmentSlot {
  id?: string;
  schedule?: string;
  doctor: string;
  doctor_name?: string;
  patient?: string;
  patient_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "AVAILABLE" | "BOOKED" | "CANCELLED" | "BLOCKED";
}

export interface ClinicQueueItem {
  id: string;
  appointment_slot?: string;
  patient_id: string;
  patient: string;
  doctor_id: string;
  doctor: string;
  token: string;
  sequence: number;
  status: "WAITING" | "VITALS" | "IN_ROOM" | "COMPLETED" | "NOSHOW";
  check_in_time: string;
  estimated_wait_time: number;
  wait: string;
}

export const schedulingApi = {
  // Schedules
  getSchedules: async () => {
    const response = await axiosInstance.get<PhysicianSchedule[]>("/scheduling/schedules/");
    return response.data;
  },

  createSchedule: async (data: PhysicianSchedule) => {
    const response = await axiosInstance.post<PhysicianSchedule>("/scheduling/schedules/", data);
    return response.data;
  },

  // Slots
  getSlots: async (params?: { doctor_id?: string; date?: string; status?: string }) => {
    const response = await axiosInstance.get<AppointmentSlot[]>("/scheduling/slots/", { params });
    return response.data;
  },

  bookSlot: async (slotId: string, patientId: string) => {
    const response = await axiosInstance.post<AppointmentSlot>(
      `/scheduling/slots/${slotId}/book/`,
      { patient_id: patientId }
    );
    return response.data;
  },

  // Queue
  getQueue: async () => {
    const response = await axiosInstance.get<ClinicQueueItem[]>("/scheduling/queue/");
    return response.data;
  },

  issueToken: async (patientId: string, doctorId: string) => {
    const response = await axiosInstance.post<ClinicQueueItem>("/scheduling/queue/", {
      patient_id: patientId,
      doctor_id: doctorId,
    });
    return response.data;
  },

  updateQueueItem: async (id: string, data: Partial<ClinicQueueItem>) => {
    const response = await axiosInstance.patch<ClinicQueueItem>(`/scheduling/queue/${id}/`, data);
    return response.data;
  },

  deleteQueueItem: async (id: string) => {
    const response = await axiosInstance.delete(`/scheduling/queue/${id}/`);
    return response.data;
  },

  reorderQueue: async (orderedIds: string[]) => {
    const response = await axiosInstance.post<{ message: string }>("/scheduling/queue/reorder/", {
      ordered_ids: orderedIds,
    });
    return response.data;
  },
};
