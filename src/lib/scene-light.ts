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
export function unitStart(unit: number, n: number, leadIn = LEAD_IN): number {
  if (n <= 0) return leadIn;
  return leadIn + (unit / n) * (1 - leadIn);
}

/** Luz vigente quando a unidade está no meio do seu trecho (usada no modo sem movimento). */
export function lightForUnit(scene: Pick<Scene, 'light' | 'leadIn'>, unit: number, n: number): SceneLight {
  return lightAt(scene, unitStart(unit + 0.5, n, scene.leadIn ?? LEAD_IN));
}

/** Índice da unidade ativa para um progresso; -1 durante o lead-in. */
export function activeUnit(progress: number, n: number, leadIn = LEAD_IN): number {
  if (n <= 0) return -1;
  if (progress < leadIn) return -1;
  const p = (progress - leadIn) / (1 - leadIn);
  return Math.min(n - 1, Math.floor(p * n));
}

/** Progresso do asset: roda inteiro em `span` da cena e segura o último quadro depois. */
export function assetProgress(scene: Pick<Scene, 'asset'>, progress: number): number {
  const span = scene.asset?.span ?? 1;
  return Math.min(1, Math.max(0, span > 0 ? progress / span : progress));
}
