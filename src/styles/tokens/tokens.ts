/**
 * SELVA — tokens em TypeScript (para GSAP, canvas e lógica de cena).
 * Espelha src/styles/tokens/tokens.css. Fonte: site atual (legacy/). Ver docs/tokens.md.
 */

export const colors = {
  ink: '#0B0B0C',
  paper: '#F6F5E6',
  orange: '#ED6E1A',
  orangeDeep: '#B9500F',
  blue: '#4165F4',
  navy: '#00206B',
  navyLight: '#0E2F8F',
  pink: '#F7B2D9',
  grey: '#C9C9C9',
  red: '#D9432B',
} as const;

/** Paleta dos cases do site atual (fundo/texto por case). Fonte: legacy/cases.json */
export const casePalette = {
  baesh: { bg: '#D9432B', fg: '#F6F5E6' },
  scaffoldPlay: { bg: '#141414', fg: '#F6F5E6' },
  ligvegan: { bg: '#9BF2B9', fg: '#0F3B22' },
  arka: { bg: '#1E9BE0', fg: '#FBF7EA' },
  nikaya: { bg: '#2A0D3E', fg: '#EBDCFF' },
  surfJunkieClub: { bg: '#EE3FA8', fg: '#121212' },
  overCoffee: { bg: '#ECE5CB', fg: '#1F4A33' },
  imagine: { bg: '#B5562F', fg: '#FFF4EA' },
  inverness: { bg: '#0E6B3F', fg: '#F6F5E6' },
  vcf: { bg: '#16213F', fg: '#EEF5B0' },
} as const;

export const fonts = {
  sans: "'Archivo', Arial, sans-serif",
  mono: "'Space Mono', ui-monospace, monospace",
  /** Google Fonts: Archivo variável (wdth 62–125, wght 100–900) + Space Mono 400/700 */
  googleFontsHref:
    'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Space+Mono:wght@400;700&display=swap',
  display: { weight: 900, stretch: 125, tracking: '-0.025em', leading: 0.86 },
  lead: { weight: 700, leading: 1.08, tracking: '-0.02em' },
  body: { weight: 500, leading: 1.4 },
  label: { size: 12, tracking: '0.08em', transform: 'uppercase' as const },
  button: { size: 14, weight: 800 },
  /** Eixo de largura do Archivo usado no texto cinético: 62 (condensado) a 125 (expandido) */
  widthAxis: { min: 62, max: 125 },
} as const;

/** Easings em formato CSS e equivalentes GSAP (CustomEase) */
export const easing = {
  out: 'cubic-bezier(.2,.8,.2,1)',
  inOut: 'cubic-bezier(.65,0,.35,1)',
  inOutStrong: 'cubic-bezier(.76,0,.24,1)',
  wipe: 'cubic-bezier(.7,0,.2,1)',
  in: 'cubic-bezier(.7,0,.8,.4)',
  gsap: {
    out: '0.2,0.8,0.2,1',
    inOut: '0.65,0,0.35,1',
    inOutStrong: '0.76,0,0.24,1',
    wipe: '0.7,0,0.2,1',
    /** função usada no JS do site atual para reveals progressivos */
    inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  },
} as const;

/** Durações em segundos */
export const duration = {
  fast: 0.25, base: 0.3, ui: 0.35, med: 0.4, slow: 0.6, wipe: 0.8,
  reveal: 0.9, line: 1.1, fade: 1.2, cover: 1.4,
  staggerLine: 0.08, staggerChar: 0.045, delayBlock: 0.5,
  loopPulse: 1.6, loopDrip: 1.8, loopSpin: 22,
} as const;

/** Parâmetros do motor de scroll do site atual */
export const scroll = {
  velocityLerp: 0.15,
  pointerLerp: 0.06,
  /** alturas de pin em múltiplos da viewport */
  pin: { hero: 3, cases: 6.5, servicesA: 3.4, servicesB: 2.4 },
  dprMax: 2,
  /** banda pixelada entre seções: colunas por largura */
  pixelBandCols: { desktop: 28, mobile: 14 },
  pixelBandHeight: 'clamp(90px,12vw,170px)',
} as const;

export const layout = {
  gutter: 'clamp(16px,3vw,40px)',
  navOffset: 92,
  edgeBottom: 24,
  breakpointMobile: 760,
  hitMin: 44,
  measureCh: 46,
} as const;

export const radius = {
  xs: 2, m: 12, l: 16, xl: 18, pill: 999,
  section: 'clamp(28px,4vw,56px)',
} as const;

export const border = { thin: 1.5, base: 2, focus: 3, focusOffset: 4 } as const;
