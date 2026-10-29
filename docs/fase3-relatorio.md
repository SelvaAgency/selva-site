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

## 3. iPhone 15 Pro, Safari (Gui)
[colar aqui os relatórios copiados em /lab/cena0, uma combinação por bloco]

## 4. Recomendação
[após as medições no iPhone]
