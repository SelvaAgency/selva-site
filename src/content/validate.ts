import {
  DIMENSIONS,
  PANORAMA_STATUSES,
  isQuestionsBlock,
  type QuestionsFile,
  type ScenesFile,
  type ScoringFile,
  type ServicesFile,
} from './types';

const STATUSES = new Set(['aprovado', 'conceito', 'proposta']);

/** Valida a coerência entre os JSONs de conteúdo. Lança no primeiro erro. */
export function validateContent(input: {
  scenes: ScenesFile;
  questions: QuestionsFile;
  scoring: ScoringFile;
  services: ServicesFile;
}): string[] {
  const errors: string[] = [];
  const { scenes, questions, scoring, services } = input;

  const qById = new Map(questions.diagnostic.map((q) => [q.id, q]));
  for (const q of questions.diagnostic) {
    if (!DIMENSIONS.includes(q.dimension)) errors.push(`pergunta ${q.id}: dimensão inválida "${q.dimension}"`);
    if (!STATUSES.has(q.status)) errors.push(`pergunta ${q.id}: status inválido "${q.status}"`);
    if (q.options.length < 2) errors.push(`pergunta ${q.id}: menos de 2 alternativas`);
    const ids = new Set(q.options.map((o) => o.id));
    if (ids.size !== q.options.length) errors.push(`pergunta ${q.id}: ids de alternativa repetidos`);
    for (const o of q.options) {
      if (typeof o.value !== 'number' || o.value < 0) errors.push(`pergunta ${q.id}/${o.id}: valor inválido`);
    }
  }
  for (const d of DIMENSIONS) {
    const n = questions.diagnostic.filter((q) => q.dimension === d).length;
    if (n !== 3) errors.push(`dimensão ${d}: esperado 3 perguntas, há ${n}`);
  }

  const sceneIds = new Set(scenes.scenes.map((s) => s.id));
  const seen = new Set<string>();
  for (const s of scenes.scenes) {
    for (const b of s.blocks) {
      if ('status' in b && !STATUSES.has(b.status)) errors.push(`cena ${s.id}: bloco com status inválido`);
      if (isQuestionsBlock(b)) {
        for (const id of b.ids) {
          const q = qById.get(id);
          if (!q) errors.push(`cena ${s.id}: pergunta ${id} não existe`);
          else if (s.dimension && q.dimension !== s.dimension)
            errors.push(`cena ${s.id}: pergunta ${id} é da dimensão ${q.dimension}, cena é ${s.dimension}`);
          if (seen.has(id)) errors.push(`pergunta ${id} aparece em mais de uma cena`);
          seen.add(id);
        }
      }
    }
    if (s.choices) {
      if (!STATUSES.has(s.choices.status)) errors.push(`cena ${s.id}: choices com status inválido`);
      for (const c of s.choices.options) {
        const internal = !c.goTo.startsWith('/') && c.goTo !== 'contato';
        if (internal && !sceneIds.has(c.goTo)) errors.push(`cena ${s.id}: escolha ${c.id} aponta para cena inexistente "${c.goTo}"`);
      }
    }
  }
  for (const q of questions.diagnostic) if (!seen.has(q.id)) errors.push(`pergunta ${q.id} não está em nenhuma cena`);

  const thr = scoring.method.thresholds;
  if (thr.length === 0) errors.push('scoring: sem thresholds');
  for (let i = 1; i < thr.length; i++) if (thr[i].min >= thr[i - 1].min) errors.push('scoring: thresholds devem ser decrescentes');
  if (thr.length && thr[thr.length - 1].min !== 0) errors.push('scoring: último threshold deve ter min 0');
  for (const d of DIMENSIONS) {
    const dim = scoring.dimensions[d];
    if (!dim) { errors.push(`scoring: falta dimensão ${d}`); continue; }
    for (const st of PANORAMA_STATUSES) if (!dim.texts[st]) errors.push(`scoring: falta texto ${d}/${st}`);
  }
  for (const st of PANORAMA_STATUSES) if (!scoring.statusLabels[st]) errors.push(`scoring: falta rótulo ${st}`);
  if (/\d\s*(%|\/\s*100)/.test(scoring.disclaimer.text)) errors.push('scoring: disclaimer não pode sugerir nota');

  for (const o of questions.interest.options) {
    if (o.relatedDimension && !DIMENSIONS.includes(o.relatedDimension))
      errors.push(`interesse ${o.id}: dimensão inválida`);
  }

  const slugs = new Set<string>();
  for (const g of services.groups) {
    for (const s of g.services) {
      if (!s.slug.startsWith('[') && slugs.has(s.slug)) errors.push(`serviço: slug repetido ${s.slug}`);
      slugs.add(s.slug);
    }
  }

  return errors;
}
