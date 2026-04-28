'use client';
import { useState } from 'react';
import { MagneticCta } from '@/components/ui/MagneticCta';
import { Tide } from '@/components/ui/Tide';
import { useReducedMotion } from '@/lib/useReducedMotion';
import type { PersonalInfo } from '@/lib/types';
import styles from './Hero.module.css';

interface HeroProps {
  personal: PersonalInfo;
}

export function Hero({ personal }: HeroProps) {
  const [mp, setMp] = useState({ x: 0.5, y: 0.5 });
  const reduced = useReducedMotion();

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
          <div className={styles.eyebrow}>— mscs · uw–madison · &#39;25 → &#39;27 —</div>
          <h1 className={styles.h1}>
            <span style={reduced ? {} : { filter: 'url(#fn-edge)' }}>Avyakt</span>
            <span className={styles.h1Italic} style={reduced ? {} : { filter: 'url(#fn-edge)' }}>Garg.</span>
          </h1>
          <p className={styles.lede}>
            I build for <em>both sides of the stack</em> — distributed systems
            that don't fall over, and ML infrastructure that actually ships.
            <br />
            Marketplace platforms at Uber. CUDA kernels &amp; RAG pipelines by night.
          </p>
          <div className={styles.pills}>
            <span className={`${styles.pill} ${styles.pillSwe}`}>software engineer</span>
            <span className={`${styles.pill} ${styles.pillMl}`}>ml / ai infra</span>
            <span className={`${styles.pill} ${styles.pillOpen}`}>open to &#39;26 internships</span>
          </div>
          <div className={styles.ctaRow}>
            <MagneticCta primary href="#chat">Talk to my AI →</MagneticCta>
            <MagneticCta href="#work">See the work</MagneticCta>
          </div>
        </div>

        <aside className={styles.meta}>
          <div className={styles.portrait} style={reduced ? {} : { filter: 'url(#fn-edge)' }}>
            <div className={styles.portraitStripes} />
            <div className={styles.portraitCap}>[ portrait — 35mm, Madison &apos;26 ]</div>
          </div>
          <div className={styles.metaList}>
            <div><span>now</span> Madison, WI</div>
            <div><span>reading</span> Designing Data-Intensive Apps</div>
            <div><span>shipping</span> IVF-PQ kernel v0.3</div>
            <div><span>shooting</span> Fuji X-T4 · Pentax K1000</div>
          </div>
        </aside>
      </div>

      <Tide />
    </section>
  );
}
