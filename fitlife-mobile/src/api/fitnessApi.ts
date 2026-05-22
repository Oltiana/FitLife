import { API_BASE_URL } from '../constants/apiConfig';

const BASE_URL = API_BASE_URL;

export async function getExercises(offset = 0, limit = 10) {
  const response = await fetch(
    `${BASE_URL}/Fitness/exercises?offset=${offset}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch exercises');
  }

  return response.json();
}