'use client';
import { useEffect, useState } from 'react';
import { ApiPill } from '@/components/ui/ApiPill';
import { MobileNav } from './MobileNav';
import styles from './StickyNav.module.css';

const NAV_LINKS = [
  { id: 'about',    label: 'about' },
  { id: 'work',     label: 'work' },
  { id: 'projects', label: 'projects' },
  { id: 'skills',   label: 'stack' },
  { id: 'chat',     label: 'chat' },
  { id: 'contact',  label: 'contact' },
];

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('about');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    NAV_LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <header className={`${styles.nav}${scrolled ? ` ${styles.shrunk}` : ''}`}>
        <a href="#top" className={styles.mark}>A.G</a>

        <nav className={styles.links} aria-label="Site navigation">
          {NAV_LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} className={active === l.id ? styles.active : ''}>
              {l.label}
              {active === l.id && <span className={styles.pill} />}
            </a>
          ))}
        </nav>

        <div className={styles.right}>
          <ApiPill />
          <button
            className={styles.burger}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <MobileNav links={NAV_LINKS} open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
