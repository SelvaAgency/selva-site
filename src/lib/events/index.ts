import { consoleAdapter } from './console-adapter';
import type { ConsentState, EventsAdapter, FunnelEvent } from './types';

let adapter: EventsAdapter = consoleAdapter;
let consent: ConsentState = 'unknown';

export function setEventsAdapter(next: EventsAdapter) {
  adapter = next;
}
export function setConsent(next: ConsentState) {
  consent = next;
}
export function getConsent(): ConsentState {
  return consent;
}
/** Envia um evento ao adapter ativo. O adapter mock só registra no console. */
export function track(event: FunnelEvent) {
  adapter.track(event, { consent, at: Date.now() });
}

export * from './types';
