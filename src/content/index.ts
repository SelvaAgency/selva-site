/**
 * Ponto único de acesso ao conteúdo. Valida a coerência dos JSONs na importação
 * (falha no build/teste se algo estiver inconsistente).
 */
import scenesJson from '@content/scenes.json';
import questionsJson from '@content/questions.json';
import scoringJson from '@content/scoring.json';
import servicesJson from '@content/services.json';
import uiJson from '@content/ui.json';
import casesJson from '@content/cases.json';
import { validateContent } from './validate';
import type { CaseItem, CasesFile, Dimension, Question, QuestionsFile, Scene, ScenesFile, ScoringFile, Service, ServicesFile } from './types';

export const scenes = scenesJson as ScenesFile;
export const questions = questionsJson as QuestionsFile;
export const scoring = scoringJson as ScoringFile;
export const services = servicesJson as ServicesFile;
export const ui = uiJson;
export const cases = casesJson as CasesFile;
export const caseBySlug = (slug: string): CaseItem | undefined => cases.cases.find((c) => c.slug === slug);

const errors = validateContent({ scenes, questions, scoring, services });
if (errors.length) {
  throw new Error(`Conteúdo inválido:\n- ${errors.join('\n- ')}`);
}

export const sceneList: Scene[] = scenes.scenes;
export const sceneById = new Map(sceneList.map((s) => [s.id, s]));
export const questionById = new Map<string, Question>(questions.diagnostic.map((q) => [q.id, q]));
export const questionsByDimension = (d: Dimension): Question[] => questions.diagnostic.filter((q) => q.dimension === d);

/** Serviços com slug real (exclui placeholders entre colchetes). */
export const publishedServices: Service[] = services.groups
  .flatMap((g) => g.services)
  .filter((s) => !s.slug.startsWith('['));

export const serviceBySlug = (slug: string): Service | undefined => publishedServices.find((s) => s.slug === slug);

/** Número da cena como no briefing: s0 → "0", s0b → "0B", s1 → "1". */
export function sceneNumber(id: string): string {
  return id.replace(/^s/, '').toUpperCase();
}

export function sceneIndex(id: string): number {
  return sceneList.findIndex((s) => s.id === id);
}

export * from './types';
