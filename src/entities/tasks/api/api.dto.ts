export type TaskStatus = 'ACTIVE' | 'COMPLETED' | 'REWARDED';
export type TaskType = 'STORY' | 'BIO' | 'NICK' | 'DEFAULT';

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
