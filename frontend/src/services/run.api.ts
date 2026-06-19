import { apiClient } from '@/lib/apiClient';

export interface RunSession {
  id: string;
  userId: string;
  startTime: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface RunEndResult {
  runId: string;
  durationSeconds: number;
  distanceKm: number;
  xpEarned: number;
  territoriesCaptured: number;
}

export interface RunHistoryItem {
  id: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  distance: number;
  duration: number;
  xpEarned: number;
  territoriesCaptured: number;
  activityType: 'WALKING' | 'RUNNING' | 'CYCLING';
}

export interface RunHistoryResponse {
  success: boolean;
  message?: string;
  data: {
    runs: RunHistoryItem[];
    page: number;
    limit: number;
  };
}

export const runService = {
  startRun: async (): Promise<RunSession> => {
    const response = await apiClient.post('/runs/start');
    return response.data.data;
  },

  endRun: async (runId: string, activityType: 'WALKING' | 'RUNNING' | 'CYCLING'): Promise<RunEndResult> => {
    const response = await apiClient.post('/runs/end', { runId, activityType });
    return response.data.data;
  },

  getHistory: async (page = 1, limit = 10): Promise<RunHistoryItem[]> => {
    const response = await apiClient.get<RunHistoryResponse>(`/runs/history?page=${page}&limit=${limit}`);
    return response.data?.data?.runs || [];
  },
};
