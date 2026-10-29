'use client';
import type { Scene } from '@/content/types';
import { useSceneManifest, useVariant } from './use-scene-manifest';

/** Fallback estático (movimento reduzido ou sem palco): pôster do asset da cena. */
export function PosterAsset({ scene, fallback }: { scene: Scene; fallback: React.ReactNode }) {
  const manifest = useSceneManifest(scene.asset?.id);
  const variant = useVariant();
  const poster = manifest?.posters[variant]?.path;
  if (!poster) return <>{fallback}</>;
  return <div className="scene-asset scene-asset--poster" style={{ backgroundImage: `url(${poster})` }} aria-hidden="true" />;
}
