# Fase 3 — Relatório: técnica da cena 0

Em andamento. Fonte: T1 (720p) + T2 (1080p), originais do Magnific, 30 fps, 20 s no total, concatenados em 1920×1080 (T1 ampliado). Emenda não final.

## 1. Peso real da cena 0 (20 s, 600 quadros)

| Variante | Desktop 16:9 (1920×1080) | Mobile 9:16 (608×1080) |
|---|---|---|
| Vídeo H.264, keyframe a cada 6 quadros | 30,85 MB | 11,63 MB |
| Vídeo H.264, todo quadro keyframe | 46,21 MB | 17,10 MB |
| Vídeo HEVC, keyframe a cada 6 quadros | 21,70 MB | **8,71 MB** |
| Vídeo VP9, keyframe a cada 6 quadros (Chromium/Android) | — | 12,80 MB |
| Frames WebP q72 (desktop 1280×720 · mobile 540×960) | 41,01 MB | 23,80 MB |

Leitura: com a meta de 8 MB por cena no mobile, só o HEVC com GOP curto chega perto. Os frames em WebP ficam quase 3× acima. Há margem para reduzir (q60, 480 px de largura, AVIF), mas a ordem de grandeza não muda: frames custam mais rede, vídeo custa mais precisão de seek.

## 2. Emulação (Chromium headless, 29/10/2026) — valida a mecânica, não decide

Limitações: o Chromium do Playwright não decodifica H.264/HEVC (a técnica de vídeo só rodou com VP9); o scroll do teste é em saltos de 30 quadros a cada 120 ms, mais agressivo que um dedo; a máquina estava compartilhada com o build, o que explica a variação de fps entre rodadas. Os números que decidem vêm do iPhone.

| Medição | Vídeo VP9 · mobile | Frames · mobile (540 px) | Frames · desktop (1280 px) |
|---|---|---|---|
| fps durante o scroll | 60 | 57–59 | 20–52 |
| quadro pedido vs exibido ao fim | 223 / 223 | 247 / 247 | 278 / 278 |
| seek / decodificação média | 26,5 ms | 20,8–22,3 ms | 36,7–37,7 ms |
| 1º quadro | 203 ms | 50–74 ms | 85–96 ms |
| bitmaps residentes (janela ±12) | — | 25 | 25 |
| baixado | 12,80 MB | 23,80 MB | 41,01 MB |

O que a emulação mostrou:
- O contrato de `SceneAsset` funciona nas duas técnicas sem mexer na lógica das cenas.
- Vídeo com scrub: seek de ~26 ms e atraso zero com GOP de 6 quadros no VP9. Resta saber o Safari com HEVC/H.264.
- Frames: a primeira versão do adaptador acumulava bitmaps (190–225 residentes) e empilhava decodificações (730–2.900 ms). Com fila por proximidade, 3 decodificações simultâneas e descarte fora da janela, ficou em 25 residentes e ~22 ms por quadro.
- O "atraso máximo" registrado (235–266 quadros) vem do salto final do script de teste, de 0 para o meio da cena; não é representativo. No iPhone, com scroll real, o painel mede o atraso verdadeiro.

## 3. Projeção da jornada completa (10 trechos de 10 s = 100 s, 3.000 quadros)

Base: peso medido da cena 0 (2 trechos) dividido por 2. T1 foi ampliado de 720p para 1080p, então o trecho real em 1080p tende a pesar um pouco mais que esta média.

| Técnica | Por trecho · desktop | Jornada · desktop | Por trecho · mobile | Jornada · mobile |
|---|---|---|---|---|
| HEVC, keyframe a cada 6 | 10,9 MB | **109 MB** | 4,4 MB | **44 MB** |
| H.264, keyframe a cada 6 | 15,4 MB | 154 MB | 5,8 MB | 58 MB |
| Frames WebP (referência) | 20,5 MB | 205 MB | 11,9 MB | 119 MB |

Ninguém baixa a jornada inteira de uma vez: o carregamento é progressivo, cena atual e a próxima (CLAUDE.md). O que o visitante sente é o peso do **primeiro trecho** e o de cada trecho seguinte, baixado enquanto ele lê a cena anterior. Por isso a meta é por trecho, com um teto para a soma.

**Meta proposta**
- Mobile: ≤ 5 MB por trecho, ≤ 50 MB na jornada completa; primeiro trecho ≤ 4 MB.
- Desktop: ≤ 12 MB por trecho, ≤ 120 MB na jornada completa.
- Caminhos para fechar na meta, a confirmar no iPhone: HEVC com CRF 28 em vez de 26; keyframe a cada 10 quadros em vez de 6, se o seek no Safari continuar sem atraso; largura mobile de 540 px em vez de 608. Juntos, costumam render 25–35 %.
- Fallback H.264 fica ~35 % acima da meta; aceitável no desktop (Windows sem HEVC) e raro no mobile, onde iPhone usa HEVC e Android pode usar VP9 (12,8 MB nos 20 s medidos, com margem para cair).

## 3b. Palco único com janela deslizante (29/10/2026)

Arquitetura adotada na branch `preview/cena0-real`: um palco de vídeo fixo no fundo; o scroll da jornada controla uma linha do tempo contínua; cada cena com asset toca o seu trecho e segura o último quadro sob os textos e perguntas. Na fronteira, o último quadro de um trecho é o primeiro do seguinte, e a troca é só visibilidade.

Janela: só o trecho atual, o anterior (pré-posicionado no último quadro) e o seguinte (no primeiro) ficam montados; o que sai é desmontado e a mídia liberada (`load()` sem fontes). Verificado por instrumentação em Chromium emulando iPhone, com 4 trechos (cenas 0, 0B, 1 e 2): a janela desliza corretamente nos dois sentidos e os vizinhos chegam já no quadro certo.

| Medição (Chromium headless, 4 trechos, 24 MB no total) | Janela 1 (3 montados) | Todos montados |
|---|---|---|
| Heap JS máximo | 7 MB | 7 MB |
| RSS máximo de todos os processos do navegador | 866 MB | 872 MB |

Leitura: com só 4 trechos pequenos, a diferença fica dentro do ruído (o RSS base do Chromium headless é ~800 MB). A janela importa no iOS, onde o Safari limita decodificadores de vídeo simultâneos e descarta mídia sob pressão de memória; com 10 trechos de 1080p, manter todos montados é o cenário que costuma falhar. O painel do laboratório (`/lab/cena0?tecnica=palco&janela=1`) mostra quais trechos estão montados; no iPhone, a medição de memória vem do Web Inspector (Safari no Mac com o aparelho no cabo) ou do comportamento do aparelho.

## 4. iPhone 15 Pro, Safari (Gui)
[colar aqui os relatórios copiados em /lab/cena0, uma combinação por bloco]

## 5. Recomendação (parcial; fecha com as medições do iPhone)

**Técnica:** vídeo com scrub, não sequência de frames. Os frames custam 2,7× mais rede no mobile e ocupam a thread principal com decodificação; o vídeo usa o decodificador de hardware e cabe na meta. A sequência de frames fica como plano B apenas se o Safari mostrar seek irregular no HEVC com GOP curto, o que o laboratório vai responder.

**Codecs:** HEVC (`hvc1`) como principal, com fallback H.264 por navegador. Implementação: `<video>` com dois `<source>`, HEVC primeiro e H.264 depois; o navegador escolhe o primeiro que decodifica (Safari iOS/macOS e Chrome com decodificação de hardware pegam HEVC; Windows sem codec, Firefox e Android antigos caem no H.264). O `manifest.json` já carrega as duas variantes; o adaptador passa a montar os `<source>` em vez de um `src` único. Opcional: VP9 para Chrome/Android, se os números do Android pedirem.

**Keyframes:** GOP curto é o que faz o scrub responder (o Safari busca a partir do keyframe anterior). Começar com 6 quadros; subir para 10 se o iPhone mostrar atraso zero, porque reduz o peso.

**Carregamento:** cena atual e a próxima, `preload="auto"` só nelas; pôster JPEG como primeiro pixel; `prefers-reduced-motion` mostra o pôster.

**Armazenamento (Fase 4):** assets fora do git, em armazenamento de mídia com CDN. Opções: Cloudflare R2 (sem custo de saída de dados, API S3, domínio próprio tipo `media.selva.agency`, cache na borda) ou Vercel Blob (integração mais simples com o projeto, saída de dados cobrada). Recomendo R2 pelo custo de egress em vídeo; Vercel Blob se a prioridade for um fornecedor só. Em código: `NEXT_PUBLIC_MEDIA_BASE` prefixando os caminhos do manifest; `scripts/prepare-scene.mjs` ganha um passo de upload. Decisão registrada em `docs/decisions.md`.
