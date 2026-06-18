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

export const runService = {
  startRun: async (): Promise<RunSession> => {
    const response = await apiClient.post('/runs/start');
    return response.data.data;
  },

  endRun: async (runId: string, activityType: 'WALKING' | 'RUNNING' | 'CYCLING'): Promise<RunEndResult> => {
    const response = await apiClient.post('/runs/end', { runId, activityType });
    return response.data.data;
  },
};
