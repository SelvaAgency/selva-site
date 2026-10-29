import type { EventsAdapter } from './types';

/**
 * Adapter mock da v1: registra no console. Nenhum envio externo.
 * Trocar por um adapter real (CRM/analytics) sem mexer no resto do código.
 */
export const consoleAdapter: EventsAdapter = {
  track(event, ctx) {
    if (typeof console === 'undefined') return;
    console.debug('[selva:event]', ctx.consent, new Date(ctx.at).toISOString(), event);
  },
};
