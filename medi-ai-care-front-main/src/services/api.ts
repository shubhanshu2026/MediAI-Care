import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mediai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AI Diagnosis
export const diagnoseSymptoms = (symptoms: string) =>
  api.post('/ai/diagnose', { symptoms });

// Doctor Search
export const searchDoctorsBySpecialization = (specialization: string) =>
  api.get(`/doctor/search/specialization`, { params: { specialization } });

export const searchDoctorsByHospital = (hospital: string) =>
  api.get(`/doctor/search/hospital`, { params: { hospital } });

export const searchDoctorsByExperience = (minExp: number) =>
  api.get(`/doctor/search/experience`, { params: { minExp } });

export const searchDoctorsByFee = (maxFee: number) =>
  api.get(`/doctor/search/fee`, { params: { maxFee } });

// Appointments
export const bookAppointment = (data: { doctorId: string; slotId: string; date: string }) =>
  api.post('/appointments/book', data);

export const getPatientAppointments = (patientId: string) =>
  api.get(`/appointments/patient/${patientId}`);

export const getDoctorAppointments = (doctorId: string) =>
  api.get(`/appointments/doctor/${doctorId}`);

// Slots
export const addSlot = (data: { doctorId: string; date: string; time: string }) =>
  api.post('/slots/add', data);

export const getAvailableSlots = (doctorId: string, date: string) =>
  api.get('/slots/available', { params: { doctorId, date } });

export const bookSlot = (slotId: string) =>
  api.post(`/slots/book/${slotId}`);

// Prescriptions
export const createPrescription = (data: {
  patientId: string;
  doctorId: string;
  medicines: { name: string; dosage: string; instructions: string }[];
}) => api.post('/prescriptions/create', data);

export const getPatientPrescriptions = (patientId: string) =>
  api.get(`/prescriptions/patient/${patientId}`);

export const getDoctorPrescriptions = (doctorId: string) =>
  api.get(`/prescriptions/doctor/${doctorId}`);

// Reports
export const uploadReport = (formData: FormData) =>
  api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const downloadReport = (reportId: string) =>
  api.get(`/reports/download/${reportId}`, { responseType: 'blob' });

// Auth
export const login = (data: { email: string; password: string; role: string }) =>
  api.post('/auth/login', data);

export const register = (data: { name: string; email: string; password: string; role: string }) =>
  api.post('/auth/register', data);

export default api;
