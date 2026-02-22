import { useMemo, useCallback } from 'react';
import type { Task } from '../index';
import { useTasks } from '../api';
import { useMockTasks } from './use-mock-tasks';
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
    tasks: mockTasks,
    activateTask: activateMockTask,
    claimReward: claimMockReward,
  } = useMockTasks();
  const {
    activateTask: activateServerTask,
    claimReward: claimServerTask,
    isPending,
  } = useTaskActions();
  const { showToast } = useToast();

  const hasServerTasks = Boolean(data?.tasks && data.tasks.length > 0);

  const tasks = useMemo(() => {
    if (hasServerTasks) {
      return data?.tasks ?? [];
    }
    return mockTasks;
  }, [data?.tasks, hasServerTasks, mockTasks]);

  const baseTasks = useMemo(() => tasks.filter((task) => task.type === 'DEFAULT'), [tasks]);
  const bonusTasks = useMemo(() => tasks.filter((task) => task.type !== 'DEFAULT'), [tasks]);

  const handleActivateTask = useCallback(
    (taskId: number) => {
      if (!hasServerTasks) {
        activateMockTask(taskId);
        showToast('Задание активировано', 'success');
        return;
      }
      activateServerTask(taskId);
    },
    [hasServerTasks, activateMockTask, activateServerTask, showToast]
  );

  const handleClaimReward = useCallback(
    (taskId: number) => {
      if (!hasServerTasks) {
        claimMockReward(taskId);
        showToast('Награда получена!', 'success');
        return;
      }
      claimServerTask(taskId);
    },
    [hasServerTasks, claimMockReward, claimServerTask, showToast]
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
