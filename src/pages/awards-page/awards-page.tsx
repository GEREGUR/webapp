import { type FC } from 'react';
import { Page } from '@/pages/page';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';
import { useTasks, useClaimTaskReward } from '@/entities/tasks';
import { useToast } from '@/shared/ui/toast';

export const AwardsPage: FC = () => {
  const { data, isLoading } = useTasks();
  const claimReward = useClaimTaskReward();
  const { showToast } = useToast();

  const handleClaim = (taskId: number) => {
    claimReward.mutate(taskId, {
      onSuccess: () => showToast('Награда получена!', 'success'),
      onError: () => showToast('Ошибка', 'error'),
    });
  };

  if (isLoading) {
    return (
      <Page back>
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      </Page>
    );
  }

  const activeTasks =
    data?.tasks.filter((t) => !t.progress || t.progress.status === 'ACTIVE') || [];
  const completedTasks = data?.tasks.filter((t) => t.progress?.status === 'COMPLETED') || [];
  const rewardedTasks = data?.tasks.filter((t) => t.progress?.status === 'REWARDED') || [];

  return (
    <Page back>
      <h1 className="mb-4 text-xl font-bold text-white">Задачи</h1>

      {activeTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm text-white/60">Активные</h2>
          {activeTasks.map((task) => (
            <Card key={task.id} className="mb-3">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-white">{task.title}</h3>
                  <p className="text-sm text-white/60">{task.description}</p>
                </div>
              </div>

              {task.progress && (
                <div className="mb-2">
                  <div className="mb-1 flex justify-between text-xs text-white/60">
                    <span>Прогресс</span>
                    <span>
                      {task.progress.current_count}/{task.goal_count}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${(task.progress.current_count / task.goal_count) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-2">
                  {task.reward_bp > 0 && (
                    <span className="text-primary text-sm">+{task.reward_bp} BP</span>
                  )}
                  {task.reward_ton > 0 && (
                    <span className="text-sm text-blue-400">+{task.reward_ton} TON</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm text-white/60">Готовы к награде</h2>
          {completedTasks.map((task) => (
            <Card key={task.id} className="border-primary/50 mb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-white">{task.title}</h3>
                  <div className="mt-1 flex gap-2">
                    {task.reward_bp > 0 && (
                      <span className="text-primary text-sm">+{task.reward_bp} BP</span>
                    )}
                    {task.reward_ton > 0 && (
                      <span className="text-sm text-blue-400">+{task.reward_ton} TON</span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleClaim(task.id)}
                  disabled={claimReward.isPending}
                >
                  Получить
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {rewardedTasks.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm text-white/60">Завершённые</h2>
          {rewardedTasks.map((task) => (
            <Card key={task.id} className="mb-3 opacity-50">
              <h3 className="font-medium text-white">{task.title}</h3>
              <div className="mt-1 flex gap-2">
                {task.reward_bp > 0 && (
                  <span className="text-primary text-sm">+{task.reward_bp} BP</span>
                )}
                {task.reward_ton > 0 && (
                  <span className="text-sm text-blue-400">+{task.reward_ton} TON</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {(!data || data.tasks.length === 0) && (
        <Card>
          <p className="text-center text-white/60">Нет доступных задач</p>
        </Card>
      )}
    </Page>
  );
};
