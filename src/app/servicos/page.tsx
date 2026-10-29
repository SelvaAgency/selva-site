import { services, ui } from '@/content';
import { InternalPage } from '@/components/ui/internal-page';

export default function Servicos() {
  return (
    <InternalPage title={ui.nav.services}>
      <p className="placeholder">{services._nota}</p>
      {services.groups.map((g) => (
        <section key={g.id}>
          <h2 className="t-display" style={{ fontSize: 'var(--text-hero)' }}>{g.label}</h2>
          <p className="t-body" style={{ marginTop: 'var(--space-5)' }}>{g.description}</p>
          <ul style={{ marginTop: 'var(--space-6)', display: 'grid', gap: 'var(--space-3)' }}>
            {g.services.map((s) => (
              <li key={s.name} className="t-label">{s.name}</li>
            ))}
          </ul>
        </section>
      ))}
    </InternalPage>
  );
}
