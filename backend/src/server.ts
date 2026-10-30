import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { createBackendFromEnv } from './index';

const port = Number(process.env.PORT ?? 8787);
/** Listen on all interfaces so a physical phone can hit the LAN IP. */
const host = process.env.HOST ?? '0.0.0.0';
const handle = createBackendFromEnv();

const server = createServer((req, res) => {
  void handleNode(req, res, handle);
});

server.listen(port, host, () => {
  console.log(`@dermis/backend listening on http://${host}:${String(port)}`);
});

async function handleNode(
  req: IncomingMessage,
  res: ServerResponse,
  handleRequest: (request: Request) => Promise<Response>,
): Promise<void> {
  try {
    const request = await toFetchRequest(req);
    const response = await handleRequest(request);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (error) {
    const tooLarge = error instanceof BodyTooLargeError;
    res.statusCode = tooLarge ? 413 : 500;
    res.setHeader('content-type', 'application/json');
    if (tooLarge) {
      res.setHeader('connection', 'close');
    }
    res.end(JSON.stringify({ error: tooLarge ? 'payload_too_large' : 'internal_error' }));
    if (tooLarge) {
      req.destroy();
    }
  }
}

async function toFetchRequest(req: IncomingMessage): Promise<Request> {
  const host = req.headers.host ?? '127.0.0.1';
  const url = new URL(req.url ?? '/', `http://${host}`);
  const method = req.method ?? 'GET';
  const headers = headersFromNode(req);
  if (method === 'GET' || method === 'HEAD') {
    return new Request(url, { method, headers });
  }
  const body = await readBody(req);
  return new Request(url, { method, headers, body: new Uint8Array(body) });
}

function headersFromNode(req: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
    }
  }
  return headers;
}

/**
 * Largest accepted request body: an 8 MB scan image as base64 (~10.7 MB) plus
 * JSON overhead. Checked while streaming so an oversized upload is rejected
 * before it is buffered (any route, including unauthenticated ones).
 */
const MAX_BODY_BYTES = 12 * 1024 * 1024;

class BodyTooLargeError extends Error {}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const declared = Number(req.headers['content-length'] ?? 0);
  if (declared > MAX_BODY_BYTES) {
    throw new BodyTooLargeError();
  }
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.byteLength;
    if (total > MAX_BODY_BYTES) {
      throw new BodyTooLargeError();
    }
    chunks.push(buf);
  }
  return Buffer.concat(chunks);
}
