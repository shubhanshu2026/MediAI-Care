import apiClient from './axiosConfig';

export interface Slot {
  id: string;
  time: string;
  available: boolean;
}

export interface AddSlotPayload {
  doctorId: string;
  date: string;
  time: string;
}

export const addSlot = (data: AddSlotPayload) =>
  apiClient.post('/api/slots/add', data);

export const getAvailableSlots = (doctorId: string, date: string) =>
  apiClient.get<Slot[]>('/api/slots/available', { params: { doctorId, date } });

export const bookSlot = (slotId: string) =>
  apiClient.post(`/api/slots/book/${slotId}`);
