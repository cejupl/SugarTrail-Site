# SugarTrail - product site

The site for **SugarTrail** at [sugartrail.app](https://sugartrail.app), the diabetes
care-buddy app built by [Cenovya Labs LLC](https://cenovyalabs.com). The app itself
lives in the `SugarTrail` repo; this is the public face and the legal home.

```
sugartrail.app
├── /                   what the app is, what it does, and what it will not do
├── /privacy            privacy policy - required by Dexcom and by the App Store
├── /terms              terms of use
└── /dexcom/callback    the OAuth redirect Dexcom returns to after you approve
```

## Why there is no build step

Four pages of hand-written HTML, one stylesheet, three small scripts. No framework,
no bundler, no `node_modules`, nothing to keep up to date. Two of these pages are
load-bearing - a privacy policy a regulator may read, and an OAuth redirect a
person's connection depends on - and both should still work untouched in five
years. The Nutovia site is built the same way.

## Working on it

```bash
python3 -m http.server 4321      # then open http://127.0.0.1:4321
```

Edit the HTML directly. Paths are absolute (`/assets/...`), so serve from the repo
root rather than opening the files from disk.

## Where the design comes from

Every colour, size and weight is `docs/DESIGN.md` in the app repo, so the site and
the app are the same object: warm paper, one teal, one amber, Manrope, and space.
The trail mark - a rounded path ending in a dot - is the app's `TrailMark`
component, inline as SVG.

Most of the copy is the app's own welcome story, word for word. Keep them in step:
if a line changes in `apps/mobile/src/app/welcome.tsx`, change it here too.

**Manrope is self-hosted**, subset to latin and converted to woff2 (about 12 KB a
weight). The site makes no third-party requests of any kind - no fonts, no
analytics, no trackers - which is the same promise the privacy policy makes.

## Regenerating the art

`assets/img/` is generated from the one vector source and committed. To change it,
see the instructions at the top of `scripts/make-images.mjs`; it borrows `sharp`
and `opentype.js` from the app repo so this one stays dependency-free.

## Deploying

The DNS for sugartrail.app is on Cloudflare, so **Cloudflare Pages** is the shortest
path: connect this repo, no build command, output directory `/`. `_headers` is
applied by Pages and carries the security headers, including a content security
policy that allows no inline scripts or styles and no outside origins - so keep
styles in `site.css` and scripts in `assets/*.js`.

`CNAME` is kept so GitHub Pages remains a one-switch fallback. Every page is a
directory with an `index.html`, which gives clean URLs on both hosts.
