import type { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../services/firebase';
import { AppError } from './error';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    phone?: string;
  };
}

/**
 * Middleware that requires a valid Firebase ID token in the Authorization header.
 * Sets req.user with the decoded token info.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'Missing or invalid authorization header', 'AUTH_REQUIRED');
    }

    const token = authHeader.slice(7);
    const decodedToken = await firebaseAuth.verifyToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      phone: decodedToken.phone_number,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError(401, 'Invalid or expired token', 'AUTH_INVALID'));
  }
}

/**
 * Optional auth — sets req.user if token is present, but doesn't require it.
 * Useful for endpoints that work for both anonymous and authenticated users.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decodedToken = await firebaseAuth.verifyToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        phone: decodedToken.phone_number,
      };
    }
  } catch {
    // Token invalid — continue as anonymous
  }
  next();
}
