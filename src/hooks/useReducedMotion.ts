'use client';
import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
const get = () => window.matchMedia(QUERY).matches;
/** No servidor assume movimento reduzido: o HTML inicial é o fallback estático. */
const getServer = () => true;

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, get, getServer);
}
