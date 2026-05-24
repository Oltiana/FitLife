import { ReactNode } from 'react';
import { BASE_URL } from '../constants/apiConfig';
import { tokenStorage } from '../storage/tokenStorage';

export type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
  workoutPlans: number;
  workoutSessions: number;
  favoriteExercises: number;
}; 

type AdminStats = {
  totalUsers: number;
  totalPilatesPrograms: number;
  totalYogaClasses: number;
  totalFitnessExercises: number;
};
async function authHeaders() {
  const token = await tokenStorage.getToken();
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}


export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${BASE_URL}/Admin/stats`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${BASE_URL}/Admin/users`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function getAdminUser(id: number): Promise<AdminUser> {
  const res = await fetch(`${BASE_URL}/Admin/users/${id}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}
export async function updateUserRole(id: number, role: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/Admin/users/${id}/role`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error('Failed to update role');
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/Admin/users/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete user');
}
export type PilatesEnrollment = {
  id: number;
  programName: string;
  enrolledAt: string;
};

export type PilatesProgress = {
  durationMinutes: ReactNode;
  id: number;
  programName: string;
  workoutName: string;
  isCompleted: boolean;
  completedAt: string | null;
};

export type Booking = {
  id: number;
  bookingDate: string;
  sessionId: number;
};

export type AdminUserDetails = AdminUser & {
  pilatesEnrollments: PilatesEnrollment[];
  pilatesProgress: PilatesProgress[];
  bookings: Booking[];
};

export async function getAdminUserDetails(id: number): Promise<AdminUserDetails> {
  const res = await fetch(`${BASE_URL}/Admin/users/${id}/details`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch user details');
  return res.json();
}