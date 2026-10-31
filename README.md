# ExploraSelf Broadcast

An independent mobile-first news PWA for leaders. Original source headlines and short excerpts flow into four domains, shown in full as Lead yourself, Lead your people, Lead your business and Lead the market (internal keys stay Self, People, Work, Business). Free reading, device-local bookmarks/preferences, a three-hour feed cache, and clearly labelled ExploraSelf tools.

## Run

`npm run dev` serves the app and public RSS feeds locally using Python's standard library. `npm run check` checks syntax; `npm test` checks the Cloudflare feed route. No paid APIs or Lovable credits are used.

## Cloudflare Pages from this repository

Connect **this repository only** as a separate Pages project. Use repository root `/`, no build command, and build output directory `exploraself-broadcast`. `functions/api/news.js` serves `/api/news` and uses four public publisher feeds with a three-hour edge cache. Do not configure a route under the existing main site or shop.

Suggested custom domain: `broadcast.exploraself.com`, added only to this Pages project after verifying its separate `*.pages.dev` URL. The main site and shop require no source or hosting changes. Cloudflare Pages will provision the new subdomain DNS record when the zone is available in the account.

## Mailchimp and report delivery

The optional Weekly Success Supply form posts to the existing ExploraSelf audience form. Marketing consent is unchecked by default. Mailchimp confirmation and delivery still need an end-to-end test on the live domain. The Leader's Intelligence Report is free to read and save without an email. Automated report email delivery and the four interest tags need a dedicated Mailchimp collector/automation; the UI explicitly labels these as pending. Do not put API keys in the web files. Push notifications likewise require separate permission, subscription and send setup.

The source offers and links were verified against `exploraself.com` on 25 October 2026. Recheck pricing and time-limited promotions before campaigns.
