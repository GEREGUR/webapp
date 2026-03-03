import { type FC } from 'react';
import { Page } from '@/pages/page';
import { Loader } from '@/shared/ui/spinner';
import { useTasksPage } from '@/entities/tasks/model/use-tasks-page';
import { TaskList } from './ui/task-row';
import { useToast } from '@/shared/ui/toast';

export const AwardsPage: FC = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const {
    baseTasks,
    bonusTasks,
    isLoading,
    isActionPending,
    onActivateTask,
    onCompleteTask,
    onClaimReward,
  } = useTasksPage();

  const { showToast } = useToast();

  const filteredBonusTasks = bonusTasks.filter((task) => isMobile || task.type !== 'STORY');

  const taskSection = baseTasks.length > 0 ? baseTasks : filteredBonusTasks;

  if (isLoading) {
    return (
      <Page back>
        <Loader />
      </Page>
    );
  }

  return (
    <Page back>
      <button className="text-white" onClick={() => showToast('hello', 'success')}>
        wassup
      </button>
      <div className="space-y-10">
        <section>
          <h1 className="mb-4 text-[20px] leading-[20.03px] font-semibold text-white">Задания</h1>
          <TaskList
            tasks={taskSection}
            isPending={isActionPending}
            onStart={onActivateTask}
            onCheck={onCompleteTask}
            onClaim={onClaimReward}
          />
        </section>

        {baseTasks.length > 0 && filteredBonusTasks.length > 0 && (
          <section>
            <h2 className="mb-4 text-[20px] leading-[20.03px] font-semibold text-white">Бонусы</h2>
            <TaskList
              tasks={filteredBonusTasks}
              isPending={isActionPending}
              onStart={onActivateTask}
              onCheck={onCompleteTask}
              onClaim={onClaimReward}
            />
          </section>
        )}
      </div>
    </Page>
  );
};
