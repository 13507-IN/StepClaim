import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { User } from '@prisma/client';

export class AuthController {
  private authService = new AuthService();

  /**
   * Post endpoint handler for user registration.
   * Leverages @fastify/multipart to upload avatar picture directly to Cloudinary.
   */
  register = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      let username = '';
      let email = '';
      let password = '';
      let avatarBuffer: Buffer | undefined;

      // Check if it is a multipart request
      if (request.isMultipart()) {
        const parts = request.parts();
        for await (const part of parts) {
          if (part.type === 'file') {
            if (part.fieldname === 'avatar') {
              avatarBuffer = await part.toBuffer();
            }
          } else {
            // It is a text field
            if (part.fieldname === 'username') username = part.value as string;
            if (part.fieldname === 'email') email = part.value as string;
            if (part.fieldname === 'password') password = part.value as string;
          }
        }
      } else {
        // Fallback to standard JSON body
        const body = request.body as any;
        username = body.username;
        email = body.email;
        password = body.password;
      }

      if (!username || !email || !password) {
        reply.status(400).send(errorResponse('Missing required fields'));
        return;
      }

      const result = await this.authService.register(username, email, password, avatarBuffer);

      // Set cookies for secure session management
      this.setCookies(reply, result.accessToken, result.refreshToken);

      reply.status(201).send(
        successResponse({
          user: this.sanitizeUser(result.user),
          accessToken: result.accessToken,
        }, 'User registered successfully'),
      );
    } catch (error: any) {
      reply.status(400).send(errorResponse(error.message));
    }
  };

  /**
   * Post endpoint handler for user login.
   */
  login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const { email, password } = request.body as any;
      const result = await this.authService.login(email, password);

      // Set cookies for secure session management
      this.setCookies(reply, result.accessToken, result.refreshToken);

      reply.status(200).send(
        successResponse({
          user: this.sanitizeUser(result.user),
          accessToken: result.accessToken,
        }, 'Logged in successfully'),
      );
    } catch (error: any) {
      reply.status(401).send(errorResponse(error.message));
    }
  };

  /**
   * Post endpoint handler to refresh access token.
   */
  refresh = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      // Pull token from cookie or request body
      const cookies = request.cookies as Record<string, string> | undefined;
      const token = cookies?.refreshToken || (request.body as any)?.refreshToken;

      if (!token) {
        reply.status(401).send(errorResponse('Refresh token required'));
        return;
      }

      const result = await this.authService.refresh(token);

      // Set cookies
      this.setCookies(reply, result.accessToken, result.refreshToken);

      reply.status(200).send(
        successResponse({
          accessToken: result.accessToken,
        }, 'Token refreshed successfully'),
      );
    } catch (error: any) {
      reply.status(401).send(errorResponse(error.message));
    }
  };

  /**
   * Post endpoint handler for logging out a user.
   */
  logout = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (userId) {
        await this.authService.logout(userId);
      }

      // Clear cookies
      reply.clearCookie('accessToken', { path: '/' });
      reply.clearCookie('refreshToken', { path: '/' });

      reply.status(200).send(successResponse({}, 'Logged out successfully'));
    } catch (error: any) {
      reply.status(500).send(errorResponse(error.message));
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Set JWT tokens as secure HttpOnly, SameSite cookies.
   */
  private setCookies(reply: FastifyReply, accessToken: string, refreshToken: string): void {
    const isProd = process.env.NODE_ENV === 'production';
    
    reply.setCookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 mins
    });

    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  }

  /**
   * Sanitize user object to avoid leaking password hashes.
   */
  private sanitizeUser(user: User) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
