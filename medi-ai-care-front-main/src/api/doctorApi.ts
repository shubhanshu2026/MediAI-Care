import apiClient from './axiosConfig';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  hospital: string;
  fee: number;
  rating: number;
  avatar?: string;
}

export const searchBySpecialization = (value: string) =>
  apiClient.get<Doctor[]>('/api/doctor/search/specialization', { params: { value } });

export const searchByHospital = (value: string) =>
  apiClient.get<Doctor[]>('/api/doctor/search/hospital', { params: { value } });

export const searchByExperience = (years: number) =>
  apiClient.get<Doctor[]>('/api/doctor/search/experience', { params: { years } });

export const searchByFee = (max: number) =>
  apiClient.get<Doctor[]>('/api/doctor/search/fee', { params: { max } });
