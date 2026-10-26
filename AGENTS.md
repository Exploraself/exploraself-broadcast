# ExploraSelf Broadcast — rules for anyone working in this repo

This applies to every contributor, human or AI. If you are an agent reading
this because you were pointed at this repository: read all of it before you
change a file, and run `npm test` before you finish. The tests enforce most of
what follows, so a violation fails the build rather than quietly shipping.

Broadcast is part of ExploraSelf. It is not a generic news reader, and the
things that make it ExploraSelf's are the things most likely to get optimised
away by someone who does not know why they are there. That is what this file
is for.

---

## The one-line brief

**Inform. Reform. Transform.**

The world supplies the moment. We supply the tool. The reader keeps the move.
News that stops at "what happened" is somebody else's product.

---

## 1. The editorial algorithm

- The daily edition is **exactly two stories per domain**, four domains, eight
  stories. `PER_DOMAIN` is 2. Do not "improve" this by showing more.
- A story's **domain comes from its topic**, never from the feed that carried
  it. A wellbeing story in a business feed belongs to Self. `TOPIC_DOMAIN` in
  `functions/api/news.js` is the map, and every topic must appear in it.
- Selection is **scored, not sliced**: recency, publisher authority, topic
  clarity, and whether we can speak precisely to the reader's trade. The
  rejection is what makes it feel edited. Keep the scoring.
- Scoring runs **in the browser**. See the free-tier budget below.

## 2. The free-tier budget (this is a hard constraint, not a preference)

Cloudflare Workers free plan:

| Limit | Value |
| --- | --- |
| CPU per request | **10 ms** |
| External subrequests per request | 50 |
| Requests per day | 100,000 |

Therefore:

- `/api/news` is **sharded** (`?s=1..3`), ~10 feeds each, each cached at the
  edge for three hours. **Do not merge the shards into one endpoint.** Parsing
  every feed in one invocation exceeds the CPU budget and the whole edition
  fails.
- **Never move scoring, sorting or selection into the Worker.** It belongs in
  `app.js` where CPU is free.
- Keep the per-feed caps (`MAX_ITEMS`, `MAX_XML`). They bound the work.
- Shard 4 (Google News topic searches) is a **safety net only**, requested by
  the browser when a domain came back empty. It is never the backbone.
- Before calling anything "free", verify it against the provider's own limits
  and say so in the PR.

## 3. Sources

- Add publishers by their **own official RSS or Atom feed**. No proxies, no
  mirrors, no scrapers, no third-party aggregator APIs standing in for a
  publisher.
- A source may list **alternate official URLs**; they are tried in order when
  the first refuses or moves.
- If a publisher deliberately blocks non-browser clients, **respect it**. Do
  not impersonate a browser to get around bot protection. Our user agent
  identifies us honestly and links to the site. Use the other publishers.
- The list is **over-provisioned on purpose** — around 30 feeds to fill 8
  slots — so that several publishers can go dark without the edition noticing.
  Do not "tidy up" by trimming it to the minimum.
- Every shard must contain feeds already proven live, so no shard can come back
  empty if a newer URL has moved.

## 4. Syndication, not republication

On a card we show a **headline, a short excerpt (220 characters, hard cap),
the publisher's name, and a link to the original**.

In the reader we additionally show **what the publisher itself placed in
`content:encoded`**, capped at `MAX_BODY`. A publisher that puts its text in
its own feed has chosen to syndicate it; many do, and it is why the reader can
read here instead of being bounced out. Every story still carries its link,
and the reader says plainly that the full piece continues at the source.

- **Never fetch or scrape the article page.** The feed is the only source.
- Never raise `MAX_BODY` to the point where we are republishing rather than
  excerpting, and never carry a body a publisher did not put in the feed.
- Everything from a feed is escaped before it reaches the page. Feeds
  routinely escape their own markup, so `decode()` resolves entities **before**
  stripping tags — otherwise a literal `<p>` survives into the page, which is
  a bug we have already shipped once.
- Never remove the link to the source.
- Never present an ExploraSelf prompt as something the publisher said. The
  reflection and the tool are ours and are labelled as ours.

## 5. News first. The commentary is earned, not imposed.

Broadcast is a news app before it is anything else. A reader scrolling the
edition should meet far more headlines than opinion.

**On the page**, a story carries the publisher's headline, excerpt, name and
time, plus **one line** of what it means for the reader's trade. That is all.
Underneath each domain sits a wire list of the remaining headlines, because a
list of stories is what makes this read as a news service.

**In the reader**, once someone has opened a story and asked to go further,
the fuller read appears a step at a time: what it means for you, then your
next move and the tool behind it.

Do not push the commentary back onto the page. An earlier version put a
headed "ExploraSelf read" block with a tool and a reflection on every card,
plus a question and a three-step exercise under every domain. It buried the
news and it was removed on Alexandru's instruction. If you are tempted to add
our voice to the scroll, add a headline instead.

## 6. The tools are Alexandru's — and they are context, not content

`tools` in `content.js` is taken word for word from **99 Built to Lead**, his
printed field guide. It exists so we understand **who we are speaking to** and
can pick the right news for them. It is not a content well to draw from on
every card.

- A tool appears **only in the reader**, only after the reader has chosen to go
  deeper, and only once per story.
- The card never shows a tool name, a tool number, or "Tool 004 of 100". A
  first-time reader has never heard of the guide, and jargon they cannot place
  reads as noise.
- **Do not invent tools.** Do not reword the questions. Do not generate new
  ones with a model.

`tools` in `content.js` is taken word for word from **99 Built to Lead**, his
printed field guide. Each entry is a real tool with its real number, its real
line and its real question.

- **Do not invent tools.** Do not reword the questions. Do not generate new
  ones with a model.
- Tool numbers refer to real pages. If you add one, it must exist in the guide.
- `moveFor()` is seeded by the story id so a story always shows the same tool.
  Keep it deterministic.

## 7. Honesty in the copy (non-negotiable)

From Alexandru's own growth strategy: *if an ad needs exaggerated fear, made-up
proof or a stronger promise than the product delivers, it is the wrong ad for
ExploraSelf.*

Never ship:

- invented reader counts, "X people are reading this", fake live activity;
- countdowns that do not count down to a real event;
- scarcity that is not real;
- copy designed to make a reader doubt their own judgement;
- any claim that a subscription, payment or delivery succeeded when it has not
  been verified.

Urgency must come from a **real mechanism**. The countdown is the real time
until the next edition. The unread figure is counted, not invented.

## 8. Consent and privacy

- **Reading Broadcast never requires marketing consent.** The report and the
  news are free with no email.
- Where name and email are requested for access, the **marketing checkbox is
  separate, unticked, and optional**. Consent has to be freely given; tying it
  to access would not be.
- Mailchimp base URL, form ids and tag ids in `app.js` are **fixed**. They map
  to real audiences. Do not change or "clean them up".
- Mailchimp confirms its own subscriptions. Never assert success in our UI.
- Preferences and bookmarks live on the reader's device. No account, no
  tracking, no third-party analytics.

## 9. Interface rules

- **One grid.** Every block is the full width or exactly half. A banner fills
  exactly one slot so the rhythm never breaks.
- **Promotion is a banner, never a paragraph**: artwork, short title, one
  button, in three fixed sizes (`bn-band`, `bn-tile`, `bn-strip`). At most one
  per five stories. No body copy competing with the news.
- **The industry picker is six groups, never a flat list of thirty.** Comfort
  is a design decision. Every industry in `industries` must appear in exactly
  one `industryGroups` entry.
- The Leader's Intelligence Report is the **home page**, not a side door. The
  four squares are the grid.
- Must work at 390px wide with no horizontal scroll.
- Respect `prefers-reduced-motion`.

## 10. Housekeeping

- No build step. Plain ES modules, no framework, no bundler, no new
  dependencies without a reason stated in the PR.
- **No API keys, tokens or secrets in this repo.** Public Mailchimp form ids
  are not credentials; nothing else belongs here.
- Do not rewrite published git history. If a branch conflicts after a squash
  merge, branch again off `main` and carry the files over.
- Alexandru merges or approves what ships. Open a PR; say plainly what you
  could not verify.
- Run `npm run check` and `npm test` before finishing.

---

## If you are about to break one of these

Say so in the PR, in plain language, and explain why. Several of these rules
cost us something on purpose — the free-tier sharding costs simplicity, the
honesty rules cost conversion, the over-provisioned feed list costs tidiness.
They are deliberate. Changing one is a decision for Alexandru, not a cleanup.
