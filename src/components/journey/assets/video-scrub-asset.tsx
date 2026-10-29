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
  video: VideoEntry;
  poster?: string;
  shouldLoad: boolean;
  onMetrics?: (m: AssetMetrics) => void;
};

/**
 * Técnica A: <video> mudo com playsinline; o scroll define currentTime.
 * Só um seek em voo por vez: o último alvo pedido é aplicado quando o anterior termina.
 */
export function VideoScrubAsset({ video, poster, shouldLoad, onMetrics }: VideoScrubAssetProps) {
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
      m.current.bytesLoaded = video.bytes; // o navegador não expõe bytes por mídia; usamos o manifest
      if (m.current.firstFrameMs === null) m.current.firstFrameMs = performance.now() - mountedAt.current;
      report();
    };
    v.addEventListener('seeked', onSeeked);
    v.addEventListener('loadeddata', onLoaded);
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
      if (rvfc && 'cancelVideoFrameCallback' in v) (v as unknown as { cancelVideoFrameCallback: (h: number) => void }).cancelVideoFrameCallback(rvfc);
    };
  }, [video, applySeek, report]);

  useEffect(() => {
    if (shouldLoad && el.current && el.current.preload !== 'auto') { el.current.preload = 'auto'; el.current.load(); }
  }, [shouldLoad]);

  return (
    <div ref={root} className="scene-asset scene-asset--video" data-loaded={shouldLoad} aria-hidden="true">
      <video
        ref={el}
        className="scene-asset__media"
        src={shouldLoad ? video.path : undefined}
        poster={poster}
        muted
        playsInline
        preload={shouldLoad ? 'auto' : 'none'}
        disablePictureInPicture
        disableRemotePlayback
      />
    </div>
  );
}
