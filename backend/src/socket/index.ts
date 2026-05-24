import { Server as SocketIOServer, Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { verifyAccessToken } from '../utils/jwt.js';
import { registerSocketHandlers } from './handlers.js';

export let io: SocketIOServer | undefined;

/**
 * Fastify plugin to initialize and configure Socket.IO server.
 * Hooks into the native node HTTP/S server inside Fastify.
 */
export async function initSocketServer(fastify: FastifyInstance): Promise<void> {
  // Initialize Socket.IO with CORS settings matching Fastify's CORS configs
  io = new SocketIOServer(fastify.server, {
    cors: {
      origin: '*', // Customize to specific domain in production
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  // Handshake Authentication pre-connection middleware
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.query?.token;

      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication failed: Missing token'));
      }

      // Verify and decode JWT Access Token
      const decoded = verifyAccessToken(token);
      if (!decoded || !decoded.userId) {
        return next(new Error('Authentication failed: Invalid token'));
      }

      socket.data = {
        userId: decoded.userId,
        username: decoded.username || '',
      };

      next();
    } catch (error) {
      console.warn('⚠️  Socket.IO: connection authentication rejected');
      next(new Error('Authentication failed: Invalid token'));
    }
  });

  // Handle incoming connections
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket.IO: Player connected - ID: ${socket.data.userId} (${socket.data.username})`);
    
    // Register gameplay socket handlers (movement, runs, captures)
    registerSocketHandlers(socket);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket.IO: Player disconnected - ID: ${socket.data.userId}`);
    });
  });

  console.log('✅ Socket.IO: server initialized successfully');
}
