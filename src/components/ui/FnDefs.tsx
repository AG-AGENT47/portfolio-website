'use client';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useEffect, useState } from 'react';

export function FnDefs() {
  const reduced = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    setIsDesktop(window.innerWidth > 879);
    const handler = () => setIsDesktop(window.innerWidth > 879);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (reduced || !isDesktop) return null;

  return (
    <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
      <defs>
        <filter id="fn-edge" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" />
        </filter>
        <filter id="fn-water" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="3" seed="9" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="22" />
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
    </svg>
  );
}
