import { useMemo } from 'react';

export interface BattlePassProgressState {
  currentLevel: number;
  nextLevel: number;
  progress: number;
  currentExp: number;
}

export interface UseBattlePassProgressProps {
  currentLevel?: number;
  nextLevel?: number;
  progress?: number;
  expPerLevel?: number;
}

const DEFAULT_EXP_PER_LEVEL = 1000;

export const useBattlePassProgress = ({
  currentLevel = 1,
  nextLevel = 2,
  progress = 0,
  expPerLevel = DEFAULT_EXP_PER_LEVEL,
}: UseBattlePassProgressProps): BattlePassProgressState => {
  return useMemo(() => {
    const normalizedProgress = Math.min(100, Math.max(0, progress));
    const currentExp = Math.round((normalizedProgress / 100) * expPerLevel);

    return {
      currentLevel,
      nextLevel,
      progress: normalizedProgress,
      currentExp,
    };
  }, [currentLevel, nextLevel, progress, expPerLevel]);
};
