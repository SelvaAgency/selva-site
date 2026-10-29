import { describe, expect, it } from 'vitest';
import { questions, scenes, scoring, services } from './index';
import { validateContent } from './validate';
import { DIMENSIONS, isTextBlock } from './types';

const FORBIDDEN_METAPHORS = /\b(selva|floresta|árvore|arvore|raiz|raízes|raizes|clareira|praia|mata|trilha)\b/i;

describe('conteúdo', () => {
  it('JSONs atuais passam na validação', () => {
    expect(validateContent({ scenes, questions, scoring, services })).toEqual([]);
  });
  it('3 perguntas por dimensão, 9 no total', () => {
    expect(questions.diagnostic).toHaveLength(9);
    for (const d of DIMENSIONS) expect(questions.diagnostic.filter((q) => q.dimension === d)).toHaveLength(3);
  });
  it('textos de tela não mencionam a metáfora visual (exceto o nome da marca)', () => {
    for (const s of scenes.scenes) {
      for (const b of s.blocks) {
        if (!isTextBlock(b)) continue;
        const t = b.text.replace(/\bSelva\b/g, '');
        expect(t, `cena ${s.id}: "${b.text}"`).not.toMatch(FORBIDDEN_METAPHORS);
      }
    }
    for (const d of DIMENSIONS) {
      for (const t of Object.values(scoring.dimensions[d].texts)) expect(t).not.toMatch(FORBIDDEN_METAPHORS);
    }
  });
  it('detecta pergunta referenciada em cena mas inexistente', () => {
    const broken = structuredClone(scenes);
    const s2 = broken.scenes.find((s) => s.id === 's2')!;
    const qb = s2.blocks.find((b) => 'type' in b && b.type === 'questions') as { ids: string[] };
    qb.ids.push('q99');
    expect(validateContent({ scenes: broken, questions, scoring, services }).join()).toMatch(/q99/);
  });
});
