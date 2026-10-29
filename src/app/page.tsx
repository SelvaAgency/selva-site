import ui from '@content/ui.json';

export default function Home() {
  return (
    <main className="gutter" style={{ paddingBlock: 'var(--section-pad-top)' }}>
      <p className="t-label">{ui.dev.prototypeBadge}</p>
      <h1 className="t-display" style={{ fontSize: 'var(--text-hero)', marginTop: 'var(--space-8)' }}>
        {ui.brand.name}
      </h1>
      <p className="t-body" style={{ marginTop: 'var(--space-8)' }}>{ui.dev.placeholderPage}</p>
    </main>
  );
}
