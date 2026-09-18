// Single source for canonical site facts used by metadata, sitemap, robots,
// the OG image and JSON-LD. Changing domains = set NEXT_PUBLIC_SITE_URL in Vercel.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio-website-agent-50.vercel.app'
).replace(/\/$/, '');

export const SITE_NAME = 'Avyakt Garg';
export const SITE_TITLE = 'Avyakt Garg — Software Engineer & ML/AI Infra';
export const SITE_DESCRIPTION =
  'Avyakt Garg is an MS Computer Science student at UW–Madison and former Uber software engineer intern. Backend and distributed systems, GPU computing (CUDA), ML infrastructure and RAG. Portfolio, projects, and an AI assistant you can ask about my work.';

export const GITHUB_URL = 'https://github.com/AG-AGENT47';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/avyakt-garg';
