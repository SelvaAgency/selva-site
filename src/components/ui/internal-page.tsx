import Link from 'next/link';
import { ui } from '@/content';
import './internal-page.css';

/** Moldura das rotas internas "duras": header simples, tema editorial, botão de voltar à jornada. */
export function InternalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="internal">
      <header className="internal__head gutter">
        <Link href="/" className="logo" aria-label={ui.nav.home}>
          <span className="logo__pill">{ui.brand.name.toUpperCase()}</span>
        </Link>
        <nav className="internal__nav t-label" aria-label={ui.nav.services}>
          <Link href="/servicos">{ui.nav.services}</Link>
          <Link href="/projetos">{ui.nav.projects}</Link>
          <Link href="/contato">{ui.nav.contact}</Link>
        </nav>
        <Link href="/?retomar=1" className="btn btn--small">{ui.nav.backToJourney}</Link>
      </header>
      <main className="internal__main gutter">
        <h1 className="t-display internal__title">{title}</h1>
        {children}
      </main>
    </div>
  );
}
