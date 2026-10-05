# Connecting the setter to Instagram

Walk through one step at a time. Wait for "done" (or a screenshot) before the
next. Website buttons move around; if what they see doesn't match, ask for a
screenshot and adapt.

Bot code: https://github.com/Dallionking/dm-setter-skill

## A. Accounts

1. **Instagram professional account.** In Instagram: Settings → Account type and
   tools → Switch to professional account (Creator or Business). Then
   Settings → Messages and story replies → Message controls → Connected tools →
   turn on **Allow access to messages**. Without that, no bot can read DMs.
2. **Zernio.** Sign up at zernio.com. Pick a plan that includes the **Inbox**
   (DMs). The cheapest plans may not include it, and the bot can't work
   without it. Create a profile, then connect Instagram (log in with
   Instagram and approve everything it asks for, especially messages).
3. **Zernio API key.** In the Zernio dashboard, find API keys and create one.
   Keep the tab open; it goes into Vercel in part B. Don't paste it in chat.
4. **Anthropic API key.** Go to console.anthropic.com, sign up, add a little
   credit under Billing (start with $10 to $20), then create an API key under
   API keys. Keep that tab open too.
5. **GitHub and Vercel.** Make a free GitHub account, then sign up at
   vercel.com using "Continue with GitHub".

## B. Put the bot online

1. Open this link (it copies the bot into their own GitHub and sets it up on
   Vercel):
   https://vercel.com/new/clone?repository-url=https://github.com/Dallionking/dm-setter-skill&repository-name=my-dm-setter&env=ZERNIO_API_KEY,ZERNIO_WEBHOOK_SECRET,ANTHROPIC_API_KEY,ONLY_USERNAME
2. It asks for four values:
   - `ZERNIO_API_KEY`: from A3.
   - `ZERNIO_WEBHOOK_SECRET`: a password they make up. Long and random, like
     `maya-setter-8f3k2p9q7x`. Have them save it; Zernio needs the same one.
   - `ANTHROPIC_API_KEY`: from A4.
   - `ONLY_USERNAME`: the Instagram username of their **test** account (a
     friend, or a second account). This is test mode: the bot ignores
     everyone else.
3. Click Deploy and wait for the confetti. Copy the site address it gives
   (like `https://my-dm-setter.vercel.app`).
4. Check it's alive: open `https://THEIR-ADDRESS/api/zernio` in a browser. It
   should say `"ok":true`.

## C. Give it the personality

1. On GitHub, open their new `my-dm-setter` repo → click `setter.md` → the
   pencil icon (Edit).
2. Select everything, delete, paste their full `setter.md` from Step 3.
3. Click **Commit changes**. Vercel redeploys by itself in about a minute.

Every future personality change is the same three steps.

## D. Connect Zernio to the bot

1. In the Zernio dashboard, go to Webhooks → add a webhook.
   - URL: `https://THEIR-ADDRESS/api/zernio`
   - Secret: the exact same `ZERNIO_WEBHOOK_SECRET` from B2
   - Events: `message.received` (and `comment.received` if they use a comment
     keyword)
2. Use Zernio's **Send test** button. It should succeed.
3. From the test account, DM their Instagram. Wait about 20 seconds (the bot
   waits 15 on purpose so people can finish typing). A reply should arrive.
4. Go through a few of the test conversations from `testing.md` for real.

**Comment trigger (optional):** in Vercel → their project → Settings →
Environment Variables, add `COMMENT_KEYWORD` (like `GUIDE`) and
`COMMENT_OPENER` (the first DM, written in their voice). Then Deployments →
⋯ on the latest → Redeploy. Any change to environment variables needs a
redeploy.

## E. Go live

When test mode looks right: Vercel → Settings → Environment Variables →
delete `ONLY_USERNAME` → Redeploy. Now it answers everyone who DMs.

**Kill switch:** add `PAUSED` = `1` and redeploy. Delete it and redeploy to
turn it back on.

## When it doesn't work

| What they see | Likely cause | Fix |
|---|---|---|
| No reply at all | Webhook not set, wrong URL, or bot in test mode for a different username | Check the URL ends in `/api/zernio`; check `ONLY_USERNAME` matches the test account exactly |
| Zernio "Send test" fails | Secret mismatch or deploy failed | Make the secret identical in both places; redeploy; open the address in a browser |
| Zernio says 402 / 403 / "feature not available" | Plan doesn't include the Inbox, or payment is due | Upgrade the Zernio plan; this is billing, not a bug |
| Replies stopped after working | Zernio turned the webhook off after repeated failures, or API credit ran out | Re-enable the webhook in Zernio; check Anthropic billing |
| It replies with the placeholder or nonsense | `setter.md` not pasted, or not committed | Redo part C |
| Can't see DMs at all | "Allow access to messages" is off in Instagram | Part A1 |
| Something else | | Vercel → project → Logs shows the exact error. Ask them to screenshot it |
