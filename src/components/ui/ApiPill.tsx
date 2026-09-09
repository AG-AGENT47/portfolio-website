'use client';
import { useApiStatus, type ApiPhase } from '@/lib/useApiStatus';

const LABEL: Record<ApiPhase, string> = {
  connecting: 'connecting',
  waking: 'waking',
  live: 'live',
  down: 'down',
};

export function ApiPill() {
  const s = useApiStatus();
  const warming = s.phase === 'connecting' || s.phase === 'waking';
  return (
    <div className={`fn-pill${s.phase === 'down' ? ' down' : ''}${warming ? ' warming' : ''}`}>
      <span className="fn-pill-dot" />
      <span className="fn-pill-label">api</span>
      <span className="fn-pill-state">{LABEL[s.phase]}</span>
      <svg viewBox="0 0 80 20" preserveAspectRatio="none" className="fn-pill-graph">
        <polyline
          points={s.history.slice(-20).map((v, i) => `${(i / 19) * 80},${20 - (v / 400) * 18}`).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
      <span className="fn-pill-ms">{s.phase === 'live' ? `${s.latency}ms` : '—'}</span>
    </div>
  );
}
