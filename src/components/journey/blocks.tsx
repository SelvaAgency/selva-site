'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { questionById, questions, ui } from '@/content';
import type { Choices, Dimension, InterestOption, Question, Scene } from '@/content/types';
import { track } from '@/lib/events';
import { useJourney } from '@/state/journey';

/** Bloco de texto de tela. Status aparece só como data-attr (para QA), nunca no texto. */
export function TextBlock({ text, status, lead }: { text: string; status: string; lead?: boolean }) {
  return (
    <p className={lead ? 't-display scene-text scene-text--lead' : 't-lead scene-text'} data-status={status}>
      {text}
    </p>
  );
}

export function shortcutHref(interestId: string | null): string {
  const opt = questions.interest.options.find((o) => o.id === interestId);
  const slug = opt?.serviceSlug;
  if (slug && !slug.startsWith('[')) return `/servicos/${slug}`;
  return interestId ? `/servicos?interesse=${encodeURIComponent(interestId)}` : '/servicos';
}

/** Escolhas de cena (rota A/B, descobrir/direto, CTAs finais). */
export function ChoiceGroup({
  scene,
  choices,
  onGoToScene,
}: {
  scene: Scene;
  choices: Choices;
  onGoToScene: (sceneId: string) => void;
}) {
  const router = useRouter();
  const { chooseRoute, interest, startJourney } = useJourney();

  function handle(id: string, goTo: string) {
    track({ type: 'cta_clicked', cta: id, scene: scene.id });
    if (scene.id === 's0') chooseRoute(id === 'rota-b' ? 'B' : 'A');
    if (id === 'descobrir') startJourney();
    if (id === 'direto') {
      track({ type: 'shortcut_to_service', slug: shortcutHref(interest) });
      router.push(shortcutHref(interest));
      return;
    }
    if (goTo.startsWith('/')) {
      router.push(goTo);
      return;
    }
    if (goTo === 'contato') {
      router.push('/contato');
      return;
    }
    onGoToScene(goTo);
  }

  return (
    <div className="choices" role="group" aria-label={ui.a11y.choiceGroup} data-status={choices.status}>
      {choices.options.map((c, i) => (
        <button
          key={c.id}
          type="button"
          className={i === 0 ? 'btn btn--primary' : 'btn'}
          onClick={() => handle(c.id, c.goTo)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

/** Pergunta de interesse (cena 0B). */
export function InterestPicker({ status }: { status: string }) {
  const { interest, chooseInterest } = useJourney();
  const { prompt, options } = questions.interest;
  return (
    <fieldset className="question" data-status={status}>
      <legend className="t-lead scene-text">{prompt}</legend>
      <div className="options">
        {options.map((o: InterestOption) => (
          <OptionButton key={o.id} selected={interest === o.id} onClick={() => chooseInterest(o.id)}>
            {o.label}
          </OptionButton>
        ))}
      </div>
    </fieldset>
  );
}

/** Uma pergunta do diagnóstico com alternativas e botão Pular. */
export function QuestionBlock({ id, n, total }: { id: string; n: number; total: number }) {
  const q: Question | undefined = questionById.get(id);
  const answer = useJourney((s) => s.answers.find((a) => a.questionId === id));
  const set = useJourney((s) => s.answer);
  if (!q) return null;
  const dim: Dimension = q.dimension;
  const groupLabel = ui.a11y.questionGroup.replace('{n}', String(n)).replace('{total}', String(total));
  return (
    <fieldset className="question" data-status={q.status} data-answered={answer ? (answer.optionId ? 'yes' : 'skipped') : 'no'}>
      <legend className="visually-hidden">{groupLabel}</legend>
      <p className="t-label question__n" aria-hidden="true">{String(n).padStart(2, '0')} / {String(total).padStart(2, '0')}</p>
      <p className="t-lead scene-text question__prompt">{q.prompt}</p>
      <div className="options">
        {q.options.map((o) => (
          <OptionButton key={o.id} selected={answer?.optionId === o.id} onClick={() => set(dim, q.id, o.id)}>
            {o.label}
          </OptionButton>
        ))}
      </div>
      <div className="question__foot">
        <button type="button" className="btn btn--ghost" onClick={() => set(dim, q.id, null)} aria-pressed={answer?.optionId === null && !!answer}>
          {ui.journey.skipQuestion}
        </button>
        <span className="t-label question__state" aria-live="polite">
          {answer ? (answer.optionId ? ui.journey.answered : ui.journey.skipped) : ''}
        </span>
      </div>
    </fieldset>
  );
}

function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="option" aria-pressed={selected} onClick={onClick}>
      <span className="option__dot" aria-hidden="true" />
      {children}
    </button>
  );
}

/** Link de rota interna que preserva a sessão (o store já persiste em sessionStorage). */
export function BackToJourney({ className }: { className?: string }) {
  return (
    <Link href="/?retomar=1" className={className ?? 'btn'}>
      {ui.nav.backToJourney}
    </Link>
  );
}
