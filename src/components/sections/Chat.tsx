'use client';
import { useEffect, useRef, useState } from 'react';
import { Section } from '@/components/ui/Section';
import { useApiStatus } from '@/lib/useApiStatus';
import { streamChat } from '@/lib/api';
import type { ChatMessage, Project } from '@/lib/types';
import styles from './Chat.module.css';

const SUGGESTIONS = ['Tell me about Uber', "What's IVF-PQ?", 'ML or SWE?', 'Best project?'];

// Shown in the sidebar when the RAG chatbot project row can't be loaded.
const FALLBACK_STACK = ['Go', 'SSE', 'pgvector', 'Gemini', 'Groq', 'Neon'];

// The backend prompt asks the model for plain prose, but models occasionally slip
// in a stray **bold** or a leading "- ". Strip the common markers so the bubble
// never shows raw markdown. (Full markdown rendering is deliberately out of scope
// — a chat reply is meant to be one or two plain sentences.)
function cleanText(raw: string): string {
  return raw
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ');
}

interface Message {
  who: 'ai' | 'me';
  text: string;
  streaming?: boolean;
  interactionId?: string; // from the SSE `done` event — for a future 👍/👎 on /rating
}

export function Chat({ project }: { project?: Project | null }) {
  const s = useApiStatus();
  const stack = project?.tech_stack?.length ? project.tech_stack : FALLBACK_STACK;
  const metaLine = stack.slice(0, 4).map((t) => t.toLowerCase()).join(' · ');
  const [msgs, setMsgs] = useState<Message[]>([
    { who: 'ai', text: "Hi — I'm Avyakt's AI twin. Ask me about his work, projects, or how he thinks." },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [msgs]);

  async function send(text?: string) {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    setInput('');
    setBusy(true);
    setMsgs((m) => [...m, { who: 'me', text: t }]);

    // History = the real conversation so far, excluding the seed greeting (index 0).
    const history: ChatMessage[] = msgs.slice(1).map((m) => ({
      role: m.who === 'me' ? 'user' : 'assistant',
      content: m.text,
    }));

    setMsgs((m) => [...m, { who: 'ai', text: '', streaming: true }]);

    const replaceLast = (patch: Partial<Message>) =>
      setMsgs((m) => {
        const next = [...m];
        next[next.length - 1] = { ...next[next.length - 1], ...patch };
        return next;
      });

    try {
      for await (const chunk of streamChat(t, history)) {
        if (chunk.rateLimited) {
          replaceLast({ text: "I'm getting a lot of questions right now — give me a few seconds and try again.", streaming: false });
          break;
        }
        if (chunk.error) {
          replaceLast({ text: "My backend hit a snag answering that. Try again in a moment — or just email me.", streaming: false });
          break;
        }
        if (chunk.token) {
          setMsgs((m) => {
            const next = [...m];
            const last = next[next.length - 1];
            next[next.length - 1] = { ...last, text: last.text + chunk.token, streaming: true };
            return next;
          });
        }
        if (chunk.done) {
          replaceLast({ streaming: false, interactionId: chunk.id });
        }
      }
    } catch {
      replaceLast({ text: 'Something went wrong — please try again.', streaming: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section
      id="chat"
      label="vi. chat"
      title={<>Talk to me,<br /><em>via my AI twin.</em></>}
      dark
    >
      <div className={styles.disclaimer}>
        <span className={styles.beta}>BETA</span>
        This is a custom RAG chatbot trained on my work. It runs on a Go backend I built —
        live status on the right. It can be wrong; for anything important, just email me.
      </div>

      <div className={styles.wrap}>
        <div className={styles.chat}>
          <div className={styles.chatHead}>
            <span className={`${styles.chatDot}${s.live ? ` ${styles.chatDotLive}` : ` ${styles.chatDotDown}`}`} />
            <span>chat.avyakt.dev</span>
            <span className={styles.chatMeta}>{metaLine}</span>
          </div>

          <div className={styles.log} ref={logRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.who === 'ai' ? styles.ai : styles.me}`}>
                {m.who === 'ai' ? cleanText(m.text) : m.text}
                {m.streaming && m.text === '' && (
                  <span className={styles.thinking}>
                    <span /><span /><span />
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className={styles.suggest}>
            {SUGGESTIONS.map((q) => (
              <button key={q} onClick={() => send(q)} disabled={busy}>{q}</button>
            ))}
          </div>

          <div className={styles.inputRow}>
            <input
              value={input}
              placeholder="ask anything…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={busy}
            />
            <button onClick={() => send()} disabled={busy || !input.trim()}>send</button>
          </div>
        </div>

        <aside className={styles.api}>
          <div className={styles.apiHead}>
            <span className={`${styles.apiDot}${s.live ? ` ${styles.live}` : ` ${styles.down}`}`} />
            <code>chatbot api</code>
            <span className={`${styles.apiState}${s.live ? ` ${styles.live}` : ` ${styles.down}`}`}>
              {s.live ? 'operational' : 'degraded'}
            </span>
          </div>

          <svg viewBox="0 0 600 100" preserveAspectRatio="none" className={styles.graph}>
            <defs>
              <linearGradient id="chat-graph-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97757" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#d97757" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points={`0,100 ${s.history.map((v, i) => `${(i / (s.history.length - 1)) * 600},${100 - (v / 400) * 90}`).join(' ')} 600,100`}
              fill="url(#chat-graph-fill)"
            />
            <polyline
              points={s.history.map((v, i) => `${(i / (s.history.length - 1)) * 600},${100 - (v / 400) * 90}`).join(' ')}
              fill="none" stroke="#d97757" strokeWidth="1.6"
            />
          </svg>

          <div className={styles.stats}>
            <div><label>latency</label><b>{s.latency}<span>ms</span></b></div>
            <div><label>uptime</label><b>{s.uptime.toFixed(2)}<span>%</span></b></div>
            <div><label>region</label><b>oregon</b></div>
            <div><label>provider</label><b>Render</b></div>
          </div>

          <ul className={styles.techList}>
            {stack.slice(0, 6).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </aside>
      </div>
    </Section>
  );
}
