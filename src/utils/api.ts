export const API_BASE = 'http://localhost:4321';
export const API_KEY = 'none';

type StreamParams = {
  messages: { role: string; content: string }[];
  signal?: AbortSignal | null;
  onToken: (token: string) => void;
  model?: string;
};

function getConfig() {
  try {
    const base = window.localStorage.getItem('apiBase') || API_BASE;
    const key = window.localStorage.getItem('apiKey') || API_KEY;
    const model = window.localStorage.getItem('apiModel') || 'gpt-4o-mini';
    return { base, key, model };
  } catch (e) {
    return { base: API_BASE, key: API_KEY, model: 'gpt-4o-mini' };
  }
}

export async function streamChatCompletion({ messages, signal, onToken, model }: StreamParams) {
  const cfg = getConfig();
  const res = await fetch(`${cfg.base}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.key}`
    },
    body: JSON.stringify({
      model: model || cfg.model,
      messages,
      stream: true
    }),
    signal: signal || undefined
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  if (!res.body) return;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Split by newline and keep remainder in buffer
    const parts = buffer.split(/\r?\n/);
    buffer = parts.pop() || '';

    for (const part of parts) {
      if (!part) continue;
      // OpenAI streaming lines start with `data: `
      const line = part.startsWith('data:') ? part.replace(/^data:\s*/, '') : part;
      if (line === '[DONE]') return;

      // Try parse JSON; OpenAI-style chunk looks like { "choices": [{ "delta": { "content": "..." } }] }
      try {
        const parsed = JSON.parse(line);
        const delta = parsed?.choices?.[0]?.delta?.content ?? parsed?.choices?.[0]?.text ?? null;
        if (delta) onToken(delta);
      } catch (e) {
        // If not JSON, forward raw line
        onToken(line);
      }
    }
  }
}

// Non-streaming completion (returns assistant text)
export async function createChatCompletion(messages: { role: string; content: string }[], model?: string) {
  const cfg = getConfig();
  const res = await fetch(`${cfg.base}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.key}`
    },
    body: JSON.stringify({ model: model || cfg.model, messages, stream: false })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? '';
  return content;
}

export function saveApiConfig({ base, key, model }: { base: string; key: string; model?: string }) {
  try {
    window.localStorage.setItem('apiBase', base);
    window.localStorage.setItem('apiKey', key);
    if (model) window.localStorage.setItem('apiModel', model);
  } catch (e) {
    console.error('Failed to save API config', e);
  }
}
