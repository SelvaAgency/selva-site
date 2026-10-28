# SELVA — Novo site (experiência imersiva + diagnóstico)

## Contexto
Site da SELVA Agency (agência boutique de branding e performance digital, São Paulo).
Experiência cinematográfica controlada por scroll, com jornada consultiva e diagnóstico autodeclarado.

**Fonte única de verdade:** `docs/briefing-v01.pdf`. Se este arquivo e o briefing conflitarem, o briefing vence. Em dúvida, pergunte antes de decidir.

## Regras inegociáveis
1. **Conteúdo fora do código.** Todo texto vive em `/content` (JSON). Componentes nunca têm texto hardcoded.
2. **Textos com `status: "aprovado"` não podem ser alterados.** Textos com `status: "proposta"` só mudam se o Gui pedir.
3. **Não inventar** cases, métricas, depoimentos, nomes de clientes, serviços ou escopos. Use placeholders visíveis no formato `[PLACEHOLDER — descrição]`.
4. **Diagnóstico:**
   - Sem nota numérica (nada de 0–100 ou percentual).
   - Sem linguagem que sugira auditoria técnica (velocidade, SEO, indexação, vendas).
   - O panorama sempre traz a ressalva de que se baseia em respostas do visitante.
   - O panorama aparece antes de qualquer pedido de e-mail.
5. **Os textos não mencionam a metáfora visual** (selva, árvore, raiz, clareira, praia, caminho na mata). O visual é selva; o texto é empresarial.
6. **Sem áudio.** Sem voz e sem trilha na v1. Todo texto é texto de tela.
7. **Dados e privacidade:** nenhum envio a CRM ou analytics sem consentimento explícito. Na v1, eventos vão para um adapter mock (console), com interface pronta para trocar depois.
8. **Tom verbal:** empresarial, consultivo, direto. Nada de slogans genéricos ou aforismos.

## Linguagem gráfica
- **Reaproveitar** do site atual (selva.up.railway.app): tipografia, cores, grid, elementos geométricos e os cases.
- **Não reaproveitar** nenhum texto do site atual.
- Antes de criar o design system, inspecionar o site e o repositório atuais e extrair tokens (cores, fontes, espaçamentos, raios, motion) para `src/styles/tokens`. Mostrar os tokens extraídos para aprovação antes de seguir.

## Stack
- Next.js (App Router) + TypeScript
- GSAP + ScrollTrigger para a câmera no scroll; Lenis para smooth scroll
- Zustand com persist em sessionStorage para o estado da jornada
- **Cenas realistas (decidido):** vídeo ou sequência de frames controlada pelo scroll. Na fase de protótipo, usar imagens estáticas de placeholder com a mesma API de cena, para trocar o asset sem mexer na lógica.
- **Intervenções geométricas:** SVG ou canvas; WebGL leve só se necessário.
- Deploy de preview por branch.

## Arquitetura de rotas
- `/` — experiência imersiva (cenas 0 a 8)
- `/servicos/[slug]` — páginas "duras" de serviço: simples, objetivas, com explicação, cases e contato. São o destino do atalho "Quero ir direto ao que procuro". Indexáveis, renderizadas no servidor, sem dependência de 3D. Estrutura em `content/services.json`.
- `/projetos` — Rota B. **Formato a confirmar** (ver `docs/decisions.md`, item 1).
- Toda rota interna tem um botão "voltar à jornada" que restaura a cena e as respostas da sessão.

## Estrutura de conteúdo
- `content/scenes.json` — cenas, blocos de texto, escolhas, status de aprovação
- `content/questions.json` — pergunta de interesse e as 9 perguntas do diagnóstico
- `content/scoring.json` — regras de avaliação e textos condicionais do panorama
- `content/services.json` — serviços (placeholders até o catálogo ser fechado)

## Estado da jornada (modelo)
```ts
type Answer = { dimension: 'infra' | 'marca' | 'performance'; questionId: string; optionId: string | null; at?: number }
type Journey = { route: 'A' | 'B' | null; interest: string | null; currentScene: string; answers: Answer[] }
```
- `optionId: null` significa pergunta pulada.
- O resultado é calculado por uma função pura a partir de `scoring.json`, com teste unitário.

## Acessibilidade e performance
- Com `prefers-reduced-motion`: sem scrubbing; transições em fade, com o mesmo conteúdo.
- Todas as escolhas são operáveis por teclado, com foco visível.
- Fallback leve (imagens estáticas) para conexão lenta ou dispositivo fraco.
- Mobile first. Os assets de cena carregam de forma progressiva: cena atual e a próxima.
- Os textos aparecem em blocos ao longo do scroll, nunca como parede de texto.

## Fluxo de trabalho
- Antes de qualquer etapa grande, apresentar um plano e aguardar aprovação.
- Uma cena ou feature por branch. Commits pequenos e descritivos.
- Ao fechar cada etapa:
  - rodar o build e os testes;
  - checar em viewport mobile;
  - listar o que ficou pendente.
- Pendências do briefing (seção 8) não são decididas sozinho: registrar a dúvida em `docs/decisions.md` e perguntar.

## Fases
1. Setup e extração de tokens do site atual
2. **Protótipo cinza:** fluxo completo das cenas 0 a 8, com placeholders, quiz, estado e panorama
3. Teste técnico da cena 0 (sobrevoo e descida) com vídeo ou frames reais, validado no mobile
4. Integração dos assets reais das cenas
5. Rota B, páginas de serviço, consentimento, CRM e eventos de funil
6. QA: mobile, reduced motion, fallback, performance, acessibilidade
