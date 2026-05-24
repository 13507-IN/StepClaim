import { api } from './api';
import { APIResponse } from '../types';

export const socialService = {
  /**
   * Send a friend invite by username.
   */
  async sendFriendRequest(username: string): Promise<APIResponse<any>> {
    const { data } = await api.post('/social/request', { username });
    return data;
  },

  /**
   * Accept or reject a friend invitation.
   */
  async respondToRequest(requestId: string, action: 'ACCEPT' | 'DECLINE' | 'BLOCK'): Promise<APIResponse<any>> {
    const { data } = await api.post('/social/respond', { requestId, action });
    return data;
  },

  /**
   * Fetch user's accepted friends.
   */
  async getFriends(): Promise<APIResponse<any[]>> {
    const { data } = await api.get('/social/friends');
    return data;
  },

  /**
   * Fetch user's pending received and sent friend requests.
   */
  async getPendingRequests(): Promise<APIResponse<{ incoming: any[]; outgoing: any[] }>> {
    const { data } = await api.get('/social/pending');
    return data;
  },

  /**
   * Fetch chronological activity timeline logs (captures, runs, levels, badges).
   */
  async getActivityFeed(page = 1, limit = 20): Promise<APIResponse<any[]>> {
    const { data } = await api.get(`/social/activity-feed?page=${page}&limit=${limit}`);
    return data;
  },

  /**
   * Search database for user profiles.
   */
  async searchUsers(query: string): Promise<APIResponse<any[]>> {
    const { data } = await api.get(`/social/search?q=${encodeURIComponent(query)}`);
    return data;
  },
};
export default socialService;
