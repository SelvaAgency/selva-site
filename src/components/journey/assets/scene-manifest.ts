/** Manifesto gerado por scripts/prepare-scene.mjs. */
export type Variant = 'desktop' | 'mobile';

export type VideoEntry = {
  id: string;
  variant: Variant;
  path: string;
  bytes: number;
  width: number;
  height: number;
  codec: string;
  fps: number;
  duration: number;
};
export type FramesEntry = {
  variant: Variant;
  dir: string;
  count: number;
  pad: number;
  ext: string;
  bytes: number;
  width: number;
  height: number;
};
export type SceneManifest = {
  scene: string;
  generatedAt: string;
  fps: number;
  master: { width: number; height: number; fps: number; duration: number; codec: string };
  videos: VideoEntry[];
  frames: FramesEntry[];
  posters: Record<Variant, { path: string; bytes: number }>;
};

export async function loadManifest(scene: string): Promise<SceneManifest | null> {
  try {
    const r = await fetch(`/scenes/${scene}/manifest.json`, { cache: 'no-store' });
    if (!r.ok) return null;
    return (await r.json()) as SceneManifest;
  } catch {
    return null;
  }
}

/** Mobile = retrato estreito: recebe o recorte central vertical. */
export function pickVariant(): Variant {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia('(max-width: 760px) and (orientation: portrait)').matches ? 'mobile' : 'desktop';
}

export const framePath = (f: FramesEntry, index: number) => `${f.dir}${String(index + 1).padStart(f.pad, '0')}.${f.ext}`;
