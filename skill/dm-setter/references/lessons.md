# Lessons from running a real DM setter

Use these to give the owner honest recommendations in Step 6.

## Funnel
- **Promise only what actually happens.** The worst failure we saw: the bot
  told people "I'll email it to you", no email was ever sent, and dozens of
  people sat waiting. If something gets delivered, the DM itself delivers it
  (a link) right away.
- **Get what you need before you give the reward.** If the setter collects an
  email or answers before sending a link, ask first, then send. Once the link
  is sent, there's no reason left to answer.
- **One goal per conversation.** A setter that offers three things converts
  worse than one with a single clear next step.
- **Ask, don't pitch.** Two or three short questions before the link beat a
  paragraph about the offer.
- **Speed matters, but not instantly.** Replies within a minute feel human.
  Instant replies to a three-message burst feel robotic, so the bot waits.

## Instagram rules that bite
- **Comment → DM:** Instagram allows **one** private reply per comment, within
  7 days. People who don't follow you can only get plain text from it. Buttons
  or images to non-followers fail **and** use up that one reply.
- **Message Requests:** DMs to non-followers land in Requests, where
  quick-reply chips don't show. Write openers that work as plain text.
- **24-hour window:** the bot can only reply within 24 hours of the person's
  last message. It doesn't do cold follow-ups, and it shouldn't try.
- **Ask for a follow** before sending a link, if they want followers. A
  follower's DMs land in the main inbox, and links preview better.

## Running it
- Test mode (`ONLY_USERNAME`) before every big change.
- If Zernio's webhook fails 10 times in a row, Zernio switches it off and
  stops sending events until it's turned back on. Check the webhook after any
  outage.
- Zernio errors 402/403 mean billing or plan, not broken code.
- Messages from before Zernio was connected don't trigger the bot. Only new ones do.
- The owner can jump in, but the bot doesn't step back for good. If they reply
  before the bot does, the bot stays quiet for that message. When the person
  answers again, the bot replies again. To take over a thread fully, use test
  mode or the kill switch while they handle it.
