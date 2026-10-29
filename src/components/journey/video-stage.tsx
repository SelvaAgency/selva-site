'use client';
import { sceneList } from '@/content';
import type { Scene } from '@/content/types';
import { sourcesFor, useSceneManifest, useVariant } from './assets/use-scene-manifest';
import { VideoScrubAsset } from './assets/video-scrub-asset';

/**
 * Palco único de vídeo: fixo no fundo, nunca rola. O scroll da jornada controla uma linha do tempo
 * contínua; cada cena com asset define o trecho que toca e em que fração do scroll.
 * O motor emite o progresso em cada [data-clip] e marca o ativo com data-active; a troca é só
 * visibilidade, com os vizinhos já carregados e decodificados (último quadro de um = primeiro do seguinte).
 */
export function VideoStage() {
  const clips = sceneList.filter((s) => s.asset?.kind === 'video');
  if (!clips.length) return null;
  return (
    <div className="video-stage" aria-hidden="true">
      {clips.map((scene, i) => (
        <StageClip key={scene.id} scene={scene} first={i === 0} />
      ))}
    </div>
  );
}

function StageClip({ scene, first }: { scene: Scene; first: boolean }) {
  const manifest = useSceneManifest(scene.asset?.id);
  const variant = useVariant();
  if (!manifest) return null;
  const sources = sourcesFor(manifest, variant);
  if (!sources.length) return null;
  return (
    <VideoScrubAsset
      key={variant}
      clipId={scene.id}
      active={first}
      video={sources[0]}
      sources={sources}
      poster={manifest.posters[variant]?.path}
      shouldLoad
    />
  );
}
