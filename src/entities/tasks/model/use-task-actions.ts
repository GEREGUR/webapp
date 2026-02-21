import { useActivateTask, useClaimTaskReward } from '../api';
import { useToast } from '@/shared/ui/toast';

export interface UseTaskActionsResult {
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
      onError: () => showToast('Ошибка', 'error'),
    });
  };

  const claimReward = (taskId: number) => {
    claimRewardMutation.mutate(taskId, {
      onSuccess: () => showToast('Награда получена!', 'success'),
      onError: () => showToast('Ошибка', 'error'),
    });
  };

  return {
    activateTask,
    claimReward,
    isPending: activateTaskMutation.isPending || claimRewardMutation.isPending,
  };
};
