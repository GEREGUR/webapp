import { api } from '@/shared/api';
import type { TasksListResponse } from './api.dto';

export const tasksApi = {
  // Get all tasks with progress
  getTasks: async (): Promise<TasksListResponse> => {
    const response = await api.get<TasksListResponse>('/user/tasks/list');
    return response.data;
  },

  // Activate task
  activateTask: async (taskId: number): Promise<void> => {
    await api.post(`/user/tasks/activate/${taskId}`);
  },

  // Complete task (for Story, Bio, Nick tasks)
  completeTask: async (taskId: number): Promise<void> => {
    await api.post(`/user/tasks/completed/${taskId}`);
  },

  // Claim task reward
  claimTaskReward: async (taskId: number): Promise<void> => {
    await api.post(`/user/tasks/claim/${taskId}`);
  },
};
