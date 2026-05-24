import { XP_RATES, LEVEL_THRESHOLDS } from '../config/constants.js';

/**
 * Supported activity types for XP calculation.
 */
type ActivityType = 'WALKING' | 'RUNNING' | 'CYCLING';

/**
 * Level information including title and progress towards next level.
 */
interface LevelInfo {
  level: number;
  title: string;
  nextLevelXP: number | null;
  progress: number;
}

/**
 * Calculate XP earned for a given distance and activity type.
 * XP is awarded per 100 meters of movement.
 *
 * @param distanceMeters - Distance traveled in meters
 * @param activityType - Type of activity (WALKING, RUNNING, or CYCLING)
 * @returns XP points earned (integer)
 *
 * @example
 * ```ts
 * const xp = calculateXP(1500, 'RUNNING');
 * // 1500m / 100m * 10 XP = 150 XP
 * ```
 */
export function calculateXP(
  distanceMeters: number,
  activityType: ActivityType
): number {
  const rate = XP_RATES[activityType];
  const hundredMeterBlocks = distanceMeters / 100;
  return Math.floor(hundredMeterBlocks * rate);
}

/**
 * Determine the player's level and progress from their total XP.
 * Levels are determined by matching against LEVEL_THRESHOLDS in descending order.
 *
 * @param xp - Total XP accumulated by the player
 * @returns Level info including current level, title, next level XP requirement, and progress percentage
 *
 * @example
 * ```ts
 * const info = getLevelFromXP(750);
 * // { level: 5, title: 'Runner', nextLevelXP: 2000, progress: 0.1667 }
 * ```
 */
export function getLevelFromXP(xp: number): LevelInfo {
  // Walk thresholds in reverse to find the highest matching level
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    const threshold = LEVEL_THRESHOLDS[i];
    if (xp >= threshold.xpRequired) {
      const nextThreshold = LEVEL_THRESHOLDS[i + 1] ?? null;

      let progress = 1.0;
      if (nextThreshold) {
        const xpIntoLevel = xp - threshold.xpRequired;
        const xpForNextLevel = nextThreshold.xpRequired - threshold.xpRequired;
        progress = xpForNextLevel > 0 ? xpIntoLevel / xpForNextLevel : 1.0;
      }

      return {
        level: threshold.level,
        title: threshold.title,
        nextLevelXP: nextThreshold?.xpRequired ?? null,
        progress: Math.min(progress, 1.0),
      };
    }
  }

  // Fallback — should never reach here if thresholds start at 0
  return {
    level: 1,
    title: 'Beginner',
    nextLevelXP: LEVEL_THRESHOLDS[1]?.xpRequired ?? null,
    progress: 0,
  };
}

/**
 * Get the title string for a given level number.
 * Returns the title of the highest threshold at or below the given level.
 *
 * @param level - The player's current level
 * @returns Title string for the level (e.g. "Runner", "Explorer")
 *
 * @example
 * ```ts
 * const title = getLevelTitle(15);
 * // "Explorer"
 * ```
 */
export function getLevelTitle(level: number): string {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (level >= LEVEL_THRESHOLDS[i].level) {
      return LEVEL_THRESHOLDS[i].title;
    }
  }
  return 'Beginner';
}
