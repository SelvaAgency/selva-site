# Selva — novo site

Experiência imersiva controlada por scroll com jornada consultiva e diagnóstico autodeclarado.
Regras, stack e fases em `CLAUDE.md`. Fonte de verdade: `docs/briefing-v01.pdf`.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm test           # vitest
npm run typecheck
npm run lint
```

## Estrutura

- `content/` — todo o texto do site (JSON). Componentes não têm texto hardcoded.
- `src/styles/tokens/` — tokens extraídos do site atual (ver `docs/tokens.md`).
- `src/app/` — rotas (App Router).
- `legacy/` — site atual, apenas referência visual.
- `docs/` — briefing, decisões, tokens.
