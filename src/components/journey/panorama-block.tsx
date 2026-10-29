'use client';
import { useEffect, useMemo, useRef } from 'react';
import { questions, scoring, ui } from '@/content';
import { track } from '@/lib/events';
import { computePanorama } from '@/lib/panorama';
import { useJourney } from '@/state/journey';

/**
 * Panorama preliminar (cena 6). Três blocos descritivos, sem nota, com ressalva.
 * Aparece antes de qualquer pedido de e-mail — não há captura aqui.
 */
export function PanoramaBlock() {
  const answers = useJourney((s) => s.answers);
  const interest = useJourney((s) => s.interest);
  const panorama = useMemo(() => computePanorama({ answers, interest, questions, scoring }), [answers, interest]);
  const interestLabel = questions.interest.options.find((o) => o.id === interest)?.label ?? ui.panorama.noInterest;
  const ref = useRef<HTMLDivElement | null>(null);
  const seen = useRef(false);

  // evento "panorama visto" quando o bloco que o contém fica ativo
  useEffect(() => {
    const host = ref.current?.closest<HTMLElement>('.block');
    if (!host) return;
    const check = () => {
      if (seen.current || host.dataset.state !== 'active') return;
      seen.current = true;
      track({ type: 'panorama_viewed', statuses: Object.fromEntries(panorama.dimensions.map((d) => [d.dimension, d.status])) });
    };
    check();
    const mo = new MutationObserver(check);
    mo.observe(host, { attributes: true, attributeFilter: ['data-state'] });
    return () => mo.disconnect();
  }, [panorama]);

  return (
    <div ref={ref} className="panorama" data-status={scoring.status}>
      <p className="t-label panorama__kicker">
        {ui.panorama.title} · {ui.panorama.yourInterest}: {interestLabel}
      </p>
      <ol className="panorama__grid">
        {panorama.dimensions.map((d) => (
          <li key={d.dimension} className="panorama__card" data-status={d.status} data-primary={d.dimension === panorama.primaryDimension}>
            <p className="t-label panorama__dim">{d.label}</p>
            <p className="panorama__status t-display">{d.statusLabel}</p>
            <p className="panorama__text">{d.text}</p>
          </li>
        ))}
      </ol>
      <p className="panorama__disclaimer" data-status={scoring.disclaimer.status}>{panorama.disclaimer}</p>
    </div>
  );
}
