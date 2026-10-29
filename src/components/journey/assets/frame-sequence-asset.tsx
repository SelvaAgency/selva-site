'use client';
import { useCallback, useEffect, useRef } from 'react';
import { framePath, type FramesEntry } from './scene-manifest';
import { Avg, newMetrics, type AssetMetrics } from './metrics';
import { useSceneProgress } from './use-scene-progress';

export type FrameSequenceAssetProps = {
  frames: FramesEntry;
  poster?: string;
  shouldLoad: boolean;
  onMetrics?: (m: AssetMetrics) => void;
  /** quantos quadros decodificados manter de cada lado do atual */
  window?: number;
  /** downloads simultâneos */
  concurrency?: number;
  /** decodificações simultâneas (a mais perto do alvo primeiro) */
  decodeConcurrency?: number;
};

/**
 * Técnica B: sequência de WebP no canvas.
 * Baixa tudo progressivamente como Blob (comprimido, barato), decodifica sob demanda
 * numa janela em torno do quadro atual, com fila por proximidade e concorrência limitada,
 * e descarta bitmaps fora da janela (memória previsível).
 */
export function FrameSequenceAsset({
  frames, poster, shouldLoad, onMetrics, window: win = 12, concurrency = 6, decodeConcurrency = 3,
}: FrameSequenceAssetProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const blobs = useRef<(Blob | null)[]>([]);
  const bitmaps = useRef<Map<number, ImageBitmap>>(new Map());
  const inFlight = useRef<Set<number>>(new Set());
  const target = useRef(0);
  const shown = useRef(-1);
  const m = useRef<AssetMetrics>({ ...newMetrics('frames', frames.variant, frames.bytes), totalFrames: frames.count, loadedFrames: 0, residentFrames: 0, maxLagLoaded: 0, missesNotLoaded: 0 });
  const decodeAvg = useRef(new Avg());
  const mountedAt = useRef(0);
  const pumpRef = useRef<() => void>(() => {});
  const lagCheck = useRef(0);
  useEffect(() => { mountedAt.current = performance.now(); }, []);
  const report = useCallback(() => onMetrics?.({ ...m.current, avgDecodeMs: decodeAvg.current.value, residentFrames: bitmaps.current.size }), [onMetrics]);

  const draw = useCallback((i: number) => {
    const c = canvas.current;
    const bmp = bitmaps.current.get(i);
    if (!c || !bmp) return;
    if (c.width !== bmp.width || c.height !== bmp.height) { c.width = bmp.width; c.height = bmp.height; }
    c.getContext('2d')?.drawImage(bmp, 0, 0);
    shown.current = i;
    m.current.shownFrame = i;
    m.current.presented++;
    if (m.current.firstFrameMs === null) m.current.firstFrameMs = performance.now() - mountedAt.current;
  }, []);

  /** escolhe o próximo quadro a decodificar: o mais perto do alvo, dentro da janela, já baixado */
  const pump = useCallback(() => {
    const t = target.current;
    while (inFlight.current.size < decodeConcurrency) {
      let pick = -1;
      for (let d = 0; d <= win && pick < 0; d++) {
        for (const i of d ? [t + d, t - d] : [t]) {
          if (i < 0 || i >= frames.count) continue;
          if (blobs.current[i] && !bitmaps.current.has(i) && !inFlight.current.has(i)) { pick = i; break; }
        }
      }
      if (pick < 0) return;
      const i = pick;
      inFlight.current.add(i);
      const t0 = performance.now();
      createImageBitmap(blobs.current[i]!).then(
        (bmp) => {
          decodeAvg.current.add(performance.now() - t0);
          inFlight.current.delete(i);
          if (Math.abs(i - target.current) > win) { bmp.close(); } // alvo já foi embora: descarta
          else {
            bitmaps.current.set(i, bmp);
            if (i === target.current || shown.current < 0 || Math.abs(i - target.current) < Math.abs(shown.current - target.current)) draw(i);
          }
          pumpRef.current();
          report();
        },
        () => { inFlight.current.delete(i); pumpRef.current(); },
      );
    }
  }, [decodeConcurrency, win, frames.count, draw, report]);
  useEffect(() => { pumpRef.current = pump; }, [pump]);

  /** mantém só a janela em torno do alvo decodificada */
  const settle = useCallback(() => {
    const t = target.current;
    for (const [i, bmp] of bitmaps.current) if (Math.abs(i - t) > win) { bmp.close(); bitmaps.current.delete(i); }
    pump();
  }, [pump, win]);

  useSceneProgress(root, (p) => {
    const i = Math.min(frames.count - 1, Math.max(0, Math.round(p * (frames.count - 1))));
    m.current.updates++;
    m.current.targetFrame = i;
    target.current = i;
    if (bitmaps.current.has(i)) draw(i);
    else {
      let best = -1;
      for (const k of bitmaps.current.keys()) if (best < 0 || Math.abs(k - i) < Math.abs(best - i)) best = k;
      if (best >= 0 && best !== shown.current) draw(best);
    }
    // atraso instantâneo (pessimista: antes de a decodificação do alvo terminar)
    m.current.maxLag = Math.max(m.current.maxLag, Math.abs(i - Math.max(0, shown.current)));
    if (!blobs.current[i]) m.current.missesNotLoaded = (m.current.missesNotLoaded ?? 0) + 1;
    // atraso que importa: o que ficou na tela no quadro seguinte de animação, com o alvo já baixado
    if (!lagCheck.current) lagCheck.current = requestAnimationFrame(() => {
      lagCheck.current = 0;
      const t = target.current;
      if (blobs.current[t]) m.current.maxLagLoaded = Math.max(m.current.maxLagLoaded ?? 0, Math.abs(t - Math.max(0, shown.current)));
      report();
    });
    settle();
    report();
  });

  // download progressivo: do quadro 0 em diante, com concorrência limitada
  useEffect(() => {
    if (!shouldLoad) return;
    let cancelled = false;
    blobs.current = new Array(frames.count).fill(null);
    let next = 0;
    const worker = async () => {
      while (!cancelled && next < frames.count) {
        const i = next++;
        try {
          const r = await fetch(framePath(frames, i));
          const b = await r.blob();
          if (cancelled) return;
          blobs.current[i] = b;
          m.current.bytesLoaded += b.size;
          m.current.loadedFrames = (m.current.loadedFrames ?? 0) + 1;
          if (Math.abs(i - target.current) <= win) pump();
        } catch { /* mantém null: o quadro mais próximo cobre */ }
        report();
      }
    };
    for (let k = 0; k < concurrency; k++) void worker();
    const bmps = bitmaps.current;
    const lc = lagCheck;
    return () => { cancelled = true; if (lc.current) cancelAnimationFrame(lc.current); for (const b of bmps.values()) b.close(); bmps.clear(); };
  }, [shouldLoad, frames, concurrency, win, pump, report]);

  return (
    <div ref={root} className="scene-asset scene-asset--frames" data-loaded={shouldLoad} aria-hidden="true" style={poster ? { backgroundImage: `url(${poster})` } : undefined}>
      <canvas ref={canvas} className="scene-asset__media" />
    </div>
  );
}
