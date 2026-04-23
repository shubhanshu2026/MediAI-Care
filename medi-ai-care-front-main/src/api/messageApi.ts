import apiClient from './axiosConfig';

export interface Message {
  id?: number;
  senderId: number;
  receiverId: number;
  message: string;
  timestamp?: string;
}

export interface Contact {
  id: number;
  name: string;
  role: string;
}

export interface SendMessagePayload {
  senderId: number;
  receiverId: number;
  message: string;
}

/** POST /api/messages/send */
export const sendMessage = (data: SendMessagePayload) =>
  apiClient.post<Message>('/api/messages/send', data);

/** GET /api/messages/{user1}/{user2} */
export const getConversation = (user1: number, user2: number) =>
  apiClient.get<Message[]>(`/api/messages/${user1}/${user2}`);

/**
 * GET /api/messages/contacts/doctor/{doctorId}
 * FIX: Returns patients who have an APPROVED appointment with this doctor.
 *      Uses the new doctor_patient_relations table — no longer relies on
 *      appointment.patientId being 0.
 */
export const getDoctorContacts = (doctorId: number) =>
  apiClient.get<Contact[]>(`/api/messages/contacts/doctor/${doctorId}`);

/**
 * GET /api/messages/contacts/patient/{patientId}
 * FIX: Returns doctors who have APPROVED an appointment for this patient.
 */
export const getPatientContacts = (patientId: number) =>
  apiClient.get<Contact[]>(`/api/messages/contacts/patient/${patientId}`);
