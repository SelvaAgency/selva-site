'use client';
import { useCallback, useEffect, useRef } from 'react';
import type { VideoEntry } from './scene-manifest';
import { Avg, newMetrics, type AssetMetrics } from './metrics';
import { useSceneProgress } from './use-scene-progress';

type VideoEl = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number, meta: { presentedFrames: number; mediaTime: number }) => void) => number;
  getVideoPlaybackQuality?: () => { droppedVideoFrames: number };
};

export type VideoScrubAssetProps = {
  /** entrada principal (duração, fps e bytes para as métricas) */
  video: VideoEntry;
  /** fontes alternativas em ordem de preferência; o navegador toca a primeira que decodifica */
  sources?: VideoEntry[];
  poster?: string;
  shouldLoad: boolean;
  onMetrics?: (m: AssetMetrics) => void;
  /** no palco: id da cena (o motor encontra o clipe por [data-clip]) e visibilidade inicial */
  clipId?: string;
  active?: boolean;
  /** posição inicial (0–1) assim que os metadados chegam: vizinho anterior = 1, seguinte = 0 */
  initialProgress?: number;
};

/** MIME com codecs, para o navegador descartar fontes sem decodificador antes de baixar */
export function mimeFor(v: VideoEntry): string {
  if (v.codec === 'hevc') return 'video/mp4; codecs="hvc1.1.6.L120.B0"';
  if (v.codec === 'h264') return 'video/mp4; codecs="avc1.640028"';
  if (v.codec === 'vp9') return 'video/webm; codecs="vp9"';
  if (v.codec === 'av1') return 'video/mp4; codecs="av01.0.08M.08"';
  return v.path.endsWith('.webm') ? 'video/webm' : 'video/mp4';
}

/**
 * Técnica A: <video> mudo com playsinline; o scroll define currentTime.
 * Só um seek em voo por vez: o último alvo pedido é aplicado quando o anterior termina.
 */
export function VideoScrubAsset({ video, sources, poster, shouldLoad, onMetrics, clipId, active, initialProgress }: VideoScrubAssetProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const el = useRef<VideoEl | null>(null);
  const m = useRef<AssetMetrics>(newMetrics('video', video.id + '-' + video.variant, video.bytes));
  const seeking = useRef(false);
  const pending = useRef<number | null>(null);
  const seekStart = useRef(0);
  const seekAvg = useRef(new Avg());
  const mountedAt = useRef(0);
  useEffect(() => { mountedAt.current = performance.now(); }, []);
  const report = useCallback(() => onMetrics?.({ ...m.current, avgDecodeMs: seekAvg.current.value }), [onMetrics]);

  const applySeek = useCallback((t: number) => {
    const v = el.current;
    if (!v || !Number.isFinite(v.duration)) return;
    seeking.current = true;
    seekStart.current = performance.now();
    v.currentTime = Math.min(Math.max(t, 0), v.duration - 0.001);
  }, []);

  useSceneProgress(root, (p) => {
    const v = el.current;
    if (!v) return;
    const t = p * (video.duration || v.duration || 0);
    m.current.updates++;
    m.current.targetFrame = Math.round(t * video.fps);
    if (seeking.current) pending.current = t;
    else applySeek(t);
    report();
  });

  useEffect(() => {
    const v = el.current;
    if (!v) return;
    const onSeeked = () => {
      seekAvg.current.add(performance.now() - seekStart.current);
      seeking.current = false;
      m.current.shownFrame = Math.round(v.currentTime * video.fps);
      m.current.maxLag = Math.max(m.current.maxLag, Math.abs(m.current.targetFrame - m.current.shownFrame));
      if (m.current.firstFrameMs === null) m.current.firstFrameMs = performance.now() - mountedAt.current;
      if (v.getVideoPlaybackQuality) m.current.dropped = v.getVideoPlaybackQuality().droppedVideoFrames;
      if (pending.current !== null) { const t = pending.current; pending.current = null; applySeek(t); }
      report();
    };
    const onLoaded = () => {
      // qual fonte o navegador escolheu (HEVC, H.264 ou VP9)
      const chosen = (sources ?? [video]).find((x) => v.currentSrc.endsWith(x.path));
      if (chosen) { m.current.variantId = chosen.id + '-' + chosen.variant; m.current.bytesTotal = chosen.bytes; }
      m.current.bytesLoaded = (chosen ?? video).bytes; // o navegador não expõe bytes por mídia; usamos o manifest
      if (m.current.firstFrameMs === null) m.current.firstFrameMs = performance.now() - mountedAt.current;
      report();
    };
    const onMeta = () => {
      if (m.current.updates > 0 || seeking.current) return;
      // pré-posiciona: vizinho no quadro da fronteira; clipe corrente montado no meio da cena vai para o progresso atual
      let p = initialProgress;
      if (p == null && clipId) {
        const overlay = document.querySelector<HTMLElement>(`#${clipId} .scene-overlay, #${clipId} .scene-asset`);
        const cur = overlay ? parseFloat(overlay.style.getPropertyValue('--p')) : NaN;
        if (Number.isFinite(cur)) p = cur;
      }
      if (p != null) applySeek(p * v.duration);
    };
    v.addEventListener('seeked', onSeeked);
    v.addEventListener('loadeddata', onLoaded);
    v.addEventListener('loadedmetadata', onMeta);
    let rvfc = 0;
    const tick = (_now: number, meta: { presentedFrames: number; mediaTime: number }) => {
      m.current.presented = meta.presentedFrames;
      m.current.shownFrame = Math.round(meta.mediaTime * video.fps);
      rvfc = v.requestVideoFrameCallback!(tick);
    };
    if (v.requestVideoFrameCallback) rvfc = v.requestVideoFrameCallback(tick);
    return () => {
      v.removeEventListener('seeked', onSeeked);
      v.removeEventListener('loadeddata', onLoaded);
      v.removeEventListener('loadedmetadata', onMeta);
      if (rvfc && 'cancelVideoFrameCallback' in v) (v as unknown as { cancelVideoFrameCallback: (h: number) => void }).cancelVideoFrameCallback(rvfc);
    };
  }, [video, sources, applySeek, report, initialProgress, clipId]);

  // só na desmontagem real (o clipe saiu da janela do palco): solta a mídia para o navegador liberar o decodificador
  useEffect(() => {
    const v = el.current;
    return () => {
      if (!v) return;
      v.removeAttribute('src');
      while (v.firstChild) v.removeChild(v.firstChild);
      v.load();
    };
  }, []);

  useEffect(() => {
    if (shouldLoad && el.current && el.current.preload !== 'auto') { el.current.preload = 'auto'; el.current.load(); }
  }, [shouldLoad]);

  return (
    <div ref={root} className="scene-asset scene-asset--video" data-loaded={shouldLoad} data-clip={clipId} data-active={clipId ? !!active : undefined} aria-hidden="true">
      <video
        ref={el}
        className="scene-asset__media"
        src={!sources && shouldLoad ? video.path : undefined}
        poster={poster}
        muted
        playsInline
        preload={shouldLoad ? 'auto' : 'none'}
        disablePictureInPicture
        disableRemotePlayback
      >
        {sources && shouldLoad && sources.map((x) => <source key={x.id} src={x.path} type={mimeFor(x)} />)}
      </video>
    </div>
  );
}
