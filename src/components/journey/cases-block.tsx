'use client';
import Link from 'next/link';
import { cases, ui } from '@/content';
import { CaseCard } from '@/components/ui/case-card';

/** Cena 7: cases reais do site atual em faixa horizontal. Sem métricas, sem depoimentos. */
export function CasesBlock() {
  return (
    <div className="cases-strip" data-status={cases.status}>
      <p className="t-label cases-strip__kicker">{ui.projects.title}</p>
      <ul className="cases-strip__list">
        {cases.cases.map((c, i) => (
          <li key={c.slug}>
            <Link href={`/projetos#${c.slug}`} className="cases-strip__link">
              <CaseCard item={c} priority={i < 2} />
            </Link>
          </li>
        ))}
      </ul>
      <p className="t-label cases-strip__note">{ui.placeholders.metric}</p>
    </div>
  );
}
