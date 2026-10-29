'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { Scene } from '@/content/types';
import { loadManifest, pickVariant, type SceneManifest, type Variant } from './scene-manifest';
import { VideoScrubAsset } from './video-scrub-asset';

const subscribeViewport = (cb: () => void) => {
  const mq = window.matchMedia('(max-width: 760px) and (orientation: portrait)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

/** Ordem de preferência das fontes: HEVC (Safari, Chrome com hardware) → H.264 (todos) → VP9 (Chrome/Android sem H.264) */
const PREFERENCE = ['hevc-gop6', 'h264-gop6', 'vp9-gop6'];

export type VideoSceneAssetProps = {
  scene: Scene;
  shouldLoad: boolean;
  progressRef?: React.RefObject<HTMLDivElement | null>;
  /** o que mostrar enquanto o manifest carrega ou se não existir */
  fallback: React.ReactNode;
};

/** Asset de vídeo real de uma cena: lê o manifest gerado por scripts/prepare-scene.mjs e escolhe variante e fontes. */
export function VideoSceneAsset({ scene, shouldLoad, fallback }: VideoSceneAssetProps) {
  const id = scene.asset?.id ?? scene.id;
  const [manifest, setManifest] = useState<SceneManifest | null | undefined>(undefined);
  const variant: Variant = useSyncExternalStore(subscribeViewport, pickVariant, () => 'desktop' as Variant);

  useEffect(() => {
    let alive = true;
    void loadManifest(id).then((m) => { if (alive) setManifest(m); });
    return () => { alive = false; };
  }, [id]);

  if (!manifest) return <>{fallback}</>;
  const sources = PREFERENCE.map((p) => manifest.videos.find((v) => v.id === p && v.variant === variant)).filter((v): v is NonNullable<typeof v> => !!v);
  if (!sources.length) return <>{fallback}</>;
  return <VideoScrubAsset key={variant} video={sources[0]} sources={sources} poster={manifest.posters[variant]?.path} shouldLoad={shouldLoad} />;
}
