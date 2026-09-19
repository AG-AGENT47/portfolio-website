'use client';

/* ============================================================
   Tide — the wave that closes every section.

   Built once at module scope and animated purely by CSS: three
   seamless layers slide across each other at different speeds,
   so the crest never repeats to the eye. The old version redrew
   every path from a rAF-driven React state 60×/second, which cost
   a full re-render per frame and still stepped in visible notches.
   Here the geometry is static and only `transform` moves — the
   compositor handles it, and it stays glassy on a phone.
   ============================================================ */

// One seamless tile, in SVG user units. The wave is periodic over
// PERIOD, so sliding by exactly PERIOD loops with no seam.
const PERIOD = 1440;
const TILES = 3;
const VB_W = PERIOD * TILES;
// Kept short on purpose: the viewBox is squashed to the strip height, so a
// shallow box spends more of those pixels on crest and less on dead fill.
const FLOOR = 130;

const r = (n: number) => Math.round(n * 100) / 100;

interface Harmonic {
  /** whole cycles per tile — integers keep the loop seamless */
  k: number;
  a: number;
  p: number;
}

interface Layer {
  base: number;
  harmonics: Harmonic[];
  /** seconds for one full PERIOD slide */
  drift: number;
  /** seconds for the slow vertical swell */
  swell: number;
  lift: number;
  opacity: number;
  reverse?: boolean;
}

// Summed harmonics rather than a single sine: the crests stop looking
// stamped-out and start looking like water.
function waveY(x: number, layer: Layer): number {
  let y = layer.base;
  for (const h of layer.harmonics) {
    y += h.a * Math.sin((x / PERIOD) * Math.PI * 2 * h.k + h.p);
  }
  return y;
}

// Catmull-Rom through the samples, converted to cubic Béziers. Quadratics
// (what this used before) only match position at the joins, so a coarse
// sample rate reads as faceted; cubics match the tangent too and the curve
// comes out genuinely smooth at a fraction of the point count.
function wavePath(layer: Layer): string {
  const step = PERIOD / 20;
  const n = Math.round(VB_W / step);
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = i * step;
    pts.push([x, waveY(x, layer)]);
  }

  let d = `M${r(pts[0][0])},${r(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${r(c1x)},${r(c1y)} ${r(c2x)},${r(c2y)} ${r(p2[0])},${r(p2[1])}`;
  }
  d += ` L${VB_W},${FLOOR} L0,${FLOOR} Z`;
  return d;
}

const LAYERS: Layer[] = [
  // Far swell — broad, pale, barely moving.
  {
    base: 34,
    harmonics: [{ k: 1, a: 20, p: 0 }, { k: 2, a: 8, p: 1.1 }, { k: 3, a: 4, p: 2.4 }],
    drift: 34,
    swell: 17,
    lift: 7,
    opacity: 0.38,
  },
  // Mid swell — runs the other way, so the two interfere instead of marching.
  {
    base: 56,
    harmonics: [{ k: 1, a: 15, p: 2.0 }, { k: 2, a: 10, p: 0.4 }, { k: 5, a: 3, p: 1.0 }],
    drift: 23,
    swell: 13,
    lift: 5,
    opacity: 0.6,
    reverse: true,
  },
  // Near crest — opaque, so the bottom of the wave is a clean colour seam
  // into the next section.
  {
    base: 78,
    harmonics: [{ k: 1, a: 12, p: 4.1 }, { k: 3, a: 6, p: 0.8 }, { k: 2, a: 4, p: 2.6 }],
    drift: 15,
    swell: 9,
    lift: 4,
    opacity: 1,
  },
];

const PATHS = LAYERS.map(wavePath);

interface TideProps {
  flip?: boolean;
  /** Near crest — set it to the background of the section below. */
  color?: string;
  /** Far swells. */
  color2?: string;
  /** 0–1 phase seed so no two sections show the same crest. */
  offset?: number;
}

export function Tide({ flip = false, color = '#e8d9c0', color2 = '#d9c8a8', offset = 0 }: TideProps) {
  return (
    <div className={`fn-tide${flip ? ' flip' : ''}`} aria-hidden="true">
      <svg viewBox={`0 0 ${VB_W} ${FLOOR}`} preserveAspectRatio="none" focusable="false">
        {LAYERS.map((layer, i) => (
          <g
            key={i}
            className="fn-tide-swell"
            style={{
              animationDuration: `${layer.swell}s`,
              animationDelay: `${-offset * layer.swell}s`,
              // Per-layer lift, read by the shared keyframes.
              ['--lift' as string]: `${layer.lift}px`,
            }}
          >
            <g
              className={`fn-tide-drift${layer.reverse ? ' rev' : ''}`}
              style={{
                animationDuration: `${layer.drift}s`,
                animationDelay: `${-offset * layer.drift}s`,
              }}
            >
              <path d={PATHS[i]} fill={i === 2 ? color : color2} opacity={layer.opacity} />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
