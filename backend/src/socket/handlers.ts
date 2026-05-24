import { Socket } from 'socket.io';
import * as h3 from 'h3-js';
import { GpsService } from '../services/gps.service.js';
import { io } from './index.js';

// Defensive H3 compatibility wrappers
const latLngToCell = h3.latLngToCell || (h3 as any).geoToH3;
const cellToParent = h3.cellToParent || (h3 as any).h3ToParent;

const gpsService = new GpsService();

/**
 * Register gameplay event listeners for a newly connected Socket.IO client.
 */
export function registerSocketHandlers(socket: Socket): void {
  const userId = socket.data.userId;
  const username = socket.data.username;

  // Active track user's current spatial H3 room to optimize socket broadcasts
  let currentParentCellRoom: string | null = null;

  // ─── Location Updates ──────────────────────────────────────────────────────

  socket.on(
    'LOCATION_UPDATED',
    async (payload: {
      latitude: number;
      longitude: number;
      speed: number;
      activityType: 'WALKING' | 'RUNNING' | 'CYCLING';
      runId: string | null;
    }) => {
      try {
        const { latitude, longitude, speed, activityType, runId } = payload;

        if (isNaN(latitude) || isNaN(longitude)) {
          return;
        }

        // Process location through GPS service (coordinates filter + speed limit validation)
        const result = await gpsService.processLocationUpdate(
          userId,
          runId,
          latitude,
          longitude,
          speed,
          activityType,
        );

        if (!result.processed) {
          // If coordinates are flagged by Anti-Cheat, warn the client privately
          if (result.reason === 'unrealistic_speed' || result.reason === 'teleport') {
            socket.emit('CHEAT_WARNING', {
              reason: `Infraction flagged: ${result.reason?.replace('_', ' ')}`,
            });
          }
          return;
        }

        // Spatial H3 Room Management: Partition users into Resolution 6 parent rooms (~36km²)
        const currentCell = latLngToCell(latitude, longitude, 9);
        const parentCell = cellToParent(currentCell, 6);
        const newRoomName = `h3_room:${parentCell}`;

        if (currentParentCellRoom !== newRoomName) {
          // Dynamically transition socket rooms
          if (currentParentCellRoom) {
            socket.leave(currentParentCellRoom);
          }
          socket.join(newRoomName);
          currentParentCellRoom = newRoomName;
        }

        // Broadcast current location to other online players inside the same spatial room
        socket.to(newRoomName).emit('LOCATION_SHARED', {
          userId,
          username,
          latitude,
          longitude,
          speed: result.speed,
        });

        // ─── Capture Event Triggered ───────────────────────────────────────────
        if (result.captureResult?.captured) {
          const cap = result.captureResult;
          
          // Broadcast capture updates globally to make the game feel active
          io?.emit('TERRITORY_CAPTURED', {
            gridId: cap.gridId,
            ownerId: userId,
            username: username,
            status: cap.status, // 'claimed' or 'recaptured'
          });

          // Fetch fresh user data to push stats back
          const prisma = (await import('../config/database.js')).prisma;
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { xp: true, level: true },
          });

          if (user) {
            socket.emit('XP_UPDATED', {
              xp: user.xp,
              level: user.level,
              xpGained: cap.xpGained,
              captureSuccess: true,
            });
          }
        }
      } catch (error) {
        console.error(`Error processing LOCATION_UPDATED for user ${userId}:`, error);
      }
    },
  );

  // ─── Run Session States ────────────────────────────────────────────────────

  socket.on('RUN_STARTED', (payload: { runId: string }) => {
    console.log(`🏃 Player ${username} started running session: ${payload.runId}`);
    socket.broadcast.emit('RUN_STARTED', {
      userId,
      username,
      runId: payload.runId,
    });
  });

  socket.on('RUN_ENDED', (payload: { runId: string }) => {
    console.log(`🏁 Player ${username} ended running session: ${payload.runId}`);
    socket.broadcast.emit('RUN_ENDED', {
      userId,
      username,
      runId: payload.runId,
    });
  });
}
