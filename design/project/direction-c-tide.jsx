// DIRECTION C — QUIET TIDE
// Soft scroll-driven SVG path morphing between sections.
// Most restrained / editorial of the three.

const { useState: useStateC, useEffect: useEffectC, useRef: useRefC } = React;

function tideWave(p, amp = 30, freq = 3, w = 1440, h = 100) {
  // Build a smooth wave path that morphs by p (0..1)
  const pts = [];
  for (let i = 0; i <= 30; i++) {
    const x = (i / 30) * w;
    const phase = (i / 30) * Math.PI * 2 * freq + p * Math.PI * 2;
    const y = h / 2 + Math.sin(phase) * amp * (0.5 + p * 0.5);
    pts.push([x, y]);
  }
  let d = `M0,${h} L0,${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    d += ` Q${cx},${py} ${x},${y}`;
  }
  d += ` L${w},${h} Z`;
  return d;
}

function QTTideDivider({ flip, color = "#e8d9c0", offset = 0 }) {
  const [t, setT] = useStateC(0);
  useEffectC(() => {
    let raf;
    const tick = () => {
      setT(performance.now() / 4000 + offset);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [offset]);
  return (
    <svg className={`qt-tide ${flip ? "flip" : ""}`} viewBox="0 0 1440 100" preserveAspectRatio="none">
      <path d={tideWave(t % 1, 24, 2.3, 1440, 100)} fill={color} opacity="0.55" />
      <path d={tideWave((t + 0.3) % 1, 18, 3.1, 1440, 100)} fill={color} opacity="0.4" />
    </svg>
  );
}

function QTHero() {
  const [mp, setMp] = useStateC({ x: 0.5, y: 0.5 });
  return (
    <section className="qt-hero" data-screen-label="C · Hero"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setMp({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
      }}
    >
      <div className="qt-hero-blob"
        style={{ transform: `translate(${(mp.x - 0.5) * 30}px, ${(mp.y - 0.5) * 30}px)` }}
      />
      <header className="qt-nav">
        <div className="qt-mark">a / g</div>
        <nav>
          <a href="#about-c">about</a>
          <a href="#work-c">work</a>
          <a href="#projects-c">projects</a>
          <a href="#chat-c">chat</a>
          <a href="#contact-c">contact</a>
        </nav>
        <ApiPill />
      </header>
      <div className="qt-hero-body">
        <div className="qt-hero-eyebrow">— a portfolio, by avyakt garg —</div>
        <h1 className="qt-h1">
          Slow software,<br />
          <em>built carefully.</em>
        </h1>
        <p className="qt-lede">
          MSCS at Wisconsin–Madison. Spent the last year shipping marketplace
          infrastructure at Uber. Currently writing CUDA kernels, RAG pipelines,
          and the occasional 35mm frame.
        </p>
        <div className="qt-hero-foot">
          <a href="#chat-c">↓ chat with my AI</a>
          <a href="#work-c">↓ see the work</a>
        </div>
      </div>
      <QTTideDivider color="#d9c8a8" />
    </section>
  );
}

function QTSection({ id, label, title, children, screenLabel, tide = true, flip = false, bg }) {
  const ref = useRefC(null);
  const [vis, setVis] = useStateC(false);
  useEffectC(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVis(true), { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section ref={ref} id={id} className={`qt-section ${vis ? "vis" : ""} ${flip ? "flip" : ""}`}
      style={bg ? { background: bg } : undefined} data-screen-label={screenLabel}>
      <div className="qt-section-inner">
        <div className="qt-section-meta">
          <div className="qt-section-label">{label}</div>
        </div>
        <h2 className="qt-section-title">{title}</h2>
        {children}
      </div>
      {tide && <QTTideDivider flip={flip} color={flip ? "#1f1812" : "#d9c8a8"} offset={Math.random()} />}
    </section>
  );
}

function QTAbout() {
  return (
    <QTSection id="about-c" label="i. about" title={<>A software engineer<br/><em>who reads carefully.</em></>} screenLabel="C · About">
      <div className="qt-about">
        <p>
          I'm a CS grad student. I write systems software — Go, Java, CUDA — and the occasional
          ML pipeline. Before Madison I was at Uber, where I built marketplace infra for AI
          annotation across five countries. Before that, two research stints (Saskatchewan,
          IIT Ropar) on biomedical data and IoT health sensors.
        </p>
        <p>
          I'm a team player. I leave the codebase cleaner than I found it. I shoot 35mm
          on the weekends.
        </p>
      </div>
    </QTSection>
  );
}

function QTExp() {
  return (
    <QTSection id="work-c" label="ii. experience" title={<>Where the work<br/><em>actually happened.</em></>} screenLabel="C · Work" bg="#ebe0cc">
      <div className="qt-exp">
        {DATA.experience.map((e, i) => (
          <div key={i} className="qt-exp-row">
            <div className="qt-exp-when">{e.period}</div>
            <div>
              <h3>{e.org}</h3>
              <div className="qt-exp-role">{e.role}</div>
              <ul>{e.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
            </div>
          </div>
        ))}
      </div>
    </QTSection>
  );
}

function QTProj() {
  return (
    <QTSection id="projects-c" label="iii. projects" title={<>Things I've shipped,<br/><em>or am shipping now.</em></>} screenLabel="C · Projects">
      <div className="qt-proj">
        {DATA.projects.map((p, i) => (
          <article key={i} className="qt-proj-card">
            <div className="qt-proj-num">0{i + 1}</div>
            <div>
              <div className="qt-proj-tag">{p.tag} — {p.stack}</div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          </article>
        ))}
      </div>
    </QTSection>
  );
}

function QTSkills() {
  return (
    <QTSection id="skills-c" label="iv. stack" title={<>The tools<br/><em>on my desk.</em></>} screenLabel="C · Skills" bg="#ebe0cc">
      <div className="qt-skills">
        {Object.entries(DATA.skills).map(([k, v]) => (
          <div key={k}>
            <h4>{k}</h4>
            <p>{v.join(" · ")}</p>
          </div>
        ))}
      </div>
    </QTSection>
  );
}

function QTEdu() {
  return (
    <QTSection id="edu-c" label="v. school" title={<>Two degrees<br/><em>and counting.</em></>} screenLabel="C · Education">
      <div className="qt-edu">
        {DATA.education.map((e, i) => (
          <div key={i}>
            <div className="qt-edu-when">{e.period}</div>
            <h3>{e.school}</h3>
            <div>{e.degree} — <em>{e.grade}</em></div>
          </div>
        ))}
        <div className="qt-ach-title">Honors</div>
        {DATA.achievements.map((a, i) => (
          <div key={i} className="qt-ach"><span>{a.year}</span> {a.text}</div>
        ))}
      </div>
    </QTSection>
  );
}

function QTChat() {
  const [msgs, setMsgs] = useStateC([
    { who: "ai", text: "Hi — I'm a chatbot trained on Avyakt's notes, projects, and resume. Ask anything." },
  ]);
  const [input, setInput] = useStateC("");
  const [thinking, setThinking] = useStateC(false);
  const send = () => {
    const t = input.trim(); if (!t) return;
    setMsgs(m => [...m, { who: "me", text: t }]);
    setInput(""); setThinking(true);
    setTimeout(() => {
      setMsgs(m => [...m, { who: "ai", text: pickReply(t) }]);
      setThinking(false);
    }, 750);
  };
  return (
    <QTSection id="chat-c" label="vi. chat" title={<>Talk to me,<br/><em>via my AI twin.</em></>} screenLabel="C · Chat" bg="#1f1812" flip>
      <div className="qt-chat">
        <div className="qt-chat-log">
          {msgs.map((m, i) => <div key={i} className={`qt-chat-msg ${m.who}`}>{m.text}</div>)}
          {thinking && <div className="qt-chat-msg ai thinking"><span/><span/><span/></div>}
        </div>
        <div className="qt-chat-input">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="ask anything…" />
          <button onClick={send}>send</button>
        </div>
        <div className="qt-chat-meta">
          three repos · go · pgvector · sse streaming · gemini + groq
        </div>
      </div>
    </QTSection>
  );
}

function QTApi() {
  const s = useApiStatus();
  return (
    <QTSection id="api-c" label="vii. api" title={<>Live status,<br/><em>from the source.</em></>} screenLabel="C · API">
      <div className="qt-api">
        <div className="qt-api-head">
          <div>
            <span className={`qt-dot ${s.live ? "live" : "down"}`} />
            <code>api.avyakt.dev/v1</code>
          </div>
          <div className={`qt-state ${s.live ? "live" : "down"}`}>{s.live ? "operational" : "degraded"}</div>
        </div>
        <svg viewBox="0 0 600 100" preserveAspectRatio="none" className="qt-api-graph">
          <polyline
            points={s.history.map((v, i) => `${(i / (s.history.length - 1)) * 600},${100 - (v / 130) * 90}`).join(" ")}
            fill="none" stroke="#7a2c10" strokeWidth="1.4"
          />
          {s.history.map((v, i) => (
            <circle key={i} cx={(i / (s.history.length - 1)) * 600} cy={100 - (v / 130) * 90} r="1.5" fill="#7a2c10" />
          ))}
        </svg>
        <div className="qt-api-stats">
          <div><label>latency</label><b>{s.latency}<span>ms</span></b></div>
          <div><label>uptime</label><b>{s.uptime.toFixed(2)}<span>%</span></b></div>
          <div><label>checks</label><b>1<span>/sec</span></b></div>
          <div><label>region</label><b>us-east-1</b></div>
        </div>
      </div>
    </QTSection>
  );
}

function QTContact() {
  return (
    <QTSection id="contact-c" label="viii. fin" title={<>Say hello.<br/><em>I'll write back.</em></>} screenLabel="C · Contact" tide={false}>
      <div className="qt-contact">
        <a href="mailto:garg62@wisc.edu" className="qt-mail">garg62@wisc.edu</a>
        <div className="qt-contact-grid">
          <div><label>phone</label>(608) 259-0543</div>
          <div><label>linkedin</label>avyakt-garg</div>
          <div><label>github</label>github.com/avyakt</div>
          <div><label>cv</label><a href="#" download>↓ pdf, single page</a></div>
        </div>
      </div>
      <footer className="qt-foot">
        <span>© 2026 Avyakt Garg</span>
        <span>set in instrument serif &amp; ibm plex</span>
        <span>built in madison</span>
      </footer>
    </QTSection>
  );
}

function QuietTideSite() {
  return (
    <div className="qt-root" data-scroll-root>
      <QTHero />
      <QTAbout />
      <QTExp />
      <QTProj />
      <QTSkills />
      <QTEdu />
      <QTChat />
      <QTApi />
      <QTContact />
    </div>
  );
}

window.QuietTideSite = QuietTideSite;
