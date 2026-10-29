'use client';
import { useEffect, type RefObject } from 'react';

export const SCENE_PROGRESS_EVENT = 'sceneprogress';

/** Emite progresso (0–1) para um asset sem passar pelo React. O motor chama isto a cada atualização. */
export function emitSceneProgress(el: HTMLElement, progress: number) {
  el.style.setProperty('--p', progress.toFixed(4));
  el.dispatchEvent(new CustomEvent<number>(SCENE_PROGRESS_EVENT, { detail: progress }));
}

/** Assina o progresso no elemento raiz do asset. */
export function useSceneProgress(ref: RefObject<HTMLElement | null>, onProgress: (p: number) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = (e: Event) => onProgress((e as CustomEvent<number>).detail);
    el.addEventListener(SCENE_PROGRESS_EVENT, h);
    return () => el.removeEventListener(SCENE_PROGRESS_EVENT, h);
  }, [ref, onProgress]);
}
