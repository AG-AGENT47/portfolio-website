import type { Metadata } from 'next';
import { Instrument_Serif, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { HealthWarmup } from '@/components/ui/HealthWarmup';

const serif = Instrument_Serif({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

const sans = IBM_Plex_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Avyakt Garg — Software Engineer & ML/AI Infra',
  description:
    'MSCS at UW–Madison. Previously Uber. Builds distributed systems, ML infra, and RAG pipelines. Talk to my AI.',
  openGraph: {
    title: 'Avyakt Garg — Software Engineer & ML/AI Infra',
    description:
      'MSCS at UW–Madison. Previously Uber. Builds distributed systems, ML infra, and RAG pipelines.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Avyakt Garg',
    description: 'MSCS at UW–Madison. Software engineer & ML infra.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <HealthWarmup />
        {children}
      </body>
    </html>
  );
}
