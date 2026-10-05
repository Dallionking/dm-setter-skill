# DM Setter

An AI that answers your Instagram DMs in your voice and moves good leads to
your next step (a call, a link, a sale), plus a Claude skill that builds it
with you.

You don't need to code. Claude interviews you, writes your setter's
personality, practices real DMs with you until it sounds like you, then walks
you through connecting it to Instagram one click at a time.

## Start here

1. Download **`dm-setter-skill.zip`** from the [latest release](../../releases/latest).
2. Add it to Claude:
   - **Claude app or claude.ai:** Settings → Capabilities → Skills → Upload skill → pick the zip.
   - **Claude Code:** unzip it into `~/.claude/skills/`.
3. Start a new chat and say: **"Help me build my DM setter."**

Plan on about an hour. You'll need an Instagram professional account and a
little money for two services: Zernio (connects Instagram) and Anthropic API
credit (writes the replies). GitHub and Vercel are free.

## How it works

```
Instagram DM → Zernio → your bot on Vercel → Claude writes the reply (using setter.md) → Zernio → Instagram
```

- `setter.md`: your setter's personality. The only file you ever edit.
- `api/zernio.js`: receives new DMs and comments from Zernio.
- `lib/setter.js`: reads the conversation, asks Claude for the reply, sends it.
- `skill/dm-setter/`: the Claude skill that guides you through everything.

Built-in safety:

- **Test mode:** `ONLY_USERNAME` means it only answers one account.
- **Kill switch:** `PAUSED=1` stops it instantly.
- **Hand-off:** when a conversation needs you, it stays silent.
- **Honest:** it never claims to be human if someone sincerely asks.

Settings are listed in `.env.example`.

## License

MIT
