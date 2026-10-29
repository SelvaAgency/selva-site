'use client';
import { sceneIndex, sceneList, sceneNumber, ui } from '@/content';
import { useJourney } from '@/state/journey';

export function JourneyHud({ onRestart, onTop }: { onRestart: () => void; onTop: () => void }) {
  const current = useJourney((s) => s.currentScene);
  const idx = Math.max(0, sceneIndex(current));
  const scene = sceneList[idx];
  return (
    <>
      <header className="hud hud--top">
        <button type="button" className="logo" onClick={onTop} aria-label={ui.nav.home}>
          <span className="logo__pill">{ui.brand.name.toUpperCase()}</span>
        </button>
        <span className="t-label hud__badge">{ui.dev.prototypeBadge}</span>
        <button type="button" className="btn btn--small" onClick={onRestart}>
          {ui.journey.restart}
        </button>
      </header>
      <footer className="hud hud--bottom">
        <p className="t-label hud__scene" aria-live="polite">
          {ui.journey.sceneLabel} {sceneNumber(current)} — {scene?.name}
        </p>
        <p className="t-label hud__hint" aria-hidden="true">{ui.journey.scrollHint}</p>
        <div className="hud__bar" role="progressbar" aria-label={ui.journey.progressLabel} aria-valuemin={0} aria-valuemax={sceneList.length - 1} aria-valuenow={idx}>
          <span />
        </div>
      </footer>
    </>
  );
}
