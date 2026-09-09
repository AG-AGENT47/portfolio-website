'use client';
import { useRef, useEffect, useState, useMemo } from 'react';
import { Tide } from './Tide';

interface SectionProps {
  id: string;
  label: string;
  title: React.ReactNode;
  children: React.ReactNode;
  dark?: boolean;
  tide?: boolean;
  tideColor?: string;
  tideColor2?: string;
}

// Deterministic 0–1 offset derived from the section id, so the tide wave starts
// at a stable phase per section and server/client render identical markup
// (Math.random() here caused a hydration mismatch on every load).
function hashOffset(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return (Math.abs(h) % 997) / 997;
}

export function Section({ id, label, title, children, dark = false, tide = true, tideColor, tideColor2 }: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  const offset = useMemo(() => hashOffset(id), [id]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={`fn-section${vis ? ' vis' : ''}${dark ? ' dark' : ''}`}>
      {/* Crest at the section's own top edge, so anchor-jumping to a section
          lands you on its wave breaking into the content — not on the trailing
          wave of the section above. Always the default sand tone: this wave
          washes IN, the per-section colour belongs to the wave washing OUT. */}
      {tide && <Tide flip offset={offset} />}
      <div className="fn-section-inner">
        <div className="fn-section-label">{label}</div>
        <h2 className="fn-section-title">{title}</h2>
        {children}
      </div>
      {tide && <Tide color={tideColor} color2={tideColor2} offset={offset + 0.5} />}
    </section>
  );
}
