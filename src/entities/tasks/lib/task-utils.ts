import type { ApiTaskType, Task, TaskType } from '../index';

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

export const mapTaskType = (type: ApiTaskType): TaskType => {
  if (type === 'SET_STORY') return 'STORY';
  if (type === 'SET_BIO') return 'BIO';
  if (type === 'SET_NICK') return 'NICK';
  return 'DEFAULT';
};

export const mapTaskTitle = (type: ApiTaskType): string => {
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

export const mapTaskDescription = (type: ApiTaskType): string => {
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
