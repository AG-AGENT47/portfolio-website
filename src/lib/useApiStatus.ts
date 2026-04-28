'use client';
import { useEffect, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const HISTORY_LEN = 40;
const POLL_MS = 5000;

export interface ApiStatus {
  live: boolean;
  latency: number;
  uptime: number;
  history: number[];
}

export function useApiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>({
    live: true,
    latency: 0,
    uptime: 99.9,
    history: Array(HISTORY_LEN).fill(50),
  });
  const uptimeRef = useRef({ total: 0, ok: 0 });

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const t0 = performance.now();
      try {
        const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(4000) });
        const latency = Math.round(performance.now() - t0);
        const live = res.ok;
        uptimeRef.current.total++;
        if (live) uptimeRef.current.ok++;
        const uptime = uptimeRef.current.total
          ? (uptimeRef.current.ok / uptimeRef.current.total) * 100
          : 99.9;
        if (!cancelled) {
          setStatus((s) => ({
            live,
            latency,
            uptime: parseFloat(uptime.toFixed(2)),
            history: [...s.history.slice(1), latency],
          }));
        }
      } catch {
        if (!cancelled) {
          setStatus((s) => ({
            ...s,
            live: false,
            history: [...s.history.slice(1), 0],
          }));
        }
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return status;
}
