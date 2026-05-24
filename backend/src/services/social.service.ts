import { FriendRepository } from '../repositories/friend.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { Friend, FriendStatus } from '@prisma/client';

export class SocialService {
  private friendRepo = new FriendRepository();
  private userRepo = new UserRepository();
  private activityRepo = new ActivityRepository();

  /**
   * Send a friend request by target username.
   */
  async sendFriendRequest(requesterId: string, receiverUsername: string): Promise<Friend> {
    const receiver = await this.userRepo.findByUsername(receiverUsername);
    if (!receiver) {
      throw new Error('User not found');
    }

    if (requesterId === receiver.id) {
      throw new Error('You cannot add yourself as a friend');
    }

    // Check for existing friendship
    const existing = await this.friendRepo.findRequest(requesterId, receiver.id);
    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new Error('You are already friends');
      } else if (existing.status === 'PENDING') {
        throw new Error('A friend request is already pending between you');
      } else if (existing.status === 'BLOCKED') {
        throw new Error('Block list constraint prevents adding this friend');
      }
    }

    return this.friendRepo.sendRequest(requesterId, receiver.id);
  }

  /**
   * Respond to a pending friend request (Accept or Decline/Delete).
   */
  async respondToRequest(
    requestId: string,
    userId: string,
    action: 'ACCEPT' | 'DECLINE' | 'BLOCK',
  ): Promise<any> {
    const prisma = (await import('../config/database.js')).prisma;
    const request = await prisma.friend.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    if (request.receiverId !== userId && action !== 'BLOCK') {
      throw new Error('You are not authorized to respond to this request');
    }

    if (action === 'ACCEPT') {
      return this.friendRepo.updateStatus(requestId, 'ACCEPTED');
    } else if (action === 'DECLINE') {
      return this.friendRepo.deleteRequest(requestId);
    } else if (action === 'BLOCK') {
      return this.friendRepo.updateStatus(requestId, 'BLOCKED');
    }

    throw new Error('Invalid action');
  }

  /**
   * Get all accepted friends.
   */
  async getFriends(userId: string): Promise<any[]> {
    return this.friendRepo.findFriends(userId);
  }

  /**
   * Get both incoming and outgoing pending invitations.
   */
  async getPendingRequests(userId: string): Promise<{ incoming: any[]; outgoing: any[] }> {
    const incoming = await this.friendRepo.findPendingReceived(userId);
    const outgoing = await this.friendRepo.findPendingSent(userId);
    return { incoming, outgoing };
  }

  /**
   * Fetch social activity timeline for feed page.
   */
  async getActivityFeed(userId: string, limit = 20, page = 1): Promise<any[]> {
    const skip = (page - 1) * limit;
    return this.activityRepo.getFriendsFeed(userId, limit, skip);
  }

  /**
   * Search database for user profiles.
   */
  async searchUsers(query: string, excludeUserId: string): Promise<any[]> {
    return this.userRepo.searchUsers(query, excludeUserId);
  }
}
