import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { ApiTask, ApiTaskError, TasksListResponse, TaskStatus } from './api.dto';
import { mapTaskDescription, mapTaskTitle, mapTaskType } from '../lib/task-utils';
import { mockApiTasks, mockBonusTasks } from './mock-data';
import { AxiosError } from 'axios';

const QUERY_KEYS = {
  tasks: ['tasks', 'list'] as const,
};

type TaskMutationContext = {
  previousTasks?: TasksListResponse;
};

export const useTasks = () => {
  return useQuery({
    queryKey: QUERY_KEYS.tasks,
    queryFn: async () => {
      try {
        const response = await api.get<ApiTask[]>('/tasks/list');
        return { tasks: mapTasks(response.data) };
      } catch (error) {
        console.error('API Error useTasks:', error);
        //WARN: remove later - return mock data on error
        const allTasks = [...mockApiTasks, ...mockBonusTasks];
        return { tasks: mapTasks(allTasks) };
      }
    },
  });
};

const mapTasks = (tasks: ApiTask[]) => {
  return tasks.map((task) => {
    const taskType = mapTaskType(task.type);
    return {
      ...task,
      type: taskType,
      reward_ton: task.reward_ton ?? 0,
      reward_bp: task.reward_bp ?? 0,
      reward_exp: task.reward_exp ?? 0,
      title: mapTaskTitle(task.type),
      description: mapTaskDescription(task.type),
    };
  });
};

export const useActivateTask = () =>
  createTaskMutation((taskId) => `/tasks/activate/${taskId}`, 'ACTIVE');

export const useCompleteTask = () =>
  createTaskMutation((taskId) => `/tasks/completed/${taskId}`, 'COMPLETED');

export const useClaimTaskReward = () =>
  createTaskMutation((taskId) => `/tasks/claim/${taskId}`, 'REWARDED');

export const createTaskMutation = (
  urlBuilder: (taskId: number) => string,
  optimisticStatus: TaskStatus
) => {
  return useMutation<void, AxiosError<ApiTaskError>, number, TaskMutationContext>({
    mutationFn: async (taskId) => {
      await api.post(urlBuilder(taskId), null);
    },

    onMutate: async (taskId, context) => {
      await context.client.cancelQueries({ queryKey: QUERY_KEYS.tasks });

      const previousTasks = context.client.getQueryData<TasksListResponse>(QUERY_KEYS.tasks);

      context.client.setQueryData<TasksListResponse>(QUERY_KEYS.tasks, (old) => {
        if (!old) return old;

        return {
          ...old,
          tasks: old.tasks.map((task) =>
            task.id === taskId && task.progress
              ? {
                  ...task,
                  progress: {
                    ...task.progress,
                    status: optimisticStatus,
                  },
                }
              : task
          ),
        };
      });

      return { previousTasks };
    },

    onError: (err, _taskId, onMutateResult, context) => {
      const msg = err.response?.data.detail;

      if (
        msg &&
        ['Reward already claimed', 'Task already activated', 'Task already completed'].includes(msg)
      ) {
        void context.client.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
        return;
      }

      if (onMutateResult?.previousTasks) {
        context.client.setQueryData(QUERY_KEYS.tasks, onMutateResult.previousTasks);
      }
    },

    onSuccess: (_data, _variables, _onMutateResult, context) => {
      void context.client.invalidateQueries({
        queryKey: QUERY_KEYS.tasks,
      });
    },
  });
};
