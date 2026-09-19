'use client';
import { useRef } from 'react';
import { MagneticCta } from '@/components/ui/MagneticCta';
import { HeroPhoto } from '@/components/ui/HeroPhoto';
import { Tide } from '@/components/ui/Tide';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { richText, splitList } from '@/lib/richText';
import { PHOTOS } from '@/lib/photos';
import type { PersonalInfo } from '@/lib/types';
import styles from './Hero.module.css';

interface HeroProps {
  personal: PersonalInfo;
}

// Last whitespace-separated token of the name is set apart (italic); the rest leads.
function splitName(name: string): [string, string] {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return [name, ''];
  const last = parts.pop() as string;
  return [parts.join(' '), last];
}

const PILL_CLASSES = [styles.pillSwe, styles.pillMl, styles.pillOpen];

export function Hero({ personal }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef(0);
  const reduced = useReducedMotion();

  const [firstName, lastName] = splitName(personal.name);
  const pills = splitList(personal.hero_pills);
  const meta: Array<[string, string | undefined]> = [
    ['now', personal.now_location],
    ['reading', personal.now_reading],
    ['shipping', personal.now_building],
    ['shooting', personal.now_shooting],
  ];

  // The pointer drives two CSS variables written straight to the node, and
  // the blobs' transforms are expressed in terms of them. Storing the pointer
  // in React state instead re-rendered the whole hero on every mousemove —
  // which is exactly the kind of stutter the parallax is there to avoid.
  // Coalesced to one write per frame, since a trackpad fires far faster.
  function onMove(e: React.MouseEvent<HTMLElement>) {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      el.style.setProperty('--mx', String(x));
      el.style.setProperty('--my', String(y));
    });
  }

  return (
    <section ref={ref} id="top" className={styles.hero} onMouseMove={onMove}>
      <div className={styles.blob} />
      <div className={`${styles.blob} ${styles.blobAlt}`} />

      <div className={styles.grid}>
        <div className={styles.text}>
          {personal.hero_eyebrow && (
            <div className={styles.eyebrow}>— {personal.hero_eyebrow} —</div>
          )}
          <h1 className={styles.h1}>
            <span style={reduced ? {} : { filter: 'url(#fn-edge)' }}>{firstName}</span>
            {lastName && (
              <span
                className={styles.h1Italic}
                style={reduced ? {} : { filter: 'url(#fn-edge)' }}
              >
                {lastName}.
              </span>
            )}
          </h1>
          {personal.hero_lede && (
            <p className={styles.lede}>{richText(personal.hero_lede)}</p>
          )}
          {pills.length > 0 && (
            <div className={styles.pills}>
              {pills.map((label, i) => (
                <span
                  key={label}
                  className={`${styles.pill} ${PILL_CLASSES[i] ?? styles.pillOpen}`}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
          <div className={styles.ctaRow}>
            <MagneticCta primary href="#chat">Talk to my AI →</MagneticCta>
            <MagneticCta href="#work">See the work</MagneticCta>
          </div>
        </div>

        <aside className={styles.meta}>
          <HeroPhoto photos={PHOTOS} fallbackCaption={personal.portrait_caption} />
          <div className={styles.metaList}>
            {meta
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}><span>{label}</span> {value}</div>
              ))}
          </div>
        </aside>
      </div>

      <Tide />
    </section>
  );
}
