import { Suspense } from 'react';
import Link from 'next/link';
import { services, ui } from '@/content';
import { InternalPage } from '@/components/ui/internal-page';
import { InterestNotice } from './interest-notice';

/** Índice de serviços. Destino do atalho enquanto os slugs por interesse não existem. */
export default function Servicos() {
  return (
    <InternalPage title={ui.nav.services}>
      <Suspense fallback={null}>
        <InterestNotice />
      </Suspense>
      <p className="placeholder">{services._nota}</p>
      {services.groups.map((g) => (
        <section key={g.id} className="internal__section" id={g.id}>
          <h2 className="t-display" style={{ fontSize: 'var(--text-hero)' }}>{g.label}</h2>
          <p className="t-body">{g.description}</p>
          <ul className="service-list">
            {g.services.map((s) => (
              <li key={s.name}>
                {s.slug.startsWith('[') ? (
                  <span className="t-label">{s.name}</span>
                ) : (
                  <Link href={`/servicos/${s.slug}`} className="btn">{s.name}</Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </InternalPage>
  );
}
