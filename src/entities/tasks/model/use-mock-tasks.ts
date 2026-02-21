import { useReducer } from 'react';
import type { Task } from '../index';

const MOCK_TASKS: Task[] = [
  {
    id: 1001,
    title: 'Совершить 10 покупок',
    description: 'Сделайте 10 покупок на рынке',
    type: 'DEFAULT',
    goal_count: 10,
    reward_ton: 0,
    reward_bp: 10,
    reward_exp: 0,
    progress: { current_count: 0, status: 'ACTIVE' },
  },
  {
    id: 1002,
    title: 'Совершить 10 выкупов',
    description: 'Выкупите 10 ордеров',
    type: 'DEFAULT',
    goal_count: 10,
    reward_ton: 0,
    reward_bp: 10,
    reward_exp: 100,
    progress: { current_count: 0, status: 'ACTIVE' },
  },
  {
    id: 1003,
    title: 'Совершить 10 сделок',
    description: 'Закройте 10 сделок',
    type: 'DEFAULT',
    goal_count: 10,
    reward_ton: 0,
    reward_bp: 10,
    reward_exp: 0,
    progress: { current_count: 5, status: 'ACTIVE' },
  },
  {
    id: 1004,
    title: 'Совершить 10 сделок',
    description: 'Закройте 10 сделок',
    type: 'DEFAULT',
    goal_count: 10,
    reward_ton: 0,
    reward_bp: 10,
    reward_exp: 0,
    progress: { current_count: 10, status: 'COMPLETED' },
  },
  {
    id: 2001,
    title: 'Совершить 10 сделок',
    description: 'Закройте 10 сделок',
    type: 'BIO',
    goal_count: 10,
    reward_ton: 0,
    reward_bp: 10,
    reward_exp: 0,
    progress: { current_count: 0, status: 'ACTIVE' },
  },
  {
    id: 2002,
    title: 'Совершить 10 сделок',
    description: 'Закройте 10 сделок',
    type: 'NICK',
    goal_count: 10,
    reward_ton: 0,
    reward_bp: 10,
    reward_exp: 0,
    progress: { current_count: 10, status: 'COMPLETED' },
  },
  {
    id: 2003,
    title: 'Совершить 10 сделок',
    description: 'Закройте 10 сделок',
    type: 'STORY',
    goal_count: 10,
    reward_ton: 0,
    reward_bp: 10,
    reward_exp: 0,
    progress: { current_count: 10, status: 'REWARDED' },
  },
];

type MockTasksAction =
  | { type: 'ACTIVATE_TASK'; payload: number }
  | { type: 'CLAIM_REWARD'; payload: number }
  | { type: 'RESET' };

interface MockTasksState {
  tasks: Task[];
}

function mockTasksReducer(state: MockTasksState, action: MockTasksAction): MockTasksState {
  switch (action.type) {
    case 'ACTIVATE_TASK':
      return {
        tasks: state.tasks.map((task) => {
          if (task.id !== action.payload) return task;
          return {
            ...task,
            progress: {
              current_count: task.progress?.current_count ?? 0,
              status: 'ACTIVE',
            },
          };
        }),
      };
    case 'CLAIM_REWARD':
      return {
        tasks: state.tasks.map((task) => {
          if (task.id !== action.payload) return task;
          return task.progress
            ? {
                ...task,
                progress: {
                  ...task.progress,
                  status: 'REWARDED',
                },
              }
            : task;
        }),
      };
    case 'RESET':
      return { tasks: MOCK_TASKS };
    default:
      return state;
  }
}

export interface UseMockTasksResult {
  tasks: Task[];
  activateTask: (taskId: number) => void;
  claimReward: (taskId: number) => void;
}

export const useMockTasks = (): UseMockTasksResult => {
  const [state, dispatch] = useReducer(mockTasksReducer, { tasks: MOCK_TASKS });

  const activateTask = (taskId: number) => {
    dispatch({ type: 'ACTIVATE_TASK', payload: taskId });
  };

  const claimReward = (taskId: number) => {
    dispatch({ type: 'CLAIM_REWARD', payload: taskId });
  };

  return {
    tasks: state.tasks,
    activateTask,
    claimReward,
  };
};
