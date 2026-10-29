/** Tipos do conteúdo em /content. Espelham os JSONs; validados em src/content/index.ts */

export type ApprovalStatus = 'aprovado' | 'conceito' | 'proposta';
export type Dimension = 'infra' | 'marca' | 'performance';

export type TextBlock = { text: string; status: ApprovalStatus };
export type InterestBlock = { type: 'interest'; ref: string; status: ApprovalStatus };
export type QuestionsBlock = { type: 'questions'; ids: string[] };
export type PanoramaBlock = { type: 'panorama'; ref: string };
export type CasesBlock = { type: 'cases'; source: string };
export type SceneBlock = TextBlock | InterestBlock | QuestionsBlock | PanoramaBlock | CasesBlock;

export type Choice = { id: string; label: string; goTo: string };
export type Choices = { status: ApprovalStatus; options: Choice[] };

export type Scene = {
  id: string;
  name: string;
  dimension?: Dimension;
  visual: string;
  blocks: SceneBlock[];
  choices?: Choices;
  notes?: string;
};

export type ScenesFile = { _nota?: string; scenes: Scene[] };

export type InterestOption = {
  id: string;
  label: string;
  relatedDimension: Dimension | null;
  serviceSlug: string | null;
};
export type Interest = { status: ApprovalStatus; prompt: string; options: InterestOption[] };

export type QuestionOption = { id: string; label: string; value: number };
export type Question = {
  id: string;
  dimension: Dimension;
  status: ApprovalStatus;
  prompt: string;
  options: QuestionOption[];
};
export type QuestionsFile = { interest: Interest; diagnostic: Question[] };

export type PanoramaStatus = 'bem-avaliada' | 'oportunidade' | 'atencao' | 'sem-dados';
export type Threshold = { min: number; status: Exclude<PanoramaStatus, 'sem-dados'> };
export type ScoringFile = {
  _nota?: string;
  status: ApprovalStatus;
  method: {
    valuePerAnswer: string;
    dimensionScore: string;
    skipped: string;
    insufficientData: string;
    thresholds: Threshold[];
    display: string;
    interestUse: string;
  };
  statusLabels: Record<PanoramaStatus, string>;
  disclaimer: { status: ApprovalStatus; text: string };
  dimensions: Record<Dimension, { label: string; texts: Record<PanoramaStatus, string> }>;
};

export type Service = {
  slug: string;
  name: string;
  status: string;
  body: string;
  cases: string[];
};
export type ServiceGroup = { id: string; label: string; description: string; services: Service[] };
export type ServicesFile = {
  _nota?: string;
  groups: ServiceGroup[];
  servicePageTemplate: { sections: string[] };
};

export const DIMENSIONS: readonly Dimension[] = ['infra', 'marca', 'performance'] as const;
export const PANORAMA_STATUSES: readonly PanoramaStatus[] = [
  'bem-avaliada',
  'oportunidade',
  'atencao',
  'sem-dados',
] as const;

export function isTextBlock(b: SceneBlock): b is TextBlock {
  return 'text' in b;
}
export function isQuestionsBlock(b: SceneBlock): b is QuestionsBlock {
  return 'type' in b && b.type === 'questions';
}
export function isInterestBlock(b: SceneBlock): b is InterestBlock {
  return 'type' in b && b.type === 'interest';
}
export function isPanoramaBlock(b: SceneBlock): b is PanoramaBlock {
  return 'type' in b && b.type === 'panorama';
}
export function isCasesBlock(b: SceneBlock): b is CasesBlock {
  return 'type' in b && b.type === 'cases';
}
