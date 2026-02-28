import { type FC } from 'react';
import { shareStory } from '@tma.js/sdk-react';
import BpIcon from '@/shared/assets/bp-white-sm.svg?react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import type { Task } from '@/entities/tasks';
import { formatReward, getTaskAction } from '@/entities/tasks/lib/task-utils';

interface TaskRowProps {
  task: Task;
  isLast: boolean;
  isPending: boolean;
  onStart: (taskId: number) => void;
  onCheck: (taskId: number) => void;
  onClaim: (taskId: number) => void;
}

const storyImageUrl = import.meta.env.VITE_STORY_IMG_URL as string | undefined;
const url = import.meta.env.VITE_TG_BOT_URL as string | undefined;
const name = import.meta.env.APP_NAME as string | undefined;

const TaskRow: FC<TaskRowProps> = ({ task, isLast, isPending, onStart, onCheck, onClaim }) => {
  const action = getTaskAction(task);
  const currentCount = task.progress?.current_count ?? 0;
  const rewards = formatReward(task);

  const handleStart = () => {
    if (task.type === 'STORY' && storyImageUrl && shareStory.isAvailable()) {
      const options =
        url && name
          ? {
              widgetLink: { url, name },
            }
          : undefined;

      shareStory(storyImageUrl, options);
    }

    onStart(task.id);
  };

  return (
    <div
      className={`flex h-[60px] items-center gap-3 px-4 ${!isLast ? 'border-b border-[#272525]' : ''} [&>button]:min-w-[70px]`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white/90">
        <BpIcon className="size-8" strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm leading-tight font-normal text-white">
          {task.title} ({currentCount}/{task.goal_count})
        </p>
        <div className="text-accent mt-1 flex flex-wrap items-center gap-1.5 text-xs leading-none">
          <span className="text-[#FFAA00]">Награда:</span>
          {rewards.map((reward, rewardIndex) => (
            <span key={`${task.id}-${reward.value}`} className={reward.className}>
              {reward.value}
              {rewardIndex !== rewards.length - 1 && (
                <span className="text-accent">
                  {' '}
                  <span className="text-[#FFAA00]">и</span>{' '}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="w-[75px] [&>button]:w-full">
        {action === 'start' && (
          <Button
            size="sm"
            disabled={isPending}
            onClick={handleStart}
            className="rounded-md bg-white px-[10px] text-[10px] font-normal text-black hover:bg-white/90"
          >
            Начать
          </Button>
        )}
        {action === 'claim' && (
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => onClaim(task.id)}
            className="roundend-md bg-[#AA55D0] px-[10px] text-[10px] font-normal text-white hover:brightness-110"
          >
            Забрать
          </Button>
        )}
        {action === 'check' && (
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => onCheck(task.id)}
            className="rounded-md bg-white px-[10px] text-[10px] font-normal text-black hover:bg-white/90"
          >
            Проверить
          </Button>
        )}
        {action === 'claim-disabled' && (
          <Button
            size="sm"
            disabled
            variant="secondary"
            className="rounded-md bg-white/12 px-[10px] text-[10px] font-normal text-white/45"
          >
            Забрать
          </Button>
        )}
        {action === 'claimed' && (
          <Button
            size="sm"
            disabled
            variant="purple"
            className="rounded-md px-[10px] text-[10px] font-normal"
          >
            Получено
          </Button>
        )}
      </div>
    </div>
  );
};

interface TaskListProps {
  tasks: Task[];
  isPending: boolean;
  onStart: (taskId: number) => void;
  onCheck: (taskId: number) => void;
  onClaim: (taskId: number) => void;
}

export const TaskList: FC<TaskListProps> = ({ tasks, isPending, onStart, onCheck, onClaim }) => {
  if (tasks.length === 0) {
    return (
      <Card>
        <p className="text-center text-white/60">Нет доступных задач</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-[10px] border-[#272525] bg-[#131214] p-0">
      {tasks.map((task, index) => (
        <TaskRow
          key={task.id}
          task={task}
          isLast={index === tasks.length - 1}
          isPending={isPending}
          onStart={onStart}
          onCheck={onCheck}
          onClaim={onClaim}
        />
      ))}
    </Card>
  );
};
