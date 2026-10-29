/** Eventos de funil (briefing, seção 7). Nada sai do navegador sem consentimento. */
export type FunnelEvent =
  | { type: 'enter' }
  | { type: 'route_chosen'; route: 'A' | 'B' }
  | { type: 'interest_chosen'; interest: string }
  | { type: 'journey_started' }
  | { type: 'scene_viewed'; scene: string }
  | { type: 'question_answered'; questionId: string; dimension: string; optionId: string | null }
  | { type: 'panorama_viewed'; statuses: Record<string, string> }
  | { type: 'cta_clicked'; cta: string; scene?: string }
  | { type: 'shortcut_to_service'; slug: string }
  | { type: 'journey_restarted' };

export type ConsentState = 'unknown' | 'granted' | 'denied';

export interface EventsAdapter {
  /** Chamado para todo evento. O adapter decide o que fazer com base no consentimento. */
  track(event: FunnelEvent, ctx: { consent: ConsentState; at: number }): void;
}
