export interface AuthResponse {
  token: string;
  refreshToken: string;
  fullName: string;
  email: string;
  isVerified: boolean;
}

export interface AuthUser {
  fullName: string;
  email: string;
  isVerified: boolean;
}