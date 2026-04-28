import type { ChatMessage } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export function pingHealth(): void {
  fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) }).catch(() => {});
}

export async function* streamChat(
  message: string,
  history: ChatMessage[]
): AsyncGenerator<{ token?: string; rateLimited?: boolean; done?: boolean }> {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok || !res.body) {
    yield { token: 'Sorry, something went wrong. Please try again.' };
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
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') { yield { done: true }; return; }
      try {
        const parsed = JSON.parse(payload);
        if (parsed.rate_limited) { yield { rateLimited: true }; return; }
        if (parsed.content) yield { token: parsed.content };
      } catch {
        if (payload) yield { token: payload };
      }
    }
  }

  yield { done: true };
}
