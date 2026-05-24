import { BASE_URL } from '../constants/apiConfig';
import { tokenStorage } from '../storage/tokenStorage';

type AdminStats = {
  totalUsers: number;
  totalPilatesPrograms: number;
  totalYogaClasses: number;
  totalFitnessExercises: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const token = await tokenStorage.getToken();
  const res = await fetch(`${BASE_URL}/Admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}