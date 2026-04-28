'use client';
import { useRef, useState } from 'react';

interface MagneticCtaProps {
  href?: string;
  primary?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export function MagneticCta({ href = '#', primary = false, children, onClick }: MagneticCtaProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  return (
    <a
      ref={ref}
      className={`fn-cta${primary ? ' primary' : ' ghost'}`}
      href={href}
      onClick={onClick}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setTranslate({
          x: (e.clientX - r.left - r.width / 2) * 0.25,
          y: (e.clientY - r.top - r.height / 2) * 0.4,
        });
      }}
      onMouseLeave={() => setTranslate({ x: 0, y: 0 })}
      style={{ transform: `translate(${translate.x}px, ${translate.y}px)` }}
    >
      {children}
    </a>
  );
}
