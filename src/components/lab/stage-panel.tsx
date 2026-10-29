'use client';
import { useEffect, useRef, useState } from 'react';
import { ui } from '@/content';

type Perf = Performance & { memory?: { usedJSHeapSize: number } };
type ClipRow = { id: string; mounted: boolean; active: boolean; ready: number; t: string; src: string };

/** Painel do modo palco: trechos montados na janela e memória JS (Chrome). Lê o DOM do palco a cada 500 ms. */
export function StagePanel() {
  const [rows, setRows] = useState<ClipRow[]>([]);
  const [current, setCurrent] = useState('');
  const [heap, setHeap] = useState<{ now: number | null; max: number }>({ now: null, max: 0 });
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const log = useRef<{ at: number; scene: string; mounted: string[]; heapMb: number | null }[]>([]);

  useEffect(() => {
    const tick = () => {
      const stage = document.querySelector<HTMLElement>('.video-stage');
      const list: ClipRow[] = [...document.querySelectorAll<HTMLElement>('.video-stage [data-clip]')].map((c) => {
        const v = c.querySelector('video');
        return { id: c.dataset.clip!, mounted: !!v, active: c.dataset.active === 'true', ready: v?.readyState ?? 0, t: v ? v.currentTime.toFixed(2) : '—', src: v?.currentSrc.split('/').pop() ?? '' };
      });
      const mem = (performance as Perf).memory;
      const now = mem ? mem.usedJSHeapSize / 1e6 : null;
      setRows(list);
      setCurrent(stage?.dataset.current ?? '');
      setHeap((h) => ({ now, max: Math.max(h.max, now ?? 0) }));
      const mounted = list.filter((r) => r.mounted).map((r) => r.id);
      const last = log.current.at(-1);
      if (!last || last.scene !== stage?.dataset.current || last.mounted.join() !== mounted.join()) {
        log.current.push({ at: Date.now(), scene: stage?.dataset.current ?? '', mounted, heapMb: now ? Math.round(now) : null });
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  const report = () => JSON.stringify({ lab: 'palco', at: new Date().toISOString(), window: document.querySelector<HTMLElement>('.video-stage')?.dataset.window, heapMaxMb: Math.round(heap.max), clips: rows, log: log.current, ua: navigator.userAgent }, null, 2);
  const copy = async () => { try { await navigator.clipboard.writeText(report()); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { window.prompt(ui.lab.copy, report()); } };
  const L = ui.lab.stageMetrics;
  const nd = ui.lab.unknown;

  return (
    <aside className="lab__panel" data-open={open} aria-live="polite">
      <div className="lab__head">
        <span className="lab__mini">{L.mounted}: {rows.filter((r) => r.mounted).map((r) => r.id).join(' ') || nd}</span>
        <button type="button" className="btn btn--small" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? ui.lab.collapse : ui.lab.expand}</button>
      </div>
      <p className="t-label lab__hint">{ui.lab.stageHint}</p>
      <dl className="lab__dl">
        <dt>{L.current}</dt><dd>{current || nd}</dd>
        <dt>{L.heap}</dt><dd>{heap.now != null ? `${Math.round(heap.now)} / ${Math.round(heap.max)}` : nd}</dd>
        {rows.map((r) => (
          <>
            <dt key={r.id + 'k'}>{r.id}{r.active ? ' ●' : ''}</dt>
            <dd key={r.id + 'v'}>{r.mounted ? `t=${r.t} r${r.ready} ${r.src}` : 'fora da janela'}</dd>
          </>
        ))}
      </dl>
      <p className="t-label lab__hint" style={{ marginTop: 8 }}>{L.note}</p>
      <div className="lab__actions">
        <button type="button" className="btn btn--small btn--primary" onClick={copy}>{copied ? ui.lab.copied : ui.lab.copy}</button>
      </div>
    </aside>
  );
}
