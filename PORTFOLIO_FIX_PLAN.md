# Portfolio System — Audit & Fix Plan

_Last updated: 2026-09-09. Author: exploration + first fix pass by Claude Code._

This document is the pick-up point. It captures **what the 3-repo system actually is today**, **every issue found**, the **root cause of the "only a few free chatbot responses" problem**, and a **phased fix sequence**.

### Progress log

- **2026-09-09 — Frontend pass 1 (done):**
  - **C3** fixed — hero rendered blank; CSS-Module `animation:` rules referenced `@keyframes` defined in `globals.css`. Moved the used keyframes into `Hero/Projects/Chat/StickyNav.module.css`. Added the previously-missing `prefers-reduced-motion` fallbacks to all four.
  - **Nav overlap** fixed — `scroll-padding-top` on `html` + `scroll-margin-top` on `.fn-section`.
  - **Hardcoded copy → DB** — `Hero` (name split, eyebrow, lede, pills, portrait caption, now/reading/shipping/shooting) and `About` (2nd paragraph) now read from `personal_info`. New keys in `portfolio-store/seeds/personal_info.sql`: `hero_eyebrow, hero_lede, hero_pills, about_p2, now_location, now_reading, now_building, now_shooting, portrait_caption`. New `src/lib/richText.tsx` handles `\n` + `*emphasis*` from the DB (no raw HTML stored).
  - **Chat sidebar** — tech list + meta line now derive from the RAG chatbot's `projects.tech_stack` row (passed from `page.tsx`). Removed the false **"HyDE retrieval"** claim (also fixed in `portfolio-store/migrations/004`). `chat.avyakt.dev` status dot now reflects real API state instead of always-green.
  - Build green; verified via Playwright screenshots in `portfolio-website/design/shots/`.
- Still open: everything else below (chatbot SSE contract, embedder swap, robustness, backend).

### Skills installed (`portfolio-website/.claude/skills/`)

| Skill | Source | Used for |
|---|---|---|
| `ui-ux-pro-max` + `ui-styling` + `design-system` | `~/.claude/skill-library/ui-ux-pro-max` (pre-existing) | ran `search.py --design-system` + `ux`/`react` queries; motion timing, reduced-motion severity, pre-delivery checklist |
| `frontend-patterns`, `nextjs-turbopack` | `everything-claude-code` (pre-existing) | Next 16 / RSC guidance |
| `impeccable` | github.com/pbakaus/impeccable | design craft-floor + anti-patterns. **Its `scripts/impeccable` launcher downloads+runs a binary — not auto-run.** Use `/impeccable <verb>` manually for the full tooling. |
| `frontend-design` | github.com/anthropics/skills | aesthetic-direction calibration — see §4.5 |
| `design-motion-principles` | github.com/kylezantos/design-motion-principles | motion audit lens (Emil Kowalski / Krehel / Tompkins) |
| `taste-skill` | github.com/senlindesign/taste-skill | reverse-engineer a reference site's tokens. **Needs Playwright MCP** (`claude mcp add playwright …`), not just the npm pkg. |

Add catalog rows for the four new repos to `~/.claude/CLAUDE.md` per its documented process.

---

## 0. How to use this doc

1. Read §1 (what's actually built) and §2 (the free-tier problem) first — they drive the biggest decisions.
2. §3 is the bug list, ranked. §4 is design/polish. §5 is cross-repo consistency.
3. §6 is the recommended order of operations. §7 is the deploy/env checklist.
4. When we start fixing, work top-down through §6 and check items off.

---

## 1. What the system actually is (as-built, 2026-09)

Three separate git repos under `~/Desktop/Development_personal_website/`, each with its own `.git`:

| Repo | Role | Stack (actual) | Hosting (intended) |
|---|---|---|---|
| `portfolio-store` | Single source of truth: schema + seed data + pre-computed embeddings | Neon PostgreSQL + `pgvector`, plain SQL migrations/seeds, one Python `embed.py` | Neon free tier |
| `rag-chatbot` | RAG API: `/chat` (SSE), `/rating`, `/metrics`, `/health` | Go 1.21, `chi` router, `pgx/v5` + `pgvector-go`, Voyage AI embeddings, Groq Llama 3.3 70B | Render free web service |
| `portfolio-website` | The portfolio site + live chatbot UI + API health dashboard | **Next.js 16** (App Router, Turbopack, React 19), CSS Modules, `@neondatabase/serverless` querying Neon directly in a Server Component | Vercel |

> ⚠️ The saved project memory (`memory/project_portfolio.md`) is stale: it says "React + Vite + Go backend" for the website and "Supabase" for the store. Reality is **Next.js 16** and **Neon**. Update that memory after this pass.

### Data flow (actual)

```
BUILD (website):  page.tsx (RSC)  ──►  src/lib/db.ts  ──►  Neon (portfolio-store DB)  ──►  static HTML (ISR, revalidate 3600s)
PAGE LOAD:        <HealthWarmup>   ──►  GET  {NEXT_PUBLIC_API_URL}/health   (wakes the Render dyno)
                 useApiStatus()    ──►  GET  /health every 5s              (drives the "operational/degraded" pill + latency graph)
CHAT:            Chat.tsx ──► streamChat() ──► POST {NEXT_PUBLIC_API_URL}/chat ──► SSE stream
                    rag-chatbot:  guardrails ─► contextualize query ─► Voyage embed ─► pgvector + FTS hybrid (RRF) ─► topic filter ─► Groq stream ─► log to `interactions`
```

### Repo state notes

- `portfolio-store`: `migrations/004_update_featured_projects.sql` is **untracked** (not committed) and `seeds/projects.sql` has **uncommitted edits** (adds GitHub URLs to 4 projects). The website's featured-projects query depends on 004 having been applied.
- `rag-chatbot`: `README.md` has uncommitted edits; `data/` and `CLAUDE.md` are gitignored.
- `portfolio-website`: single "initial" commit. `design/` folder (Claude Design handoff bundle: `Portfolio.html`, `Chat.html`, direction A/B/C prototypes) is committed but not wired into the build.
- No `.env.local` in `portfolio-website` locally → the site currently renders from `getDevFallback()` in `src/lib/db.ts`, not the real DB.

---

## 2. The "only a few free responses" problem — root cause

**The vector database is NOT the bottleneck.** Neon + `pgvector` has no per-request cap that matters here (10 GB storage; the whole knowledge base is ~46 rows / ~90 KB of vectors). Swapping Neon for Chroma would not buy a single extra response and would cost us persistence and co-location with the rest of the portfolio data. See §2.3 for why.

### 2.1 The actual cap: the query-embedding step (Voyage AI)

Every `/chat` message makes **one Voyage AI embedding call** (`internal/rag/embedder.go`, `voyage-3-lite`, `input_type="query"`). That call is the throttle:

- **`voyage-3-lite` is now a legacy model.** Voyage's current one-time free-token grant (200M tokens) applies to the **voyage-4 / context-3 / code-3** series. The series-3 models no longer carry an ongoing free allocation — once the initial trial credit is spent, calls require paid billing or return **HTTP 402 / 429**.
- The **un-billed (free) tier RPM is tiny** — the repo's own `rag-chatbot/CLAUDE.md` records it as **3 requests/minute**. Tier-1 (2000 RPM) only unlocks *after* you've been billed for real usage.
- Net effect for a public portfolio: after the trial credit drains (or more than ~3 visitors chat in the same minute), the embedder returns 429, the pipeline surfaces `{"error":"rate_limited","rate_limited":true}`, and the user sees "I'm being rate-limited right now."

Groq (LLM) is a secondary, softer limit: **1,000 requests/day, 12K tokens/min** on the free tier for Llama 3.3 70B. Fine for a portfolio unless it goes viral; not the "few responses" cause.

Neon and Render free tiers cause **cold-start latency** (see §4), not response caps.

### 2.2 Options for the embedding step (ranked)

| Option | Free-tier headroom | Effort | Dims | Notes |
|---|---|---|---|---|
| **A. Gemini embeddings** (`gemini-embedding-001`, or `text-embedding-004`) via Google AI Studio key | Free, no card. Historically ~100 RPM / ~1,000–1,500 RPD for embeddings (Google tunes this — verify at `aistudio.google.com/rate-limit`). Orders of magnitude above Voyage's 3 RPM. | **Low** — new `Embedder` impl in Go + regenerate `knowledge_base.sql` + change `VECTOR(512)`→`VECTOR(768)`. Keep Neon + pgvector untouched. | 768 (supports Matryoshka truncation to 256/512/1536) | We **already have a `GEMINI_API_KEY`** wired for the LLM fallback. Reuses the same key. Recommended immediate fix. |
| **B. Local ONNX embeddings in the Go process** (`bge-small-en-v1.5` or `all-MiniLM-L6-v2`) via `onnxruntime-go` / `hugot` | **Unlimited. Zero external calls, zero rate limit, zero cost.** | Medium — bundle a ~90–130 MB model, add ONNX runtime, ~50–200 ms CPU inference per query. Fits Render free 512 MB RAM. Regenerate embeddings with the same model. | 384 | The "internship-quality" answer: the RAG service becomes self-contained for retrieval. Best long-term. Slightly heavier cold start. |
| **C. Jina / Cohere / Mixedbread free embed APIs** | Jina: 1M free tokens, higher RPM than Voyage. Cohere trial: ~100 calls/min. | Low-ish | varies | Trades one vendor limit for another. Only if A and B are both undesirable. |
| **D. Keep Voyage but add an embedding cache** | Doesn't raise the ceiling — only absorbs *repeated* queries. | Low | 512 | Already on the repo roadmap. Do this **in addition to** A or B, not instead. |

**Recommendation:** do **A now** (unblocks immediately, minimal change), plan **B** as the follow-up (removes the external dependency entirely), and add **D**'s in-memory cache regardless.

### 2.3 On replacing the vector DB (Chroma / alternatives)

- **Chroma** is an embedded / self-hosted store. To use it we'd either (a) run `chromadb` as a **separate service** — another Render free instance, another cold start, and Chroma's on-disk persistence is **ephemeral on Render free** unless you attach a paid disk; or (b) embed it in a Python process, but our chatbot is Go. Either way it's a **downgrade** from the current setup.
- At **46 chunks**, no vector index is needed at all. A brute-force cosine scan over 46 vectors held in memory is <1 ms. We could **load `knowledge_base` into memory on boot** and drop `pgvector` from the hot path entirely (still keep the rows in Neon as source of truth). That's simpler and faster than any external vector DB. Consider this in Phase 3.
- If we ever *do* want a dedicated vector DB on a free tier: **Qdrant Cloud** (1 GB cluster, free, no auto-pause) is the only one that's genuinely competitive with pgvector here. Still not worth it at this scale.

**Verdict:** keep **Neon + pgvector**. Fix the embedder, not the database.

---

## 3. Bugs — ranked

### 🔴 CRITICAL — the hero renders blank (verified in a real browser)

**C3. CSS Module `animation:` rules reference `@keyframes` that live in `globals.css` → every animated element stays at `opacity: 0`.**
All 8 `@keyframes` (`fn-rise`, `fn-fade`, `fn-drift`, `fn-bounce`, `fn-pulse*`, `fn-nav-pop`) are defined in the **global** `src/app/globals.css`. But 5 `*.module.css` files reference them from an `animation:` shorthand. Next's CSS-Modules pipeline **rewrites the keyframe name to a module-scoped identifier** (verified: the hero `h1`'s computed `animation-name` is `Hero-module___w2HtG__fn-rise`), and since no `@keyframes fn-rise` exists inside the module, the reference dangles — the animation runs against nothing and the element never leaves its base state.

`Hero.module.css` sets `opacity: 0` on the eyebrow, `h1`, lede, pills, CTA row, portrait, and meta list, each with `animation: fn-rise … forwards` to fade them in. That fade never happens → **the entire hero (name, tagline, pills, buttons, portrait) is invisible on every load.** Confirmed on desktop (1440) and mobile (390) against `next start` — see §4.0. The homepage's first screen is effectively empty; sections below the fold are fine because their reveal (`.fn-section.vis`) is pure global CSS with a `transition`, no keyframes.

Blast radius:
- `Hero.module.css` — `fn-rise` ×8 (**catastrophic**), `fn-pulse-green` (cosmetic dot).
- `Projects.module.css` — `fn-drift` (blob float), `fn-fade` (detail panel) — cosmetic, content still ends visible.
- `Chat.module.css` — `fn-bounce` (typing dots), `fn-pulse` (status dot) — cosmetic.
- `StickyNav.module.css` — `fn-nav-pop` (active-link pill) — cosmetic.

Fix (pick one, apply project-wide): (a) move each used `@keyframes` **into** the `.module.css` that references it; (b) wrap the shared keyframes in a `:global { @keyframes … }` block in one module and keep them global; (c) reference them explicitly as `animation-name: :global(fn-rise)`; (d) drop keyframes entirely and do the hero reveal with a `transition` + a `mounted` class, matching how `.fn-section` already works. Option (d) is the most consistent with the rest of the codebase.

### 🔴 CRITICAL — the chatbot UI is broken end-to-end

**C1. SSE field-name mismatch: the website never renders any chat tokens.**
`portfolio-website/src/lib/api.ts` parses the stream looking for `parsed.content` and a `[DONE]` sentinel:

```ts
if (parsed.rate_limited) { yield { rateLimited: true }; return; }
if (parsed.content) yield { token: parsed.content };   // ← backend sends `token`, not `content`
```

But `rag-chatbot/internal/api/models.go` emits `{"token": "..."}`, `{"done": true, "id": "..."}`, `{"error": "..."}`, and `{"rate_limited": true, "error": "rate_limited"}`. There is **no `content` field and no `[DONE]` line**. Result: every token event parses fine, `parsed.content` is `undefined`, nothing is yielded → the user sees the "thinking" dots, then an **empty AI bubble**, forever. `rate_limited` happens to work; everything else is dropped.

Fix `api.ts` to the real contract:
- `parsed.token` → yield `{ token }`
- `parsed.error === 'rate_limited'` or `parsed.rate_limited` → yield `{ rateLimited: true }`
- `parsed.error` (any other) → yield `{ token: <friendly message> }` or a dedicated `{ error }` channel
- `parsed.done` → capture `parsed.id` (needed for ratings) and yield `{ done: true, id }`
- delete the `[DONE]` branch

**C2. Error events are silently swallowed.** Because of C1, a backend `{"error": "Service temporarily unavailable…"}` yields nothing — the user gets an empty bubble instead of an error message. Same root fix as C1.

### 🟠 HIGH

**H1. Voyage free-tier cap** — see §2. This is the headline functional issue. Fix = swap the embedder (§2.2 option A).

**H2. `Projects.tsx` crashes when the featured set is empty or collapsed.**
`const p = projects[active]` then `CATEGORY_LABELS[p.category]`. Two ways `p` becomes `undefined`:
- DB returns zero `is_featured = TRUE` rows (e.g. migration 004 not applied) → `projects[0]` is `undefined` → render throws.
- The **mobile accordion** shares the same `active` state and sets it to `-1` on collapse (`setActive(active === i ? -1 : i)`); the desktop detail pane then does `projects[-1]` → `undefined` → throws.
Fix: guard (`if (!projects.length) return null`), and give the accordion its own collapse state instead of overloading `active` with `-1`.

**H3. CORS misconfig will kill both chat and the health pill in production.**
`rag-chatbot` `CORSMiddleware` only sets `Access-Control-Allow-Origin` when the request `Origin` is in `ALLOWED_ORIGINS` (comma-separated, exact match). `render.yaml` has `ALLOWED_ORIGINS: sync=false` (must be set by hand in the Render dashboard).
- `POST /chat` with `Content-Type: application/json` triggers a CORS **preflight** — if the exact Vercel origin isn't listed, chat fails entirely.
- Vercel **preview deployments** get per-deploy URLs that won't match a single literal origin → chat broken on previews.
- `/health` is a simple GET, but JS still can't read the response without the CORS header → `useApiStatus` throws → dashboard shows **"degraded" even when the API is healthy**.
Fix: set `ALLOWED_ORIGINS` to the real prod origin(s); consider allowing `*.vercel.app` previews via a suffix check in the middleware; document this in the deploy checklist (§7).

**H4. Vector dimension: code is 512, docs say 1024 — a trap for the next editor.**
The runtime is **internally consistent at 512** (`migrations/003` `VECTOR(512)`, `embed.py` asserts `len == 512`, committed `seeds/knowledge_base.sql` vectors are 512-dim, `embedder.go` comment says 512). But **prose contradicts it everywhere**: `portfolio-store/README.md` ("Confirm embeddings are 1024-dim"), `portfolio-store/CLAUDE.md` schema block (`embedding VECTOR(1024)`), and 3 comments/docstrings in `embed.py` ("Generate 1024-dim embeddings", "Voyage AI voyage-3-lite (1024 dimensions)"). Anyone who "fixes the migration to match the docs" breaks retrieval. Fix the docs to say 512 — and if we do §2.2 option A/B, update to 768/384 everywhere in one pass.

### 🟡 MEDIUM

**M1. Hydration mismatch in `Section.tsx`.** `const offset = useMemo(() => Math.random(), [])` runs during render, on the server (SSR) and again on the client (hydration), producing different values. `offset` feeds `<Tide offset={offset} />`, which renders it into SVG `path d="…"` attributes → React 19 hydration-mismatch warning + a visible wave "snap" on load. ESLint flags it (`react-hooks/purity`). Fix: derive a deterministic per-section offset from `id` (e.g. a small string hash), or move the randomness into an effect.

**M2. Health polling: 4 s timeout vs 50 s+ Render cold start → misleading "degraded".**
`useApiStatus` uses `AbortSignal.timeout(4000)`; `HealthWarmup` uses 5000. A cold Render dyno takes 30–60 s to wake. So on the first visit after the dyno has slept (15 min idle), the dashboard shows **down/degraded** for the first minute regardless of real health, and the latency graph is seeded with fake `50`s. Fix: longer timeout for the warm-up ping (or no timeout), a "waking up…" state distinct from "degraded", and seed `history` empty rather than with `50`.

**M3. Two independent health-poll loops.** `useApiStatus()` is called separately by `<ApiPill>` (in `StickyNav`) and by `<Chat>`. Each starts its own `setInterval(poll, 5000)`. That's 2× the `/health` traffic and 2 uncoordinated latency graphs. Plus `<HealthWarmup>` fires a third request on mount. Fix: lift `useApiStatus` into a context provider (like `TideContext` already does for the rAF loop) so all consumers share one poller.

**M4. `formatPeriod` renders a trailing "— " for upcoming roles.**
`Experience.tsx`: `end = e.is_current ? 'present' : (e.end_date ?? '')`. The upcoming Uber 2026 row has `is_current = FALSE` and `end_date = NULL` (see `seeds/experience.sql`) → renders `"May 2026 — "`. Also the "upcoming" badge only shows when `is_current` is true, so it never shows for the future role. Fix: treat `start_date > today && end_date == null` as "upcoming" (badge + `"May 2026 — present"` or just `"Starting May 2026"`).

**M5. `interactions` logging is on the request's context — cancellation risk.**
`handlers.go` `Chat` calls `h.db.InsertInteraction(ctx, …)` where `ctx = r.Context()`. If the client disconnects right as the stream finishes, `ctx` is canceled and the interaction (and its `id`) is lost. `rag-chatbot/CLAUDE.md` even documents the intended pattern (`context.WithoutCancel`) but it isn't applied. Fix: log with `context.WithoutCancel(ctx)` (Go 1.21+).

**M6. `ivfflat` index is dead weight (and possibly hurting recall).**
`migrations/003` builds `CREATE INDEX … USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10)` **at table-creation time, on an empty table**. `pgvector`'s ivfflat needs data present to compute centroids; built empty it's unusable until a `REINDEX` after seeding. Even once reindexed, `lists = 10` over 46 rows with the default `ivfflat.probes = 1` scans ~1/10th of vectors (~5) → a top-5 query can miss the best matches. At this scale the right move is **no index** (a sequential cosine scan over 46 rows is instant) or **HNSW**. Fix: drop the ivfflat index; optionally add HNSW if/when the KB grows past a few thousand rows.

**M7. Weak topic filter.** `pipeline.go`: `chunks[0].Distance > similarityThreshold` (0.75–0.80) redirects without an LLM call. After RRF merge, `chunks[0]` may be an **FTS-only** chunk with `Distance = 0`, which never trips the filter — so a keyword-matching but off-topic question still reaches the LLM. Conversely a legitimately relevant question at cosine distance 0.82 gets redirected. Fix: compute the filter against the **best vector distance among the merged chunks** (not `chunks[0]`), or run a dedicated cheap relevance check; also `main.go` default (0.80) vs `render.yaml` (0.75) vs `.env.example`/`CLAUDE.md` (0.75) disagree — pick one.

**M8. Chat history includes the seed greeting as an `assistant` turn.** `Chat.tsx` builds `history` from all prior `msgs`, including the initial `{ who: 'ai', text: "Hi — I'm Avyakt's AI twin…" }`. So the first request sends a conversation that *starts* with an assistant message. Groq tolerates it; still wrong. Fix: drop the seed message from `history` (start the slice at index 1, or tag it `seed: true` and filter).

**M9. No ratings UI despite a working `POST /rating` endpoint.** The backend returns `{"done": true, "id": "<uuid>"}` specifically so the client can submit 👍/👎, and `/metrics` surfaces `avg_rating`. The website never captures `id` (see C1) and renders no rating control. Either wire it up (thumbs on each AI message) or drop `/rating` + the `rating` column from scope.

### 🟢 LOW / polish

- **L1.** `internal/llm/llm.go` fails `gofmt` (`gofmt -l` flags it). Run `gofmt -w ./...`. Add `make fmt` + a CI check.
- **L2.** ESLint: `react-hooks/set-state-in-effect` in `useReducedMotion.ts:9` and `FnDefs.tsx:10`. Functionally fine under React 19 but noisy; the idiomatic fix is `useSyncExternalStore` for `useReducedMotion`. `Hero.tsx` takes a `personal` prop it never uses (see D-series). The `design/project/*.jsx` lint errors are in the design-handoff bundle, not the build — ignore or move `design/` out of the lint glob.
- **L3.** `api.ts`: `const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''` — if the env var is missing in a Vercel env, requests silently go to `/chat` on the site's own origin and 404. Add a dev-time warning.
- **L4.** `next.config.ts` has an empty `experimental: {}` block with a misleading comment about "edge" — the DB call is in a Node server component, not edge. Remove the dead block.
- **L5.** `render.yaml` still lists `GEMINI_API_KEY` and Gemini as fallback, but `.env.example` says `LLM_PROVIDER` default is `gemini` while `main.go` defaults to `groq` and `render.yaml` sets `groq`. Reconcile.
- **L6.** `embed.py` `CHUNKS` array count vs comment: 46 real chunks (a 47th `"source_type":` match is in a doc comment). `README.md` "Expected: … ~35" and "≈ 35 chunks" is stale — it's 46.
- **L7.** `data/resume.txt` still ships in `rag-chatbot` though `internal/rag/resume.go` was deleted and `data/` is gitignored — dead file locally.
- **L8.** Naming drift: the website env var is `DATABASE_URL`; the chatbot and store use `NEON_DATABASE_URL`. Harmless but confusing — pick one name across all three `.env.example` files and docs.
- **L9.** `Contact.tsx` renders a CV download link only if `personal.cv_url` is set, but nothing seeds `cv_url` into `personal_info` and there's no `public/cv.pdf` (the PDFs live under `design/project/uploads/`). The website CLAUDE.md lists this as a V2 TODO. Decide: ship the CV or drop the link.
- **L10.** `Hero.tsx` portrait is a hardcoded placeholder (`[ portrait — 35mm, Madison '26 ]`); `metaList` values ("reading Designing Data-Intensive Apps", "shipping IVF-PQ kernel v0.3", camera bodies) are hardcoded, not from the DB.

---

## 4. Design & front-end quality

The site has a strong, distinctive concept (editorial serif + "tide" wave motif + live API telemetry). Issues are about **fidelity to the intended design, content sourcing, and robustness** — not a redesign.

### 4.0 Visual audit (Playwright, 2026-09-09)

Playwright + Chromium installed in `portfolio-website/`; capture script at `scripts/shoot.mjs` (walks the page to trigger scroll reveals, then shoots full-page + per-section, desktop 1440 and mobile 390). Screenshots in `portfolio-website/design/shots/` (gitignore these or move to `design/shots/` intentionally). Run against `npm run build && npm start` with no `.env.local` (dev-fallback data).

What the screenshots show:

| Observation | Verdict |
|---|---|
| **Hero is blank** — nav + gradient blobs only, no name/tagline/pills/CTA/portrait | 🔴 C3 (keyframe bug) — confirmed desktop + mobile |
| Every section **below** the hero renders correctly once scrolled into view; typography (Instrument Serif / IBM Plex / JetBrains Mono) is sharp and on-concept | ✅ |
| Section titles are **clipped under the sticky nav** when scrolled to via anchor (`#projects`, `#chat` titles cut off at the top) | 🟡 new — add `scroll-margin-top: var(--nav-h)` to `.fn-section` (or `scroll-padding-top` on `html`) |
| Experience shows **"May 2026 — "** with a dangling em-dash for the upcoming Uber role | 🟡 confirms M4 |
| Chat sidebar shows **"HyDE retrieval · Groq LLM"**, "pgvector + Voyage AI", "us-east-1", "Render" — all hardcoded; HyDE is not implemented | 🟡 confirms X6 / §4.1 |
| API panel shows "degraded", a fake 9 ms latency, "0.00% uptime", empty graph (no API running locally) | 🟡 confirms M2 — needs a distinct "unreachable / waking" state |
| Chat "chat.avyakt.dev" green "live" dot stays green while the API panel says "degraded" | 🟢 cosmetic inconsistency — wire the dot to `useApiStatus` |
| Chat log is a tall empty dark box with only the greeting — lots of dead vertical space | 🟢 polish — min-height should hug content until a conversation exists |
| Mobile: hero blank (same C3); all other sections responsive and clean; hamburger nav present | ✅ apart from C3 |

**Robustness note:** the whole reveal system fails "closed" — if JS or a CSS animation doesn't run, content is `opacity: 0` and invisible (no-JS visitors, crawlers that don't execute JS, the C3 bug). Prefer failing "open": content visible by default, animation as progressive enhancement. `globals.css` already does this for `prefers-reduced-motion` (`opacity: 1 !important`) — extend the same guarantee to the base state.

### 4.1 Content is hardcoded in components — violates the system's own rule

Both `portfolio-store/CLAUDE.md` and `portfolio-website/CLAUDE.md` state: *"Neither the website nor the chatbot hardcodes any personal info"* / *"Never edit component text directly."* In practice:

| Component | Uses DB data? | Hardcoded |
|---|---|---|
| `Hero.tsx` | ❌ (takes `personal`, ignores it) | name, lede/tagline, all 3 pills, portrait caption, "now/reading/shipping/shooting" list |
| `About.tsx` | ✅ `personal.bio` | 2nd paragraph ("I'm a team player…on weekends I am out searching for frames") |
| `Chat.tsx` | partial | sidebar claims — including **"HyDE retrieval"**, which the pipeline does **not** implement (it's hybrid vector+FTS+RRF). Same false claim is in `migrations/004`'s project bullet. Also "region us-east-1 / provider Render" hardcoded. |
| `Experience`, `Projects`, `Skills`, `Education`, `Contact` | ✅ | — |

**Fix direction:** either (a) commit to DB-sourced content and add the missing `personal_info` keys (`hero_lede`, `hero_pills`, `now_*`, `about_p2`) + a `photos`/`links` concept, or (b) explicitly declare Hero/Chat-sidebar as "static chrome" and remove the false "HyDE" claim. Pick one and write it down.

### 4.2 Design-handoff bundle is unused

`design/project/Portfolio.html`, `Chat.html`, and directions A (ink), B (liquid), C (tide) are committed. The current `src/` looks like an implementation of **direction C (tide)** plus the "final" prototype, but nobody has diffed the built site against `final.jsx` / `Portfolio.html`. Action: do a side-by-side pass (see §4.3) and list the deltas.

### 4.3 Playwright — so we can actually see it

Not installed yet. Setup (run inside `portfolio-website/`):

```bash
cd portfolio-website
npm i -D @playwright/test
npx playwright install chromium          # ~120 MB, one-time
```

Minimal screenshot script — `portfolio-website/scripts/shoot.mjs`:

```js
import { chromium } from '@playwright/test';
const url = process.argv[2] ?? 'http://localhost:3000';
const b = await chromium.launch();
for (const [w, h, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);                       // let the tide settle
  await p.screenshot({ path: `design/shots/${tag}-full.png`, fullPage: true });
}
await b.close();
```

Then:

```bash
npm run dev &                 # or `npm run build && npm start`
node scripts/shoot.mjs
```

With no `.env.local`, the dev server renders `getDevFallback()` data — good enough to review layout/typography/motion. For a true content check, add `.env.local` with a real `DATABASE_URL` first.

> The design bundle's own README says "don't screenshot unless the user asks" — the user has asked, so we screenshot.

### 4.4 Accessibility / motion quick hits

- `useReducedMotion` gates the `fn-edge`/`fn-water` SVG filters and the tide rAF loop — good. Verify the hero mouse-parallax and `MagneticCta` also respect it (they check `reduced` in Hero but `MagneticCta` does not).
- `MobileNav` overlay uses `aria-hidden={!open}` but focus is not trapped and `Esc` doesn't close it.
- Nav scroll-spy (`StickyNav`) sets `active` from an IntersectionObserver with `-40%/-55%` margins — fine, but with 6 short sections two can be "intersecting" at once; last-writer-wins may flicker.

### 4.5 Aesthetic direction — a decision for the owner (from the `frontend-design` skill)

Anthropic's `frontend-design` skill keeps a "calibration" list of the traits AI-generated design currently clusters around. **The current site matches two of its named clusters almost point-for-point:**

> **Cluster 1:** "a warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta/warm-clay accent (often near #D97757 — Anthropic's own accent, so it reads as a tell)."
> **Cluster 5:** "template chrome that appears whatever the subject: a tracked-out ALL-CAPS eyebrow above every heading; meta strings joined with middle dots ('A · B · C'); labels built as 'WORD — fragment' with a spaced em-dash; tinted near-black (#0B0B0B / #111) for black; a monospace face for small data labels; a '→' appended to link/button text."

This site has: `--paper #f4ecdf` cream, Instrument Serif display, `--rust #b34a1f` clay accent, `--ink #1f1812` tinted-black, JetBrains Mono data labels, `→` on CTAs, `i. about` / `ii. experience` numbered section eyebrows, `go · sse · pgvector · groq` middle-dot meta strings, `— mscs · uw–madison · '25 → '27 —` framed-em-dash eyebrow. The `frontend-design` skill also calls out "fade-and-slide-up entrances on each section" as an AI tell — which is exactly the `.fn-section` reveal.

**This is not a bug.** The execution is coherent and competent, and "warm editorial" is a legitimate brief. But it is the single most common look a recruiter or engineer will have seen this year, and every free axis was spent on a default rather than a choice. **Options, for the owner to pick:**

1. **Keep it.** Declare "warm editorial" as the pinned brief; both `impeccable` and `frontend-design` say the brief wins. Tighten execution (§4.1 content, motion restraint) and ship.
2. **Re-pitch the visual world.** Run `/impeccable shape` or the `frontend-design` two-pass process against a real brief grounded in the subject (distributed-systems + ML-infra engineer, Uber, CUDA, photography). Keep the structure and content; replace palette / type / chrome with something specific to *this* person. ~1–2 days.
3. **Targeted de-genericization.** Keep the bones, remove the tells: drop the numbered section eyebrows unless the content is a sequence, cut the `→` suffixes, replace middle-dot meta strings, make the section reveal a single orchestrated moment instead of per-section fade-slide. ~half a day.

Recommendation: **option 3 now** (cheap, removes the most obvious tells), keep **option 2** on the table as a deliberate project once the system works end-to-end.

---

## 5. Cross-repo consistency issues

| # | Issue | Repos affected |
|---|---|---|
| X1 | Vector dim: code 512, docs 1024 (§H4) | store |
| X2 | SSE contract: `token` vs `content`, `[DONE]` vs `{"done":true}` (§C1) | chatbot ↔ website |
| X3 | Env var name: `DATABASE_URL` vs `NEON_DATABASE_URL` (§L8) | all 3 |
| X4 | `SIMILARITY_THRESHOLD` default: 0.80 (`main.go`) vs 0.75 (`render.yaml`, `.env.example`, `CLAUDE.md`) | chatbot |
| X5 | `LLM_PROVIDER` default: `groq` (`main.go`, `render.yaml`) vs `gemini` (`.env.example`) | chatbot |
| X6 | "HyDE retrieval" claimed in `Chat.tsx` sidebar + `migrations/004` bullet; not implemented | website, store |
| X7 | Migration 004 + `seeds/projects.sql` edits uncommitted; website's featured query assumes 004 applied | store ↔ website |
| X8 | Saved project memory says Supabase / React+Vite; reality is Neon / Next.js 16 | (memory) |
| X9 | `README.md` chunk counts ("~35") vs actual (46) | store |

---

## 6. Recommended fix sequence

### Phase 0 — see it & baseline (½ day)
- [x] Install Playwright, capture desktop + mobile screenshots (`portfolio-website/design/shots/`, `scripts/shoot.mjs`). §4.0 / §4.3
- [x] First-pass visual audit → §4.0. Headline: **hero renders blank (C3)**.
- [ ] Diff built site vs `design/project/final.jsx` / `Portfolio.html`; list visual deltas.
- [ ] Stand up a scratch Neon DB, run all migrations **including 004** + seeds + `knowledge_base.sql`; confirm row counts.
- [ ] Point a local `.env.local` / `.env` at it; confirm the site renders real data and the chatbot runs locally end-to-end (it will still be broken in the browser — that's C1).

### Phase 1 — make the site + chatbot actually work (1–1.5 days)
- [ ] **C3:** fix the CSS-Module keyframe references so the hero (and cosmetic animations) render. Pick one strategy from §C3 and apply it across all 5 module files + `globals.css`. Re-screenshot to confirm the hero.
- [ ] Add `scroll-margin-top: var(--nav-h)` to `.fn-section` (§4.0) and make the base reveal state fail-open (§4.0 robustness note).
- [ ] **C1/C2:** rewrite `api.ts` SSE parsing to the real contract (`token` / `done`+`id` / `error` / `rate_limited`). Add an `{ error }` channel and render it in `Chat.tsx`.
- [ ] **M8:** exclude the seed greeting from `history`.
- [ ] **H3:** set `ALLOWED_ORIGINS` correctly; add `*.vercel.app` preview handling in `CORSMiddleware`.
- [ ] Re-test locally and on a preview deploy: hero visible, tokens stream, errors show, rate-limit message shows.

### Phase 2 — kill the free-tier ceiling (1–2 days)
- [ ] **H1 (option A):** implement a `geminiEmbedder` in `internal/rag/` (or a provider switch like the LLM layer already has). Env: `EMBED_PROVIDER=gemini|voyage|local`.
- [ ] Update `embed.py` to call Gemini embeddings; regenerate `seeds/knowledge_base.sql`.
- [ ] **H4:** new migration `005_embedding_dims.sql` — `ALTER TABLE knowledge_base … VECTOR(768)` (drop+re-add column + reload). Update all 512→768 references in docs/comments in the same commit.
- [ ] **M6:** drop the `ivfflat` index (or switch to HNSW).
- [ ] **D (cache):** add an in-memory LRU (5-min TTL) in front of the embedder for repeated queries.
- [ ] Load-test: fire 20 chats in a minute, confirm no 429.

### Phase 3 — robustness & correctness (1–2 days)
- [ ] **H2:** guard `Projects.tsx` for empty/collapsed state; give the mobile accordion its own state.
- [ ] **M1:** deterministic `Section` offset (hash of `id`).
- [ ] **M2/M3:** shared `ApiStatusProvider`; "waking up" state; realistic timeouts; empty initial history.
- [ ] **M4:** "upcoming" handling in `Experience.tsx`.
- [ ] **M5:** `context.WithoutCancel` for interaction logging.
- [ ] **M7:** fix the topic-filter to use the best vector distance; reconcile the threshold (X4).
- [ ] **L1:** `gofmt -w`; add `make fmt` + CI check. **L5/X5:** reconcile provider defaults.

### Phase 4 — design fidelity & content (2–3 days)
- [ ] Decide §4.1: DB-sourced hero/about content vs declared-static chrome. Implement.
- [ ] **X6:** remove the false "HyDE" claim (or implement HyDE — it's a small addition to `pipeline.go` if we want the buzzword to be true).
- [ ] **M9:** thumbs-up/down on AI messages → `POST /rating`; show `avg_rating` somewhere.
- [ ] **L9:** ship `public/cv.pdf` + seed `cv_url`, or drop the link.
- [ ] Accessibility: focus trap + `Esc` for `MobileNav`; `MagneticCta` respects reduced motion.
- [ ] Re-screenshot; compare against design bundle; iterate.

### Phase 5 — commit hygiene & docs
- [ ] Commit migration 004 + `seeds/projects.sql` in `portfolio-store` (X7).
- [ ] Commit the `rag-chatbot/README.md` edits.
- [ ] Update `portfolio-website/CLAUDE.md` V2 TODO list.
- [ ] Update the saved project memory (X8): Neon (not Supabase), Next.js 16 (not React+Vite).
- [ ] Fix `README.md` counts (X9), env-var naming (X3/L8).

---

## 7. Environment / deployment checklist

### `portfolio-store` (Neon)
- [ ] Neon project created; **pooled** connection string in hand.
- [ ] Migrations run in order: `001 → 002 → 003 → 004`.
- [ ] Seeds run: `personal_info, skills, experience, education, projects, achievements, knowledge_base`.
- [ ] `knowledge_base` row count = 46; `vector_dims(embedding)` = 512 (→ 768 after Phase 2).
- [ ] Decide `cv_url` in `personal_info` (L9).

### `rag-chatbot` (Render)
- [ ] `NEON_DATABASE_URL` — pooled Neon string.
- [ ] `EMBED_PROVIDER` / `VOYAGE_API_KEY` **or** `GEMINI_API_KEY` (after Phase 2, Gemini).
- [ ] `GROQ_API_KEY`; `LLM_PROVIDER=groq`.
- [ ] `ALLOWED_ORIGINS` = exact prod website origin (+ preview handling). **This is the #1 deploy footgun.**
- [ ] `SIMILARITY_THRESHOLD` — one agreed value (0.75).
- [ ] Health check path `/health` returns `{"status":"ok"}`.
- [ ] Note: free dyno sleeps after 15 min idle → first request 30–60 s. `HealthWarmup` mitigates on page load.

### `portfolio-website` (Vercel)
- [ ] `DATABASE_URL` — pooled Neon string (server-side; never `NEXT_PUBLIC_`).
- [ ] `NEXT_PUBLIC_API_URL` = `https://<render-service>.onrender.com` (no trailing slash).
- [ ] Confirm ISR: `revalidate = 3600` on `/`.
- [ ] After DB content changes: redeploy or wait ≤1 h for ISR.

---

## 8. Appendix — quick file index of where each issue lives

```
portfolio-website/
  src/app/globals.css ............ C3 (keyframes live here), §4.0 (scroll-margin, fail-open reveal)
  src/components/sections/Hero.module.css .... C3 (animation: fn-rise ×8 — blank hero)
  src/components/sections/Projects.module.css  C3 (fn-drift, fn-fade — cosmetic)
  src/components/sections/Chat.module.css .... C3 (fn-bounce, fn-pulse — cosmetic)
  src/components/nav/StickyNav.module.css .... C3 (fn-nav-pop — cosmetic)
  src/lib/api.ts .................. C1, C2, L3           (SSE contract — critical)
  src/components/sections/Chat.tsx  C1(consumer), M8, M9, X6, §4.0, §4.1
  src/components/sections/Projects.tsx  H2
  src/components/sections/Hero.tsx  L2, L10, §4.1
  src/components/sections/About.tsx §4.1
  src/components/sections/Experience.tsx  M4 (confirmed live in §4.0)
  src/components/ui/Section.tsx ... M1                    (Math.random hydration)
  src/lib/useApiStatus.ts ........ M2, M3, §4.0
  src/components/ui/HealthWarmup.tsx  M2, M3
  src/components/nav/MobileNav.tsx  §4.4 (a11y)
  next.config.ts ................. L4
  scripts/shoot.mjs ............. Playwright capture (new)

rag-chatbot/
  internal/rag/embedder.go ....... H1                     (swap Voyage → Gemini/local)
  internal/rag/pipeline.go ....... M7, X6 (HyDE)
  internal/rag/retriever.go ...... M6 (index), M7
  internal/api/handlers.go ....... C2 (error events), M5 (ctx)
  internal/api/middleware.go ..... H3 (CORS)
  internal/llm/llm.go ............ L1 (gofmt)
  cmd/server/main.go ............. X4, X5
  render.yaml ................... H3, X4, X5, L5

portfolio-store/
  migrations/003_knowledge_base.sql  H4 (VECTOR 512), M6 (ivfflat)
  migrations/004_*.sql (untracked)   X7
  seeds/projects.sql (modified) .... X7
  seeds/knowledge_base.sql ......... regenerate in Phase 2
  scripts/embed.py ................ H4 (1024 comments), Phase 2 (Gemini)
  README.md / CLAUDE.md .......... H4, X1, X9
```
