import type { Dimension } from '@/content/types';

/** Modelo de estado da jornada (CLAUDE.md). optionId null = pergunta pulada. */
export type Answer = {
  dimension: Dimension;
  questionId: string;
  optionId: string | null;
  at?: number;
};

export type Route = 'A' | 'B';

export type Journey = {
  route: Route | null;
  interest: string | null;
  currentScene: string;
  answers: Answer[];
};
