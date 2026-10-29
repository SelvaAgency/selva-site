'use client';
import { useMemo } from 'react';
import { sceneIndex, sceneList } from '@/content';
import type { Scene } from '@/content/types';
import { useJourney } from '@/state/journey';
import { sourcesFor, useSceneManifest, useVariant } from './assets/use-scene-manifest';
import { VideoScrubAsset } from './assets/video-scrub-asset';

/**
 * Palco único de vídeo: fixo no fundo, nunca rola. O scroll da jornada controla uma linha do tempo
 * contínua; cada cena com asset define o trecho que toca e em que fração do scroll.
 *
 * Janela deslizante: só o trecho atual, o anterior e o seguinte ficam montados e decodificados
 * (`window` = quantos vizinhos de cada lado). O anterior é pré-posicionado no último quadro e o
 * seguinte no primeiro, para a troca na fronteira ser instantânea; o que sai da janela é desmontado
 * e o navegador libera o decodificador. Memória não cresce com o número de trechos.
 */
export function VideoStage({ window: win = 1 }: { window?: number }) {
  const clips = useMemo(
    () => sceneList.map((scene, sceneIdx) => ({ scene, sceneIdx })).filter((c) => c.scene.asset?.kind === 'video'),
    [],
  );
  const current = useJourney((s) => s.currentScene);
  const curSceneIdx = Math.max(0, sceneIndex(current));
  // clipe corrente = o último cujo índice de cena é ≤ cena atual (cenas sem asset seguram o anterior)
  let cur = 0;
  clips.forEach((c, i) => { if (c.sceneIdx <= curSceneIdx) cur = i; });
  if (!clips.length) return null;
  return (
    <div className="video-stage" aria-hidden="true" data-window={win} data-current={clips[cur]?.scene.id}>
      {clips.map((c, i) => (
        <ClipSlot
          key={c.scene.id}
          scene={c.scene}
          active={i === cur}
          loaded={Math.abs(i - cur) <= win}
          initialProgress={i < cur ? 1 : i > cur ? 0 : undefined}
        />
      ))}
    </div>
  );
}

function ClipSlot({ scene, active, loaded, initialProgress }: { scene: Scene; active: boolean; loaded: boolean; initialProgress?: number }) {
  const manifest = useSceneManifest(scene.asset?.id);
  const variant = useVariant();
  // memoizado: o efeito do VideoScrubAsset depende de `sources` e não deve rodar a cada render
  const sources = useMemo(() => (manifest ? sourcesFor(manifest, variant) : []), [manifest, variant]);
  if (!loaded || !sources.length) {
    // fora da janela: só um marcador, sem <video>; o motor ainda encontra [data-clip] e não quebra
    return <div className="scene-asset scene-asset--unloaded" data-clip={scene.id} data-active={active} data-loaded="false" />;
  }
  return (
    <VideoScrubAsset
      key={variant}
      clipId={scene.id}
      active={active}
      video={sources[0]}
      sources={sources}
      poster={manifest!.posters[variant]?.path}
      shouldLoad
      initialProgress={initialProgress}
    />
  );
}
