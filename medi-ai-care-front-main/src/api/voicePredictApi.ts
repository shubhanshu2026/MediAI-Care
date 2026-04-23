import apiClient from './axiosConfig';

/**
 * PUT THIS FILE IN:
 *   src/api/voicePredictApi.ts
 */

export interface VoicePrediction {
  disease: string;
  confidence: string;
  reason: string;
}

export interface VoicePredictResponse {
  symptoms: string[];
  predictions: VoicePrediction[];
  error?: string;
}

export const voicePredict = (text: string) =>
  apiClient.post<VoicePredictResponse>('/api/voice-predict', { text });