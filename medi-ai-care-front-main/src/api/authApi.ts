import apiClient from './axiosConfig';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface OtpVerifyPayload {
  email: string;
  otp: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  username: string;
  role: string;
}

// Matches Spring Boot JwtResponse.java: token, id, fullName, email, role
export interface AuthResponse {
  token: string;
  id: number;
  doctorId?: number;
  fullName: string;
  email: string;
  role: string;
}

// Step 1 — validates credentials and triggers OTP email
// Backend returns: { message: "OTP sent to <email>" }
export const loginUser = (data: LoginPayload) =>
  apiClient.post<{ message: string }>('/api/auth/login', data);

// Step 2 — verifies OTP and returns JWT + user info
export const verifyOtp = (data: OtpVerifyPayload) =>
  apiClient.post<AuthResponse>('/api/auth/verify-otp', data);

export const registerUser = (data: RegisterPayload) =>
  apiClient.post<string>('/api/auth/signup', data);