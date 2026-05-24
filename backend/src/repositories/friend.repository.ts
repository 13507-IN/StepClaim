import { prisma } from '../config/database';
import { Friend, FriendStatus } from '@prisma/client';

/**
 * Repository handling user social friendships database operations.
 */
export class FriendRepository {
  /**
   * Send or create a new friend request.
   */
  async sendRequest(requesterId: string, receiverId: string): Promise<Friend> {
    return prisma.friend.create({
      data: {
        requesterId,
        receiverId,
        status: 'PENDING',
      },
    });
  }

  /**
   * Find a specific friendship connection between two users.
   */
  async findRequest(userId1: string, userId2: string): Promise<Friend | null> {
    return prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: userId1, receiverId: userId2 },
          { requesterId: userId2, receiverId: userId1 },
        ],
      },
    });
  }

  /**
   * Update the status of a request (e.g. ACCEPTED, BLOCKED).
   */
  async updateStatus(id: string, status: FriendStatus): Promise<Friend> {
    return prisma.friend.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Remove a friendship connection (cancel request, unfriend, or unblock).
   */
  async deleteRequest(id: string): Promise<Friend> {
    return prisma.friend.delete({
      where: { id },
    });
  }

  /**
   * Retrieve a user's full accepted friends list.
   */
  async findFriends(userId: string): Promise<any[]> {
    const friendships = await prisma.friend.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            level: true,
            streak: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            level: true,
            streak: true,
          },
        },
      },
    });

    return friendships.map((f) => (f.requesterId === userId ? f.receiver : f.requester));
  }

  /**
   * Retrieve all pending friend requests received by a user.
   */
  async findPendingReceived(userId: string): Promise<any[]> {
    return prisma.friend.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            level: true,
          },
        },
      },
    });
  }

  /**
   * Retrieve all pending friend requests sent by a user.
   */
  async findPendingSent(userId: string): Promise<any[]> {
    return prisma.friend.findMany({
      where: {
        requesterId: userId,
        status: 'PENDING',
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            level: true,
          },
        },
      },
    });
  }
}
