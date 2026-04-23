import apiClient from './axiosConfig';

export interface Report {
  id: string;
  name: string;
  date: string;
  type: string;
  size: string;
}

export const uploadReport = (formData: FormData) =>
  apiClient.post<Report>('/api/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const downloadReport = (reportId: string) =>
  apiClient.get(`/api/reports/download/${reportId}`, { responseType: 'blob' });

export const getPatientReports = (patientId: string) =>
  apiClient.get<Report[]>(`/api/reports/patient/${patientId}`);
