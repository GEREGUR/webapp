import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { TasksListResponse } from './api.dto';

export const QUERY_KEYS = {
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number): Promise<void> => {
      await api.post(`/user/tasks/activate/${taskId}`);
    },
    onMutate: async (taskId: number) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.tasks });
      const previousTasks = queryClient.getQueryData<TasksListResponse>(QUERY_KEYS.tasks);
      
      queryClient.setQueryData<TasksListResponse>(QUERY_KEYS.tasks, (old) => {
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
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(QUERY_KEYS.tasks, context.previousTasks);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number): Promise<void> => {
      await api.post(`/user/tasks/completed/${taskId}`);
    },
    onMutate: async (taskId: number) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.tasks });
      const previousTasks = queryClient.getQueryData<TasksListResponse>(QUERY_KEYS.tasks);
      
      queryClient.setQueryData<TasksListResponse>(QUERY_KEYS.tasks, (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((task) => 
            task.id === taskId && task.progress
              ? { ...task, progress: { ...task.progress, status: 'COMPLETED' as const } }
              : task
          ),
        };
      });

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(QUERY_KEYS.tasks, context.previousTasks);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    },
  });
};

export const useClaimTaskReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number): Promise<void> => {
      await api.post(`/user/tasks/claim/${taskId}`);
    },
    onMutate: async (taskId: number) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.tasks });
      const previousTasks = queryClient.getQueryData<TasksListResponse>(QUERY_KEYS.tasks);
      
      queryClient.setQueryData<TasksListResponse>(QUERY_KEYS.tasks, (old) => {
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
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(QUERY_KEYS.tasks, context.previousTasks);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    },
  });
};
