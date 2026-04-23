import apiClient from './axiosConfig';

export interface Medicine {
  name: string;
  dosage: string;
  instructions: string;
}

export interface CreatePrescriptionPayload {
  doctorId: string | number;
  patientId: string | number;
  diagnosis?: string;
  medicines: Medicine[] | string;   // array sent; server serialises to JSON string
  appointmentId?: string | number;
}

export interface Doctor {
  id: string;
  fullName?: string;
  username?: string;
  specialization?: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  doctorName?: string;
  patientId: string;
  patientEmail?: string;
  diagnosis?: string;
  medicines: string;          // stored as JSON string in DB – parse on display
  issuedDate?: string;
  appointmentId?: string;
}

/** Parse the medicines JSON string into an array for display. */
export const parseMedicines = (raw?: string): Medicine[] => {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

// ── Doctor creates prescription (JSON body) ───────────────────────────────
export const createPrescription = (data: CreatePrescriptionPayload) => {
  const payload = {
    ...data,
    medicines: Array.isArray(data.medicines)
      ? JSON.stringify(data.medicines)
      : data.medicines,
  };
  return apiClient.post<Prescription>('/api/prescriptions/create', payload);
};

// ── Doctor uploads prescription as file ───────────────────────────────────
export const uploadPrescription = (formData: FormData) =>
  apiClient.post<Prescription>('/api/prescriptions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ── Patient fetches their prescriptions by numeric ID (KEY FIX) ───────────
export const getPatientPrescriptions = (patientId: string | number) =>
  apiClient.get<Prescription[]>(`/api/prescriptions/patient/${patientId}`);

// ── Doctor fetches prescriptions they issued ──────────────────────────────
export const getDoctorPrescriptions = (doctorId: string | number) =>
  apiClient.get<Prescription[]>(`/api/prescriptions/doctor/${doctorId}`);
