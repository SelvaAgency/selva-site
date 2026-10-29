# Decisões e pendências

## Decididas (28/10/2026)
- Linguagem gráfica e cases: reaproveitar do site atual (selva.up.railway.app). Texto: só o do briefing.
- Técnica visual: vídeo ou frames controlados pelo scroll nas cenas realistas; SVG/canvas/WebGL leve nas intervenções geométricas.
- Áudio: nenhum. Só texto de tela.
- Página de serviço (atalho "Quero ir direto ao que procuro"): página "dura", simples, mostrando o serviço selecionado, com explicação, cases e contato.

## Decididas (29/10/2026)
- Direção visual: cena 0 em névoa densa com céu quase branco; texto escuro com degradê sutil por trás. Specs de vídeo em `docs/assets-spec.md` (16:9, 1080p, 24 fps, 10 s, sem áudio, recorte central vertical no mobile).
- Fase 3 exige teste em iPhone real com Safari, não só emulação.
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

## Observadas durante a Fase 2 (29/10/2026) — confirmar com o Gui
8. **Atalho "Quero ir direto ao que procuro":** como os slugs por interesse são placeholders, hoje leva para `/servicos?interesse=<id>` com aviso do interesse escolhido. Quando o catálogo fechar, basta preencher `serviceSlug` em `content/questions.json`.
9. **Rota B em `/projetos`:** implementada como proposta do item 1 (visão geral, 4 grupos, 10 cases do site atual, descrições como placeholder).
10. **Página de serviço inexistente** responde 404 (verificado por HTTP). Só `raio-x-digital` existe como rota real.
11. **Rotas internas** rolam por cima da barra superior fixa no modo de movimento reduzido; aceitável no protótipo, revisar na Fase 6.
12. **Cena 0B no pin:** o bloco de interesse (pergunta + 6 opções) rola internamente em telas baixas. Avaliar se o layout final deve dividir em duas unidades de scroll.
