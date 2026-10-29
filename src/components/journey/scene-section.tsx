'use client';
import { forwardRef, useRef } from 'react';
import { sceneNumber, ui } from '@/content';
import {
  isCasesBlock,
  isInterestBlock,
  isPanoramaBlock,
  isQuestionsBlock,
  isTextBlock,
  type Scene,
} from '@/content/types';
import { lightAt, lightForUnit } from '@/lib/scene-light';
import { SceneAsset } from './scene-asset';
import { ChoiceGroup, InterestPicker, QuestionBlock, TextBlock } from './blocks';

export type SceneSectionProps = {
  scene: Scene;
  index: number;
  shouldLoad: boolean;
  reduced: boolean;
  onGoToScene: (id: string) => void;
  /** slots (elementos) para panorama e cases, montados pela página */
  panoramaSlot?: React.ReactNode;
  casesSlot?: React.ReactNode;
};

/** Lista de "unidades de scroll" de uma cena: cada bloco de texto, cada pergunta e as escolhas. */
export function sceneUnits(scene: Scene): number {
  let n = 0;
  for (const b of scene.blocks) n += isQuestionsBlock(b) ? b.ids.length : 1;
  if (scene.choices) n += 1;
  return n;
}

export const SceneSection = forwardRef<HTMLElement, SceneSectionProps>(function SceneSection(
  { scene, index, shouldLoad, reduced, onGoToScene, panoramaSlot, casesSlot },
  ref,
) {
  const assetRef = useRef<HTMLDivElement | null>(null);
  const n = sceneUnits(scene);
  const label = `${ui.journey.sceneLabel} ${sceneNumber(scene.id)} — ${scene.name}`;
  let unit = 0;
  let qn = 0;
  const totalQ = scene.blocks.filter(isQuestionsBlock).reduce((s, b) => s + b.ids.length, 0);

  const items: React.ReactNode[] = [];
  const push = (node: React.ReactNode, key: string, kind: string) => {
    items.push(
      <div key={key} className="block" data-unit={unit} data-kind={kind} data-light={lightForUnit(scene, unit, n)}>
        {node}
      </div>,
    );
    unit++;
  };

  scene.blocks.forEach((b, i) => {
    if (isTextBlock(b)) {
      push(<TextBlock text={b.text} status={b.status} lead={scene.id === 's0' || scene.id === 's1'} />, `t${i}`, 'text');
    } else if (isInterestBlock(b)) {
      push(<InterestPicker status={b.status} />, `i${i}`, 'interest');
    } else if (isQuestionsBlock(b)) {
      for (const id of b.ids) {
        qn++;
        push(<QuestionBlock id={id} n={qn} total={totalQ} />, `q${id}`, 'question');
      }
    } else if (isPanoramaBlock(b)) {
      push(panoramaSlot ?? <p className="t-label">[PLACEHOLDER — panorama]</p>, `p${i}`, 'panorama');
    } else if (isCasesBlock(b)) {
      push(casesSlot ?? <p className="t-label">[PLACEHOLDER — cases]</p>, `c${i}`, 'cases');
    }
  });
  if (scene.choices) {
    push(<ChoiceGroup scene={scene} choices={scene.choices} onGoToScene={onGoToScene} />, 'choices', 'choices');
  }

  return (
    <section
      ref={ref}
      id={scene.id}
      className="scene"
      data-scene={scene.id}
      data-index={index}
      data-reduced={reduced}
      data-light={lightAt(scene, 0)}
      data-scrim={scene.scrim}
      aria-label={label}
      style={{ ['--n' as string]: n }}
    >
      <div className="scene__pin">
        <SceneAsset scene={scene} shouldLoad={shouldLoad} progressRef={assetRef} reduced={reduced} />
        <div className="scene__content">{items}</div>
      </div>
    </section>
  );
});
