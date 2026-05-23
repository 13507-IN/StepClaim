/**
 * Application-wide constants for the StepClaim game engine.
 * These values define core gameplay mechanics, XP rates, anti-cheat thresholds,
 * and other configuration parameters.
 */

// ─── H3 Hexagonal Grid ─────────────────────────────────────────────────────

/** H3 resolution level for territory hexagons (res 9 ≈ 0.1 km² per hex) */
export const H3_RESOLUTION = 9;

// ─── XP Rates ───────────────────────────────────────────────────────────────

/** XP earned per 100 meters of movement by activity type */
export const XP_RATES = {
  WALKING: 5,
  RUNNING: 10,
  CYCLING: 7,
  TERRITORY_CAPTURE: 100,
} as const;

// ─── Speed Limits ───────────────────────────────────────────────────────────

/** Maximum allowed speed in meters per second by activity type */
export const SPEED_LIMITS = {
  WALKING: 6,
  RUNNING: 10,
  CYCLING: 20,
} as const;

// ─── Anti-Cheat Thresholds ──────────────────────────────────────────────────

/** Anti-cheat detection thresholds */
export const ANTI_CHEAT = {
  /** Minimum movement in meters to register as real movement */
  MIN_MOVEMENT_THRESHOLD: 5,
  /** Distance in meters that constitutes a teleport */
  TELEPORT_DISTANCE: 500,
  /** Time in seconds — if traveled TELEPORT_DISTANCE in less time, flag as cheat */
  TELEPORT_TIME_THRESHOLD: 10,
  /** Cooldown in seconds between territory captures */
  TERRITORY_CAPTURE_COOLDOWN: 30,
} as const;

// ─── Level Thresholds ───────────────────────────────────────────────────────

/** Level progression thresholds with titles */
export const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, title: 'Beginner' },
  { level: 5, xpRequired: 500, title: 'Runner' },
  { level: 10, xpRequired: 2000, title: 'Explorer' },
  { level: 25, xpRequired: 10000, title: 'Champion' },
  { level: 50, xpRequired: 50000, title: 'Territory King' },
  { level: 100, xpRequired: 200000, title: 'Legend' },
] as const;

// ─── Streak ─────────────────────────────────────────────────────────────────

/** Streak requirements */
export const STREAK = {
  /** Minimum distance in meters to count as a daily run (1km) */
  MIN_DAILY_DISTANCE: 1000,
} as const;

// ─── Pagination ─────────────────────────────────────────────────────────────

/** Default pagination settings */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ─── Redis Keys ──────────────────────────────────────────────────────────────

/** Redis key prefixes and patterns */
export const REDIS_KEYS = {
  RATE_LIMIT: 'ratelimit:',
} as const;

