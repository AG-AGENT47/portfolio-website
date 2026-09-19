'use client';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
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
  /** Opt out of the one-viewport clamp for sections that must show everything. */
  collapsible?: boolean;
  /** Body stretches to fill the frame instead of clamping — for sections whose
      own content can flex (the chat log absorbs the leftover height). */
  fill?: boolean;
}

// Deterministic 0–1 offset derived from the section id, so the tide wave starts
// at a stable phase per section and server/client render identical markup
// (Math.random() here caused a hydration mismatch on every load).
function hashOffset(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return (Math.abs(h) % 997) / 997;
}

// Below this the section is a plain flowing block: no snapping, no clamp —
// on a phone, scrolling is the natural affordance. Keep in sync with the
// media queries in globals.css.
const DESKTOP = '(min-width: 880px)';
// Don't clamp to save a sliver; a toggle has to buy real space. Kept small,
// because anything the body overruns by is a bite out of the wave.
const CLAMP_SLACK = 20;

export function Section({
  id,
  label,
  title,
  children,
  dark = false,
  tide = true,
  tideColor,
  tideColor2,
  collapsible = true,
  fill = false,
}: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [vis, setVis] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  // Pixel budget the body gets before the wave; null = no clamp at all.
  const [budget, setBudget] = useState<number | null>(null);
  // Natural height of the body, kept fresh so the expanded state has a real
  // number to animate to (see bodyMax).
  const [full, setFull] = useState(0);
  const offset = useMemo(() => hashOffset(id), [id]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // A magnetic stop should frame exactly one section: title under the nav,
  // wave on the horizon. So the body gets whatever vertical room is left in
  // the viewport, and anything past that hides behind the fade until asked
  // for. The budget is derived from live geometry rather than a fixed vh
  // guess, so it holds for any title length, font fallback or zoom level.
  const measure = useCallback(() => {
    const sec = ref.current;
    const head = headRef.current;
    const body = bodyRef.current;
    if (!sec || !head || !body) return;

    if (!collapsible || !window.matchMedia(DESKTOP).matches) {
      setBudget(null);
      return;
    }

    const cs = getComputedStyle(sec);
    // The toggle sits below the body and inside the frame, so its box counts
    // against the budget too — miss it and the section runs a button's height
    // past the viewport, which is exactly the overshoot we're removing.
    const more = moreRef.current;
    const moreH = more
      ? more.offsetHeight + parseFloat(getComputedStyle(more).marginTop)
      : 0;
    const chrome =
      parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) +
      head.offsetHeight + moreH;
    const available = Math.max(240, window.innerHeight - chrome);
    // scrollHeight ignores the clamp, so this stays honest once collapsed.
    const natural = body.scrollHeight;
    setFull(natural);
    setBudget(natural > available + CLAMP_SLACK ? available : null);
  }, [collapsible]);

  // `hasToggle` is in the deps so the pass re-runs once the toggle mounts and
  // can finally be measured (it changes the budget by its own height).
  const hasToggle = budget !== null;
  useEffect(() => {
    // Deferred a frame rather than run inline: the first pass needs settled
    // layout (web fonts swap in and change the head's height), and it keeps
    // the effect from setting state synchronously on mount.
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    if (bodyRef.current) ro.observe(bodyRef.current);
    if (headRef.current) ro.observe(headRef.current);
    if (moreRef.current) ro.observe(moreRef.current);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, hasToggle]);

  const clamp = budget !== null && collapsed;
  // Both states carry an explicit max-height so `more`/`less` glides in both
  // directions — `max-height: none` is not an animatable value, and snapping
  // the body open in one frame undoes the feel of the rest of the page.
  const bodyMax = budget === null ? undefined : clamp ? budget : full;

  return (
    <section
      ref={ref}
      id={id}
      className={
        `fn-section${vis ? ' vis' : ''}${dark ? ' dark' : ''}${fill ? ' fill' : ''}${tide ? '' : ' no-tide'}`
      }
    >
      <div className="fn-section-inner">
        <div ref={headRef} className="fn-section-head">
          <div className="fn-section-label">{label}</div>
          <h2 className="fn-section-title">{title}</h2>
        </div>
        <div
          ref={bodyRef}
          id={`${id}-body`}
          className={`fn-section-body${clamp ? ' is-collapsed' : ''}${fill ? ' is-fill' : ''}`}
          style={bodyMax !== undefined ? { maxHeight: bodyMax } : undefined}
        >
          {children}
        </div>
        {budget !== null && (
          <button
            ref={moreRef}
            type="button"
            className="fn-more"
            aria-expanded={!collapsed}
            aria-controls={`${id}-body`}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? 'more ↓' : 'less ↑'}
          </button>
        )}
      </div>
      {tide && <Tide color={tideColor} color2={tideColor2} offset={offset} />}
    </section>
  );
}
