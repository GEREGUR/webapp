import type { Task } from '../index';

export const formatReward = (task: Task) => {
  const rewards: Array<{ value: string; className: string }> = [];

  if (task.reward_bp > 0) {
    rewards.push({ value: `${task.reward_bp} BP`, className: 'text-primary' });
  }
  if (task.reward_exp > 0) {
    rewards.push({ value: `${task.reward_exp} EXP`, className: 'text-blue' });
  }
  if (task.reward_ton > 0) {
    rewards.push({ value: `${task.reward_ton} TON`, className: 'text-blue-400' });
  }

  return rewards;
};

export const getTaskAction = (task: Task): 'start' | 'claim' | 'claim-disabled' | 'claimed' => {
  const currentCount = task.progress?.current_count ?? 0;
  const hasReachedGoal = currentCount >= task.goal_count;
  const status = task.progress?.status;

  if (status === 'REWARDED') return 'claimed';
  if (status === 'COMPLETED') return 'claim';
  if (hasReachedGoal) return 'claim-disabled';
  return 'start';
};
