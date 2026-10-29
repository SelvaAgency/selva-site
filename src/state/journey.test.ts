import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setEventsAdapter, type FunnelEvent } from '@/lib/events';
import { useJourney } from './journey';

const events: FunnelEvent[] = [];
setEventsAdapter({ track: (e) => events.push(e) });

beforeEach(() => {
  useJourney.getState().restart();
  events.length = 0;
});

describe('journey store', () => {
  it('estado inicial', () => {
    const s = useJourney.getState();
    expect(s.route).toBeNull();
    expect(s.interest).toBeNull();
    expect(s.currentScene).toBe('s0');
    expect(s.answers).toEqual([]);
  });
  it('responder substitui resposta anterior da mesma pergunta', () => {
    const s = useJourney.getState();
    s.answer('infra', 'q1', 'a');
    s.answer('infra', 'q1', 'c');
    expect(useJourney.getState().answers).toHaveLength(1);
    expect(useJourney.getState().answers[0].optionId).toBe('c');
  });
  it('pular registra optionId null', () => {
    useJourney.getState().answer('marca', 'q4', null);
    expect(useJourney.getState().answers[0]).toMatchObject({ questionId: 'q4', optionId: null });
    expect(events.at(-1)).toMatchObject({ type: 'question_answered', optionId: null });
  });
  it('setScene só emite evento quando muda', () => {
    const s = useJourney.getState();
    s.setScene('s1');
    s.setScene('s1');
    expect(events.filter((e) => e.type === 'scene_viewed')).toHaveLength(1);
  });
  it('restart limpa tudo e emite evento', () => {
    const s = useJourney.getState();
    s.chooseRoute('A');
    s.chooseInterest('site');
    s.answer('infra', 'q1', 'a');
    s.restart();
    expect(useJourney.getState()).toMatchObject({ route: null, interest: null, answers: [], currentScene: 's0' });
    expect(events.at(-1)).toEqual({ type: 'journey_restarted' });
  });
  it('adapter mock não lança sem console', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    expect(() => useJourney.getState().chooseRoute('B')).not.toThrow();
    spy.mockRestore();
  });
});
