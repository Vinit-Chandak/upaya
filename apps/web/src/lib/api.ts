import type { ChatSession, ChatMessage, Kundli, KundliProfile, Relationship } from '@upaya/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, message: string, code: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit & { timeout?: number },
): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options || {};

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        body.message || `Request failed: ${response.status}`,
        body.code || 'UNKNOWN_ERROR',
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function createChatSession(
  problemType: string,
  language: 'hi' | 'en',
  seedMessage?: string,
): Promise<{ session: ChatSession }> {
  return request('/api/chat/sessions', {
    method: 'POST',
    body: JSON.stringify({ problemType, language, seedMessage }),
  });
}

export async function sendChatMessage(
  sessionId: string,
  content: string,
): Promise<{
  userMessage: { content: string; role: string };
  aiMessage: ChatMessage;
}> {
  return request(`/api/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
    timeout: 60000,
  });
}

// ---- Kundli ----

export async function generateKundli(input: {
  dateOfBirth: string;
  timeOfBirth?: string | null;
  timeApproximate?: boolean;
  placeOfBirthName: string;
  placeOfBirthLat: number;
  placeOfBirthLng: number;
}): Promise<{ kundli: Kundli; cached: boolean }> {
  return request('/api/kundli/generate', {
    method: 'POST',
    body: JSON.stringify(input),
    timeout: 30000,
  });
}

// ---- Kundli Profiles ----

export async function createKundliProfile(input: {
  personName: string;
  relationship: Relationship;
  dateOfBirth: string;
  timeOfBirth?: string | null;
  timeApproximate?: boolean;
  placeOfBirthName: string;
  placeOfBirthLat: number;
  placeOfBirthLng: number;
  firebaseIdToken?: string;
}): Promise<{ profile: KundliProfile }> {
  const { firebaseIdToken, ...body } = input;
  return request('/api/kundli/profiles', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: firebaseIdToken ? { Authorization: `Bearer ${firebaseIdToken}` } : undefined,
  });
}

export async function getKundliProfiles(
  firebaseIdToken: string,
): Promise<{ profiles: KundliProfile[] }> {
  return request('/api/kundli/profiles', {
    headers: { Authorization: `Bearer ${firebaseIdToken}` },
  });
}

// ---- Auth ----

export async function migrateAnonymousData(input: {
  firebaseIdToken: string;
  sessionIds?: string[];
  profileIds?: string[];
}): Promise<{ migrated: { sessions: number; kundlis: number; profiles: number } }> {
  const { firebaseIdToken, ...body } = input;
  return request('/api/auth/migrate-session', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${firebaseIdToken}` },
  });
}

export { ApiError };
