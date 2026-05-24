/* ===== Core Data Models ===== */

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalDistance: number;
  totalRuns: number;
  totalTerritories: number;
  territoryCount: number;
  currentStreak: number;
  longestStreak: number;
  streak: number;
  createdAt: string;
  updatedAt: string;
}

export interface Run {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  distance: number;
  duration: number;
  avgSpeed: number;
  maxSpeed: number;
  calories: number;
  xpEarned: number;
  territoriesCaptured: number;
  route: LocationPoint[];
  status: "active" | "paused" | "completed" | "discarded";
  createdAt: string;
}

export interface Territory {
  id: string;
  h3Index: string;
  ownerId?: string;
  ownerUsername?: string;
  ownerAvatarUrl?: string;
  capturedAt?: string;
  captureCount: number;
  color?: string;
  resolution: number;
  isOwnedByUser?: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type ActivityType =
  | "run_completed"
  | "territory_captured"
  | "badge_unlocked"
  | "level_up"
  | "friend_added"
  | "streak_milestone";

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: "distance" | "territory" | "streak" | "social" | "special";
  requirement: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badge: Badge;
  unlockedAt: string;
}

export interface Friend {
  id: string;
  user: User;
  status: "pending" | "accepted" | "rejected";
  direction: "sent" | "received";
  createdAt: string;
}

export interface CheatLog {
  id: string;
  userId: string;
  type: "speed_anomaly" | "teleport" | "gps_spoof";
  details: string;
  severity: "low" | "medium" | "high";
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  totalDistance: number;
  totalTerritories: number;
  totalRuns: number;
  currentStreak: number;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  speed?: number;
  timestamp: number;
}

/* ===== Run State ===== */

export interface RunState {
  isRunning: boolean;
  isPaused: boolean;
  currentRunId?: string;
  locations: LocationPoint[];
  distance: number;
  duration: number;
  speed: number;
  avgSpeed: number;
  maxSpeed: number;
  calories: number;
  xpEarned: number;
  territoriesCaptured: number;
  startTime?: number;
  pauseTime?: number;
  totalPausedTime: number;
}

/* ===== Socket Events ===== */

export interface SocketEvents {
  // Client -> Server
  USER_CONNECTED: { userId: string; token: string };
  LOCATION_UPDATE: { location: LocationPoint; runId?: string };
  START_RUN: { runId: string };
  END_RUN: { runId: string };

  // Server -> Client
  USER_DISCONNECTED: { userId: string };
  LOCATION_UPDATED: { userId: string; location: LocationPoint };
  LOCATION_SHARED: { userId: string; username: string; location: LocationPoint };
  TERRITORY_CAPTURED: {
    territoryId: string;
    h3Index: string;
    capturedBy: string;
    username: string;
    xpEarned: number;
  };
  XP_UPDATED: { userId: string; xp: number; level: number; xpToNextLevel: number };
  LEADERBOARD_UPDATED: { entries: LeaderboardEntry[] };
  BADGE_UNLOCKED: { userId: string; badge: Badge };
  RUN_STARTED: { userId: string; runId: string };
  RUN_ENDED: { userId: string; runId: string; stats: Partial<Run> };
  CHEAT_WARNING: { message: string; severity: string };
  NEARBY_PLAYERS: { players: NearbyPlayer[] };
}

export interface NearbyPlayer {
  userId: string;
  username: string;
  avatarUrl?: string;
  location: LocationPoint;
  level: number;
  isRunning: boolean;
}

/* ===== API Response Types ===== */

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/* ===== Leaderboard Types ===== */

export type LeaderboardType = "xp" | "distance" | "territories";
export type LeaderboardPeriod = "all" | "weekly" | "monthly";

/* ===== Notification ===== */

export interface GameNotification {
  id: string;
  type: "territory" | "xp" | "badge" | "level" | "warning";
  title: string;
  message: string;
  timestamp: number;
}
