'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { loadManifest, pickVariant, type SceneManifest, type Variant, type VideoEntry } from './scene-manifest';

const subscribeViewport = (cb: () => void) => {
  const mq = window.matchMedia('(max-width: 760px) and (orientation: portrait)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

/** Ordem de preferência das fontes: HEVC (Safari, Chrome com hardware) → H.264 (todos) → VP9 (Chrome/Android sem H.264) */
export const SOURCE_PREFERENCE = ['hevc-gop6', 'h264-gop6', 'vp9-gop6'];

/** Lê o manifest de public/scenes/<id> (undefined = carregando, null = não existe). */
export function useSceneManifest(id: string | undefined): SceneManifest | null | undefined {
  const [manifest, setManifest] = useState<SceneManifest | null | undefined>(undefined);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    void loadManifest(id).then((m) => { if (alive) setManifest(m); });
    return () => { alive = false; };
  }, [id]);
  return id ? manifest : null;
}

/** desktop 16:9 ou mobile 9:16, reage à rotação */
export function useVariant(): Variant {
  return useSyncExternalStore(subscribeViewport, pickVariant, () => 'desktop' as Variant);
}

export function sourcesFor(manifest: SceneManifest, variant: Variant): VideoEntry[] {
  return SOURCE_PREFERENCE.map((p) => manifest.videos.find((v) => v.id === p && v.variant === variant)).filter((v): v is VideoEntry => !!v);
}
