import { z } from 'zod';

/**
 * Validation schema for updating user profile.
 */
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
});

/** Inferred type from the update profile schema */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Validation schema for updating user settings.
 * Placeholder for future settings (notifications, privacy, etc.)
 */
export const updateSettingsSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  privacyMode: z.enum(['public', 'friends', 'private']).optional(),
  unitSystem: z.enum(['metric', 'imperial']).optional(),
});

/** Inferred type from the update settings schema */
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
