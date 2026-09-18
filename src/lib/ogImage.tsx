import { ImageResponse } from 'next/og';
import { SITE_NAME } from './site';

// Shared renderer for opengraph-image / twitter-image (1200x630).
export function renderShareImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: '#14110f',
          color: '#f6f1e9',
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 6, color: '#e8a37f', display: 'flex' }}>
          PORTFOLIO
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 120, lineHeight: 1, display: 'flex' }}>{SITE_NAME}.</div>
          <div style={{ fontSize: 40, marginTop: 28, color: '#cfc6b8', display: 'flex' }}>
            Software Engineer · ML/AI Infra · ex-Uber
          </div>
        </div>
        <div style={{ fontSize: 28, color: '#e8a37f', display: 'flex' }}>
          MS Computer Science, UW–Madison
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
