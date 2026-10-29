'use client';
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { sceneIndex, sceneList } from '@/content';
import { track } from '@/lib/events';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useJourney } from '@/state/journey';
import { JourneyHud } from './journey-hud';
import { SceneSection } from './scene-section';
import './journey.css';

gsap.registerPlugin(ScrollTrigger);

const subscribeNoop = () => () => {};

/** Lead-in antes do primeiro bloco: a cena respira antes do texto. */
const LEAD_IN = 0.08;

function activeUnit(progress: number, n: number): number {
  if (n <= 0) return -1;
  if (progress < LEAD_IN) return -1;
  const p = (progress - LEAD_IN) / (1 - LEAD_IN);
  return Math.min(n - 1, Math.floor(p * n));
}

function applyProgress(section: HTMLElement, progress: number) {
  const asset = section.querySelector<HTMLElement>('.scene-asset');
  if (asset) asset.style.setProperty('--p', progress.toFixed(4));
  const blocks = section.querySelectorAll<HTMLElement>('.block');
  const n = blocks.length;
  const active = activeUnit(progress, n);
  blocks.forEach((b, i) => {
    const state = i === active ? 'active' : i < active ? 'past' : 'future';
    if (b.dataset.state !== state) b.dataset.state = state;
  });
}

/** Slots como elementos (não funções): atravessam a fronteira server → client. */
export type JourneyExperienceProps = {
  panoramaSlot?: React.ReactNode;
  casesSlot?: React.ReactNode;
};

export function JourneyExperience({ panoramaSlot, casesSlot }: JourneyExperienceProps) {
  const reduced = useReducedMotion();
  const sections = useRef<(HTMLElement | null)[]>([]);
  const lenisRef = useRef<Lenis | null>(null);
  const setScene = useJourney((s) => s.setScene);
  const restart = useJourney((s) => s.restart);
  const currentScene = useJourney((s) => s.currentScene);
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const currentIndex = Math.max(0, sceneIndex(currentScene));

  useEffect(() => {
    track({ type: 'enter' });
  }, []);

  const scrollToScene = useCallback(
    (id: string, immediate = false) => {
      const el = sections.current[sceneIndex(id)];
      if (!el) return;
      // +1px: fica dentro da cena de destino, não na fronteira com a anterior
      if (lenisRef.current) lenisRef.current.scrollTo(el, { immediate, offset: 1 });
      else window.scrollTo({ top: el.offsetTop + 1, behavior: immediate ? 'auto' : 'smooth' });
    },
    [],
  );

  // Motor com movimento: Lenis + ScrollTrigger com scrub por cena
  useEffect(() => {
    if (reduced || !hydrated) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const triggers = sections.current.map((el, i) => {
      if (!el) return null;
      const id = sceneList[i].id;
      applyProgress(el, 0);
      return ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => applyProgress(el, self.progress),
        onEnter: () => setScene(id),
        onEnterBack: () => setScene(id),
      });
    });
    const bar = document.querySelector<HTMLElement>('.hud__bar > span');
    const global = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => bar?.style.setProperty('--jp', self.progress.toFixed(4)),
    });

    return () => {
      triggers.forEach((t) => t?.kill());
      global.kill();
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced, hydrated, setScene]);

  // Movimento reduzido: sem scrub; blocos aparecem por interseção, cena atual por interseção
  useEffect(() => {
    if (!reduced || !hydrated) return;
    const blocks = document.querySelectorAll<HTMLElement>('.scene .block');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.setAttribute('data-state', 'active'); }),
      { threshold: 0.2 },
    );
    blocks.forEach((b) => io.observe(b));
    const ioScene = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setScene((e.target as HTMLElement).dataset.scene ?? 's0'); }),
      { rootMargin: '-40% 0px -40% 0px' },
    );
    sections.current.forEach((s) => s && ioScene.observe(s));
    return () => { io.disconnect(); ioScene.disconnect(); };
  }, [reduced, hydrated, setScene]);

  // Retomar a jornada vindo de uma rota interna (?retomar=1)
  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('retomar') !== '1') return;
    const id = useJourney.getState().currentScene;
    const t = setTimeout(() => scrollToScene(id, true), 50);
    window.history.replaceState(null, '', window.location.pathname);
    return () => clearTimeout(t);
  }, [hydrated, scrollToScene]);

  const onRestart = useCallback(() => {
    restart();
    scrollToScene('s0');
  }, [restart, scrollToScene]);

  const scenes = useMemo(() => sceneList, []);

  return (
    <div className="journey" data-reduced={reduced}>
      <JourneyHud onRestart={onRestart} onTop={() => scrollToScene('s0')} />
      <main id="conteudo">
        {scenes.map((scene, i) => (
          <SceneSection
            key={scene.id}
            ref={(el) => { sections.current[i] = el; }}
            scene={scene}
            index={i}
            shouldLoad={i <= currentIndex + 1}
            reduced={reduced}
            onGoToScene={(id) => scrollToScene(id)}
            panoramaSlot={panoramaSlot}
            casesSlot={casesSlot}
          />
        ))}
      </main>
    </div>
  );
}
