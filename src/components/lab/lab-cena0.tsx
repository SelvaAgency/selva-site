'use client';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { scenes, ui } from '@/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { activeUnit, lightAt } from '@/lib/scene-light';
import { FrameSequenceAsset } from '@/components/journey/assets/frame-sequence-asset';
import { VideoScrubAsset } from '@/components/journey/assets/video-scrub-asset';
import type { AssetMetrics } from '@/components/journey/assets/metrics';
import { loadManifest, pickVariant, type SceneManifest, type Variant } from '@/components/journey/assets/scene-manifest';
import { emitSceneProgress } from '@/components/journey/assets/use-scene-progress';
import { TextBlock } from '@/components/journey/blocks';
import { isTextBlock } from '@/content/types';
import '@/components/journey/journey.css';
import './lab.css';

gsap.registerPlugin(ScrollTrigger);

type Technique = 'video' | 'frames';
const subscribeNoop = () => () => {};
const SCENE = 'cena0';
const subscribeViewport = (cb: () => void) => {
  const mq = window.matchMedia('(max-width: 760px) and (orientation: portrait)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const s0 = scenes.scenes[0];
const UNITS = 3; // 2 textos + escolhas, como na cena 0 real

type Perf = Performance & { memory?: { usedJSHeapSize: number } };

export function LabCena0() {
  const reduced = useReducedMotion();
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [manifest, setManifest] = useState<SceneManifest | null | undefined>(undefined);
  const [technique, setTechnique] = useState<Technique>('video');
  const autoVariant = useSyncExternalStore(subscribeViewport, pickVariant, () => 'desktop' as Variant);
  const [variantOverride, setVariant] = useState<Variant | null>(null);
  const variant: Variant = variantOverride ?? autoVariant;
  const [videoId, setVideoId] = useState<string>('h264-gop6');
  const [metrics, setMetrics] = useState<AssetMetrics | null>(null);
  const [fps, setFps] = useState(0);
  const [copied, setCopied] = useState(false);
  const section = useRef<HTMLElement | null>(null);
  const fpsSamples = useRef<number[]>([]);
  const lastMetrics = useRef<AssetMetrics | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => { if (hydrated) void loadManifest(SCENE).then(setManifest); }, [hydrated]);

  const video = useMemo(() => manifest?.videos.find((v) => v.id === videoId && v.variant === variant) ?? null, [manifest, videoId, variant]);
  const frames = useMemo(() => manifest?.frames.find((f) => f.variant === variant) ?? null, [manifest, variant]);
  const poster = manifest?.posters[variant]?.path;

  // fps medido só enquanto há scroll (janelas de 1 s)
  useEffect(() => {
    if (!hydrated || reduced) return;
    let frames = 0, last = performance.now(), scrolling = 0, raf = 0;
    const onScroll = () => { scrolling = performance.now(); };
    const loop = (now: number) => {
      frames++;
      if (now - last >= 1000) {
        if (now - scrolling < 1000) { fpsSamples.current.push(frames); setFps(frames); }
        frames = 0; last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); };
  }, [hydrated, reduced]);

  // mesmo motor da jornada: Lenis + ScrollTrigger com scrub na seção
  useEffect(() => {
    if (!hydrated || reduced || !manifest) return;
    const el = section.current; if (!el) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    const apply = (p: number) => {
      const asset = el.querySelector<HTMLElement>('.scene-asset');
      if (asset) emitSceneProgress(asset, p);
      el.dataset.light = lightAt(s0, p);
      const active = activeUnit(p, UNITS);
      el.querySelectorAll<HTMLElement>('.block').forEach((b, i) => { b.dataset.state = i === active ? 'active' : i < active ? 'past' : 'future'; });
    };
    apply(0);
    const st = ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom bottom', onUpdate: (self) => apply(self.progress) });
    return () => { st.kill(); gsap.ticker.remove(tick); lenis.destroy(); };
  }, [hydrated, reduced, manifest, technique, variant, videoId, resetKey]);

  const onMetrics = useCallback((m: AssetMetrics) => { lastMetrics.current = m; setMetrics(m); }, []);

  const info = useMemo(() => {
    if (!hydrated) return null;
    const nav = navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } };
    return {
      ua: navigator.userAgent,
      dpr: window.devicePixelRatio,
      viewport: `${window.innerWidth}×${window.innerHeight}`,
      memoryMb: (performance as Perf).memory ? Math.round((performance as Perf).memory!.usedJSHeapSize / 1e6) : null,
      connection: nav.connection?.effectiveType ?? null,
      saveData: nav.connection?.saveData ?? null,
    };
  }, [hydrated]);

  const report = () => {
    const s = fpsSamples.current;
    const avg = s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : null;
    const min = s.length ? Math.min(...s) : null;
    return JSON.stringify({ lab: SCENE, at: new Date().toISOString(), technique, variant, videoId: technique === 'video' ? videoId : undefined, fps: { avg, min, samples: s.length }, metrics: lastMetrics.current, device: info, manifestGeneratedAt: manifest?.generatedAt }, null, 2);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(report()); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { window.prompt(ui.lab.copy, report()); }
  };
  const reset = () => { fpsSamples.current = []; setFps(0); setMetrics(null); lastMetrics.current = null; setResetKey((k) => k + 1); window.scrollTo(0, 0); };

  const fmtMb = (b: number) => (b / 1e6).toFixed(2);
  const nd = ui.lab.unknown;
  const L = ui.lab.metrics;

  return (
    <div className="lab journey" data-light="clara">
      <header className="lab__bar">
        <div>
          <p className="t-label">{ui.lab.title}</p>
          <p className="lab__sub">{ui.lab.subtitle}</p>
        </div>
        <div className="lab__controls">
          <label className="t-label">{ui.lab.technique}
            <select value={technique} onChange={(e) => setTechnique(e.target.value as Technique)}>
              <option value="video">{ui.lab.video}</option>
              <option value="frames">{ui.lab.frames}</option>
            </select>
          </label>
          <label className="t-label">{ui.lab.variant}
            <select value={variant} onChange={(e) => setVariant(e.target.value as Variant)}>
              <option value="desktop">desktop 16:9</option>
              <option value="mobile">mobile 9:16</option>
            </select>
          </label>
          {technique === 'video' && manifest && (
            <label className="t-label">codec
              <select value={videoId} onChange={(e) => setVideoId(e.target.value)}>
                {[...new Set(manifest.videos.map((v) => v.id))].map((id) => <option key={id} value={id}>{id}</option>)}
              </select>
            </label>
          )}
        </div>
      </header>

      {manifest === null && <p className="placeholder lab__missing">{ui.lab.missing}</p>}
      {reduced && <p className="t-label lab__missing">{ui.lab.reducedNotice}</p>}

      {manifest && (
        <section ref={section} className="scene" data-reduced={reduced} data-light="clara" style={{ ['--n' as string]: UNITS }} key={`${technique}-${variant}-${videoId}-${resetKey}`}>
          <div className="scene__pin">
            {reduced ? (
              <div className="scene-asset" style={{ backgroundImage: `url(${poster})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            ) : technique === 'video' && video ? (
              <VideoScrubAsset video={video} poster={poster} shouldLoad onMetrics={onMetrics} />
            ) : frames ? (
              <FrameSequenceAsset frames={frames} poster={poster} shouldLoad onMetrics={onMetrics} />
            ) : null}
            <div className="scene__content">
              {s0.blocks.filter(isTextBlock).map((b, i) => (
                <div key={i} className="block" data-unit={i} data-kind="text" data-state={reduced ? 'active' : 'future'}>
                  <TextBlock text={b.text} status={b.status} lead />
                </div>
              ))}
              <div className="block" data-unit={2} data-kind="choices" data-state={reduced ? 'active' : 'future'}>
                <div className="choices">{s0.choices?.options.map((c) => <span key={c.id} className="btn">{c.label}</span>)}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <aside className="lab__panel" aria-live="polite">
        <p className="t-label lab__hint">{ui.lab.scrollHint}</p>
        <dl className="lab__dl">
          <dt>{L.fps}</dt><dd>{fps || nd}</dd>
          <dt>{L.lag}</dt><dd>{metrics?.maxLag ?? nd}</dd>
          <dt>{L.target} / {L.shown}</dt><dd>{metrics ? `${metrics.targetFrame} / ${metrics.shownFrame}` : nd}</dd>
          <dt>{L.presented}</dt><dd>{metrics?.presented ?? nd}</dd>
          <dt>{L.dropped}</dt><dd>{metrics?.dropped ?? nd}</dd>
          <dt>{L.firstFrame}</dt><dd>{metrics?.firstFrameMs != null ? Math.round(metrics.firstFrameMs) : nd}</dd>
          <dt>{L.bytes}</dt><dd>{metrics ? `${fmtMb(metrics.bytesLoaded)} / ${fmtMb(metrics.bytesTotal)} MB` : nd}</dd>
          <dt>{L.decode}</dt><dd>{metrics?.avgDecodeMs != null ? metrics.avgDecodeMs.toFixed(1) : nd}</dd>
          {technique === 'frames' && <><dt>{L.lagLoaded}</dt><dd>{metrics?.maxLagLoaded ?? nd}</dd><dt>{L.misses}</dt><dd>{metrics?.missesNotLoaded ?? nd}</dd><dt>{L.loaded}</dt><dd>{metrics ? `${metrics.loadedFrames ?? 0} / ${metrics.totalFrames ?? 0}` : nd}</dd><dt>{L.resident}</dt><dd>{metrics?.residentFrames ?? nd}</dd></>}
          <dt>{L.memory}</dt><dd>{info?.memoryMb ?? nd}</dd>
          <dt>{L.dpr} · {L.viewport}</dt><dd>{info ? `${info.dpr} · ${info.viewport}` : nd}</dd>
        </dl>
        <div className="lab__actions">
          <button type="button" className="btn btn--small btn--primary" onClick={copy}>{copied ? ui.lab.copied : ui.lab.copy}</button>
          <button type="button" className="btn btn--small" onClick={reset}>{ui.lab.reset}</button>
        </div>
      </aside>
    </div>
  );
}
