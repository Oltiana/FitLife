import { BASE_URL } from "../constants/apiConfig";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface ApiResponse {
  [key: string]: any;
  message?: string;
}

async function request(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();

  let data: ApiResponse = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed (${response.status})`
    );
  }

  return data;
}

export const api = {

  
  getTasks: async (): Promise<ApiResponse> => {
    return await request("/yoga/tasks");
  },

  
  getWorkoutSteps: async (
    taskId: string | number
  ): Promise<ApiResponse> => {
    return await request(`/yoga/steps/${taskId}`);
  },

  
  getSessions: async (): Promise<ApiResponse> => {
    return await request("/yoga/sessions");
  },

  
  getUpcomingClasses: async (): Promise<ApiResponse> => {
    return await request("/yoga/upcoming");
  },

  
  bookSession: async (
    sessionId: string | number,
    userName: string
  ): Promise<ApiResponse> => {
    return await request("/yoga/book", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        userName,
      }),
    });
  },
};