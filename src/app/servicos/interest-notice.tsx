'use client';
import { useSearchParams } from 'next/navigation';
import { questions, ui } from '@/content';

/** Mostra o interesse escolhido na cena 0B quando o visitante chega pelo atalho. */
export function InterestNotice() {
  const params = useSearchParams();
  const id = params.get('interesse');
  const opt = questions.interest.options.find((o) => o.id === id);
  if (!opt) return null;
  return (
    <p className="t-label notice">
      {ui.panorama.yourInterest}: {opt.label}
      {opt.serviceSlug ? ` · ${opt.serviceSlug}` : ''}
    </p>
  );
}
