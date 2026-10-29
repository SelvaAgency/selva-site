import { describe, expect, it } from 'vitest';
import { questions, scoring } from '@/content';
import { computePanorama, dimensionOrder, dimensionScore, statusFor } from './panorama';
import type { Answer } from './journey-types';

const a = (questionId: string, optionId: string | null): Answer => {
  const q = questions.diagnostic.find((x) => x.id === questionId)!;
  return { dimension: q.dimension, questionId, optionId };
};

describe('dimensionScore', () => {
  it('média das respondidas, puladas fora da média', () => {
    const r = dimensionScore('infra', [a('q1', 'a'), a('q2', null), a('q3', 'c')], questions);
    expect(r).toEqual({ mean: 1, answered: 2, skipped: 1, total: 3 });
  });
  it('pergunta ausente conta como pulada', () => {
    const r = dimensionScore('infra', [a('q1', 'a')], questions);
    expect(r.skipped).toBe(2);
    expect(r.mean).toBe(2);
  });
  it('optionId inexistente conta como pulada', () => {
    const r = dimensionScore('marca', [a('q4', 'zzz'), a('q5', 'a'), a('q6', 'a')], questions);
    expect(r).toMatchObject({ mean: 2, answered: 2, skipped: 1 });
  });
});

describe('statusFor', () => {
  it('aplica thresholds em ordem decrescente', () => {
    expect(statusFor(2, 0, scoring)).toBe('bem-avaliada');
    expect(statusFor(1.5, 0, scoring)).toBe('bem-avaliada');
    expect(statusFor(1.49, 0, scoring)).toBe('oportunidade');
    expect(statusFor(0.75, 0, scoring)).toBe('oportunidade');
    expect(statusFor(0.74, 0, scoring)).toBe('atencao');
    expect(statusFor(0, 0, scoring)).toBe('atencao');
  });
  it('2 ou mais puladas = sem-dados, mesmo com média alta', () => {
    expect(statusFor(2, 2, scoring)).toBe('sem-dados');
    expect(statusFor(null, 3, scoring)).toBe('sem-dados');
  });
});

describe('dimensionOrder', () => {
  it('dimensão do interesse vem primeiro', () => {
    expect(dimensionOrder('clientes-vendas', questions)).toEqual(['performance', 'infra', 'marca']);
    expect(dimensionOrder('site', questions)[0]).toBe('infra');
  });
  it('sem interesse ou interesse sem dimensão: ordem padrão', () => {
    expect(dimensionOrder(null, questions)).toEqual(['infra', 'marca', 'performance']);
    expect(dimensionOrder('nao-sei', questions)).toEqual(['infra', 'marca', 'performance']);
    expect(dimensionOrder('inexistente', questions)).toEqual(['infra', 'marca', 'performance']);
  });
});

describe('computePanorama', () => {
  it('jornada completa com respostas mistas', () => {
    const answers = [
      a('q1', 'a'), a('q2', 'a'), a('q3', 'b'), // infra 5/3 ≈ 1.67
      a('q4', 'b'), a('q5', 'b'), a('q6', 'c'), // marca 2/3 ≈ 0.67
      a('q7', 'c'), a('q8', null), a('q9', null), // performance: 2 puladas
    ];
    const p = computePanorama({ answers, interest: 'marca-identidade', questions, scoring });
    expect(p.primaryDimension).toBe('marca');
    expect(p.dimensions.map((d) => d.dimension)).toEqual(['marca', 'infra', 'performance']);
    expect(p.dimensions.map((d) => d.status)).toEqual(['atencao', 'bem-avaliada', 'sem-dados']);
    expect(p.dimensions[0].text).toBe(scoring.dimensions.marca.texts.atencao);
    expect(p.dimensions[0].statusLabel).toBe('Ponto de atenção');
    expect(p.disclaimer).toBe(scoring.disclaimer.text);
  });
  it('nenhuma resposta: tudo sem-dados', () => {
    const p = computePanorama({ answers: [], interest: null, questions, scoring });
    expect(p.dimensions.every((d) => d.status === 'sem-dados')).toBe(true);
    expect(p.primaryDimension).toBeNull();
  });
  it('resultado não contém números expostos', () => {
    const p = computePanorama({ answers: [a('q1', 'a')], interest: null, questions, scoring });
    for (const d of p.dimensions) {
      expect(d.statusLabel).not.toMatch(/\d/);
      expect(d.text).not.toMatch(/\d+\s*(%|\/\s*100)/);
    }
  });
});
