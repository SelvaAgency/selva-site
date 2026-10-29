/**
 * Cálculo do panorama preliminar. Função pura, sem efeitos.
 * Regras vêm de content/scoring.json; valores de alternativa, de content/questions.json.
 * Nunca expõe número ao usuário: só status descritivo e texto condicional.
 */
import type { Dimension, PanoramaStatus, QuestionsFile, ScoringFile } from '@/content/types';
import { DIMENSIONS } from '@/content/types';
import type { Answer } from './journey-types';

export type DimensionResult = {
  dimension: Dimension;
  label: string;
  status: PanoramaStatus;
  statusLabel: string;
  text: string;
  answered: number;
  skipped: number;
  total: number;
};

export type Panorama = {
  dimensions: DimensionResult[];
  primaryDimension: Dimension | null;
  disclaimer: string;
};

export type PanoramaInput = {
  answers: Answer[];
  interest: string | null;
  questions: QuestionsFile;
  scoring: ScoringFile;
};

/** Média dos valores das respostas da dimensão (0 a 2). Uso interno — não exibir. */
export function dimensionScore(
  dimension: Dimension,
  answers: Answer[],
  questions: QuestionsFile,
): { mean: number | null; answered: number; skipped: number; total: number } {
  const qs = questions.diagnostic.filter((q) => q.dimension === dimension);
  let sum = 0;
  let answered = 0;
  let skipped = 0;
  for (const q of qs) {
    const a = answers.find((x) => x.questionId === q.id);
    if (!a || a.optionId === null) {
      skipped++;
      continue;
    }
    const opt = q.options.find((o) => o.id === a.optionId);
    if (!opt) {
      skipped++;
      continue;
    }
    sum += opt.value;
    answered++;
  }
  return { mean: answered ? sum / answered : null, answered, skipped, total: qs.length };
}

export function statusFor(mean: number | null, skipped: number, scoring: ScoringFile): PanoramaStatus {
  if (mean === null || skipped >= 2) return 'sem-dados';
  for (const t of scoring.method.thresholds) if (mean >= t.min) return t.status;
  return 'atencao';
}

export function dimensionOrder(interest: string | null, questions: QuestionsFile): Dimension[] {
  const related = questions.interest.options.find((o) => o.id === interest)?.relatedDimension ?? null;
  if (!related) return [...DIMENSIONS];
  return [related, ...DIMENSIONS.filter((d) => d !== related)];
}

export function computePanorama({ answers, interest, questions, scoring }: PanoramaInput): Panorama {
  const order = dimensionOrder(interest, questions);
  const related = questions.interest.options.find((o) => o.id === interest)?.relatedDimension ?? null;
  const dimensions = order.map((d) => {
    const s = dimensionScore(d, answers, questions);
    const status = statusFor(s.mean, s.skipped, scoring);
    const dim = scoring.dimensions[d];
    return {
      dimension: d,
      label: dim.label,
      status,
      statusLabel: scoring.statusLabels[status],
      text: dim.texts[status],
      answered: s.answered,
      skipped: s.skipped,
      total: s.total,
    };
  });
  return { dimensions, primaryDimension: related, disclaimer: scoring.disclaimer.text };
}
