'use client';
import { useTide } from './TideContext';

function tidePath(p: number, amp: number, freq: number, w: number, h: number): string {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 32; i++) {
    const x = (i / 32) * w;
    const phase = (i / 32) * Math.PI * 2 * freq + p * Math.PI * 2;
    const y = h / 2 + Math.sin(phase) * amp * (0.6 + p * 0.4);
    pts.push([x, y]);
  }
  let d = `M0,${h} L0,${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    const [px, py] = pts[i - 1];
    d += ` Q${(px + x) / 2},${py} ${x},${y}`;
  }
  d += ` L${w},${h} Z`;
  return d;
}

interface TideProps {
  flip?: boolean;
  color?: string;
  color2?: string;
  offset?: number;
}

export function Tide({ flip = false, color = '#e8d9c0', color2 = '#d9c8a8', offset = 0 }: TideProps) {
  const t = useTide();
  const p = (t + offset) % 1;

  return (
    <svg
      className={`fn-tide${flip ? ' flip' : ''}`}
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={tidePath(p % 1, 28, 2.2, 1440, 120)} fill={color2} opacity="0.55" />
      <path d={tidePath(((p + 0.3) % 1), 22, 3.0, 1440, 120)} fill={color} opacity="0.7" />
    </svg>
  );
}
