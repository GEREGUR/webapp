import { useActivateTask, useClaimTaskReward } from '../api';
import { useToast } from '@/shared/ui/toast';

interface UseTaskActionsResult {
  activateTask: (taskId: number) => void;
  claimReward: (taskId: number) => void;
  isPending: boolean;
}

export const useTaskActions = (): UseTaskActionsResult => {
  const activateTaskMutation = useActivateTask();
  const claimRewardMutation = useClaimTaskReward();
  const { showToast } = useToast();

  const activateTask = (taskId: number) => {
    activateTaskMutation.mutate(taskId, {
      onSuccess: () => showToast('Задание активировано', 'success'),
      onError: () => showToast('Не удалось активировать задание', 'error'),
    });
  };

  const claimReward = (taskId: number) => {
    claimRewardMutation.mutate(taskId, {
      onSuccess: () => showToast('Награда получена!', 'success'),
      onError: () => showToast('Не удалось получить награду', 'error'),
    });
  };

  return {
    activateTask,
    claimReward,
    isPending: activateTaskMutation.isPending || claimRewardMutation.isPending,
  };
};
