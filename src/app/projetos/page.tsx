import { cases, services, ui } from '@/content';
import { InternalPage } from '@/components/ui/internal-page';
import { CaseCard } from '@/components/ui/case-card';

/**
 * Rota B — PROPOSTA (decisão 1 em aberto): página editorial com visão geral,
 * os 4 grupos de serviço e os cases do site atual.
 */
export default function Projetos() {
  return (
    <InternalPage title={ui.projects.title}>
      <p className="placeholder">{ui.projects.intro}</p>
      <section className="internal__section">
        <h2 className="t-label">{ui.nav.services}</h2>
        <ul className="group-grid">
          {services.groups.map((g) => (
            <li key={g.id} className="group-card">
              <p className="t-display group-card__title">{g.label}</p>
              <p className="t-body">{g.description}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="internal__section">
        <h2 className="t-label">{ui.projects.title}</h2>
        <ul className="case-grid">
          {cases.cases.map((c, i) => (
            <li key={c.slug} id={c.slug} className="case-entry">
              <CaseCard item={c} priority={i < 4} sizes="(max-width: 760px) 45vw, 300px" />
              <p className="t-label case-entry__tags">{c.tags.join(' · ')}</p>
              <p className="placeholder">{c.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </InternalPage>
  );
}
