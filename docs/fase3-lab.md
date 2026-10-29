# Fase 3 — Laboratório da cena 0

Compara **vídeo com scrub** e **sequência de frames** com o trecho real, usando o mesmo contrato de `SceneAsset` da jornada. Aparelho de referência: iPhone 15 Pro, Safari.

## 1. Gerar os assets a partir do bruto
```bash
# T1 (e T2 quando chegar) em assets-src/ — fora do git
# trechos atuais (originais do Magnific, 29/10/2026):
npm run prepare:scene -- --scene cena0 --in assets-src/t1.mp4 --in assets-src/t2.mp4
# padrão de nomes daqui em diante:
npm run prepare:scene -- --scene cena0 --in assets-src/cena0-T1.mp4 --in assets-src/cena0-T2.mp4
```
Saída em `public/scenes/cena0/`:
- `video/h264-gop6-{desktop,mobile}.mp4`, `h264-gop1-*`, `hevc-gop6-*` (GOP curto para o Safari buscar quadro rápido; GOP 1 = todo quadro é keyframe)
- `frames/{desktop,mobile}/NNNN.webp` (desktop 1280 de largura, mobile 540 com recorte 9:16)
- `poster-*.jpg` e `manifest.json` com os bytes de cada variante (é o peso real medido)

Os assets gerados entram no git **só nas branches de teste da Fase 3**. Na Fase 4 vão para CDN/Blob.

## 2. Rodar o laboratório
`/lab/cena0` (não indexada). Seletor de técnica, variante (desktop 16:9 ou mobile 9:16) e codec. O painel mede:
fps durante o scroll, atraso máximo entre quadro pedido e exibido, quadros apresentados e descartados, tempo até o primeiro quadro, bytes baixados, tempo médio de seek/decodificação, bitmaps residentes (frames), memória JS (só Chrome).

## 3. Teste no iPhone (Gui)
1. Abra a URL de preview da branch na Vercel (ou o link público do Codespace) e vá em `/lab/cena0`.
2. Para cada combinação abaixo: role até o fim da cena e volte, 3 vezes, no ritmo normal; toque em **Copiar relatório** e cole na conversa.
   - vídeo · mobile · h264-gop6
   - vídeo · mobile · hevc-gop6
   - vídeo · mobile · h264-gop1
   - frames · mobile
3. Repita a combinação vencedora com **Modo de Baixo Consumo** ligado.
4. Anote o que sentiu: travou? pulou quadro? aqueceu? Esse relato vale tanto quanto os números.

## 4. Critérios de aprovação
- Scroll sem travar e sem salto visível; atraso máximo ≤ 2 quadros.
- Primeiro quadro em ≤ 2 s em 4G (desligue o Wi-Fi para esse item).
- Sem recarregamento da página por memória em uma passagem completa pela jornada.
- Funciona em Modo de Baixo Consumo.
- Peso: meta de 8 MB por cena no mobile; o limite só é fixado depois de medir a cena 0 completa (20 s) nas duas técnicas — o `manifest.json` traz os números.
- `prefers-reduced-motion`: pôster estático.

## 5. Relatório
Resultados e recomendação vão em `docs/fase3-relatorio.md`.
