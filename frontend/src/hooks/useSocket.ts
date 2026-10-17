'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/store/useUserStore';

export function useSocket() {
  const { token } = useUserStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Connect to backend websocket
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });
    socket.on('connect', () => {
      setIsConnected(true);
      setSocket(socket);
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setSocket(null);
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return {
    socket,
    isConnected,
  };
}
