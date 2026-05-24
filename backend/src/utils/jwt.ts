import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * JWT payload structure for access tokens.
 */
export interface JwtPayload {
  userId: string;
  username?: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a short-lived access token for API authentication.
 *
 * @param payload - Object containing userId and username
 * @returns Signed JWT access token string
 *
 * @example
 * ```ts
 * const token = generateAccessToken({ userId: 'abc-123', username: 'runner42' });
 * ```
 */
export function generateAccessToken(payload: {
  userId: string;
  username: string;
}): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
  });
}

/**
 * Generate a long-lived refresh token for session renewal.
 *
 * @param payload - Object containing userId
 * @returns Signed JWT refresh token string
 *
 * @example
 * ```ts
 * const refreshToken = generateRefreshToken({ userId: 'abc-123' });
 * ```
 */
export function generateRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as any,
  });
}

/**
 * Verify and decode an access token.
 *
 * @param token - JWT access token string to verify
 * @returns Decoded JwtPayload if valid, null if expired or invalid
 *
 * @example
 * ```ts
 * const payload = verifyAccessToken(token);
 * if (payload) {
 *   console.log(payload.userId);
 * }
 * ```
 */
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Verify and decode a refresh token.
 *
 * @param token - JWT refresh token string to verify
 * @returns Decoded JwtPayload if valid, null if expired or invalid
 *
 * @example
 * ```ts
 * const payload = verifyRefreshToken(refreshToken);
 * if (payload) {
 *   // Issue new access token
 * }
 * ```
 */
export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
