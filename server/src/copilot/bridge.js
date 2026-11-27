import { copilotHandler } from './runtime.js';

// Headers that Node sets itself, and would break if copied
const SKIP_HEADERS = new Set(['host', 'content-length', 'connection']);

export async function copilotBridge(req, res) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!SKIP_HEADERS.has(key) && value) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
  }

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const request = new Request(`http://localhost${req.originalUrl}`, {
    method: req.method,
    headers,
    body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
  });

  const response = await copilotHandler(request);

  res.status(response.status);
  response.headers.forEach((value, key) => res.setHeader(key, value));

  if (!response.body) return res.end();

  // Stream the response chunk by chunk, so the reply appears word by word
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}