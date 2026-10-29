import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cases, publishedServices, serviceBySlug, services, ui } from '@/content';
import { InternalPage } from '@/components/ui/internal-page';
import { CaseCard } from '@/components/ui/case-card';

/** Páginas "duras" de serviço: indexáveis, sem dependência da experiência imersiva. */
export function generateStaticParams() {
  return publishedServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: PageProps<'/servicos/[slug]'>) {
  const { slug } = await props.params;
  const s = serviceBySlug(slug);
  return { title: s ? `${s.name} — ${ui.brand.legalName}` : ui.service.notFound };
}

export default async function ServicePage(props: PageProps<'/servicos/[slug]'>) {
  const { slug } = await props.params;
  const service = serviceBySlug(slug);
  if (!service) notFound();
  const group = services.groups.find((g) => g.services.some((s) => s.slug === slug));
  const related = cases.cases.filter((c) => service.cases.includes(c.slug));
  const sections = services.servicePageTemplate.sections;

  return (
    <InternalPage title={service.name}>
      <p className="t-label">{group?.label}</p>
      <p className="t-body-l">{group?.description}</p>
      <section className="internal__section">
        <h2 className="t-label">{sections[0]}</h2>
        <p className="placeholder">{service.body || ui.placeholders.scene.replace('{name}', service.name)}</p>
      </section>
      <section className="internal__section">
        <h2 className="t-label">{ui.service.whatWeDeliver}</h2>
        <p className="placeholder">[PLACEHOLDER — entregas de {service.name}; catálogo não fechado (decisão 6)]</p>
      </section>
      <section className="internal__section">
        <h2 className="t-label">{ui.service.forWhom}</h2>
        <p className="placeholder">[PLACEHOLDER — para quem é {service.name}]</p>
      </section>
      <section className="internal__section">
        <h2 className="t-label">{ui.service.relatedCases}</h2>
        {related.length ? (
          <ul className="case-grid">
            {related.map((c) => (
              <li key={c.slug}><Link href={`/projetos#${c.slug}`} className="case-link"><CaseCard item={c} /></Link></li>
            ))}
          </ul>
        ) : (
          <p className="placeholder">[PLACEHOLDER — cases relacionados a {service.name}; vincular em content/services.json]</p>
        )}
      </section>
      <div className="internal__actions">
        <Link href="/contato" className="btn btn--primary">{ui.service.cta}</Link>
        <Link href="/servicos" className="btn">{ui.service.allServices}</Link>
      </div>
    </InternalPage>
  );
}
