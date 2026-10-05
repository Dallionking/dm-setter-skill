// The setter's brain: read the thread from Zernio, ask Claude for the next
// message using setter.md as the personality, send it back through Zernio.
import fs from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

const ZERNIO = 'https://zernio.com/api/v1';
const SETTER = fs.readFileSync(path.join(process.cwd(), 'setter.md'), 'utf8');

// House rules the personality file can't override.
const RULES = `

---
HOW TO ANSWER (always applies):
- You are replying inside an Instagram DM. Write plain text only: no markdown, no bullet lists, no headings.
- Keep it short, like a real person texting. If you want to send two separate bubbles, put a blank line between them. Never more than 3 bubbles.
- Only say things this file supports. If you don't know an answer, say you'll check and get back to them, then answer HANDOFF next time it comes up.
- If someone sincerely asks whether they're talking to a bot or AI, be honest.
- If the conversation needs the real person (see the handoff section above), or someone is upset, in crisis, or asking something risky, reply with exactly: HANDOFF
- Never promise to email, call, or send something unless this file says that actually happens.`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const claude = new Anthropic();

async function zernio(route, init = {}) {
  const res = await fetch(ZERNIO + route, {
    ...init,
    headers: {
      authorization: `Bearer ${process.env.ZERNIO_API_KEY}`,
      'content-type': 'application/json',
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`Zernio ${res.status} on ${route}: ${await res.text()}`);
  return res.json();
}

// Test mode: while ONLY_USERNAME is set, the bot only talks to that one account.
function allowed(username) {
  const only = process.env.ONLY_USERNAME?.replace('@', '').toLowerCase();
  return !only || username?.toLowerCase() === only;
}

export async function handleMessage(event) {
  const msg = event.message;
  const accountId = event.account?.accountId;
  const conversationId = event.conversation?.id ?? msg.conversationId;
  if (msg.direction !== 'incoming' || !allowed(event.conversation?.participantUsername)) return;

  // People often send 3 texts in a row. Wait, then only answer if this is still
  // the newest message and nobody (including you) has replied since.
  await sleep(Number(process.env.REPLY_DELAY_SECONDS ?? 15) * 1000);
  const { messages } = await zernio(
    `/inbox/conversations/${conversationId}/messages?accountId=${accountId}&sortOrder=desc&limit=30`,
  );
  const latest = messages[0];
  if (!latest || latest.direction !== 'incoming' || latest.id !== msg.platformMessageId) return;

  const history = messages
    .slice()
    .reverse()
    .map((m) => ({
      role: m.direction === 'incoming' ? 'user' : 'assistant',
      content: m.message?.trim() || `[sent a ${m.attachments?.[0]?.type ?? 'message'} with no text]`,
    }));
  while (history[0]?.role === 'assistant') history.shift();

  const reply = await think(history);
  if (!reply || reply.includes('HANDOFF')) return;

  const bubbles = reply.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean).slice(0, 3);
  for (const [i, text] of bubbles.entries()) {
    if (i) await sleep(1500);
    await zernio(`/inbox/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'idempotency-key': `${event.id}-${i}` },
      body: JSON.stringify({ accountId, message: text }),
    });
  }
}

// Comment a keyword on a post → get a DM. Instagram allows one private reply per
// comment, within 7 days, and plain text only for people who don't follow you.
export async function handleComment(event) {
  const c = event.comment;
  const keyword = process.env.COMMENT_KEYWORD?.trim().toLowerCase();
  if (!keyword || c.platform !== 'instagram' || c.author?.isOwnAccount || !allowed(c.author?.username)) return;
  if (!new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(c.text)) return;

  await zernio(`/inbox/comments/${c.platformPostId}/${c.id}/private-reply`, {
    method: 'POST',
    headers: { 'idempotency-key': event.id },
    body: JSON.stringify({
      accountId: event.account.accountId,
      message: process.env.COMMENT_OPENER || 'hey! saw your comment, sending it over now. quick question first: what made you comment?',
    }),
  });
}

async function think(history) {
  const res = await claude.beta.messages.create({
    model: process.env.MODEL || 'claude-opus-5-5',
    max_tokens: 1000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low' },
    system: [{ type: 'text', text: SETTER + RULES, cache_control: { type: 'ephemeral' } }],
    messages: history,
  });
  if (res.stop_reason === 'refusal') return 'HANDOFF';
  return res.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
}
