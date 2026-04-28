'use client';
import styles from './MobileNav.module.css';

interface MobileNavProps {
  links: { id: string; label: string }[];
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ links, open, onClose }: MobileNavProps) {
  return (
    <div className={`${styles.overlay}${open ? ` ${styles.open}` : ''}`} aria-hidden={!open}>
      <button className={styles.close} onClick={onClose} aria-label="Close menu">✕</button>
      <nav>
        {links.map((l) => (
          <a key={l.id} href={`#${l.id}`} onClick={onClose}>
            {l.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
