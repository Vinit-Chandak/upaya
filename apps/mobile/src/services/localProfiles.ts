/**
 * Local storage utilities for kundli profiles and anonymous session tracking.
 *
 * Mobile uses AsyncStorage (React Native).
 *
 * Storage keys:
 *   upaya_profiles_v1        — LocalKundliProfile[] (profile picker cache)
 *   upaya_anon_session_ids   — string[] (chat session_id strings for claim)
 *   upaya_anon_profile_ids   — string[] (server profile UUIDs for claim)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocalKundliProfile } from '@upaya/shared';

const PROFILES_KEY = 'upaya_profiles_v1';
const ANON_SESSION_IDS_KEY = 'upaya_anon_session_ids';
const ANON_PROFILE_IDS_KEY = 'upaya_anon_profile_ids';

// ── Profile CRUD ─────────────────────────────────────────────────────────────

export async function getLocalProfiles(): Promise<LocalKundliProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveLocalProfile(profile: LocalKundliProfile): Promise<void> {
  try {
    const existing = await getLocalProfiles();
    // Replace if same localId, append otherwise
    const idx = existing.findIndex((p) => p.localId === profile.localId);
    if (idx >= 0) {
      existing[idx] = profile;
    } else {
      existing.unshift(profile); // newest first
    }
    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(existing));
  } catch {
    // Non-fatal — profile picker just won't show this entry
  }
}

/** Mark a local profile as synced by updating its serverId */
export async function markProfileSynced(localId: string, serverId: string): Promise<void> {
  try {
    const existing = await getLocalProfiles();
    const idx = existing.findIndex((p) => p.localId === localId);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], serverId };
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(existing));
    }
  } catch {
    // Non-fatal
  }
}

/** Replace the full profile list (used after server sync to refresh cache) */
export async function setLocalProfiles(profiles: LocalKundliProfile[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    // Non-fatal
  }
}

// ── Anonymous session tracking ────────────────────────────────────────────────

export async function getAnonSessionIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(ANON_SESSION_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveAnonSessionId(sessionId: string): Promise<void> {
  try {
    const existing = await getAnonSessionIds();
    if (!existing.includes(sessionId)) {
      existing.push(sessionId);
      await AsyncStorage.setItem(ANON_SESSION_IDS_KEY, JSON.stringify(existing));
    }
  } catch {
    // Non-fatal
  }
}

// ── Anonymous profile ID tracking ────────────────────────────────────────────

export async function getAnonProfileIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(ANON_PROFILE_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveAnonProfileId(profileId: string): Promise<void> {
  try {
    const existing = await getAnonProfileIds();
    if (!existing.includes(profileId)) {
      existing.push(profileId);
      await AsyncStorage.setItem(ANON_PROFILE_IDS_KEY, JSON.stringify(existing));
    }
  } catch {
    // Non-fatal
  }
}

// ── Cleanup after successful auth claim ──────────────────────────────────────

/** Clear anonymous tracking IDs after they've been claimed on the server */
export async function clearAnonData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([ANON_SESSION_IDS_KEY, ANON_PROFILE_IDS_KEY]);
  } catch {
    // Non-fatal
  }
}
