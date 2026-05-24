import { api } from './api';
import { APIResponse, Run } from '../types';

export const runService = {
  /**
   * Start a run tracking session.
   */
  async startRun(): Promise<APIResponse<Run>> {
    const { data } = await api.post('/runs/start');
    return data;
  },

  /**
   * End and commit an active run tracking session.
   */
  async endRun(
    runId: string,
    activityType: 'WALKING' | 'RUNNING' | 'CYCLING',
  ): Promise<
    APIResponse<{
      run: Run;
      xpGained: number;
      leveledUp: boolean;
      previousLevel: number;
      newLevel: number;
      streakMilestone: boolean;
    }>
  > {
    const { data } = await api.post('/runs/end', { runId, activityType });
    return data;
  },

  /**
   * Fetch paginated user run logs history.
   */
  async getRuns(page = 1, limit = 10): Promise<APIResponse<{ runs: Run[]; page: number; limit: number }>> {
    const { data } = await api.get(`/runs/history?page=${page}&limit=${limit}`);
    return data;
  },

  /**
   * Fetch detailed path coordinates of a specific run session.
   */
  async getRunById(id: string): Promise<APIResponse<Run>> {
    const { data } = await api.get(`/runs/${id}`);
    return data;
  },
};
export default runService;
