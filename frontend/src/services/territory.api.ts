import { apiClient } from '../lib/apiClient';

export interface Territory {
  id: string;
  gridId: string;
  ownerId: string;
  capturedAt: string;
  lastActivity: string;
  capturePoints: number;
}

export interface TerritoriesResponse {
  success: boolean;
  message?: string;
  data: Territory[];
}

export const territoryService = {
  getMyTerritories: async (): Promise<Territory[]> => {
    const response = await apiClient.get<TerritoriesResponse>('/territories/mine');
    return response.data?.data || [];
  },
};
