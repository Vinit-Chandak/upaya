/**
 * Claim anonymous data after successful authentication.
 *
 * Anonymous chat sessions, kundlis, and profiles are created with user_id = NULL
 * on the server. When the user authenticates, we "claim" them by sending the
 * tracked IDs to the server, which does:
 *   UPDATE ... SET user_id = $1 WHERE id = ANY($2) AND user_id IS NULL
 *
 * This is idempotent — safe to call multiple times. Records already owned by
 * another user are not affected (the AND user_id IS NULL guard prevents that).
 *
 * After a successful claim, the local anon tracking IDs are cleared. The
 * profile list is refreshed from the server so the picker shows all profiles
 * (including those created on other devices with the same account).
 */

import {
  migrateAnonymousData,
  getKundliProfiles,
} from './api';
import {
  getAnonSessionIds,
  getAnonProfileIds,
  setLocalProfiles,
  clearAnonData,
} from './localProfiles';
import type { LocalKundliProfile } from '@upaya/shared';

interface ClaimResult {
  migrated: { sessions: number; kundlis: number; profiles: number };
}

/**
 * Call this once immediately after every successful Firebase auth event
 * (sign-in, token refresh with new UID). Runs silently in the background.
 *
 * @param firebaseIdToken  Fresh Firebase ID token from the authenticated user.
 * @param onProfilesRefreshed  Optional callback with the updated local profiles
 *   (after merging server profiles into the local cache).
 */
export async function claimAnonymousData(
  firebaseIdToken: string,
  onProfilesRefreshed?: (profiles: LocalKundliProfile[]) => void,
): Promise<ClaimResult | null> {
  const sessionIds = await getAnonSessionIds();
  const profileIds = await getAnonProfileIds();

  // Nothing to claim
  if (sessionIds.length === 0 && profileIds.length === 0) {
    return null;
  }

  try {
    const result = await migrateAnonymousData({
      firebaseIdToken,
      sessionIds,
      profileIds,
    });

    // Clear local anon tracking — they've been claimed
    await clearAnonData();

    // Fetch the server's profile list and update local cache.
    try {
      const { profiles: serverProfiles } = await getKundliProfiles(firebaseIdToken);

      // Map server profiles → LocalKundliProfile shape for the picker
      const localProfiles: LocalKundliProfile[] = serverProfiles.map((p) => ({
        localId: p.id, // use server ID as stable local key after auth
        serverId: p.id,
        personName: p.personName,
        relationship: p.relationship,
        dateOfBirth: p.dateOfBirth,
        timeOfBirth: p.timeOfBirth,
        timeApproximate: p.timeApproximate,
        placeOfBirthName: p.placeOfBirthName,
        placeOfBirthLat: p.placeOfBirthLat,
        placeOfBirthLng: p.placeOfBirthLng,
        createdAt:
          p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
      }));

      await setLocalProfiles(localProfiles);
      onProfilesRefreshed?.(localProfiles);
    } catch (syncErr) {
      // Profile sync failure is non-fatal — local cache remains, will sync next time
      console.warn('[claimAnonymousData] Profile sync failed (non-fatal):', syncErr);
    }

    return result;
  } catch (err) {
    // Claim failure is non-fatal — data remains anonymous, user can retry next session
    console.warn('[claimAnonymousData] Claim failed (non-fatal):', err);
    return null;
  }
}
