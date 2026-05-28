'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { useGameStore } from '../store/game.store';
import { useRunStore } from '../store/run.store';

interface SocketContextProps {
  socket: Socket | null;
  sendMessage: (event: string, payload: any) => void;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  sendMessage: () => {},
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  
  // Connect stores
  const { accessToken, isAuthenticated, user, setUser } = useAuthStore();
  const { updateNearbyPlayer, removeNearbyPlayer, addNotification } = useGameStore();
  const { incrementCapturedCount } = useRunStore();

  const getWsUrl = (): string => {
    const envUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (envUrl && envUrl !== 'undefined' && envUrl !== 'null' && envUrl.trim().startsWith('http')) {
      return envUrl.trim();
    }
    return 'http://localhost:5000';
  };

  const WS_URL = getWsUrl();

  useEffect(() => {
    // Only connect if the user is authenticated and we have a valid access token
    if (isAuthenticated && accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      console.log('🔌 Socket.IO Client: Attempting connection...');
      
      const socket = io(WS_URL, {
        auth: { token: accessToken },
        transports: ['websocket'],
      });

      socketRef.current = socket;

      // ─── Connection Listeners ──────────────────────────────────────────────

      socket.on('connect', () => {
        console.log('✅ Socket.IO Client: Connected successfully');
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO Client connection error:', error.message);
      });

      // ─── Realtime Gameplay Listeners ───────────────────────────────────────

      // Another player shared their location
      socket.on('LOCATION_SHARED', (payload: { userId: string; username: string; latitude: number; longitude: number; speed: number }) => {
        updateNearbyPlayer({
          userId: payload.userId,
          username: payload.username,
          location: {
            latitude: payload.latitude,
            longitude: payload.longitude,
            accuracy: 5, // mock accuracy
            timestamp: Date.now(),
          },
          level: 1, // default fallback
          isRunning: true,
        });
      });

      socket.on('NEARBY_PLAYERS', (payload: { players: Array<{ userId: string; username: string; latitude: number; longitude: number; speed?: number }> }) => {
        payload.players.forEach((player) => {
          updateNearbyPlayer({
            userId: player.userId,
            username: player.username,
            location: {
              latitude: player.latitude,
              longitude: player.longitude,
              accuracy: 5,
              timestamp: Date.now(),
            },
            level: 1,
            isRunning: true,
          });
        });
      });

      // Another player disconnected
      socket.on('USER_DISCONNECTED', (payload: { userId: string }) => {
        removeNearbyPlayer(payload.userId);
      });

      // Global broadcast: territory captured
      socket.on('TERRITORY_CAPTURED', (payload: { gridId: string; ownerId: string; username: string; status: 'claimed' | 'recaptured' }) => {
        const isMe = payload.ownerId === user?.id;
        
        // Add log alert
        addNotification({
          type: 'territory',
          title: isMe ? 'Territory Captured!' : 'Territory Recaptured',
          message: isMe
            ? `Successfully claimed grid ${payload.gridId}!`
            : `${payload.username} snatched grid ${payload.gridId}!`,
        });

        if (isMe) {
          // If we are currently running, count it in run stats
          incrementCapturedCount();
        }

        // Trigger manual refresh on the map by dispatching a custom event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('territory-captured-refresh', { detail: { gridId: payload.gridId } }));
        }
      });

      // Private update: XP and level changes
      socket.on('XP_UPDATED', (payload: { xp: number; level: number; xpGained: number; captureSuccess: boolean }) => {
        if (user) {
          const updatedUser = {
            ...user,
            xp: payload.xp,
            level: payload.level,
            territoryCount: payload.captureSuccess ? user.territoryCount + 1 : user.territoryCount,
          };
          setUser(updatedUser);

          // Add log alert
          addNotification({
            type: 'xp',
            title: `+${payload.xpGained} XP Earned`,
            message: `Current Level: ${payload.level} (${payload.xp} XP total)`,
          });
        }
      });

      // Private warning: Anti-Cheat infraction flagged
      socket.on('CHEAT_WARNING', (payload: { reason: string }) => {
        addNotification({
          type: 'warning',
          title: 'Suspicious Activity Detected',
          message: payload.reason,
        });
      });

      return () => {
        console.log('🔌 Socket.IO Client: Disconnecting connection...');
        socket.disconnect();
        socketRef.current = null;
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }
  }, [isAuthenticated, accessToken, user?.id]);

  const sendMessage = (event: string, payload: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, payload);
    } else {
      console.warn('⚠️ Cannot emit socket message. Connection not active.');
    }
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
