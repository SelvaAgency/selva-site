# Especificação dos assets de cena

Atualizado em 29/10/2026 a partir das orientações do Gui.

## Vídeos entregues pela Selva
| Item | Valor |
|---|---|
| Proporção | 16:9 |
| Resolução | 1080p (1920×1080) |
| Taxa de quadros | 24 fps |
| Duração | trechos de 10 s (240 quadros) |
| Áudio | nenhum (regra 6 do CLAUDE.md) |
| Mobile | recorte central vertical (9:16 a partir do centro do quadro) |

## Direção de luz por cena
- **Cena 0 — Sobrevoo, descida e escolha:** névoa densa, céu cinza-claro quase branco. Texto escuro com degradê sutil (creme) por trás. Campo `light: "clara"` em `content/scenes.json`.
- Demais cenas: padrão escuro até nova orientação.

## Contrato técnico (Fase 3 define a técnica)
- O componente `SceneAsset` recebe `progress` (0–1) e `shouldLoad`; vídeo com scrub e sequência de frames implementam o mesmo contrato.
- Recorte mobile: `object-fit: cover; object-position: 50% 50%` sobre o quadro 16:9, o que equivale ao recorte central vertical pedido.
- Carregamento progressivo: cena atual e a próxima.
