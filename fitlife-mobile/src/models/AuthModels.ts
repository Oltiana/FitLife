export interface AuthResponse {
  token: string;
  refreshToken: string;
  fullName: string;
  email: string;
  isVerified: boolean;
  role: string;
}

export interface AuthUser {
  fullName: string;
  email: string;
  isVerified: boolean;
  role: string;
}