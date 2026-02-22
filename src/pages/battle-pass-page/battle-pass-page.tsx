import { type FC } from 'react';
import { Page } from '@/pages/page';
import { BattlePassProgress, useBattlePassProgress } from '@/features/battle-pass-progress';

interface BattlePassPageProps {
  currentLevel?: number;
  nextLevel?: number;
  progress?: number;
}

export const BattlePassPage: FC<BattlePassPageProps> = ({
  currentLevel = 5,
  nextLevel = 6,
  progress = 65,
}) => {
  const {
    currentLevel: level,
    nextLevel: next,
    progress: percent,
    currentExp,
  } = useBattlePassProgress({
    currentLevel,
    nextLevel,
    progress,
  });

  return (
    <Page back>
      <div className="p-4">
        <BattlePassProgress
          currentLevel={level}
          nextLevel={next}
          progress={percent}
          currentExp={currentExp}
        />
      </div>
    </Page>
  );
};
