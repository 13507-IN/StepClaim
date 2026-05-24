import bcrypt from 'bcryptjs';

/** Number of salt rounds for bcrypt hashing */
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt.
 *
 * @param password - The plaintext password to hash
 * @returns A bcrypt hash string
 *
 * @example
 * ```ts
 * const hash = await hashPassword('mySecurePassword123');
 * // Store hash in database
 * ```
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 *
 * @param password - The plaintext password to check
 * @param hash - The bcrypt hash to compare against
 * @returns true if the password matches the hash, false otherwise
 *
 * @example
 * ```ts
 * const isValid = await comparePassword('myPassword', storedHash);
 * if (isValid) {
 *   // Grant access
 * }
 * ```
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
