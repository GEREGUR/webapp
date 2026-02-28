import type { Task } from '../index';

export const formatReward = (task: Task) => {
  const rewards: Array<{ value: string; className: string }> = [];

  if (task.reward_bp > 0) {
    rewards.push({ value: `${task.reward_bp} BP`, className: 'text-purple-bp' });
  }
  if (task.reward_exp > 0) {
    rewards.push({ value: `${task.reward_exp} EXP`, className: 'text-green-bp' });
  }
  if (task.reward_ton > 0) {
    rewards.push({ value: `${task.reward_ton} TON`, className: 'text-blue-400' });
  }

  return rewards;
};

export const getTaskAction = (
  task: Task
): 'start' | 'check' | 'claim' | 'claim-disabled' | 'claimed' => {
  const currentCount = task.progress?.current_count ?? 0;
  const hasReachedGoal = currentCount >= task.goal_count;
  const status = task.progress?.status;
  const isProfileTask = task.type === 'STORY' || task.type === 'BIO' || task.type === 'NICK';

  if (status === 'REWARDED') return 'claimed';
  if (status === 'COMPLETED') return 'claim';
  if (isProfileTask && status === 'ACTIVE') return 'check';
  if (status === 'ACTIVE') return 'claim-disabled';
  if (hasReachedGoal) return 'claim-disabled';
  return 'start';
};
