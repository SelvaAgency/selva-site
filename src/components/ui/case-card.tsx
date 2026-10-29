import Image from 'next/image';
import type { CaseItem } from '@/content/types';
import './case-card.css';

/** Card de case com as cores do site atual. `priority` só para os primeiros visíveis. */
export function CaseCard({ item, priority = false, sizes = '(max-width: 760px) 60vw, 250px' }: { item: CaseItem; priority?: boolean; sizes?: string }) {
  return (
    <article className="case-card" style={{ ['--case-bg' as string]: item.bg, ['--case-fg' as string]: item.fg }}>
      <div className="case-card__media">
        <Image src={item.cover} alt={`${item.name} — ${item.kind}`} fill sizes={sizes} priority={priority} style={{ objectFit: 'cover', objectPosition: item.coverPosition }} />
      </div>
      <p className="case-card__name t-display">{item.name}</p>
      <p className="case-card__kind t-label">{item.kind}</p>
    </article>
  );
}
