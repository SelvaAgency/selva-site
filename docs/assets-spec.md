# Especificação dos assets de cena

Atualizado em 29/10/2026 a partir das orientações do Gui.

## Vídeos entregues pela Selva
| Item | Valor |
|---|---|
| Proporção | 16:9 |
| Resolução | 1080p (1920×1080) |
| Taxa de quadros | 30 fps |
| Duração | trechos de 10 s (300 quadros) |
| Áudio | nenhum (regra 6 do CLAUDE.md) |
| Mobile | recorte central vertical (9:16 a partir do centro do quadro) |

## Luz por posição de scroll
A luz não é fixa por cena: muda com a posição do scroll, quando a câmera atravessa o dossel. Campo `light` em `content/scenes.json`: string (`clara` | `escura`) ou `{ from, to, switchAt }` com `switchAt` em progresso 0–1 da cena.
- **Cena 0:** `{ from: "clara", to: "escura", switchAt: 0.65 }`. Texto de abertura sobre a névoa clara (texto escuro, degradê creme por trás); escolhas no solo escuro da floresta. Texto, botões e HUD trocam de variante juntos. A cena 0B já começa escura, sem corte.
- `switchAt` é provisório: será calibrado pelo quadro real em que a câmera atravessa o dossel no trecho T1.
- Demais cenas: escuras até nova orientação.

## Clipes de teste (Fase 3)
- `assets-src/` guarda os brutos entregues pelo Gui e **não entra no git**.
- T1: trecho real da cena 0, 720p, 30 fps, 10 s. A cena 0 completa tem dois trechos (20 s).
- Os scripts em `scripts/` geram as versões otimizadas em `public/` a partir de `assets-src/`.

## Contrato técnico (Fase 3 define a técnica)
- O componente `SceneAsset` recebe `progress` (0–1) e `shouldLoad`; vídeo com scrub e sequência de frames implementam o mesmo contrato.
- Recorte mobile: `object-fit: cover; object-position: 50% 50%` sobre o quadro 16:9, o que equivale ao recorte central vertical pedido.
- Carregamento progressivo: cena atual e a próxima.
