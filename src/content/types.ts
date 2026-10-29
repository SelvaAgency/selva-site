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

export type SceneLight = 'clara' | 'escura';
/** Luz constante ou transição por posição de scroll (switchAt em progresso 0–1 da cena). */
export type SceneLightSpec = SceneLight | { from: SceneLight; to: SceneLight; switchAt: number };

export type Scene = {
  id: string;
  name: string;
  dimension?: Dimension;
  /** luz: define cor do texto, scrim e HUD; pode mudar no meio da cena. Padrão: escura */
  light?: SceneLightSpec;
  /** asset real da cena (manifest em public/scenes/<id>); sem isso, placeholder.
   *  span: fração do progresso da cena em que o asset roda do início ao fim (padrão 1); depois segura o último quadro */
  asset?: { kind: 'video' | 'frames'; id: string; span?: number };
  /** fração da cena antes do primeiro bloco (padrão 0.08): dá tempo ao asset antes do texto */
  leadIn?: number;
  /** 'forte' reforça o degradê atrás do texto no mobile (quando a área calma do quadro some no recorte vertical) */
  scrim?: 'forte';
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

export type CaseImage = { src: string; alt: string };
export type CaseItem = {
  slug: string;
  name: string;
  kind: string;
  tags: string[];
  bg: string;
  fg: string;
  cover: string;
  hero: string;
  coverPosition: string;
  gallery: CaseImage[];
  summary: string;
  results: string;
};
export type CasesFile = { _nota?: string; status: string; imagesDir: string; cases: CaseItem[] };
