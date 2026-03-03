import { AxiosError } from 'axios';
import { useToast } from '@/shared/ui/toast';
import { ApiTaskError, useActivateTask, useClaimTaskReward, useCompleteTask } from '../api';

interface UseTaskActionsResult {
  activateTask: (taskId: number) => void;
  completeTask: (taskId: number) => void;
  claimReward: (taskId: number) => void;
  isPending: boolean;
}

export const useTaskActions = (): UseTaskActionsResult => {
  const activateTaskMutation = useActivateTask();
  const completeTaskMutation = useCompleteTask();
  const claimRewardMutation = useClaimTaskReward();

  const { showToast } = useToast();

  const handleTaskMutationError = (
    err: AxiosError<ApiTaskError>,
    mutationType: 'CLAIM' | 'ACTIVATE' | 'COMPLETE'
  ) => {
    const msg = err.response?.data.detail;

    switch (mutationType) {
      case 'CLAIM':
        if (msg === 'Reward already claimed') {
          showToast('Награда уже получена', 'info');
          return;
        }
        break;
      case 'ACTIVATE':
        if (msg === 'Task already activated') {
          showToast('Задание уже активировано', 'info');
          return;
        }
        showToast('Не удалось активировать задание', 'error');
        break;
      case 'COMPLETE':
        if (msg === 'Task already completed') {
          showToast('Задание уже проверено', 'info');
          return;
        }
        showToast('Не удалось проверить задание', 'error');
        break;
    }
  };

  const activateTask = (taskId: number) => {
    activateTaskMutation.mutate(taskId, {
      onSuccess: () => showToast('Задание активировано', 'success'),
      onError: (err) => handleTaskMutationError(err, 'ACTIVATE'),
    });
  };

  const completeTask = (taskId: number) => {
    completeTaskMutation.mutate(taskId, {
      onSuccess: () => showToast('Задание отправлено на проверку', 'success'),
      onError: (err) => handleTaskMutationError(err, 'COMPLETE'),
    });
  };

  const claimReward = (taskId: number) => {
    claimRewardMutation.mutate(taskId, {
      onSuccess: () => showToast('Награда получена!', 'success'),
      onError: (err) => handleTaskMutationError(err, 'CLAIM'),
    });
  };

  return {
    activateTask,
    completeTask,
    claimReward,
    isPending:
      activateTaskMutation.isPending ||
      completeTaskMutation.isPending ||
      claimRewardMutation.isPending,
  };
};
