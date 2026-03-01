/**
 * Local storage utilities for kundli profiles and anonymous session tracking.
 *
 * Web uses localStorage (browser).
 *
 * Storage keys:
 *   upaya_profiles_v1        — LocalKundliProfile[] (profile picker cache)
 *   upaya_anon_session_ids   — string[] (chat session_id strings for claim)
 *   upaya_anon_profile_ids   — string[] (server profile UUIDs for claim)
 */

import type { LocalKundliProfile } from '@upaya/shared';

const PROFILES_KEY = 'upaya_profiles_v1';
const ANON_SESSION_IDS_KEY = 'upaya_anon_session_ids';
const ANON_PROFILE_IDS_KEY = 'upaya_anon_profile_ids';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Non-fatal — localStorage full or unavailable (SSR)
  }
}

// ── Profile CRUD ─────────────────────────────────────────────────────────────

export function getLocalProfiles(): LocalKundliProfile[] {
  const result = safeGet<LocalKundliProfile[]>(PROFILES_KEY, []);
  return Array.isArray(result) ? result : [];
}

export function saveLocalProfile(profile: LocalKundliProfile): void {
  const existing = getLocalProfiles();
  const idx = existing.findIndex((p) => p.localId === profile.localId);
  if (idx >= 0) {
    existing[idx] = profile;
  } else {
    existing.unshift(profile); // newest first
  }
  safeSet(PROFILES_KEY, existing);
}

export function markProfileSynced(localId: string, serverId: string): void {
  const existing = getLocalProfiles();
  const idx = existing.findIndex((p) => p.localId === localId);
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], serverId };
    safeSet(PROFILES_KEY, existing);
  }
}

export function setLocalProfiles(profiles: LocalKundliProfile[]): void {
  safeSet(PROFILES_KEY, profiles);
}

// ── Anonymous session tracking ────────────────────────────────────────────────

export function getAnonSessionIds(): string[] {
  const result = safeGet<string[]>(ANON_SESSION_IDS_KEY, []);
  return Array.isArray(result) ? result : [];
}

export function saveAnonSessionId(sessionId: string): void {
  const existing = getAnonSessionIds();
  if (!existing.includes(sessionId)) {
    existing.push(sessionId);
    safeSet(ANON_SESSION_IDS_KEY, existing);
  }
}

// ── Anonymous profile ID tracking ────────────────────────────────────────────

export function getAnonProfileIds(): string[] {
  const result = safeGet<string[]>(ANON_PROFILE_IDS_KEY, []);
  return Array.isArray(result) ? result : [];
}

export function saveAnonProfileId(profileId: string): void {
  const existing = getAnonProfileIds();
  if (!existing.includes(profileId)) {
    existing.push(profileId);
    safeSet(ANON_PROFILE_IDS_KEY, existing);
  }
}

// ── Cleanup after successful auth claim ──────────────────────────────────────

export function clearAnonData(): void {
  try {
    localStorage.removeItem(ANON_SESSION_IDS_KEY);
    localStorage.removeItem(ANON_PROFILE_IDS_KEY);
  } catch {
    // Non-fatal
  }
}
