import { FACTOR_RANGE, SCORE_RANGE } from './ranges';

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const normalizeFactor = (value: number) => clamp(value, FACTOR_RANGE.min, FACTOR_RANGE.max);
export const normalizeScore = (value: number) => clamp(value, SCORE_RANGE.min, SCORE_RANGE.max);

export const round2 = (n: number) => Math.round(n * 100) / 100;

export const weightedScore = (entries: Array<{ weight: number; factor: number }>) => {
  const totalWeight = entries.reduce((acc, current) => acc + current.weight, 0);
  if (totalWeight <= 0) return 1;
  const score = entries.reduce((acc, current) => acc + current.weight * normalizeFactor(current.factor), 0) / totalWeight;
  return normalizeScore(score);
};
