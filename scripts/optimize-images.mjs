/**
 * Generates responsive, modern-format variants of the site's photography.
 *
 * Sources live in `images/` — they are committed but never deployed, so the
 * full-size originals don't ship to visitors. Outputs land in `public/img/`
 * and ARE committed, which keeps the GitHub Pages workflow free of an image
 * processing step (and free of a native `sharp` install).
 *
 * Run after adding or replacing a source image:
 *
 *   npm run images
 */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = 'images';
const OUTPUT_DIR = join('public', 'img');

/** Widths to emit. Must match the `srcset` descriptors in the templates. */
const WIDTHS = [800, 1400, 2000];

/** Ordered best-first; the browser takes the first type it understands. */
const FORMATS = [
  { ext: 'avif', options: { quality: 55, effort: 6 } },
  { ext: 'webp', options: { quality: 72 } },
  { ext: 'jpeg', options: { quality: 78, mozjpeg: true }, suffix: 'jpg' },
];

const kb = (bytes) => `${Math.round(bytes / 1024)} kB`;

await mkdir(OUTPUT_DIR, { recursive: true });

const sources = (await readdir(SOURCE_DIR)).filter((file) =>
  /\.(jpe?g|png|tiff?|webp)$/i.test(file),
);

if (!sources.length) {
  console.warn(`No source images found in ${SOURCE_DIR}/`);
  process.exit(0);
}

for (const file of sources) {
  const name = basename(file, extname(file));
  const input = sharp(join(SOURCE_DIR, file));
  const { width: sourceWidth } = await input.metadata();

  console.log(`\n${file} (${sourceWidth}px wide)`);

  for (const width of WIDTHS) {
    // Never upscale — a variant wider than the source just wastes bytes.
    const target = Math.min(width, sourceWidth);

    for (const { ext, options, suffix } of FORMATS) {
      const outName = `${name}-${width}.${suffix ?? ext}`;
      const buffer = await input
        .clone()
        .resize({ width: target, withoutEnlargement: true })
        .toFormat(ext, options)
        .toBuffer();

      await writeFile(join(OUTPUT_DIR, outName), buffer);
      console.log(`  ${outName.padEnd(28)} ${kb(buffer.byteLength).padStart(8)}`);
    }
  }
}

console.log(`\nDone — variants written to ${OUTPUT_DIR}/`);
