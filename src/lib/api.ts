import type { ChatMessage } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

if (!API_URL && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn('[api] NEXT_PUBLIC_API_URL is not set — chat + health calls will hit this origin and 404.');
}

export function pingHealth(): void {
  if (!API_URL) return;
  fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) }).catch(() => {});
}

export interface ChatChunk {
  token?: string;
  done?: boolean;
  id?: string;
  rateLimited?: boolean;
  error?: string;
}

/**
 * Streams a chat response from the Go RAG service.
 *
 * SSE contract (rag-chatbot/internal/api/models.go), each frame `data: <json>\n\n`:
 *   {"token": "..."}                              streamed token
 *   {"done": true, "id": "<uuid>"}                stream complete (id for /rating)
 *   {"error": "..."}                              infrastructure failure
 *   {"error": "rate_limited", "rate_limited": true}   embedder 429 — retry shortly
 */
export async function* streamChat(
  message: string,
  history: ChatMessage[]
): AsyncGenerator<ChatChunk> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
  } catch {
    yield { error: 'network' };
    return;
  }

  if (res.status === 429) {
    yield { rateLimited: true };
    return;
  }
  if (!res.ok || !res.body) {
    yield { error: `http_${res.status}` };
    return;
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });

    const lines = buf.split('\n');
    buf = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(line.indexOf(':') + 1).trim();
      if (!payload) continue;

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(payload);
      } catch {
        continue;
      }

      if (parsed.rate_limited === true || parsed.error === 'rate_limited') {
        yield { rateLimited: true };
        return;
      }
      if (typeof parsed.error === 'string') {
        yield { error: parsed.error };
        return;
      }
      if (typeof parsed.token === 'string') {
        yield { token: parsed.token };
      }
      if (parsed.done === true) {
        yield { done: true, id: typeof parsed.id === 'string' ? parsed.id : undefined };
        return;
      }
    }
  }

  yield { done: true };
}
