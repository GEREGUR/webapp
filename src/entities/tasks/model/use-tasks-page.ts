import { useMemo, useCallback } from 'react';
import type { Task } from '../index';
import { useTasks } from '../api';
import { useTaskActions } from './use-task-actions';
import { useToast } from '@/shared/ui/toast';

interface UseTasksPageResult {
  tasks: Task[];
  baseTasks: Task[];
  bonusTasks: Task[];
  isLoading: boolean;
  isActionPending: boolean;
  onActivateTask: (taskId: number) => void;
  onClaimReward: (taskId: number) => void;
}

export const useTasksPage = (): UseTasksPageResult => {
  const { data, isLoading } = useTasks();
  const {
    activateTask: activateServerTask,
    claimReward: claimServerTask,
    isPending,
  } = useTaskActions();
  const { showToast } = useToast();

  const tasks = useMemo(() => {
    return data?.tasks ?? [];
  }, [data?.tasks]);

  const baseTasks = useMemo(() => tasks.filter((task) => task.type === 'DEFAULT'), [tasks]);
  const bonusTasks = useMemo(() => tasks.filter((task) => task.type !== 'DEFAULT'), [tasks]);

  const handleActivateTask = useCallback(
    (taskId: number) => {
      activateServerTask(taskId);
    },
    [activateServerTask, showToast]
  );

  const handleClaimReward = useCallback(
    (taskId: number) => {
      claimServerTask(taskId);
    },
    [claimServerTask, showToast]
  );

  return {
    tasks,
    baseTasks,
    bonusTasks,
    isLoading,
    isActionPending: isPending,
    onActivateTask: handleActivateTask,
    onClaimReward: handleClaimReward,
  };
};
