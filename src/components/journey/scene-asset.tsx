'use client';
import { useEffect, useRef } from 'react';
import { sceneNumber, ui } from '@/content';
import type { Scene } from '@/content/types';

/**
 * API de asset de cena. O mesmo contrato serve para placeholder, sequência de frames e vídeo:
 * o motor passa `progress` (0–1 dentro da cena) via atributo e CSS var, sem re-render por frame.
 * `shouldLoad` chega como true para a cena atual e a próxima (carregamento progressivo).
 */
export type SceneAssetKind = 'placeholder' | 'frames' | 'video';

export type SceneAssetProps = {
  scene: Scene;
  kind?: SceneAssetKind;
  shouldLoad: boolean;
  /** ref para o motor escrever `--p` (progresso) sem passar pelo React */
  progressRef?: React.RefObject<HTMLDivElement | null>;
};

export function SceneAsset({ scene, kind = 'placeholder', shouldLoad, progressRef }: SceneAssetProps) {
  if (kind !== 'placeholder') {
    // frames/vídeo chegam na Fase 3/4 com o mesmo contrato
    return <PlaceholderAsset scene={scene} shouldLoad={shouldLoad} progressRef={progressRef} />;
  }
  return <PlaceholderAsset scene={scene} shouldLoad={shouldLoad} progressRef={progressRef} />;
}

function PlaceholderAsset({ scene, shouldLoad, progressRef }: Omit<SceneAssetProps, 'kind' | 'index'>) {
  const local = useRef<HTMLDivElement | null>(null);
  const ref = progressRef ?? local;
  useEffect(() => {
    if (ref.current && !ref.current.style.getPropertyValue('--p')) ref.current.style.setProperty('--p', '0');
  }, [ref]);
  const label = ui.placeholders.scene.replace('{name}', `${sceneNumber(scene.id)} · ${scene.name}`);
  return (
    <div ref={ref} className="scene-asset scene-asset--placeholder" data-loaded={shouldLoad} aria-hidden="true">
      <div className="scene-asset__layer scene-asset__layer--far" />
      <div className="scene-asset__layer scene-asset__layer--near" />
      <div className="scene-asset__grid" />
      <p className="scene-asset__label t-label">{label}</p>
      <p className="scene-asset__visual t-label">{scene.visual}</p>
    </div>
  );
}
