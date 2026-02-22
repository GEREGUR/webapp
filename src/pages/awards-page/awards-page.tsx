import { type FC } from 'react';
import { Page } from '@/pages/page';
import { Loader } from '@/shared/ui/spinner';
import { useTasksPage } from '@/entities/tasks/model/use-tasks-page';
import { TaskList } from './ui/task-row';

export const AwardsPage: FC = () => {
  const { baseTasks, bonusTasks, isLoading, isActionPending, onActivateTask, onClaimReward } =
    useTasksPage();

  const taskSection = baseTasks.length > 0 ? baseTasks : bonusTasks;

  if (isLoading) {
    return (
      <Page back>
        <Loader />
      </Page>
    );
  }

  return (
    <Page back>
      <div className="space-y-10">
        <section>
          <h1 className="mb-5 text-[20px] leading-[20.03px] font-semibold text-white">Задания</h1>
          <TaskList
            tasks={taskSection}
            isPending={isActionPending}
            onStart={onActivateTask}
            onClaim={onClaimReward}
          />
        </section>

        {baseTasks.length > 0 && bonusTasks.length > 0 && (
          <section>
            <h2 className="mb-5 text-[20px] leading-[20.03px] font-semibold text-white">Бонусы</h2>
            <TaskList
              tasks={bonusTasks}
              isPending={isActionPending}
              onStart={onActivateTask}
              onClaim={onClaimReward}
            />
          </section>
        )}
      </div>
    </Page>
  );
};
