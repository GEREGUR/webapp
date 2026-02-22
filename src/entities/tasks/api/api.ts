import { useQuery, useMutation } from '@tanstack/react-query';
import { api, getRequiredUserId } from '@/shared/api';
import type { ApiTask, ApiTaskType, TaskType, TasksListResponse } from './api.dto';

const QUERY_KEYS = {
  tasks: ['tasks', 'list'] as const,
};

export const useTasks = () => {
  return useQuery({
    queryKey: QUERY_KEYS.tasks,
    queryFn: async (): Promise<TasksListResponse> => {
      const response = await api.get<ApiTask[]>('/tasks/list', {
        params: {
          user_id: getRequiredUserId(),
        },
      });

      const tasks = response.data.map((task) => {
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

      return { tasks };
    },
  });
};

export const useActivateTask = () => {
  return useMutation({
    mutationFn: async (taskId: number): Promise<void> => {
      await api.post(`/tasks/activate/${taskId}`, null, {
        params: {
          user_id: getRequiredUserId(),
        },
      });
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
      await api.post(`/tasks/claim/${taskId}`, null, {
        params: {
          user_id: getRequiredUserId(),
        },
      });
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

const mapTaskType = (type: ApiTaskType): TaskType => {
  if (type === 'SET_STORY') return 'STORY';
  if (type === 'SET_BIO') return 'BIO';
  if (type === 'SET_NICK') return 'NICK';
  return 'DEFAULT';
};

const mapTaskTitle = (type: ApiTaskType): string => {
  switch (type) {
    case 'SET_STORY':
      return 'Опубликовать историю';
    case 'SET_BIO':
      return 'Обновить описание профиля';
    case 'SET_NICK':
      return 'Установить никнейм';
    case 'INVITE':
      return 'Пригласить друзей';
    case 'CREATE_ORDER':
      return 'Создать ордер';
    case 'BUY_ORDER':
      return 'Купить ордер';
    case 'SELF_BUY_ORDER':
      return 'Выкупить свой ордер';
    case 'PAYMENT':
      return 'Совершить пополнение';
    case 'SUM_PAYMENT':
      return 'Пополнить на заданную сумму';
    case 'CONNECT_WALLET':
      return 'Подключить кошелёк';
    case 'SPEND_TON':
      return 'Потратить TON';
    case 'SPEND_BP':
      return 'Потратить BP';
    case 'SUM_EARN_REF':
      return 'Заработать на рефералах';
    default:
      return 'Задача';
  }
};

const mapTaskDescription = (type: ApiTaskType): string => {
  switch (type) {
    case 'SET_STORY':
      return 'Опубликуйте историю в Telegram';
    case 'SET_BIO':
      return 'Обновите био в Telegram профиле';
    case 'SET_NICK':
      return 'Установите никнейм в Telegram';
    case 'INVITE':
      return 'Приглашайте новых пользователей';
    case 'CREATE_ORDER':
      return 'Создайте ордер на продажу BP';
    case 'BUY_ORDER':
      return 'Совершите покупку ордера';
    case 'SELF_BUY_ORDER':
      return 'Закройте собственный ордер';
    case 'PAYMENT':
      return 'Сделайте пополнение TON';
    case 'SUM_PAYMENT':
      return 'Пополните баланс на целевую сумму';
    case 'CONNECT_WALLET':
      return 'Привяжите TON-кошелёк';
    case 'SPEND_TON':
      return 'Потратьте TON в приложении';
    case 'SPEND_BP':
      return 'Потратьте BP в приложении';
    case 'SUM_EARN_REF':
      return 'Накопите доход с рефералов';
    default:
      return 'Выполните условие задачи';
  }
};
