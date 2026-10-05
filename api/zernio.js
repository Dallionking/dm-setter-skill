// Zernio webhook. Checks the signature, answers 200 right away (Zernio retries
// anything slower than 5s), and does the real work in the background.
import crypto from 'node:crypto';
import { waitUntil } from '@vercel/functions';
import { handleComment, handleMessage } from '../lib/setter.js';

export async function POST(request) {
  const secret = process.env.ZERNIO_WEBHOOK_SECRET;
  if (!secret) return new Response('ZERNIO_WEBHOOK_SECRET is not set', { status: 500 });

  const raw = await request.text();
  const signature = request.headers.get('x-zernio-signature') ?? '';
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return new Response('bad signature', { status: 401 });
  }

  const event = JSON.parse(raw);
  if (process.env.PAUSED !== '1') {
    if (event.event === 'message.received') waitUntil(handleMessage(event).catch(console.error));
    if (event.event === 'comment.received') waitUntil(handleComment(event).catch(console.error));
  }
  return Response.json({ ok: true });
}

export function GET() {
  return Response.json({ ok: true, service: 'dm-setter', paused: process.env.PAUSED === '1' });
}
