# Backend Code Review: Logical Errors & Optimization Opportunities

## Critical Issues 🔴

### 1. **Race Condition in Run Ending** [HIGH PRIORITY]
**File:** `src/services/run.service.ts` - `endRun()` method
**Issue:** 
```typescript
const locations = run.locations; // Fetched at line 34
// ... 40+ lines of processing ...
// By this time, new locations may have been added via logTrackpoint()
```
**Problem:** Locations are fetched once but can be modified concurrently by `logTrackpoint()` calls. Final distance calculation may be incorrect.

**Solution:**
```typescript
// Fetch locations again before final calculation
const finalRun = await this.runRepo.findById(runId);
const locations = finalRun?.locations || [];
```

---

### 2. **Missing Username in Refresh Token** [MEDIUM]
**File:** `src/services/auth.service.ts` - `refresh()` method (line 105)
**Issue:**
```typescript
const decoded = verifyRefreshToken(token);
const accessToken = generateAccessToken({ 
  userId: decoded.userId, 
  username: decoded.username || '' // ⚠️ Username is undefined!
});
```
**Problem:** Refresh tokens don't contain username, defaulting to empty string. This breaks user identification.

**Solution:** Store username in refresh token or fetch from database:
```typescript
const user = await this.userRepo.findById(decoded.userId);
const accessToken = generateAccessToken({ 
  userId: decoded.userId, 
  username: user.username 
});
```

---

### 3. **CORS Configuration Too Permissive** [SECURITY]
**File:** `src/app.ts` (line 30)
**Issue:**
```typescript
await fastify.register(cors, {
  origin: true, // ⚠️ Allows ANY origin in development
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true, // Makes it even riskier
});
```
**Solution:**
```typescript
await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? env.CORS_ORIGIN 
    : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
});
```

---

### 4. **Inconsistent Cookie Secret Configuration** [SECURITY]
**File:** `src/app.ts` (line 33) and `src/config/env.ts`
**Issue:**
```typescript
await fastify.register(cookie, {
  secret: env.JWT_ACCESS_SECRET, // ⚠️ Using JWT secret for cookies!
});
```
**Problem:** JWT_ACCESS_SECRET is meant for JWTs, not for signing cookies. Should use dedicated COOKIE_SECRET.

**Solution:**
```typescript
await fastify.register(cookie, {
  secret: env.COOKIE_SECRET,
});
```

---

### 5. **N+1 Query Problems in Leaderboard Service** [PERFORMANCE]
**File:** `src/services/leaderboard.service.ts` - `getLeaderboard()` method
**Issue:**
```typescript
// Fetches all user IDs first, then queries users separately
const stats = await prisma.run.groupBy({...}); // Query 1
const users = await prisma.user.findMany({...}); // Query 2 (N+1 pattern)
```
**Solution:** Use Prisma include/select to fetch in single query:
```typescript
const users = await prisma.user.findMany({
  where: { id: { in: userIds } },
  include: { runs: { where: { startTime: { gte: sevenDaysAgo } } } }
});
```

---

## Logical Errors 🟡

### 6. **Pagination Missing Max Size Enforcement**
**File:** `src/controllers/run.controller.ts` - `history()` method
**Issue:**
```typescript
const parsedLimit = limit ? parseInt(limit, 10) : 10;
// No validation! User could request 1 million records
```

**Solution:**
```typescript
const MAX_LIMIT = 100;
const parsedLimit = Math.min(limit ? parseInt(limit, 10) : 10, MAX_LIMIT);
```

---

### 7. **Unsafe Parsing of Query Parameters**
**File:** `src/controllers/run.controller.ts`
**Issue:**
```typescript
const { limit, page } = request.query as { limit?: string; page?: string };
const parsedLimit = limit ? parseInt(limit, 10) : 10;
// No validation for negative numbers or non-integers
```

**Solution:**
```typescript
const parsedLimit = Math.max(1, Math.min(parseInt(limit || '10', 10), 100)) || 10;
const parsedPage = Math.max(1, parseInt(page || '1', 10)) || 1;
```

---

### 8. **Cloudinary Upload Error Handling**
**File:** `src/services/auth.service.ts` & `src/services/profile.service.ts`
**Issue:**
```typescript
const uploadStream = cloudinary.uploader.upload_stream(
  { folder: 'stepclaim_avatars' },
  (error, result) => {
    if (error || !result) {
      return reject(new Error('Cloudinary upload failed'));
    }
  },
);
uploadStream.end(avatarFileBuffer);
```
**Problem:** No timeout, stream errors not handled, upload_stream might not have error listeners properly attached.

**Solution:**
```typescript
return new Promise<string>((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'stepclaim_avatars', timeout: 30000 },
    (error, result) => {
      if (error) return reject(new Error(`Upload failed: ${error.message}`));
      if (!result?.secure_url) return reject(new Error('Invalid upload response'));
      resolve(result.secure_url);
    },
  );
  
  uploadStream.on('error', reject);
  uploadStream.end(avatarFileBuffer);
});
```

---

### 9. **Missing Input Validation in Controllers**
**File:** `src/controllers/territory.controller.ts`, `src/controllers/run.controller.ts`
**Issue:** No validation for:
- Latitude/Longitude bounds (-90 to 90, -180 to 180)
- Speed ranges (negative speeds not validated)
- activityType enum values
- Distance/Duration reasonableness

**Solution:** Use Zod validators before processing:
```typescript
const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed: z.number().min(0).max(50),
});
```

---

### 10. **Race Condition in Territory Capture Counter**
**File:** `src/services/territory.service.ts` - `captureTerritory()` (line 48-58)
**Issue:**
```typescript
// Between checking ownership and transaction, another user might capture it
const currentTerritory = await this.territoryRepo.findByGridId(gridId); // Line 48
// ... code ...
const territory = await prisma.$transaction(async (tx: any) => {
  // What if territory was captured by another user between lines 48 and transaction?
```

**Solution:** Move the check inside the transaction:
```typescript
const territory = await prisma.$transaction(async (tx: any) => {
  const current = await tx.territory.findUnique({ where: { gridId } });
  if (current?.ownerId === userId) return current; // Already owned
  
  // ... rest of capture logic
});
```

---

## Performance Issues ⚡

### 11. **Missing Database Indexes**
**File:** `prisma/schema.prisma`
**Current State:** Only unique constraints, no performance indexes

**Missing Indexes:**
```prisma
model User {
  @@index([createdAt])
}

model Run {
  @@index([userId])
  @@index([startTime])
}

model UserLocation {
  @@index([userId])
  @@index([runId])
  @@index([timestamp])
}

model Territory {
  @@index([ownerId])
  @@index([capturedAt])
}

model Activity {
  @@index([userId])
  @@index([createdAt])
}
```

---

### 12. **Inefficient Nearby Territories Query**
**File:** `src/services/territory.service.ts` - `getNearbyTerritories()`
**Issue:**
```typescript
const surroundingGrids = gridDisk(centerCell, 8); // Returns ~900+ hex cells
const capturedTerritories = await this.territoryRepo.findNearby(surroundingGrids);
// Querying 900+ gridIds is expensive!
```

**Solution:** Cache results in Redis:
```typescript
const cacheKey = `territories:${centerCell}`;
let nearby = await redis.get(cacheKey);
if (!nearby) {
  nearby = await this.territoryRepo.findNearby(surroundingGrids);
  await redis.setex(cacheKey, 300, JSON.stringify(nearby)); // 5min cache
}
```

---

### 13. **Redis Fail-Open Strategy is Risky**
**File:** `src/middleware/rateLimit.middleware.ts`
**Issue:**
```typescript
try {
  const current = await redis.incr(key);
  // ...
} catch (error) {
  // If Redis fails, allow request through! (fail-open)
  request.log.warn('Rate limiting unavailable: Redis error');
}
```

**Problem:** Rate limiting is completely disabled if Redis goes down. Attackers can abuse it.

**Solution:** Implement circuit breaker or fail-closed:
```typescript
if (redisDown) {
  return reply.status(503).send(errorResponse('Service temporarily unavailable'));
}
```

---

### 14. **Synchronous Import of Database Config in Services**
**File:** `src/services/run.service.ts` (line 35), `src/services/territory.service.ts` (line 114)
**Issue:**
```typescript
const prisma = (await import('../config/database.js')).prisma;
// Dynamic import on every call! Wasteful.
```

**Solution:**
```typescript
// At top of file
import { prisma } from '../config/database.js';
// Use directly: await prisma.run.findFirst({...})
```

---

## Code Quality Issues 🔧

### 15. **Magic Numbers Throughout Codebase**
**Issue:** Constants scattered everywhere:
- Line 51, run.service.ts: `Math.max(..., 1)` - why 1?
- Line 18, anticheat.service.ts: hardcoded speed limits

**Solution:** Add to `constants.ts`:
```typescript
export const RUN_MIN_DURATION_SECONDS = 1;
export const LOCATION_FETCH_TIMEOUT_MS = 5000;
```

---

### 16. **Missing Error Recovery in Socket Handlers**
**File:** `src/socket/handlers.ts`
**Issue:**
```typescript
socket.on('LOCATION_UPDATED', async (payload) => {
  const result = await gpsService.processLocationUpdate(...);
  if (!result.processed) return; // Silent failure!
});
```

**Solution:**
```typescript
socket.on('LOCATION_UPDATED', async (payload) => {
  try {
    const result = await gpsService.processLocationUpdate(...);
    if (!result.processed) {
      socket.emit('LOCATION_REJECTED', { reason: result.reason });
    }
  } catch (error) {
    socket.emit('ERROR', { message: 'Location processing failed' });
  }
});
```

---

### 17. **Weak Error Messages**
**File:** `src/services/auth.service.ts`
**Issue:**
```typescript
throw new Error('Cloudinary upload failed'); // Too vague
throw new Error('Invalid or expired refresh token'); // Leaks info
```

**Solution:**
```typescript
throw new Error('Avatar upload failed - please try again');
throw new Error('Session expired - please login again');
```

---

### 18. **No Input Sanitization**
**File:** `src/services/auth.service.ts` - `register()`, `login()`
**Issue:** Email/username not trimmed or sanitized:
```typescript
async register(username: string, email: string, passwordStr: string)
// If user passes " admin " - creates different account!
```

**Solution:**
```typescript
username = username.trim().toLowerCase();
email = email.trim().toLowerCase();
```

---

### 19. **Type Casting Hazards**
**File:** `src/controllers/run.controller.ts`
**Issue:**
```typescript
const { runId, activityType } = request.body as {
  runId: string;
  activityType: 'WALKING' | 'RUNNING' | 'CYCLING';
}; // No validation!
```

**Solution:**
```typescript
const validated = RunEndSchema.parse(request.body);
const { runId, activityType } = validated;
```

---

### 20. **Memory Leak Risk in Socket Handlers**
**File:** `src/socket/handlers.ts`
**Issue:**
```typescript
const livePresenceByUserId = new Map<string, PresenceState>();
// Users never removed from this map!
// If 100k users connect/disconnect, map grows unbounded
```

**Solution:**
```typescript
socket.on('disconnect', () => {
  livePresenceByUserId.delete(userId);
});
```

---

## Optimization Recommendations 🚀

### 21. **Batch Database Operations**
**Issue:** Multiple calls to update user stats:
```typescript
await this.userRepo.updateStats(userId, { totalDistance: ... });
await this.gamificationService.awardXP(userId, xpGained, ...);
await this.gamificationService.checkBadgeEligibility(userId);
// 3+ DB queries for one operation
```

**Solution:**
```typescript
await prisma.$transaction(async (tx) => {
  await tx.user.update({...});
  await tx.activity.create({...});
  // all in one transaction
});
```

---

### 22. **Add Connection Pooling Configuration**
**File:** `src/config/database.ts`
**Current:**
```typescript
new PrismaClient({ log: [...] })
```

**Optimization:**
```typescript
new PrismaClient({
  log: [...],
  datasources: {
    db: {
      url: `${env.DATABASE_URL}?connection_limit=10&pool_timeout=45`,
    },
  },
})
```

---

### 23. **Implement Request Caching**
**Issue:** Leaderboard queries could be cached:
```typescript
// Every request fetches fresh data
const users = await prisma.user.findMany({...});
```

**Solution:**
```typescript
const cacheKey = `leaderboard:${type}:${period}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const users = await prisma.user.findMany({...});
await redis.setex(cacheKey, 300, JSON.stringify(users)); // 5min cache
```

---

### 24. **Lazy Load Socket Data**
**Issue:** Socket handlers create new service instances:
```typescript
const gpsService = new GpsService(); // Global instance
```

**Optimization:** Singleton pattern to reuse instances

---

### 25. **Add Request Timeouts**
**File:** `src/app.ts`
**Current:** No timeout configuration

**Solution:**
```typescript
const fastify = Fastify({
  requestTimeout: 30000, // 30s timeout
  logger: {...},
});
```

---

## Summary Table

| Issue | Severity | Type | Impact |
|-------|----------|------|--------|
| Run ending race condition | 🔴 Critical | Logic | Incorrect XP/distance |
| Missing username in refresh | 🔴 Critical | Logic | Authentication broken |
| CORS too permissive | 🔴 Critical | Security | CSRF/XSS vulnerable |
| Cookie secret misconfig | 🔴 Critical | Security | Session hijacking |
| N+1 queries | 🟡 High | Performance | Slow leaderboard (100ms→1s+) |
| Missing pagination limits | 🟡 High | Logic | DoS attack vector |
| Territory race condition | 🟡 High | Logic | Territory count mismatch |
| Missing DB indexes | 🟡 High | Performance | Query slowdown (10-100x) |
| Cloudinary error handling | 🟡 High | Reliability | Avatar upload failures |
| Redis fail-open | 🟡 High | Security | Rate limiting bypass |
| Memory leak in socket | 🟡 Medium | Performance | Server memory bloat |
| Inefficient hex query | 🟡 Medium | Performance | Socket broadcast delays |
| No input validation | 🟡 Medium | Security | Injection attacks possible |
| Dynamic imports | 🟡 Medium | Performance | Repeated module loading |
| Socket error recovery | 🟡 Medium | Reliability | Silent failures |

---

## Recommended Priority for Fixes

**Phase 1 (Immediate - Security & Critical Logic):**
1. Fix CORS configuration
2. Fix cookie secret
3. Fix run ending race condition  
4. Add pagination limits

**Phase 2 (High Impact - Performance):**
5. Add database indexes
6. Fix N+1 queries
7. Implement query caching
8. Remove dynamic imports

**Phase 3 (Medium Priority - Code Quality):**
9. Add input validation with Zod
10. Fix socket memory leak
11. Add request timeouts
12. Improve error handling

