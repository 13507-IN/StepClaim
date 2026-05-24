import { z } from 'zod';

/**
 * Validation schema for user registration.
 * Enforces strong passwords and valid email/username formats.
 */
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

/** Inferred type from the registration schema */
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Validation schema for user login.
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/** Inferred type from the login schema */
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validation schema for token refresh.
 */
export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/** Inferred type from the refresh schema */
export type RefreshInput = z.infer<typeof refreshSchema>;
