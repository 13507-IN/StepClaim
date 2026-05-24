import { api } from './api';
import { APIResponse, Territory } from '../types';

export const territoryService = {
  /**
   * Fetch all H3 hexagon cells (both captured and empty) surrounding coordinates.
   */
  async getNearbyTerritories(
    latitude: number,
    longitude: number,
  ): Promise<
    APIResponse<
      {
        gridId: string;
        boundary: [number, number][];
        captured: boolean;
        owner: { id: string; username: string; avatarUrl: string | null } | null;
      }[]
    >
  > {
    const { data } = await api.get(`/territories/nearby?latitude=${latitude}&longitude=${longitude}`);
    return data;
  },

  /**
   * Fetch all territories owned/captured by the authenticated user.
   */
  async getMyTerritories(): Promise<APIResponse<any[]>> {
    const { data } = await api.get('/territories/mine');
    return data;
  },

  /**
   * Fetch aggregate capture statistics (such as personal and global captured counts).
   */
  async getTerritoryStats(): Promise<
    APIResponse<{
      userOwnedCount: number;
      globalCapturedCount: number;
    }>
  > {
    const { data } = await api.get('/territories/stats');
    return data;
  },
};
export default territoryService;
