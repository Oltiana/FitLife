import { API_BASE_URL } from '../constants/apiConfig';
import { tokenStorage } from '../storage/tokenStorage';

export type AdminYogaClass = {
  id: number;
  title: string;
  level: string;
  durationMin: number;
  imageUrl: string;
};

export type AdminYogaStep = {
  id: number;
  yogaClassId: number;
  title: string;
  durationSec: number;
  imageUrl: string;
  stepOrder: number;
};

export type AdminSession = {
  id: number;
  startTime: string;
  capacity: number;
  instructorName: string;
  yogaClassId: number;
  sessionDate: string;
};

export type AdminUpcomingClass = {
  id: number;
  title: string;
  instructorName: string;
  level: string;
  imageUrl: string;
  startDate: string;
  startTime: string;
  yogaClassId: number;
};

export type AdminBooking = {
  id: number;
  sessionId: number;
  userName: string;
  bookingDate: string;
};

export type CreateYogaClassPayload = {
  title: string;
  level: string;
  durationMin: number;
  imageUrl: string;
};

export type UpdateYogaClassPayload =
  CreateYogaClassPayload;

export type CreateYogaStepPayload = {
  yogaClassId: number;
  title: string;
  durationSec: number;
  imageUrl: string;
  stepOrder: number;
};

export type UpdateYogaStepPayload = {
  title: string;
  durationSec: number;
  imageUrl: string;
  stepOrder: number;
};

export type CreateSessionPayload = {
  yogaClassId: number;
  startTime: string;
  capacity: number;
  instructorName: string;
  sessionDate: string;
};

export type UpdateSessionPayload = {
  startTime: string;
  capacity: number;
  instructorName: string;
  sessionDate: string;
};

export type CreateUpcomingPayload = {
  title: string;
  instructorName: string;
  level: string;
  imageUrl: string;
  startDate: string;
  startTime: string;
  yogaClassId: number;
};

export type UpdateUpcomingPayload =
  CreateUpcomingPayload;


const YOGA_URL = `${API_BASE_URL}/yoga`;

async function authHeaders(): Promise<
  Record<string, string>
> {
  const raw = await tokenStorage.getToken();

  const token =
    raw?.trim().replace(/^bearer\s+/i, '') ?? '';

  if (!token) {
    throw new Error(
      'Sign in required. Log in as Admin and try again.',
    );
  }

  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

async function parseError(
  res: Response,
  fallback: string,
): Promise<never> {
  const text = await res.text();

  throw new Error(text || fallback);
}

export async function fetchYogaClasses(): Promise<
  AdminYogaClass[]
> {
  const res = await fetch(
    `${YOGA_URL}/tasks`,
    {
      headers: await authHeaders(),
    },
  );

  if (!res.ok) {
    await parseError(
      res,
      'Failed to load yoga classes',
    );
  }

  const data = await res.json();

  return Array.isArray(data)
    ? data
    : data.tasks ?? [];
}

export async function createYogaClass(
  payload: CreateYogaClassPayload,
): Promise<AdminYogaClass> {
  const res = await fetch(
    `${YOGA_URL}/tasks`,
    {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    await parseError(
      res,
      'Failed to create yoga class',
    );
  }

  return res.json();
}

export async function updateYogaClass(
  id: number,
  payload: UpdateYogaClassPayload,
): Promise<AdminYogaClass> {
  const res = await fetch(
    `${YOGA_URL}/tasks/${id}`,
    {
      method: 'PUT',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    await parseError(
      res,
      'Failed to update yoga class',
    );
  }

  return res.json();
}

export async function deleteYogaClass(
  id: number,
): Promise<void> {
  const res = await fetch(
    `${YOGA_URL}/tasks/${id}`,
    {
      method: 'DELETE',
      headers: await authHeaders(),
    },
  );

  if (!res.ok && res.status !== 204) {
    await parseError(
      res,
      'Failed to delete yoga class',
    );
  }
}


export async function fetchYogaSteps(
  yogaClassId: number,
): Promise<AdminYogaStep[]> {
  const res = await fetch(
    `${YOGA_URL}/steps/${yogaClassId}`,
    {
      headers: await authHeaders(),
    },
  );

  if (!res.ok) {
    await parseError(
      res,
      'Failed to load yoga steps',
    );
  }

  const data = await res.json();

  return Array.isArray(data)
    ? data
    : data.steps ?? [];
}

export async function createYogaStep(
  payload: CreateYogaStepPayload,
): Promise<AdminYogaStep> {
  const res = await fetch(
    `${YOGA_URL}/steps`,
    {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    await parseError(
      res,
      'Failed to create yoga step',
    );
  }

  return res.json();
}

export async function updateYogaStep(
  id: number,
  payload: UpdateYogaStepPayload,
): Promise<AdminYogaStep> {
  const res = await fetch(
    `${YOGA_URL}/steps/${id}`,
    {
      method: 'PUT',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    await parseError(
      res,
      'Failed to update yoga step',
    );
  }

  return res.json();
}

export async function deleteYogaStep(
  id: number,
): Promise<void> {
  const res = await fetch(
    `${YOGA_URL}/steps/${id}`,
    {
      method: 'DELETE',
      headers: await authHeaders(),
    },
  );

  if (!res.ok && res.status !== 204) {
    await parseError(
      res,
      'Failed to delete yoga step',
    );
  }
}

export async function fetchSessions(): Promise<
  AdminSession[]
> {
  const res = await fetch(
    `${YOGA_URL}/sessions`,
    {
      headers: await authHeaders(),
    },
  );

  if (!res.ok) {
    await parseError(
      res,
      'Failed to load sessions',
    );
  }

  const data = await res.json();

  return Array.isArray(data)
    ? data
    : data.sessions ?? [];
}

export async function createSession(
  payload: CreateSessionPayload,
): Promise<AdminSession> {
  const res = await fetch(
    `${YOGA_URL}/sessions`,
    {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    await parseError(
      res,
      'Failed to create session',
    );
  }

  return res.json();
}

export async function updateSession(
  id: number,
  payload: UpdateSessionPayload,
): Promise<AdminSession> {
  const res = await fetch(
    `${YOGA_URL}/sessions/${id}`,
    {
      method: 'PUT',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    await parseError(
      res,
      'Failed to update session',
    );
  }

  return res.json();
}

export async function deleteSession(
  id: number,
): Promise<void> {
  const res = await fetch(
    `${YOGA_URL}/sessions/${id}`,
    {
      method: 'DELETE',
      headers: await authHeaders(),
    },
  );

  if (!res.ok && res.status !== 204) {
    await parseError(
      res,
      'Failed to delete session',
    );
  }
}

export async function fetchUpcomingClasses(): Promise<
  AdminUpcomingClass[]
> {
  const res = await fetch(
    `${YOGA_URL}/upcoming`,
    {
      headers: await authHeaders(),
    },
  );

  if (!res.ok) {
    await parseError(
      res,
      'Failed to load upcoming classes',
    );
  }

  const data = await res.json();

  return Array.isArray(data)
    ? data
    : data.upcoming ?? [];
}

export async function createUpcomingClass(
  payload: CreateUpcomingPayload,
): Promise<AdminUpcomingClass> {
  const res = await fetch(
    `${YOGA_URL}/upcoming`,
    {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    await parseError(
      res,
      'Failed to create upcoming class',
    );
  }

  return res.json();
}

export async function updateUpcomingClass(
  id: number,
  payload: UpdateUpcomingPayload,
): Promise<AdminUpcomingClass> {
  const res = await fetch(
    `${YOGA_URL}/upcoming/${id}`,
    {
      method: 'PUT',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    await parseError(
      res,
      'Failed to update upcoming class',
    );
  }

  return res.json();
}

export async function deleteUpcomingClass(
  id: number,
): Promise<void> {
  const res = await fetch(
    `${YOGA_URL}/upcoming/${id}`,
    {
      method: 'DELETE',
      headers: await authHeaders(),
    },
  );

  if (!res.ok && res.status !== 204) {
    await parseError(
      res,
      'Failed to delete upcoming class',
    );
  }
}

export async function fetchBookings(): Promise<
  AdminBooking[]
> {
  const res = await fetch(
    `${YOGA_URL}/bookings`,
    {
      headers: await authHeaders(),
    },
  );

  if (!res.ok) {
    await parseError(
      res,
      'Failed to load bookings',
    );
  }

  const data = await res.json();

  return Array.isArray(data)
    ? data
    : data.bookings ?? [];
}

export async function deleteBooking(
  id: number,
): Promise<void> {
  const res = await fetch(
    `${YOGA_URL}/bookings/${id}`,
    {
      method: 'DELETE',
      headers: await authHeaders(),
    },
  );

  if (!res.ok && res.status !== 204) {
    await parseError(
      res,
      'Failed to delete booking',
    );
  }
}