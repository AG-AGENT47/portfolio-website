'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

const TideCtx = createContext<number>(0);

export function TideProvider({ children }: { children: React.ReactNode }) {
  const [t, setT] = useState(0);
  const reduced = useReducedMotion();
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (reduced) return;
    const tick = () => {
      setT(performance.now() / 4500);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduced]);

  return <TideCtx.Provider value={t}>{children}</TideCtx.Provider>;
}

export function useTide() {
  return useContext(TideCtx);
}
