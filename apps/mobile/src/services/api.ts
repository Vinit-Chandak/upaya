import Constants from 'expo-constants';
import type {
  ChatSession,
  ChatMessage,
  Kundli,
  ProblemType,
} from '@upaya/shared';

const API_BASE =
  Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

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

// ---- Chat ----

export async function createChatSession(
  problemType: ProblemType,
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
    timeout: 60000, // LLM calls can be slow
  });
}

export async function getChatMessages(
  sessionId: string,
): Promise<{ messages: ChatMessage[] }> {
  return request(`/api/chat/sessions/${sessionId}/messages`);
}

// ---- Kundli ----

export async function generateKundli(input: {
  dateOfBirth: string;
  timeOfBirth?: string;
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

export async function getKundli(
  id: string,
): Promise<{ kundli: Kundli }> {
  return request(`/api/kundli/${id}`);
}

// ---- Diagnosis ----

interface DiagnosisResponse {
  diagnosis: {
    id: string;
    kundli_id: string;
    chat_session_id: string;
    problem_type: string;
    root_dosha: string;
    severity: string;
    impacted_areas: Record<string, unknown>;
    dasha_analysis: unknown;
    free_remedies: unknown[];
    full_remedies: unknown[];
    result: Record<string, unknown>;
    llm_provider: string;
    created_at: string;
  };
}

export async function generateDiagnosis(input: {
  kundliId: string;
  chatSessionId?: string;
  problemType: string;
  emotionalContext: string;
  qualifyingAnswer: string;
  language: 'hi' | 'en';
}): Promise<DiagnosisResponse> {
  return request('/api/diagnosis/generate', {
    method: 'POST',
    body: JSON.stringify(input),
    timeout: 90000, // LLM diagnosis can be slow
  });
}

export async function getDiagnosis(
  id: string,
): Promise<DiagnosisResponse> {
  return request(`/api/diagnosis/${id}`);
}

export { ApiError };
