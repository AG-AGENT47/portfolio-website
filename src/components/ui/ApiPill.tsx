'use client';
import { useApiStatus } from '@/lib/useApiStatus';

export function ApiPill() {
  const s = useApiStatus();
  return (
    <div className={`fn-pill${s.live ? '' : ' down'}`}>
      <span className="fn-pill-dot" />
      <span className="fn-pill-label">api</span>
      <span className="fn-pill-state">{s.live ? 'live' : 'degraded'}</span>
      <svg viewBox="0 0 80 20" preserveAspectRatio="none" className="fn-pill-graph">
        <polyline
          points={s.history.slice(-20).map((v, i) => `${(i / 19) * 80},${20 - (v / 400) * 18}`).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
      <span className="fn-pill-ms">{s.latency}ms</span>
    </div>
  );
}
