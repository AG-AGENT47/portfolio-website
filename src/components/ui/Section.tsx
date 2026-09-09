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
  /** Long sections: cap the body at ~72vh behind a fade with a more/less toggle.
      Never clamps on mobile (there, scrolling is the natural affordance). */
  collapsible?: boolean;
}

// Deterministic 0–1 offset derived from the section id, so the tide wave starts
// at a stable phase per section and server/client render identical markup
// (Math.random() here caused a hydration mismatch on every load).
function hashOffset(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return (Math.abs(h) % 997) / 997;
}

// Keep in sync with --collapse-max in globals.css.
const COLLAPSE_RATIO = 0.72;

export function Section({
  id,
  label,
  title,
  children,
  dark = false,
  tide = true,
  tideColor,
  tideColor2,
  collapsible = false,
}: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [needsToggle, setNeedsToggle] = useState(false);
  const offset = useMemo(() => hashOffset(id), [id]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!collapsible) return;
    const check = () => {
      const el = bodyRef.current;
      if (!el) return;
      const mobile = window.matchMedia('(max-width: 879px)').matches;
      // scrollHeight ignores the collapsed max-height, so this stays correct
      // whether or not the body is currently clamped.
      setNeedsToggle(!mobile && el.scrollHeight > window.innerHeight * COLLAPSE_RATIO + 48);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [collapsible]);

  const clamp = collapsible && collapsed && needsToggle;

  return (
    <section ref={ref} id={id} className={`fn-section${vis ? ' vis' : ''}${dark ? ' dark' : ''}`}>
      <div className="fn-section-inner">
        <div className="fn-section-label">{label}</div>
        <h2 className="fn-section-title">{title}</h2>
        {collapsible ? (
          <>
            <div ref={bodyRef} className={`fn-collapsible${clamp ? ' is-collapsed' : ''}`}>
              {children}
            </div>
            {needsToggle && (
              <button
                type="button"
                className="fn-more"
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? 'more ↓' : 'less ↑'}
              </button>
            )}
          </>
        ) : (
          children
        )}
      </div>
      {tide && <Tide color={tideColor} color2={tideColor2} offset={offset + 0.5} />}
    </section>
  );
}
