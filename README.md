# portfolio-website

Avyakt Garg's portfolio site. Part 3 of a 3-repo system:

```
portfolio-website (you are here)  →  rag-chatbot  →  portfolio-store
   (Next.js 16 / Vercel)             (Go / Render)     (Neon Postgres + pgvector)
```

A single statically-generated page. All content is read from the Neon database at
build time; the only runtime traffic is the chat stream and the API health poll.

---

## Stack

- **Next.js 16** (16.2.4), App Router, **Turbopack**, **React 19**, TypeScript
- **CSS Modules** (no Tailwind) — design tokens in `src/app/globals.css`
- **`@neondatabase/serverless`** — queries Neon from a Server Component at build time
- **Playwright** (dev only) — screenshot + chat E2E scripts
- Deploy: **Vercel**

---

## How it works

```
Build   page.tsx (RSC) ──► src/lib/db.ts ──► Neon ──► static HTML   (ISR: revalidate = 3600s)
Load    <ApiStatusProvider> ──► GET {NEXT_PUBLIC_API_URL}/health every 5s
                                 (first poll wakes the Render dyno; drives the status pill + chat sidebar)
Chat    Chat.tsx ──► streamChat() ──► POST {NEXT_PUBLIC_API_URL}/chat ──► SSE token stream
```

- `src/lib/db.ts` runs six `SELECT`s against Neon. If `DATABASE_URL` is unset it
  returns `getDevFallback()` — hardcoded sample data so the site builds and runs
  with no database.
- The page is regenerated at most once an hour (ISR). A content change in
  `portfolio-store` shows up on the next revalidation, or immediately on redeploy.
  Full workflow: `portfolio-store/UPDATING.md`.
- Health status has four phases — `connecting → waking → live → down`. `waking`
  covers the 30–60 s cold start of the free Render dyno so it doesn't read as an
  outage.

---

## Local development

```bash
npm install
cp .env.local.example .env.local     # optional — without it, dev-fallback data is used
npm run dev                          # http://localhost:3000

npm run build && npm start           # production build + serve
npm run lint
```

### Environment

| Variable | Scope | Notes |
|---|---|---|
| `DATABASE_URL` | server only | Neon pooled connection string. **Never** `NEXT_PUBLIC_`. Missing → dev-fallback content. |
| `NEXT_PUBLIC_API_URL` | client | `rag-chatbot` base URL, e.g. `https://rag-chatbot-qge9.onrender.com`, **no trailing slash**. Missing → chat/health calls hit this origin and 404. |

Set both in the Vercel dashboard for deploys.

---

## Layout

```
src/app/
  layout.tsx        <html>/<body>, fonts, <ApiStatusProvider>
  page.tsx          Server Component — getPortfolioData(), renders every section
  globals.css       design tokens, resets, shared UI (.fn-*), keyframes
src/lib/
  db.ts             Neon queries + getDevFallback()
  types.ts          types for every DB entity
  api.ts            streamChat() — SSE generator (token / done+id / error / rate_limited)
  useApiStatus.tsx  ApiStatusProvider + useApiStatus() — one shared /health poller
  richText.tsx      "\n" + *emphasis* rendering for DB-sourced copy
src/components/
  sections/         Hero, About, Experience, Projects, Skills, Education, Chat, Contact (+ Photography stub)
  nav/              StickyNav (scroll-spy + ApiPill), MobileNav
  ui/               Section, Tide, TideContext, ApiPill, FnDefs, MagneticCta
scripts/
  shoot.mjs         Playwright — full-page + per-section screenshots → design/shots/
  chat-e2e.mjs      Playwright — drive the real chat against a running backend
design/             unimplemented Claude Design handoff bundle (not part of the build)
```

`AGENTS.md` — Next.js 16 has breaking changes vs. older versions; read
`node_modules/next/dist/docs/` before writing framework code.
