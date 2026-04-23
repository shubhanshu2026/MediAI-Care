import apiClient from './axiosConfig';

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization?: string;
  patientId?: number;          // FIX: added — was missing, needed for chat + prescriptions
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  appointmentDate: string;
  timeSlot: string;
  amount?: number;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
}

export interface BookAppointmentPayload {
  doctorId: number | string;
  doctorName: string;
  doctorSpecialization?: string;
  patientId: number;           // FIX: required — sends logged-in user's numeric ID
  patientName?: string;
  patientEmail: string;
  patientPhone?: string;
  appointmentDate: string;     // "YYYY-MM-DD"
  timeSlot: string;
  amount?: number;
  paymentMethod?: string;
}

// ── Patient ────────────────────────────────────────────────────────────────
export const bookAppointment = (data: BookAppointmentPayload) =>
  apiClient.post<Appointment>('/api/appointments/book', data);

export const getPatientAppointments = (email: string) =>
  apiClient.get<Appointment[]>(`/api/appointments/patient?email=${encodeURIComponent(email)}`);

// ── Doctor ─────────────────────────────────────────────────────────────────
export const getDoctorAppointments = (doctorId: string | number) =>
  apiClient.get<Appointment[]>(`/api/appointments/doctor/${doctorId}`);

/** Doctor approves or rejects an appointment.
 *  status: 'APPROVED' | 'REJECTED' | 'COMPLETED'
 */
export const updateAppointmentStatus = (id: string | number, status: string) =>
  apiClient.put<Appointment>(`/api/appointments/${id}/status`, { status });

export const getAppointment = (id: string | number) =>
  apiClient.get<Appointment>(`/api/appointments/${id}`);
