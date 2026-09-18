import Link from 'next/link';

export const metadata = { title: 'Page not found — Avyakt Garg', robots: { index: false } };

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 400, margin: 0 }}>
          404
        </h1>
        <p style={{ margin: '16px 0 24px' }}>That page doesn’t exist.</p>
        <Link href="/">Back to Avyakt’s portfolio</Link>
      </div>
    </main>
  );
}
