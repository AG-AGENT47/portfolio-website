'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const HISTORY_LEN = 40;
const POLL_MS = 5000;

// A cold Render free-tier dyno takes 30–60s to answer its first request after it
// has slept (15 min idle). Until we've seen one healthy response we treat a failed
// poll as "waking", not "down", and give the request a much longer timeout than
// the steady-state poll.
const WAKE_WINDOW_MS = 70_000;
const TIMEOUT_WAKING_MS = 15_000;
const TIMEOUT_LIVE_MS = 4_000;

export type ApiPhase = 'connecting' | 'waking' | 'live' | 'down';

export interface ApiStatus {
  phase: ApiPhase;
  /** true only when phase === 'live' — kept so existing callers keep working. */
  live: boolean;
  latency: number;
  uptime: number;
  /** Healthy-poll latencies, oldest first. Empty until the first OK response. */
  history: number[];
}

const INITIAL: ApiStatus = {
  phase: 'connecting',
  live: false,
  latency: 0,
  uptime: 100,
  history: [],
};

const ApiStatusContext = createContext<ApiStatus>(INITIAL);

/**
 * Runs a single `/health` poll loop and shares the result via context, so the
 * nav pill, the chat sidebar, and the page-load warm-up all read one poller
 * instead of firing three independent request streams.
 */
export function ApiStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ApiStatus>(INITIAL);
  const uptime = useRef({ total: 0, ok: 0 });
  const startedAt = useRef(0);
  const everLive = useRef(false);
  const inFlight = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
    let cancelled = false;

    async function poll() {
      if (!API_URL) {
        if (!cancelled) setStatus((s) => ({ ...s, phase: 'down', live: false }));
        return;
      }
      // Don't pile up requests while a slow cold-start poll is still hanging.
      if (inFlight.current) return;
      inFlight.current = true;

      const inWakeWindow = Date.now() - startedAt.current < WAKE_WINDOW_MS;
      const timeout = everLive.current ? TIMEOUT_LIVE_MS : TIMEOUT_WAKING_MS;
      const t0 = performance.now();

      try {
        const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(timeout) });
        const latency = Math.round(performance.now() - t0);
        const ok = res.ok;

        // Only count polls toward uptime once the service has answered at least
        // once — cold-start misses shouldn't show as "0% uptime".
        if (ok) {
          uptime.current.ok += 1;
          uptime.current.total += 1;
          everLive.current = true;
        } else if (everLive.current) {
          uptime.current.total += 1;
        }
        const pct = uptime.current.total
          ? (uptime.current.ok / uptime.current.total) * 100
          : 100;

        if (cancelled) return;
        setStatus((s) => ({
          phase: ok ? 'live' : everLive.current || !inWakeWindow ? 'down' : 'waking',
          live: ok,
          latency,
          uptime: parseFloat(pct.toFixed(2)),
          history: ok ? [...s.history, latency].slice(-HISTORY_LEN) : s.history,
        }));
      } catch {
        if (everLive.current) uptime.current.total += 1;
        if (!cancelled) {
          setStatus((s) => ({
            ...s,
            phase: everLive.current || !inWakeWindow ? 'down' : 'waking',
            live: false,
            uptime: uptime.current.total
              ? parseFloat(((uptime.current.ok / uptime.current.total) * 100).toFixed(2))
              : s.uptime,
          }));
        }
      } finally {
        inFlight.current = false;
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return <ApiStatusContext.Provider value={status}>{children}</ApiStatusContext.Provider>;
}

export function useApiStatus(): ApiStatus {
  return useContext(ApiStatusContext);
}
