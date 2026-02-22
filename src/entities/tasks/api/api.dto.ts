type TaskStatus = 'ACTIVE' | 'COMPLETED' | 'REWARDED';
export type TaskType = 'STORY' | 'BIO' | 'NICK' | 'DEFAULT';

export type ApiTaskType =
  | 'SET_STORY'
  | 'SET_BIO'
  | 'SET_NICK'
  | 'INVITE'
  | 'CREATE_ORDER'
  | 'BUY_ORDER'
  | 'SELF_BUY_ORDER'
  | 'PAYMENT'
  | 'SUM_PAYMENT'
  | 'CONNECT_WALLET'
  | 'SPEND_TON'
  | 'SPEND_BP'
  | 'SUM_EARN_REF';

export interface TaskProgress {
  current_count: number;
  status: TaskStatus;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  type: TaskType;
  goal_count: number;
  reward_ton: number;
  reward_bp: number;
  reward_exp: number;
  progress: TaskProgress | null;
}

export interface TasksListResponse {
  tasks: Task[];
}

export interface ApiTask {
  id: number;
  type: ApiTaskType;
  goal_count: number;
  reward_ton: number | null;
  reward_bp: number | null;
  reward_exp: number | null;
  progress: TaskProgress | null;
}
