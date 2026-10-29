import type { Scene, SceneLight } from '@/content/types';

/** Lead-in antes do primeiro bloco: a cena respira antes do texto. Compartilhado com o motor. */
export const LEAD_IN = 0.08;

/** Luz da cena em um progresso de scroll (0–1). */
export function lightAt(scene: Pick<Scene, 'light'>, progress: number): SceneLight {
  const l = scene.light ?? 'escura';
  if (typeof l === 'string') return l;
  return progress >= l.switchAt ? l.to : l.from;
}

/** Progresso em que a unidade `unit` (de `n`) passa a ser a ativa. */
export function unitStart(unit: number, n: number): number {
  if (n <= 0) return LEAD_IN;
  return LEAD_IN + (unit / n) * (1 - LEAD_IN);
}

/** Luz vigente quando a unidade está no meio do seu trecho (usada no modo sem movimento). */
export function lightForUnit(scene: Pick<Scene, 'light'>, unit: number, n: number): SceneLight {
  return lightAt(scene, unitStart(unit + 0.5, n));
}

/** Índice da unidade ativa para um progresso; -1 durante o lead-in. */
export function activeUnit(progress: number, n: number): number {
  if (n <= 0) return -1;
  if (progress < LEAD_IN) return -1;
  const p = (progress - LEAD_IN) / (1 - LEAD_IN);
  return Math.min(n - 1, Math.floor(p * n));
}
