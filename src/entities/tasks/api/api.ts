import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { TasksListResponse } from './api.dto';

const QUERY_KEYS = {
  tasks: ['tasks', 'list'] as const,
};

export const useTasks = () => {
  return useQuery({
    queryKey: QUERY_KEYS.tasks,
    queryFn: async (): Promise<TasksListResponse> => {
      const response = await api.get<TasksListResponse>('/user/tasks/list');
      return response.data;
    },
  });
};

export const useActivateTask = () => {
  return useMutation({
    mutationFn: async (taskId: number): Promise<void> => {
      await api.post(`/user/tasks/activate/${taskId}`);
    },
    onMutate: async (taskId: number, context) => {
      await context.client.cancelQueries({ queryKey: QUERY_KEYS.tasks });
      const previousTasks = context.client.getQueryData<TasksListResponse>(QUERY_KEYS.tasks);

      context.client.setQueryData<TasksListResponse>(QUERY_KEYS.tasks, (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((task) =>
            task.id === taskId && task.progress
              ? { ...task, progress: { ...task.progress, status: 'ACTIVE' as const } }
              : task
          ),
        };
      });

      return { previousTasks };
    },
    onError: (_err, _variables, onMutateResult, context) => {
      if (onMutateResult?.previousTasks) {
        context.client.setQueryData(QUERY_KEYS.tasks, onMutateResult.previousTasks);
      }
    },
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      void context.client.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    },
  });
};

export const useClaimTaskReward = () => {
  return useMutation({
    mutationFn: async (taskId: number): Promise<void> => {
      await api.post(`/user/tasks/claim/${taskId}`);
    },
    onMutate: async (taskId: number, context) => {
      await context.client.cancelQueries({ queryKey: QUERY_KEYS.tasks });
      const previousTasks = context.client.getQueryData<TasksListResponse>(QUERY_KEYS.tasks);

      context.client.setQueryData<TasksListResponse>(QUERY_KEYS.tasks, (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((task) =>
            task.id === taskId && task.progress
              ? { ...task, progress: { ...task.progress, status: 'REWARDED' as const } }
              : task
          ),
        };
      });

      return { previousTasks };
    },
    onError: (_err, _variables, onMutateResult, context) => {
      if (onMutateResult?.previousTasks) {
        context.client.setQueryData(QUERY_KEYS.tasks, onMutateResult.previousTasks);
      }
    },
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      void context.client.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    },
  });
};
