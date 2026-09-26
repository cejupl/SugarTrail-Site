/*
 * Regenerates the site art from the one vector source: the trail mark and the
 * Manrope wordmark. The outputs are committed, so this site needs no
 * dependencies of its own.
 *
 * It borrows sharp and opentype.js from the app repo, so run it from there:
 *
 *   cp scripts/make-images.mjs ../SugarTrail/tmp-images.mjs
 *   (cd ../SugarTrail && node tmp-images.mjs && rm tmp-images.mjs)
 *
 * The colours and the mark path are docs/DESIGN.md in the app repo.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import opentype from 'opentype.js';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const OUT = '/Users/cejunair/Documents/Projects/SugarTrail-Site/assets/img/';

const C = { canvas: '#FAF7F2', ink: '#1B1917', ink2: '#5C5750', trail: '#0E6B66', sunrise: '#E9A23B' };
const MARK_W = 48, MARK_H = 32;
const markSvg = (trail, sunrise) =>
  `<path d="M4 26 C 12 26, 13 8, 21 8 C 29 8, 30 24, 38 20" stroke="${trail}" stroke-width="4.5" stroke-linecap="round" fill="none"/>` +
  `<circle cx="42" cy="13" r="4.5" fill="${sunrise}"/>`;

function markOn(w, h, s, cx, cy, colors, background = 'none') {
  const tx = cx - (MARK_W / 2) * s;
  const ty = cy - (MARK_H / 2 + 1) * s;
  const bg = background === 'none' ? '' : `<rect width="${w}" height="${h}" fill="${background}"/>`;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${bg}<g transform="translate(${tx} ${ty}) scale(${s})">${markSvg(colors.trail, colors.sunrise)}</g></svg>`,
  );
}

function textPath(text, size, weightFile) {
  const ttf = require.resolve(`@expo-google-fonts/manrope/${weightFile}/Manrope_${weightFile}.ttf`);
  const font = opentype.parse(readFileSync(ttf).buffer.slice(0));
  const tracking = -0.3 * (size / 30);
  const path = font.getPath(text, 0, 0, size, { kerning: true, letterSpacing: tracking / size });
  return { d: path.toPathData(3), box: path.getBoundingBox() };
}

async function main() {
  // 1. Favicon: the mark on a trail-teal rounded square, so it reads on any tab strip.
  const fav = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" rx="56" fill="${C.trail}"/><g transform="translate(32 60) scale(4)">${markSvg('#FFFFFF', C.sunrise)}</g></svg>`,
  );
  await sharp(fav).resize(64, 64).png().toFile(`${OUT}favicon.png`);

  // 2. Apple touch icon: the mark on white, opaque, like the app icon.
  await sharp(markOn(180, 180, 2.6, 90, 90, C, '#FFFFFF')).removeAlpha().png().toFile(`${OUT}apple-touch-icon.png`);

  // 3. Open Graph card: the lockup and the promise, on warm paper.
  const W = 1200, H = 630;
  const markScale = 3.4;
  const word = textPath('SugarTrail', 86, '800ExtraBold');
  const tag = textPath('Remember less. See more.', 40, '500Medium');
  const markW = MARK_W * markScale;
  const gap = 26;
  const lockW = markW + gap + (word.box.x2 - word.box.x1);
  const lockX = (W - lockW) / 2;
  const lockY = 286;
  const tagW = tag.box.x2 - tag.box.x1;

  const og = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      `<rect width="${W}" height="${H}" fill="${C.canvas}"/>` +
      `<g transform="translate(${lockX} ${lockY - (MARK_H / 2 + 1) * markScale}) scale(${markScale})">${markSvg(C.trail, C.sunrise)}</g>` +
      `<path d="${word.d}" fill="${C.ink}" transform="translate(${lockX + markW + gap - word.box.x1} ${lockY - (word.box.y1 + word.box.y2) / 2})"/>` +
      `<path d="${tag.d}" fill="${C.ink2}" transform="translate(${(W - tagW) / 2 - tag.box.x1} ${lockY + 116})"/>` +
      `<rect x="${(W - 132) / 2}" y="${H - 96}" width="132" height="3" rx="1.5" fill="${C.trail}" opacity="0.5"/>` +
      `</svg>`,
  );
  await sharp(og).removeAlpha().png().toFile(`${OUT}og.png`);

  console.log('images written');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
