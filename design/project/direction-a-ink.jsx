// DIRECTION A — INK BLEED
// Editorial paper, real watercolor + ink-bleed via SVG turbulence,
// scroll-linked ink-spread reveals, photographic placeholders.

const { useState, useEffect, useRef, useMemo } = React;

function InkBleedDefs() {
  // Reused SVG filter definitions for ink/watercolor textures
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <filter id="ink-bleed" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
        </filter>
        <filter id="ink-edge" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
        </filter>
        <filter id="paper-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.36
                                  0 0 0 0 0.20
                                  0 0 0 0 0.10
                                  0 0 0 0.08 0" />
        </filter>
        <filter id="watercolor" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="3" seed="11" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="22" />
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <radialGradient id="ink-blot-rust" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#b34a1f" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#8a3210" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4a1a08" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ink-blot-ink" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1410" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#2c241e" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2c241e" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// A scroll-spy hook — returns 0..1 for how far an element is into the viewport
function useScrollProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const root = node.closest("[data-scroll-root]") || window;
    const update = () => {
      const rect = node.getBoundingClientRect();
      const rootRect = root === window
        ? { top: 0, height: window.innerHeight }
        : root.getBoundingClientRect();
      const vh = rootRect.height;
      const top = rect.top - rootRect.top;
      const raw = 1 - (top + rect.height * 0.3) / (vh + rect.height * 0.3);
      setP(Math.max(0, Math.min(1, raw)));
    };
    update();
    const target = root === window ? window : root;
    target.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      target.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref]);
  return p;
}

function InkBlot({ x, y, r, color = "rust", style }) {
  const url = color === "rust" ? "url(#ink-blot-rust)" : "url(#ink-blot-ink)";
  return (
    <svg
      style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, pointerEvents: "none", ...style }}
      viewBox="0 0 200 200"
    >
      <g filter="url(#watercolor)">
        <circle cx="100" cy="100" r="80" fill={url} />
      </g>
    </svg>
  );
}

function InkHero() {
  const ref = useRef(null);
  const pRaw = useScrollProgress(ref);
  const p = Number.isFinite(pRaw) ? pRaw : 0;
  return (
    <section ref={ref} className="ink-hero" data-screen-label="A · Hero">
      {/* Ambient ink blots that drift on scroll */}
      <InkBlot x="-120px" y="-80px" r={260} color="rust" style={{ transform: `translate(${p * 40}px, ${p * 60}px)`, opacity: Math.max(0, 0.7 - p * 0.3) }} />
      <InkBlot x="65%" y="20%" r={180} color="ink" style={{ transform: `translate(${-p * 60}px, ${p * 80}px)`, opacity: 0.45 }} />
      <InkBlot x="55%" y="65%" r={220} color="rust" style={{ transform: `translate(${p * 80}px, ${-p * 40}px)`, opacity: Math.max(0, 0.5 - p * 0.2) }} />

      <header className="ink-nav">
        <div className="ink-mark">AG.</div>
        <nav>
          <a href="#work">Work</a>
          <a href="#projects">Projects</a>
          <a href="#chat">Chat</a>
          <a href="#contact">Contact</a>
        </nav>
        <ApiPill />
      </header>

      <div className="ink-hero-grid">
        <div className="ink-hero-text">
          <div className="ink-eyebrow">
            <span className="ink-dot" /> MSCS · UW–MADISON · 2025—2027
          </div>
          <h1 className="ink-h1">
            <span style={{ filter: "url(#ink-edge)" }}>Avyakt</span>
            <span className="ink-name-break" style={{ filter: "url(#ink-edge)" }}>Garg.</span>
          </h1>
          <p className="ink-lede">
            I build <em>AI infrastructure</em> the way I shoot film — patient with the slow parts,
            unforgiving on the edges. Marketplace systems at Uber. CUDA kernels by night.
            Coffee by the gallon.
          </p>
          <div className="ink-cta-row">
            <a className="ink-cta primary" href="#chat">Talk to my chatbot →</a>
            <a className="ink-cta ghost" href="#resume">Download CV</a>
          </div>
        </div>
        <div className="ink-hero-portrait">
          <div className="ink-portrait-frame" style={{ filter: "url(#ink-bleed)" }}>
            <div className="ink-portrait-stripes" />
            <div className="ink-portrait-caption">[ portrait — 35mm, Madison, Feb '26 ]</div>
          </div>
          <div className="ink-portrait-meta">
            <div><span>NOW</span> Madison, WI · 38°F · clear</div>
            <div><span>READING</span> Designing Data-Intensive Apps</div>
            <div><span>SHIPPING</span> IVF-PQ kernel v0.3</div>
          </div>
        </div>
      </div>
      <div className="ink-scroll-hint">scroll — the ink follows</div>
    </section>
  );
}

function ApiPill() {
  const s = useApiStatus();
  return (
    <div className={`api-pill ${s.live ? "live" : "down"}`}>
      <span className="api-pill-dot" />
      <span className="api-pill-label">api</span>
      <span className="api-pill-state">{s.live ? "live" : "degraded"}</span>
      <svg className="api-pill-graph" viewBox="0 0 80 20" preserveAspectRatio="none">
        <polyline
          points={s.history.slice(-20).map((v, i) => `${(i / 19) * 80},${20 - (v / 130) * 18}`).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
      <span className="api-pill-ms">{s.latency}ms</span>
    </div>
  );
}

function InkSection({ id, label, title, children, screenLabel }) {
  const ref = useRef(null);
  const pRaw = useScrollProgress(ref);
  const p = Number.isFinite(pRaw) ? pRaw : 0;
  return (
    <section id={id} ref={ref} className="ink-section" data-screen-label={screenLabel}>
      <div
        className="ink-section-divider"
        style={{
          transform: `scaleX(${0.05 + p * 0.95})`,
          opacity: Math.max(0, Math.min(1, p * 2)),
        }}
      />
      <div className="ink-section-head" style={{ opacity: Math.max(0, Math.min(1, p * 2.5)), transform: `translateY(${(1 - Math.min(1, p * 2)) * 24}px)` }}>
        <div className="ink-section-label">{label}</div>
        <h2 className="ink-section-title">{title}</h2>
      </div>
      <div className="ink-section-body">{children}</div>
    </section>
  );
}

function InkAbout() {
  return (
    <InkSection id="about" label="01 / About" title="A long-form, no-fluff story." screenLabel="A · About">
      <div className="ink-about-grid">
        <p className="ink-prose">
          I'm a CS grad student at UW–Madison. Before this, I spent a year at Uber building
          marketplace infra for AI annotation — backend Java, gRPC, Kafka, the whole stack.
          Before that I was a research intern in Saskatchewan rebuilding a biomedical
          lab's data pipeline, and at IIT Ropar training models on IoT health sensors.
        </p>
        <p className="ink-prose">
          Outside of code I shoot 35mm. I read papers slower than I should. I'm the
          kind of teammate who pings you about the edge case before standup, then
          shows up with the fix.
        </p>
        <aside className="ink-aside">
          <div className="ink-aside-row"><span>FROM</span> Delhi → Pilani → Madison</div>
          <div className="ink-aside-row"><span>STUDIES</span> Systems · ML · GPUs</div>
          <div className="ink-aside-row"><span>SHOOTS</span> Fuji X-T4 · Pentax K1000</div>
          <div className="ink-aside-row"><span>RUNS ON</span> 4hr deep work blocks</div>
        </aside>
      </div>
    </InkSection>
  );
}

function InkExperience() {
  return (
    <InkSection id="work" label="02 / Experience" title="Where the receipts are." screenLabel="A · Experience">
      <ol className="ink-exp-list">
        {DATA.experience.map((e, i) => (
          <li key={i} className="ink-exp-item">
            <div className="ink-exp-meta">
              <div className="ink-exp-period">{e.period}</div>
              <div className="ink-exp-num">0{i + 1}</div>
            </div>
            <div className="ink-exp-body">
              <h3>{e.role} <span>· {e.org}</span></h3>
              <ul>
                {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </InkSection>
  );
}

function InkProjects() {
  const [hovered, setHovered] = useState(null);
  return (
    <InkSection id="projects" label="03 / Projects" title="Things I've actually shipped." screenLabel="A · Projects">
      <div className="ink-proj-grid">
        {DATA.projects.map((pr, i) => (
          <article
            key={i}
            className={`ink-proj-card ${hovered === i ? "hovered" : ""}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="ink-proj-tag">{pr.tag}</div>
            <h3 className="ink-proj-title">{pr.title}</h3>
            <div className="ink-proj-stack">{pr.stack}</div>
            <p className="ink-proj-body">{pr.body}</p>
            <div className="ink-proj-reveal">
              <span>read writeup →</span>
            </div>
            {/* Hover ink blot reveal */}
            <div className="ink-proj-blot" />
          </article>
        ))}
      </div>
    </InkSection>
  );
}

function InkSkills() {
  return (
    <InkSection id="skills" label="04 / Stack" title="What's on the bench." screenLabel="A · Skills">
      <div className="ink-skills-grid">
        {Object.entries(DATA.skills).map(([k, v]) => (
          <div key={k} className="ink-skill-col">
            <div className="ink-skill-head">{k}</div>
            <div className="ink-skill-tags">
              {v.map((t) => <span key={t} className="ink-tag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </InkSection>
  );
}

function InkEducation() {
  return (
    <InkSection id="education" label="05 / School" title="Two degrees, one thesis short of a third." screenLabel="A · Education">
      <div className="ink-edu-list">
        {DATA.education.map((e, i) => (
          <div key={i} className="ink-edu-row">
            <div className="ink-edu-period">{e.period}</div>
            <div>
              <h3>{e.school}</h3>
              <div className="ink-edu-degree">{e.degree}</div>
            </div>
            <div className="ink-edu-grade">{e.grade}</div>
          </div>
        ))}
      </div>
    </InkSection>
  );
}

function InkAchievements() {
  return (
    <InkSection id="achievements" label="06 / Honors" title="A few on the wall." screenLabel="A · Achievements">
      <div className="ink-ach-list">
        {DATA.achievements.map((a, i) => (
          <div key={i} className="ink-ach-row">
            <div className="ink-ach-year">{a.year}</div>
            <div>{a.text}</div>
          </div>
        ))}
      </div>
    </InkSection>
  );
}

function InkChat() {
  const [msgs, setMsgs] = useState([
    { who: "ai", text: "Hey — I'm Avyakt's chatbot. Ask me about Uber, the CUDA project, or what film I shoot." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const send = () => {
    const t = input.trim();
    if (!t) return;
    setMsgs((m) => [...m, { who: "me", text: t }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { who: "ai", text: pickReply(t) }]);
      setThinking(false);
    }, 700 + Math.random() * 600);
  };
  const suggestions = ["Tell me about Uber.", "What's the CUDA project?", "Do you shoot photos?"];
  return (
    <InkSection id="chat" label="07 / Chat" title="Talk to me. (Powered by RAG.)" screenLabel="A · Chat">
      <div className="ink-chat-shell">
        <div className="ink-chat-head">
          <span className="ink-chat-dot" />
          <span>chat.avyakt.dev</span>
          <span className="ink-chat-meta">SSE · Gemini · pgvector</span>
        </div>
        <div className="ink-chat-log">
          {msgs.map((m, i) => (
            <div key={i} className={`ink-chat-msg ${m.who}`}>
              <div className="ink-chat-bubble">{m.text}</div>
            </div>
          ))}
          {thinking && (
            <div className="ink-chat-msg ai">
              <div className="ink-chat-bubble thinking"><span /><span /><span /></div>
            </div>
          )}
        </div>
        <div className="ink-chat-suggestions">
          {suggestions.map((s) => (
            <button key={s} onClick={() => { setInput(s); setTimeout(send, 80); }}>{s}</button>
          ))}
        </div>
        <div className="ink-chat-input">
          <input
            value={input}
            placeholder="ask anything…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send}>send →</button>
        </div>
      </div>
    </InkSection>
  );
}

function InkApi() {
  const s = useApiStatus();
  return (
    <InkSection id="api" label="08 / API" title="Live status. Pulled from prod." screenLabel="A · API">
      <div className="ink-api-card">
        <div className="ink-api-head">
          <div className="ink-api-name">
            <span className={`ink-api-dot ${s.live ? "live" : "down"}`} />
            api.avyakt.dev/v1
          </div>
          <div className="ink-api-state">{s.live ? "OPERATIONAL" : "DEGRADED"}</div>
        </div>
        <div className="ink-api-stats">
          <div><label>latency</label><b>{s.latency}<span>ms</span></b></div>
          <div><label>uptime 30d</label><b>{s.uptime.toFixed(2)}<span>%</span></b></div>
          <div><label>requests / min</label><b>{Math.round(s.history[s.history.length - 1] * 12)}</b></div>
        </div>
        <svg className="ink-api-graph" viewBox="0 0 400 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ink-graph-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b34a1f" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#b34a1f" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            points={s.history.map((v, i) => `${(i / (s.history.length - 1)) * 400},${80 - (v / 130) * 70}`).join(" ")}
            fill="none"
            stroke="#b34a1f"
            strokeWidth="1.6"
          />
          <polygon
            points={`0,80 ${s.history.map((v, i) => `${(i / (s.history.length - 1)) * 400},${80 - (v / 130) * 70}`).join(" ")} 400,80`}
            fill="url(#ink-graph-fill)"
          />
        </svg>
        <div className="ink-api-foot">last check {Math.floor(Math.random() * 3) + 1}s ago · check every 1s</div>
      </div>
    </InkSection>
  );
}

function InkContact() {
  return (
    <InkSection id="contact" label="09 / Contact" title="Say hi. I read everything." screenLabel="A · Contact">
      <div className="ink-contact-grid">
        <a href="mailto:garg62@wisc.edu" className="ink-contact-row big">
          <span>EMAIL</span><b>garg62@wisc.edu</b>
        </a>
        <a className="ink-contact-row"><span>LINKEDIN</span><b>avyakt-garg</b></a>
        <a className="ink-contact-row"><span>GITHUB</span><b>github.com/avyakt</b></a>
        <a className="ink-contact-row"><span>PHONE</span><b>(608) 259-0543</b></a>
      </div>
      <div id="resume" className="ink-resume-cta">
        <a href="#" download>↓ Download CV (PDF, 1 page)</a>
      </div>
      <footer className="ink-foot">
        <div>© 2026 Avyakt Garg. Set in Instrument Serif & IBM Plex.</div>
        <div>Built with Go, Postgres, and a lot of ink.</div>
      </footer>
    </InkSection>
  );
}

function InkBleedSite() {
  return (
    <div className="ink-root" data-scroll-root>
      <InkBleedDefs />
      <div className="ink-paper-grain" />
      <InkHero />
      <InkAbout />
      <InkExperience />
      <InkProjects />
      <InkSkills />
      <InkEducation />
      <InkAchievements />
      <InkChat />
      <InkApi />
      <InkContact />
    </div>
  );
}

window.InkBleedSite = InkBleedSite;
