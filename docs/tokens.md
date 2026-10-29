# Fase 1 — Tokens extraídos do site atual

Fonte: `legacy/index.html` (snapshot de selva.up.railway.app, commit `da4b339`).
Arquivos gerados: `src/styles/tokens/tokens.css`, `src/styles/tokens/tokens.ts`, `legacy/cases.json`, `legacy/cases/*.jpg`.

Método: CSS inline (22,7 KB) e motor JS (57 KB) lidos integralmente após remover as 19 imagens base64; contagem de ocorrências por valor. Cores de SVG exportado (`#ef701b`, `#fcffee`, `#002068`, `#4269f4`, `#f9b4d3`) são variantes de exportação das cores oficiais e foram normalizadas para os valores do CSS.

## 1. Cores

| Token | Valor | Uso no site atual | Ocorrências |
|---|---|---|---|
| `--selva-ink` | `#0B0B0C` | fundo global, texto sobre claro, theme-color | 61 |
| `--selva-paper` | `#F6F5E6` | texto sobre escuro, intro, adesivos, rodapé | 57 |
| `--selva-orange` | `#ED6E1A` | logo, hover de link, CTA final, `::selection`, cursor | 20 |
| `--selva-blue` | `#4165F4` | manifesto, seção clientes, hover do botão magnético | 17 |
| `--selva-pink` | `#F7B2D9` | texto e borda do painel de serviços A | 14 |
| `--selva-navy` | `#00206B` | fundo do painel de serviços A | 3 |
| `--selva-navy-light` | `#0E2F8F` | face do prisma A | 1 |
| `--selva-grey` | `#C9C9C9` | fundo do painel de serviços B | 3 |
| `--selva-red` | `#D9432B` | palco do carrossel de cases | 2 |
| `--selva-orange-deep` | `#B9500F` | lateral da moeda 3D | 1 |

Transparências recorrentes: paper a 80/75/70/60/40 %; ink a 35/12 %; preto a 35/40 % (sombras).

Paleta por case (fundo/texto), usada na página de case e no carrossel: ver `legacy/cases.json`. São 10 cases: Baesh, Scaffold Play, Ligvegan, Arka, Nikaya, Surf Junkie Club, Over Coffee, Imagine, Inverness, VCF.

## 2. Tipografia

- **Archivo** (Google Fonts, variável): eixo `wdth` 62–125, `wght` 100–900.
- **Space Mono** 400/700 para rótulos.

| Papel | Peso | Largura | Tamanho | Entrelinha | Tracking |
|---|---|---|---|---|---|
| Display | 900 | 125 % | `clamp(40px,7vw,120px)` a `clamp(80px,17vw,300px)` | .8–.92 | −.025 a −.05em |
| Hero | 900 | 125 % | `clamp(34px,5.2vw,82px)` | .86 | −.025em |
| Lead/manifesto | 700 | 100 % | `clamp(26px,3.2vw,50px)` | 1.08 | −.02em |
| Corpo | 500 | 100 % | `clamp(15px,1.2vw,18px)` a `clamp(18px,1.6vw,24px)` | 1.35–1.4 | 0 |
| Rótulo mono | 400 | — | 12 px, uppercase | 1.5 | .08em |
| UI | 500 | — | 13 px (créditos, %), 11 px (cursor) | 1.2 | 0 |
| Botão | 800 | — | 14 px | 1 | 0 |

Recurso autoral: texto cinético que varia o eixo `wdth` de 62 a 125 conforme o scroll; texto em contorno (`-webkit-text-stroke` 1,5–2 px); reveal de manchete por linha (clip + translateY, stagger 80 ms) e por caractere (stagger 45 ms, rotação 8°).

## 3. Espaçamento e grid

- Gutter universal `clamp(16px,3vw,40px)`. Sem `max-width` de container: layout full-bleed.
- Conteúdo começa a 92 px do topo (nav fixa com padding 18 px). Créditos a 24 px da base.
- Seções: padding vertical `clamp(70px,8vw,120px)` em cima, `clamp(60px,6vw,90px)` a `clamp(110px,10vw,160px)` embaixo.
- Gaps: 2, 6, 8, 10, 12, 16, 20, 24, 40 px; grid `clamp(12px,2vw,24px)`; blocos `clamp(24px,4vw,60px)`.
- Colunas: flex-wrap com base fixa (520 / 420 / 340 px); grid de 4 colunas no rodapé, 2 no mobile.
- Breakpoint único: 760 px. Medida de parágrafo: 40–46 ch.
- Alvo de toque mínimo 44 px (48 px em pill-btn); botão circular 52 px.

## 4. Raios, bordas, sombras

- Raios: 2 (lateral de moeda), 12 (imagens, cards), 16 (hero de case, prisma), 18 (depoimento), `clamp(28px,4vw,56px)` (topo de painel empilhado), 999 (pill), 50 % (círculos).
- Bordas: 1,5 px (tags, chips), 2 px (botões, prisma, réguas). Foco: `3px solid currentColor`, offset 4 px.
- Sombras: `0 -30px 60px rgba(0,0,0,.35)` (painel que sobe), `0 30px 60px rgba(0,0,0,.4)` (card), `drop-shadow(0 6px 0 rgba(11,11,12,.12))` (adesivo: offset duro, sem blur).

## 5. Motion

| Token | Valor | Uso |
|---|---|---|
| `--ease-out` | `cubic-bezier(.2,.8,.2,1)` | padrão (9 ocorrências): hovers, reveals, entradas |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | intro eclipse |
| `--ease-in-out-strong` | `cubic-bezier(.76,0,.24,1)` | transições de painel |
| `--ease-wipe` | `cubic-bezier(.7,0,.2,1)` | saída da intro (clip-path) |
| JS | easeInOutCubic | progresso de reveals no scroll |

Durações: .25 / .3 / .35 / .4 / .6 / .8 / .9 / 1.1 / 1.2 / 1.4 s. Loops: pulse 1,6 s, drip 1,8 s, spin 22–28 s linear.

Motor de scroll: sem biblioteca (rAF próprio). Seções "pinadas" com altura em múltiplos de `100vh` (hero 3, cases 6,5, serviços 3,4 e 2,4). Lerp de velocidade .15, de ponteiro .06. DPR limitado a 2. `prefers-reduced-motion`: intro oculta, loops e entradas desligados, `scroll-behavior: auto`.

## 6. Elementos geométricos (inventário para reaproveitar)

1. **Logo**: quadrado laranja `#ED6E1A` (padding 6×9 px) com pílula oval creme e "SELVA" em Archivo 900/125 %, 19 px, tracking −.03em. Hover: rotate(−4°) scale(1.06).
2. **Favicon/selo**: círculo preto com "S" creme e anel orbital (`legacy/favicon.svg`).
3. **Intro eclipse**: dois círculos de 62 vmin com `mix-blend-mode: difference` que se cruzam e explodem; saída por `clip-path` wipe.
4. **Bandas pixeladas**: canvas entre seções; grade de quadrados (28 colunas desktop, 14 mobile) que dissolve uma cor na outra conforme a visibilidade.
5. **Partículas do hero**: pontos que formam a palavra SELVA e se reorganizam em órbitas (fases "Saturno"), com paralaxe de mouse.
6. **Moedas**: elipses 340:100, face laranja com oval creme, lateral `#B9500F`, giram em 3D.
7. **Carrossel-anel de cases**: cards 4:5 (raio 12) distribuídos num anel 3D, arrastável; barra de progresso de 2 px com ponto.
8. **Prismas pentagonais**: 5 faces (72°), raio 16, borda 2 px, giram com o scroll; chips de lista acendem por face.
9. **Adesivos**: cápsulas e ovais em SVG, rotacionadas ±4–8°, arrastáveis, sombra dura.
10. **Globo**: círculo preto com anel SVG girando e canvas interno.
11. **Chips físicos**: círculos com texto uppercase 900/125 % em simulação de queda.
12. **Painéis empilhados**: seções com topo arredondado que sobem sobre a anterior (sombra para cima, scale .93 e brightness na que fica embaixo).
13. **Nav e cursor** em `mix-blend-mode: difference`; cursor 18 px e rótulo circular laranja de 96 px.
14. **Wordmark gigante** no rodapé dentro de oval creme.

## 7. Proposta para o site novo (aguarda aprovação)

- Aliases semânticos em `tokens.css` (`--color-bg`, `--color-fg`, `--color-accent`, `--color-surface-editorial`): o site novo é dark-first nas cenas 0–5 e editorial (creme) nas cenas 6–8 e páginas de serviço.
- Manter Archivo/Space Mono, gutter, escala de display, easings e durações como estão.
- Reaproveitar geometrias 4 (bandas pixeladas), 8 (prismas), 9 (adesivos) e 12 (painéis empilhados) como "intervenções geométricas" nas transições entre cenas; 7 (anel de cases) na cena 7 e em `/projetos`.
- Não reaproveitar: intro eclipse automática (briefing veta vinheta automática) e cursor customizado (sem valor no mobile).
- Pendente: o site atual não tem tokens de cor para as cenas realistas (floresta). Proposta de camada "scene": overlay `ink` a 0–60 % sobre o vídeo para garantir contraste do texto creme. Definir na Fase 2.
