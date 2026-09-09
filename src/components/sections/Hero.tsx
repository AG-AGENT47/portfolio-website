'use client';
import { useState } from 'react';
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
  const [mp, setMp] = useState({ x: 0.5, y: 0.5 });
  const reduced = useReducedMotion();

  const [firstName, lastName] = splitName(personal.name);
  const pills = splitList(personal.hero_pills);
  const meta: Array<[string, string | undefined]> = [
    ['now', personal.now_location],
    ['reading', personal.now_reading],
    ['shipping', personal.now_building],
    ['shooting', personal.now_shooting],
  ];

  const blobStyle1 = reduced ? {} : {
    transform: `translate(${(mp.x - 0.5) * 36}px, ${(mp.y - 0.5) * 36}px)`,
  };
  const blobStyle2 = reduced ? {} : {
    transform: `translate(${(0.5 - mp.x) * 24}px, ${(0.5 - mp.y) * 24}px)`,
  };

  return (
    <section
      id="top"
      className={styles.hero}
      onMouseMove={(e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        setMp({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
      }}
    >
      <div className={styles.blob} style={blobStyle1} />
      <div className={`${styles.blob} ${styles.blobAlt}`} style={blobStyle2} />

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
