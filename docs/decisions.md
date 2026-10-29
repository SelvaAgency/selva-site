# Decisões e pendências

## Decididas (28/10/2026)
- Linguagem gráfica e cases: reaproveitar do site atual (selva.up.railway.app). Texto: só o do briefing.
- Técnica visual: vídeo ou frames controlados pelo scroll nas cenas realistas; SVG/canvas/WebGL leve nas intervenções geométricas.
- Áudio: nenhum. Só texto de tela.
- Página de serviço (atalho "Quero ir direto ao que procuro"): página "dura", simples, mostrando o serviço selecionado, com explicação, cases e contato.

## Decididas (29/10/2026)
- Tokens visuais extraídos do site atual aprovados como estão (`docs/tokens.md`), incluindo aliases semânticos e a camada de overlay escuro sobre as cenas.
- Pular perguntas: botão explícito "Pular" em cada pergunta, além de poder simplesmente rolar adiante. Pergunta pulada = `optionId: null`.
- Ordem das branches da Fase 2: setup → conteúdo → estado → cenas → panorama → rotas duras.

## Em aberto — perguntar ao Gui antes de implementar
1. **Rota B ("Explorar a Selva") na abertura:** nesse ponto o visitante ainda não escolheu serviço. Proposta: página editorial simples com visão geral da Selva, os 4 grupos de serviço e os cases, linkando para as páginas de serviço. Confirmar.
2. Redação final da pergunta de interesse e das alternativas.
3. Texto do convite para a jornada.
4. Regras de pontuação e textos condicionais (v0 em `content/scoring.json`).
5. E-mail, consentimento (LGPD) e qual CRM.
6. Catálogo definitivo de serviços.
7. Revisão da cena 8.
