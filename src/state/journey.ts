'use client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Dimension } from '@/content/types';
import type { Answer, Journey, Route } from '@/lib/journey-types';
import { track } from '@/lib/events';

export const FIRST_SCENE = 's0';

type Actions = {
  chooseRoute: (route: Route) => void;
  chooseInterest: (interest: string) => void;
  startJourney: () => void;
  setScene: (scene: string) => void;
  answer: (dimension: Dimension, questionId: string, optionId: string | null) => void;
  clearAnswer: (questionId: string) => void;
  restart: () => void;
};

export type JourneyStore = Journey & Actions;

const initial: Journey = { route: null, interest: null, currentScene: FIRST_SCENE, answers: [] };

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useJourney = create<JourneyStore>()(
  persist(
    (set, get) => ({
      ...initial,
      chooseRoute: (route) => {
        set({ route });
        track({ type: 'route_chosen', route });
      },
      chooseInterest: (interest) => {
        set({ interest });
        track({ type: 'interest_chosen', interest });
      },
      startJourney: () => {
        track({ type: 'journey_started' });
      },
      setScene: (scene) => {
        if (get().currentScene === scene) return;
        set({ currentScene: scene });
        track({ type: 'scene_viewed', scene });
      },
      answer: (dimension, questionId, optionId) => {
        const next: Answer = { dimension, questionId, optionId, at: Date.now() };
        set((s) => ({ answers: [...s.answers.filter((a) => a.questionId !== questionId), next] }));
        track({ type: 'question_answered', questionId, dimension, optionId });
      },
      clearAnswer: (questionId) => {
        set((s) => ({ answers: s.answers.filter((a) => a.questionId !== questionId) }));
      },
      restart: () => {
        set({ ...initial });
        track({ type: 'journey_restarted' });
      },
    }),
    {
      name: 'selva-journey',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? noopStorage : window.sessionStorage,
      ),
      partialize: (s) => ({
        route: s.route,
        interest: s.interest,
        currentScene: s.currentScene,
        answers: s.answers,
      }),
    },
  ),
);

/** Resposta registrada para uma pergunta (undefined = ainda não vista). */
export const selectAnswer = (questionId: string) => (s: JourneyStore) =>
  s.answers.find((a) => a.questionId === questionId);
