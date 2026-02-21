import { type FC } from 'react';
import { Scale } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import type { Task } from '@/entities/tasks';
import { formatReward, getTaskAction } from '@/entities/tasks/lib/task-utils';

interface TaskRowProps {
  task: Task;
  isLast: boolean;
  isPending: boolean;
  onStart: (taskId: number) => void;
  onClaim: (taskId: number) => void;
}

export const TaskRow: FC<TaskRowProps> = ({ task, isLast, isPending, onStart, onClaim }) => {
  const action = getTaskAction(task);
  const currentCount = task.progress?.current_count ?? 0;
  const rewards = formatReward(task);

  return (
    <div className={`flex h-[60px] items-center gap-3 px-4 ${!isLast ? 'border-b border-[#272525]' : ''}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white/90">
        <Scale className="h-6 w-6" strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-['SF_Pro_Display'] text-[20px] leading-[20.03px] font-semibold text-white">
          {task.title} ({currentCount}/{task.goal_count})
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm leading-none">
          <span className="text-accent">Награда:</span>
          {rewards.map((reward, rewardIndex) => (
            <span key={`${task.id}-${reward.value}`} className={reward.className}>
              {reward.value}
              {rewardIndex !== rewards.length - 1 && <span className="text-white/60"> и </span>}
            </span>
          ))}
        </div>
      </div>

      {action === 'start' && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => onStart(task.id)}
          className="h-[26px] min-w-[70px] rounded-[7.4px] bg-white px-[10px] text-xs font-semibold text-black hover:bg-white/90"
        >
          Начать
        </Button>
      )}
      {action === 'claim' && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => onClaim(task.id)}
          className="h-[26px] min-w-[70px] rounded-[7.4px] bg-[#AA55D0] px-[10px] text-xs font-semibold text-white hover:brightness-110"
        >
          Забрать
        </Button>
      )}
      {action === 'claim-disabled' && (
        <Button
          size="sm"
          disabled
          className="h-[26px] min-w-[70px] rounded-[7.4px] bg-white/12 px-[10px] text-xs font-semibold text-white/45"
        >
          Забрать
        </Button>
      )}
      {action === 'claimed' && (
        <Button
          size="sm"
          disabled
          className="h-[26px] min-w-[70px] rounded-[7.4px] bg-white/12 px-[10px] text-xs font-semibold text-white/45"
        >
          Забрано
        </Button>
      )}
    </div>
  );
};

interface TaskListProps {
  tasks: Task[];
  isPending: boolean;
  onStart: (taskId: number) => void;
  onClaim: (taskId: number) => void;
}

export const TaskList: FC<TaskListProps> = ({ tasks, isPending, onStart, onClaim }) => {
  if (tasks.length === 0) {
    return (
      <Card>
        <p className="text-center text-white/60">Нет доступных задач</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-[18px] border-[#272525] bg-[#131214] p-0">
      {tasks.map((task, index) => (
        <TaskRow
          key={task.id}
          task={task}
          isLast={index === tasks.length - 1}
          isPending={isPending}
          onStart={onStart}
          onClaim={onClaim}
        />
      ))}
    </Card>
  );
};
