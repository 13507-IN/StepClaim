import { z } from 'zod';

/**
 * Validation schema for sending a friend request.
 */
export const sendFriendRequestSchema = z.object({
  receiverId: z.string().uuid('Invalid user ID'),
});

/** Inferred type from the send friend request schema */
export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;

/**
 * Validation schema for responding to a friend request.
 */
export const respondFriendRequestSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  action: z.enum(['accept', 'block'], {
    errorMap: () => ({ message: 'Action must be "accept" or "block"' }),
  }),
});

/** Inferred type from the respond friend request schema */
export type RespondFriendRequestInput = z.infer<typeof respondFriendRequestSchema>;
