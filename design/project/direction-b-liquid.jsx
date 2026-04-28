// DIRECTION B — LIQUID METAL
// Canvas-based metaball/fluid simulation in the hero, blob morphing on scroll.
// Dreamy gradient-washed, kinetic.

const { useState: useStateB, useEffect: useEffectB, useRef: useRefB } = React;

// Canvas-based metaball renderer with rust/cream/ink palette
function MetaballCanvas() {
  const canvasRef = useRefB(null);
  useEffectB(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w, h;
    const blobs = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.18 + Math.random() * 0.14,
      vx: (Math.random() - 0.5) * 0.0012,
      vy: (Math.random() - 0.5) * 0.0012,
      hue: i % 3,
    }));
    const mouse = { x: 0.5, y: 0.5, active: false };
    let scrollP = 0;

    const resize = () => {
      w = Math.max(1, canvas.clientWidth);
      h = Math.max(1, canvas.clientHeight);
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    const onScroll = () => {
      const root = canvas.closest("[data-scroll-root]") || document.documentElement;
      const scrollTop = root.scrollTop || window.scrollY;
      scrollP = Math.min(1, scrollTop / 600);
    };
    const root = canvas.closest("[data-scroll-root]");
    (root || window).addEventListener("scroll", onScroll, { passive: true });

    // Off-screen buffer for threshold pass
    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d");

    const draw = () => {
      // Guard: if the canvas isn't mounted/measured yet, skip the frame.
      if (!w || !h || canvas.clientWidth === 0 || canvas.clientHeight === 0) {
        raf = requestAnimationFrame(draw);
        return;
      }
      // Re-sync if size changed (e.g. DesignCanvas zoom remeasures)
      if (canvas.clientWidth !== w || canvas.clientHeight !== h) resize();
      off.width = Math.max(1, w);
      off.height = Math.max(1, h);
      offCtx.clearRect(0, 0, w, h);
      // Cream background fade
      offCtx.fillStyle = "rgba(244, 236, 223, 0)";
      offCtx.fillRect(0, 0, w, h);

      blobs.forEach((b) => {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0.05 || b.x > 0.95) b.vx *= -1;
        if (b.y < 0.05 || b.y > 0.95) b.vy *= -1;
        if (mouse.active) {
          const dx = mouse.x - b.x, dy = mouse.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 0.3) {
            b.vx += dx * 0.00008;
            b.vy += dy * 0.00008;
          }
        }
        b.vx *= 0.995; b.vy *= 0.995;
        const cx = b.x * w;
        const cy = b.y * h - scrollP * 200;
        const baseR = b.r * Math.min(w, h) * (1 - scrollP * 0.3);
        const colors = [
          ["#d76a3a", "#7a2c10"],   // rust
          ["#e8b88a", "#a86a3a"],   // peach
          ["#3a2e25", "#1f1812"],   // ink
        ];
        const [c1, c2] = colors[b.hue];
        const grad = offCtx.createRadialGradient(cx, cy, 0, cx, cy, baseR);
        grad.addColorStop(0, c1);
        grad.addColorStop(0.7, c2);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        offCtx.globalCompositeOperation = "lighter";
        offCtx.fillStyle = grad;
        offCtx.beginPath();
        offCtx.arc(cx, cy, baseR, 0, Math.PI * 2);
        offCtx.fill();
      });

      // Final compose with cream wash
      ctx.fillStyle = "#f4ecdf";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "multiply";
      ctx.filter = "blur(28px) contrast(1.4) saturate(1.1)";
      if (off.width > 0 && off.height > 0) {
        ctx.drawImage(off, 0, 0, w, h);
      }
      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";

      // Grain overlay
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = "#1f1812";
      for (let i = 0; i < 200; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      (root || window).removeEventListener("scroll", onScroll);
    };
  }, []);
  return <canvas ref={canvasRef} className="lm-canvas" />;
}

function LMHero() {
  return (
    <section className="lm-hero" data-screen-label="B · Hero">
      <MetaballCanvas />
      <header className="lm-nav">
        <div className="lm-mark">A.G</div>
        <nav>
          <a href="#about-b">About</a>
          <a href="#work-b">Work</a>
          <a href="#projects-b">Projects</a>
          <a href="#chat-b">Chat</a>
        </nav>
        <ApiPill />
      </header>
      <div className="lm-hero-content">
        <div className="lm-eyebrow">CURRENTLY · MSCS @ UW–MADISON · '25–'27</div>
        <h1 className="lm-h1">
          <span>Avyakt</span>
          <span className="lm-italic">Garg</span>
        </h1>
        <div className="lm-tagline">
          <span>Builder of</span>
          <span className="lm-rotator">
            <span>AI infra.</span>
            <span>RAG pipelines.</span>
            <span>CUDA kernels.</span>
            <span>quiet things.</span>
          </span>
        </div>
        <div className="lm-actions">
          <a className="lm-btn primary" href="#chat-b">Chat with my AI →</a>
          <a className="lm-btn ghost" href="#work-b">See work</a>
        </div>
      </div>
    </section>
  );
}

function LMSection({ id, num, title, sub, children, screenLabel }) {
  const ref = useRefB(null);
  const [vis, setVis] = useStateB(false);
  useEffectB(() => {
    const obs = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section ref={ref} id={id} className={`lm-section ${vis ? "vis" : ""}`} data-screen-label={screenLabel}>
      <div className="lm-section-header">
        <div className="lm-section-num">{num}</div>
        <div>
          <h2 className="lm-section-title">{title}</h2>
          {sub && <p className="lm-section-sub">{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function LMAbout() {
  return (
    <LMSection id="about-b" num="01" title="About" sub="The short version." screenLabel="B · About">
      <div className="lm-about">
        <p>
          I'm an MSCS at UW–Madison. Before this I shipped marketplace infrastructure at Uber,
          rebuilt a biomedical lab's data backbone in Saskatchewan, and trained ML models
          on IoT health sensors at IIT Ropar. I write Go, Java, Python, and CUDA — usually
          in that order.
        </p>
        <p>
          I'm a team player with golden-retriever energy. I read papers, shoot 35mm,
          and over-engineer my home lab.
        </p>
      </div>
    </LMSection>
  );
}

function LMExperience() {
  return (
    <LMSection id="work-b" num="02" title="Experience" sub="Where the work happened." screenLabel="B · Work">
      <div className="lm-exp">
        {DATA.experience.map((e, i) => (
          <div key={i} className="lm-exp-row">
            <div className="lm-exp-when">{e.period}</div>
            <div className="lm-exp-what">
              <h3>{e.role} <em>at {e.org}</em></h3>
              <ul>
                {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </LMSection>
  );
}

function LMProjects() {
  const [active, setActive] = useStateB(0);
  return (
    <LMSection id="projects-b" num="03" title="Projects" sub="Hover to dive in." screenLabel="B · Projects">
      <div className="lm-proj-layout">
        <ol className="lm-proj-list">
          {DATA.projects.map((p, i) => (
            <li
              key={i}
              className={i === active ? "active" : ""}
              onMouseEnter={() => setActive(i)}
            >
              <span className="lm-proj-num">0{i + 1}</span>
              <span className="lm-proj-name">{p.title}</span>
              <span className="lm-proj-stack">{p.stack}</span>
            </li>
          ))}
        </ol>
        <div className="lm-proj-detail">
          <div className="lm-proj-blob" />
          <div className="lm-proj-content" key={active}>
            <div className="lm-proj-tag">{DATA.projects[active].tag}</div>
            <h3>{DATA.projects[active].title}</h3>
            <div className="lm-proj-stack-line">{DATA.projects[active].stack}</div>
            <p>{DATA.projects[active].body}</p>
          </div>
        </div>
      </div>
    </LMSection>
  );
}

function LMSkills() {
  return (
    <LMSection id="skills-b" num="04" title="Stack" sub="What I reach for." screenLabel="B · Skills">
      <div className="lm-skills">
        {Object.entries(DATA.skills).map(([k, v]) => (
          <div key={k} className="lm-skill-block">
            <h4>{k}</h4>
            <div>{v.map(t => <span key={t}>{t}</span>)}</div>
          </div>
        ))}
      </div>
    </LMSection>
  );
}

function LMEducation() {
  return (
    <LMSection id="edu-b" num="05" title="Education" screenLabel="B · Education">
      <div className="lm-edu">
        {DATA.education.map((e, i) => (
          <div key={i}>
            <div className="lm-edu-when">{e.period}</div>
            <h3>{e.school}</h3>
            <div>{e.degree} · <em>{e.grade}</em></div>
          </div>
        ))}
      </div>
    </LMSection>
  );
}

function LMAchievements() {
  return (
    <LMSection id="ach-b" num="06" title="Honors" screenLabel="B · Achievements">
      <div className="lm-ach">
        {DATA.achievements.map((a, i) => (
          <div key={i}><span>{a.year}</span>{a.text}</div>
        ))}
      </div>
    </LMSection>
  );
}

function LMChat() {
  const [msgs, setMsgs] = useStateB([
    { who: "ai", text: "I'm Avyakt's AI twin. Ask anything." },
  ]);
  const [input, setInput] = useStateB("");
  const [thinking, setThinking] = useStateB(false);
  const send = () => {
    const t = input.trim(); if (!t) return;
    setMsgs(m => [...m, { who: "me", text: t }]);
    setInput(""); setThinking(true);
    setTimeout(() => {
      setMsgs(m => [...m, { who: "ai", text: pickReply(t) }]);
      setThinking(false);
    }, 800);
  };
  return (
    <LMSection id="chat-b" num="07" title="Talk to me" sub="Mocked here. Real on /chat." screenLabel="B · Chat">
      <div className="lm-chat">
        <div className="lm-chat-blob" />
        <div className="lm-chat-log">
          {msgs.map((m, i) => (
            <div key={i} className={`lm-chat-msg ${m.who}`}>{m.text}</div>
          ))}
          {thinking && <div className="lm-chat-msg ai thinking"><span/><span/><span/></div>}
        </div>
        <div className="lm-chat-input">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="ask anything…" />
          <button onClick={send}>↑</button>
        </div>
      </div>
    </LMSection>
  );
}

function LMApi() {
  const s = useApiStatus();
  return (
    <LMSection id="api-b" num="08" title="API status" sub="Live. Polled every second." screenLabel="B · API">
      <div className="lm-api">
        <div className="lm-api-row">
          <div className="lm-api-name">
            <span className={`lm-api-pulse ${s.live ? "live" : "down"}`} />
            api.avyakt.dev/v1
          </div>
          <div className="lm-api-state">{s.live ? "OPERATIONAL" : "DEGRADED"}</div>
        </div>
        <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="lm-api-graph">
          <defs>
            <linearGradient id="lm-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d76a3a" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#d76a3a" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,100 ${s.history.map((v, i) => `${(i / (s.history.length - 1)) * 400},${100 - (v / 130) * 90}`).join(" ")} 400,100`}
            fill="url(#lm-grad)"
          />
          <polyline
            points={s.history.map((v, i) => `${(i / (s.history.length - 1)) * 400},${100 - (v / 130) * 90}`).join(" ")}
            fill="none" stroke="#d76a3a" strokeWidth="1.6"
          />
        </svg>
        <div className="lm-api-stats">
          <div><label>LATENCY</label><b>{s.latency}<span>ms</span></b></div>
          <div><label>UPTIME</label><b>{s.uptime.toFixed(2)}<span>%</span></b></div>
          <div><label>RPM</label><b>{Math.round(s.history[s.history.length - 1] * 12)}</b></div>
        </div>
      </div>
    </LMSection>
  );
}

function LMContact() {
  return (
    <LMSection id="contact-b" num="09" title="Get in touch" screenLabel="B · Contact">
      <div className="lm-contact">
        <a href="mailto:garg62@wisc.edu">garg62@wisc.edu</a>
        <div className="lm-contact-meta">
          <span>(608) 259-0543</span>
          <span>linkedin / avyakt-garg</span>
          <span>github.com/avyakt</span>
          <a href="#" download>↓ CV</a>
        </div>
      </div>
      <footer className="lm-foot">© 2026 — set in Instrument Serif & IBM Plex.</footer>
    </LMSection>
  );
}

function LiquidMetalSite() {
  return (
    <div className="lm-root" data-scroll-root>
      <LMHero />
      <LMAbout />
      <LMExperience />
      <LMProjects />
      <LMSkills />
      <LMEducation />
      <LMAchievements />
      <LMChat />
      <LMApi />
      <LMContact />
    </div>
  );
}

window.LiquidMetalSite = LiquidMetalSite;
