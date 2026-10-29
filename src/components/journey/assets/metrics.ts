/**
 * Medições do asset durante o scroll. Mesma estrutura para vídeo e frames,
 * para o painel do laboratório comparar as técnicas.
 */
export type AssetMetrics = {
  technique: 'video' | 'frames';
  variantId: string;
  /** quadro pedido pelo scroll e quadro efetivamente exibido */
  targetFrame: number;
  shownFrame: number;
  /** maior diferença observada entre pedido e exibido (em quadros) */
  maxLag: number;
  /** atualizações de progresso recebidas */
  updates: number;
  /** quadros apresentados (rVFC no vídeo; drawImage nos frames) */
  presented: number;
  /** quadros descartados pelo decodificador (vídeo, quando o navegador informa) */
  dropped: number;
  /** ms do mount até o primeiro quadro visível */
  firstFrameMs: number | null;
  /** bytes carregados (frames: soma dos baixados; vídeo: manifest) */
  bytesLoaded: number;
  bytesTotal: number;
  loadedFrames?: number;
  totalFrames?: number;
  /** ms médio de decodificação sob demanda (frames) ou de seek (vídeo) */
  avgDecodeMs: number | null;
  /** bitmaps mantidos em memória no momento (frames) */
  residentFrames?: number;
  /** atraso máximo só nos pedidos cujo quadro já estava baixado (frames): mede decodificação, não rede */
  maxLagLoaded?: number;
  /** pedidos de quadro ainda não baixado (frames) */
  missesNotLoaded?: number;
};

export function newMetrics(technique: AssetMetrics['technique'], variantId: string, bytesTotal: number): AssetMetrics {
  return {
    technique, variantId, targetFrame: 0, shownFrame: 0, maxLag: 0, updates: 0, presented: 0, dropped: 0,
    firstFrameMs: null, bytesLoaded: 0, bytesTotal, avgDecodeMs: null,
  };
}

export class Avg {
  private n = 0;
  private sum = 0;
  add(v: number) { this.n++; this.sum += v; }
  get value() { return this.n ? this.sum / this.n : null; }
}
