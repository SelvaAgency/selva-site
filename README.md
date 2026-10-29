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
- `src/components/journey/` — motor de scroll, cenas, blocos, HUD.
- `src/lib/panorama.ts` — cálculo puro do panorama (testado).
- `src/state/journey.ts` — estado da jornada (Zustand, sessionStorage).
- `src/lib/events/` — eventos de funil; adapter mock no console.

## Estado da Fase 2

Protótipo cinza navegável: cenas 0 a 8, escolhas, 9 perguntas com Pular, panorama e cases; rotas `/servicos`, `/servicos/raio-x-digital`, `/projetos`, `/contato`. Verificado no Chromium em iPhone 13, desktop e `prefers-reduced-motion`. Pendências em `docs/decisions.md`.
