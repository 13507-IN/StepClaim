import { api } from './api';
import { APIResponse } from '../types';

export const leaderboardService = {
  /**
   * Fetch leaderboard rankings based on XP, total distance, or captured grids.
   */
  async getLeaderboard(
    type: 'XP' | 'DISTANCE' | 'TERRITORIES',
    period: 'GLOBAL' | 'WEEKLY' | 'FRIENDS',
    page = 1,
    limit = 20,
  ): Promise<
    APIResponse<{
      rankings: any[];
      type: string;
      period: string;
      page: number;
      limit: number;
    }>
  > {
    const { data } = await api.get(`/leaderboard?type=${type}&period=${period}&page=${page}&limit=${limit}`);
    return data;
  },
};
export default leaderboardService;
