// FINAL — remix of A's scheme + C's tide waves + B's expanding project panel.
// Single-scroll site with a separate /chat page (Chat.html) opened from CTA.

const { useState: useS, useEffect: useE, useRef: useR } = React;

/* ---------- Reusable: tide wave divider (from C) ---------- */
function tidePath(p, amp, freq, w, h) {
  const pts = [];
  for (let i = 0; i <= 32; i++) {
    const x = i / 32 * w;
    const phase = i / 32 * Math.PI * 2 * freq + p * Math.PI * 2;
    const y = h / 2 + Math.sin(phase) * amp * (0.6 + p * 0.4);
    pts.push([x, y]);
  }
  let d = `M0,${h} L0,${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    const [px, py] = pts[i - 1];
    d += ` Q${(px + x) / 2},${py} ${x},${y}`;
  }
  d += ` L${w},${h} Z`;
  return d;
}
function Tide({ flip = false, color = "#e8d9c0", color2 = "#d9c8a8", offset = 0 }) {
  const [t, setT] = useS(0);
  useE(() => {
    let raf;
    const tick = () => {
      setT(performance.now() / 4500 + offset);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [offset]);
  return (
    <svg className={`fn-tide ${flip ? "flip" : ""}`} viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
      <path d={tidePath(t % 1, 28, 2.2, 1440, 120)} fill={color2} opacity="0.55" />
      <path d={tidePath((t + 0.3) % 1, 22, 3.0, 1440, 120)} fill={color} opacity="0.7" />
    </svg>);

}

/* ---------- Filters (ink-edge, watercolor) ---------- */
function FnDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <filter id="fn-edge" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" />
        </filter>
        <filter id="fn-water" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="3" seed="9" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="22" />
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
    </svg>);

}

/* ---------- API status pill (top-right) ---------- */
function FnApiPill() {
  const s = useApiStatus();
  return (
    <div className={`fn-pill ${s.live ? "live" : "down"}`}>
      <span className="fn-pill-dot" />
      <span className="fn-pill-label">api</span>
      <span className="fn-pill-state">{s.live ? "live" : "degraded"}</span>
      <svg viewBox="0 0 80 20" preserveAspectRatio="none" className="fn-pill-graph">
        <polyline
          points={s.history.slice(-20).map((v, i) => `${i / 19 * 80},${20 - v / 130 * 18}`).join(" ")}
          fill="none" stroke="currentColor" strokeWidth="1.2" />
        
      </svg>
      <span className="fn-pill-ms">{s.latency}ms</span>
    </div>);

}

/* ---------- Sticky nav with scroll-spy ---------- */
const NAV_LINKS = [
{ id: "about", label: "about" },
{ id: "work", label: "work" },
{ id: "projects", label: "projects" },
{ id: "skills", label: "stack" },
{ id: "chat", label: "chat" },
{ id: "contact", label: "contact" }];

function FnStickyNav() {
  const [scrolled, setScrolled] = useS(false);
  const [active, setActive] = useS("about");
  useE(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useE(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    NAV_LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return (
    <header className={`fn-nav sticky ${scrolled ? "shrunk" : ""}`}>
      <a href="#top" className="fn-mark">A.G</a>
      <nav>
        {NAV_LINKS.map((l) =>
        <a key={l.id} href={`#${l.id}`} className={active === l.id ? "active" : ""}>
            {l.label}
            {active === l.id && <span className="fn-nav-pill" />}
          </a>
        )}
      </nav>
      <FnApiPill />
    </header>);

}

/* ---------- Magnetic CTA ---------- */
function MagneticCta({ href, primary, children, onClick }) {
  const ref = useR(null);
  const [t, setT] = useS({ x: 0, y: 0 });
  return (
    <a
      ref={ref}
      className={`fn-cta ${primary ? "primary" : "ghost"}`}
      href={href}
      onClick={onClick}
      onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        setT({ x: x * 0.25, y: y * 0.4 });
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      style={{ transform: `translate(${t.x}px, ${t.y}px)` }}>
      
      {children}
    </a>);

}

/* ---------- Hero ---------- */
function FnHero() {
  const [mp, setMp] = useS({ x: 0.5, y: 0.5 });
  return (
    <section id="top" className="fn-hero" data-screen-label="01 Hero"
    onMouseMove={(e) => {
      const r = e.currentTarget.getBoundingClientRect();
      setMp({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    }}>
      
      <div className="fn-hero-blob"
      style={{ transform: `translate(${(mp.x - 0.5) * 36}px, ${(mp.y - 0.5) * 36}px)` }} />
      
      <div className="fn-hero-blob alt"
      style={{ transform: `translate(${(0.5 - mp.x) * 24}px, ${(0.5 - mp.y) * 24}px)` }} />
      
      <div className="fn-hero-grid">
        <div className="fn-hero-text">
          <div className="fn-eyebrow">— mscs · uw–madison · '25 → '27 —</div>
          <h1 className="fn-h1">
            <span style={{ filter: "url(#fn-edge)" }}>Avyakt</span>
            <span className="fn-h1-italic" style={{ filter: "url(#fn-edge)" }}>Garg.</span>
          </h1>
          <p className="fn-lede">
            I build for <em>both sides of the stack</em> — distributed systems
            that don't fall over, and ML infrastructure that actually ships.
            <br />
            Marketplace platforms at Uber. CUDA kernels & RAG pipelines by night.
          </p>
          <div className="fn-role-pills">
            <span className="fn-role-pill swe">software engineer</span>
            <span className="fn-role-pill ml">ml / ai infra</span>
            <span className="fn-role-pill open">open to '26 internships</span>
          </div>
          <div className="fn-cta-row">
            <MagneticCta primary href="#chat">Talk to my AI →</MagneticCta>
            <MagneticCta href="#work">See the work</MagneticCta>
          </div>
        </div>
        <aside className="fn-hero-meta">
          <div className="fn-portrait" style={{ filter: "url(#fn-edge)" }}>
            <div className="fn-portrait-stripes" />
            <div className="fn-portrait-cap">[ portrait — 35mm, Madison '26 ]</div>
          </div>
          <div className="fn-meta-list">
            <div><span>now</span> Madison, WI · 38°F · clear</div>
            <div><span>reading</span> Designing Data-Intensive Apps</div>
            <div><span>shipping</span> IVF-PQ kernel v0.3</div>
            <div><span>shooting</span> Fuji X-T4 · Pentax K1000</div>
          </div>
        </aside>
      </div>
      <Tide />
    </section>);

}

/* ---------- Wrapper section (with optional flipped/dark variant + tide) ---------- */
function FnSection({ id, label, title, children, screenLabel, dark = false, tide = true, tideColor, tideColor2 }) {
  const ref = useR(null);
  const [vis, setVis] = useS(false);
  useE(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVis(true), { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section ref={ref} id={id} className={`fn-section ${vis ? "vis" : ""} ${dark ? "dark" : ""}`} data-screen-label={screenLabel}>
      <div className="fn-section-inner">
        <div className="fn-section-label">{label}</div>
        <h2 className="fn-section-title">{title}</h2>
        {children}
      </div>
      {tide && <Tide color={tideColor} color2={tideColor2} offset={Math.random()} />}
    </section>);

}

function FnAbout() {
  return (
    <FnSection id="about" label="i. about" title={<>A software engineer<br /><em>who reads carefully.</em></>} screenLabel="02 About">
      <div className="fn-about">
        <p>
          I'm a CS grad student at UW–Madison. Before this, a year at Uber building
          marketplace infrastructure for AI annotation across five countries — Java,
          gRPC, Kafka, the whole stack. Two research stints before that: Saskatchewan
          (biomedical data) and IIT Ropar (ML on IoT health sensors).
        </p>
        <p>I'm a team player you can rely on. I leave the codebase cleaner than I found it. On weekends, I am out searching for frames.


        </p>
      </div>
    </FnSection>);

}

function FnExperience() {
  return (
    <FnSection id="work" label="ii. experience" title={<>Where the work<br /><em>actually happened.</em></>} screenLabel="03 Work" tideColor="#1f1812" tideColor2="#3a2e25">
      <div className="fn-exp">
        {DATA.experience.map((e, i) =>
        <div key={i} className="fn-exp-row">
            <div className="fn-exp-when">{e.period}</div>
            <div className="fn-exp-body">
              <h3>{e.org}</h3>
              <div className="fn-exp-role">{e.role}</div>
              <ul>{e.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
            </div>
          </div>
        )}
      </div>
    </FnSection>);

}

/* ---------- Projects: list + expanding detail (B-style) ---------- */
function FnProjects() {
  const [active, setActive] = useS(0);
  return (
    <FnSection id="projects" label="iii. projects" title={<>Things I've shipped,<br /><em>or am shipping now.</em></>} screenLabel="04 Projects" dark>
      <div className="fn-proj-layout">
        <ol className="fn-proj-list">
          {DATA.projects.map((p, i) =>
          <li key={i} className={i === active ? "active" : ""} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)}>
              <span className="fn-proj-num">0{i + 1}</span>
              <span className="fn-proj-name">{p.title}</span>
              <span className="fn-proj-stack">{p.stack}</span>
            </li>
          )}
        </ol>
        <div className="fn-proj-detail">
          <div className="fn-proj-blob" />
          <div className="fn-proj-content" key={active}>
            <div className="fn-proj-tag">{DATA.projects[active].tag}</div>
            <h3>{DATA.projects[active].title}</h3>
            <div className="fn-proj-stackline">{DATA.projects[active].stack}</div>
            <p>{DATA.projects[active].body}</p>
            <a className="fn-proj-cta" href="#" onClick={(e) => e.preventDefault()}>read writeup →</a>
          </div>
        </div>
      </div>
    </FnSection>);

}

function FnSkills() {
  return (
    <FnSection id="skills" label="iv. stack" title={<>The tools<br /><em>on my desk.</em></>} screenLabel="05 Skills">
      <div className="fn-skills">
        {Object.entries(DATA.skills).map(([k, v]) =>
        <div key={k} className="fn-skill-block">
            <h4>{k}</h4>
            <div className="fn-skill-tags">{v.map((t) => <span key={t}>{t}</span>)}</div>
          </div>
        )}
      </div>
    </FnSection>);

}

function FnEducation() {
  return (
    <FnSection id="education" label="v. school" title={<>Two degrees,<br /><em>and counting.</em></>} screenLabel="06 Education" tideColor="#1f1812" tideColor2="#3a2e25">
      <div className="fn-edu">
        {DATA.education.map((e, i) =>
        <div key={i} className="fn-edu-row">
            <div className="fn-edu-when">{e.period}</div>
            <div>
              <h3>{e.school}</h3>
              <div className="fn-edu-degree">{e.degree} — <em>{e.grade}</em></div>
            </div>
          </div>
        )}
        <div className="fn-ach-title">Honors</div>
        <div className="fn-ach-list">
          {DATA.achievements.map((a, i) =>
          <div key={i} className="fn-ach-row"><span>{a.year}</span> {a.text}</div>
          )}
        </div>
      </div>
    </FnSection>);

}

/* ---------- Inline chat (full, with API status sidebar) ---------- */
function FnChatTeaser() {
  const s = useApiStatus();
  const [msgs, setMsgs] = useS([
  { who: "ai", text: "Hi — I'm Avyakt's AI twin. Ask me about his work, projects, or how he thinks. I'm in beta and may make mistakes." }]
  );
  const logRef = useR(null);
  useE(() => {if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;}, [msgs]);
  const [input, setInput] = useS("");
  const [thinking, setThinking] = useS(false);
  const send = () => {
    const t = input.trim();if (!t) return;
    setMsgs((m) => [...m, { who: "me", text: t }]);
    setInput("");setThinking(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { who: "ai", text: pickReply(t) }]);
      setThinking(false);
    }, 750);
  };
  return (
    <FnSection id="chat" label="vi. chat" title={<>Talk to me,<br /><em>via my AI twin.</em></>} screenLabel="07 Chat" dark>
      <div className="fn-chat-disclaimer">
        <span className="fn-beta-tag">BETA</span>
        This is a custom RAG chatbot trained on my work. It runs on a Go backend I built —
        live status on the right. It can be wrong; for anything important, just email me.
      </div>
      <div className="fn-chat-wrap">
        <div className="fn-chat">
          <div className="fn-chat-head">
            <span className="fn-chat-dot" />
            <span>chat.avyakt.dev</span>
            <span className="fn-chat-meta">go · sse · pgvector · gemini</span>
          </div>
          <div className="fn-chat-log" ref={logRef}>
            {msgs.map((m, i) => <div key={i} className={`fn-chat-msg ${m.who}`}>{m.text}</div>)}
            {thinking && <div className="fn-chat-msg ai thinking"><span /><span /><span /></div>}
          </div>
          <div className="fn-chat-suggest">
            {["Tell me about Uber", "What's IVF-PQ?", "ML or SWE?", "Show me a project"].map((q) =>
            <button key={q} onClick={() => {setInput(q);setTimeout(() => {setMsgs((m) => [...m, { who: "me", text: q }]);setInput("");setThinking(true);setTimeout(() => {setMsgs((m) => [...m, { who: "ai", text: pickReply(q) }]);setThinking(false);}, 750);}, 0);}}>{q}</button>
            )}
          </div>
          <div className="fn-chat-input">
            <input value={input} placeholder="ask anything…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()} />
            <button onClick={send}>send</button>
          </div>
        </div>
        <aside className="fn-chat-api">
          <div className="fn-chat-api-head">
            <span className={`fn-api-dot ${s.live ? "live" : "down"}`} />
            <code>chatbot api</code>
            <span className={`fn-api-state ${s.live ? "live" : "down"}`}>{s.live ? "operational" : "degraded"}</span>
          </div>
          <svg viewBox="0 0 600 100" preserveAspectRatio="none" className="fn-api-graph">
            <defs>
              <linearGradient id="fn-graph-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97757" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#d97757" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,100 ${s.history.map((v, i) => `${i / (s.history.length - 1) * 600},${100 - v / 130 * 90}`).join(" ")} 600,100`} fill="url(#fn-graph-fill)" />
            <polyline points={s.history.map((v, i) => `${i / (s.history.length - 1) * 600},${100 - v / 130 * 90}`).join(" ")} fill="none" stroke="#d97757" strokeWidth="1.6" />
          </svg>
          <div className="fn-chat-api-stats">
            <div><label>latency</label><b>{s.latency}<span>ms</span></b></div>
            <div><label>uptime</label><b>{s.uptime.toFixed(2)}<span>%</span></b></div>
            <div><label>region</label><b>us-east-1</b></div>
            <div><label>checks</label><b>1<span>/sec</span></b></div>
          </div>
          <ul className="fn-chat-api-stack">
            <li>Three-repo Go service</li>
            <li>SSE streaming</li>
            <li>pgvector + Voyage embeddings</li>
            <li>HyDE retrieval · injection guards</li>
          </ul>
        </aside>
      </div>
    </FnSection>);

}

function FnContact() {
  return (
    <FnSection id="contact" label="viii. fin" title={<>Say hello.<br /><em>I'll write back.</em></>} screenLabel="09 Contact" tide={false}>
      <div className="fn-contact">
        <a href="mailto:garg62@wisc.edu" className="fn-mail">garg62@wisc.edu</a>
        <div className="fn-contact-grid">
          <div><label>phone</label>(608) 259-0543</div>
          <div><label>linkedin</label>avyakt-garg</div>
          <div><label>github</label>github.com/avyakt</div>
          <div><label>cv</label><a href="#" download>↓ pdf, single page</a></div>
        </div>
      </div>
      <footer className="fn-foot">
        <span>© 2026 Avyakt Garg</span>
        <span>set in instrument serif &amp; ibm plex</span>
        <span>built in madison</span>
      </footer>
    </FnSection>);

}

function FinalSite() {
  return (
    <div className="fn-root">
      <FnDefs />
      <FnStickyNav />
      <FnHero />
      <FnAbout />
      <FnExperience />
      <FnProjects />
      <FnSkills />
      <FnEducation />
      <FnChatTeaser />
      <FnContact />
    </div>);

}

window.FinalSite = FinalSite;