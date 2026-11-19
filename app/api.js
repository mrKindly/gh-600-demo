import { createServer as createHttpServer } from 'node:http';
import { text } from 'node:stream/consumers';
import { computeInvoice } from './billing/invoice.js';
import { getProductById, listProducts } from './products.js';

/** @typedef {{ status: number, body: unknown }} Reply */
/** @typedef {{ req: import('node:http').IncomingMessage, url: URL, params: string[] }} Context */

/** @returns {Reply} */
const reply = (status, body) => ({ status, body });
const notFound = () => reply(404, { error: 'not_found' });
const invalidRequest = (message) => reply(400, { error: 'invalid_request', message });

/** @param {string} raw @returns {{ error: string } | { lines: { productId: string, quantity: number }[] }} */
const parseInvoiceRequest = (raw) => {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return { error: 'Body must be valid JSON' };
  }
  const lines = payload?.lines;
  if (!Array.isArray(lines) || lines.length === 0) return { error: 'lines must be a non-empty array' };
  for (const line of lines) {
    if (!getProductById(line?.productId)) return { error: `Unknown productId: ${String(line?.productId)}` };
    if (!Number.isInteger(line.quantity) || line.quantity < 1) return { error: 'quantity must be an integer >= 1' };
  }
  return { lines: lines.map(({ productId, quantity }) => ({ productId, quantity })) };
};

const handleHealth = () => reply(200, { status: 'ok' });

const handleListProducts = () => {
  const items = listProducts();
  return reply(200, { items, count: items.length });
};

/** @param {Context} ctx */
const handleGetProduct = ({ params: [id] }) => {
  const product = getProductById(id);
  return product ? reply(200, product) : notFound();
};

/** @param {Context} ctx */
const handleCreateInvoice = async ({ req }) => {
  const parsed = parseInvoiceRequest(await text(req));
  if ('error' in parsed) return invalidRequest(parsed.error);
  return reply(200, computeInvoice(parsed.lines, listProducts()));
};

/** @type {{ pattern: RegExp, methods: Record<string, (ctx: Context) => Reply | Promise<Reply>> }[]} */
const routes = [
  { pattern: /^\/health$/, methods: { GET: handleHealth } },
  { pattern: /^\/products$/, methods: { GET: handleListProducts } },
  { pattern: /^\/products\/([^/]+)$/, methods: { GET: handleGetProduct } },
  { pattern: /^\/invoices$/, methods: { POST: handleCreateInvoice } },
];

/** @param {import('node:http').IncomingMessage} req @returns {Promise<Reply>} */
const handleRequest = async (req) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  for (const { pattern, methods } of routes) {
    const match = pattern.exec(url.pathname);
    if (!match) continue;
    const handler = methods[req.method ?? ''];
    if (!handler) return reply(405, { error: 'method_not_allowed' });
    return handler({ req, url, params: match.slice(1) });
  }
  return notFound();
};

/** Creates the HTTP server without binding a port. */
export const createServer = () => createHttpServer(async (req, res) => {
  const { status, body } = await handleRequest(req).catch((error) => {
    console.error(error);
    return reply(500, { error: 'internal' });
  });
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
});
