import * as admin from 'firebase-admin';
import { config } from '../config';

let app: admin.app.App | null = null;

function getApp(): admin.app.App {
  if (!app) {
    const { projectId, clientEmail, privateKey } = config.firebase;

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('[Firebase] Missing configuration — running in mock mode');
      // Initialize with a dummy config for development
      app = admin.initializeApp({
        projectId: 'upaya-dev',
      });
    } else {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
  }
  return app;
}

export interface DecodedToken {
  uid: string;
  email?: string;
  phone_number?: string;
  name?: string;
}

export const firebaseAuth = {
  /**
   * Verify a Firebase ID token and return decoded claims.
   */
  async verifyToken(idToken: string): Promise<DecodedToken> {
    const auth = getApp().auth();
    const decoded = await auth.verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email,
      phone_number: decoded.phone_number,
      name: decoded.name,
    };
  },

  /**
   * Get a user by their Firebase UID.
   */
  async getUser(uid: string): Promise<admin.auth.UserRecord> {
    const auth = getApp().auth();
    return auth.getUser(uid);
  },

  /**
   * Create a custom token for a user (useful for anonymous → auth migration).
   */
  async createCustomToken(uid: string, claims?: Record<string, unknown>): Promise<string> {
    const auth = getApp().auth();
    return auth.createCustomToken(uid, claims);
  },
};
