import axios from 'axios';

// 1. ADD THIS INTERFACE (The missing piece)
export interface DiagnosisResult {
  possibleDisease: string;
  description: string;
  recommendedSpecialist: string;
  severity: string;
  precautions: string[]; // Must be string array
  medications: string;
  diet: string;
  workout: string;
  error?: string; 
}

const API = axios.create({
  baseURL: 'http://localhost:8080/api/ai'
});

// 2. Ensure your function is exported correctly
export const diagnoseSymptoms = (symptoms: string) => {
  return API.post<DiagnosisResult>('/diagnose', { symptoms });
};