import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:3000';
const outDir = 'design/shots';
mkdirSync(outDir, { recursive: true });

const viewports = [
  { w: 1440, h: 900, tag: 'desktop' },
  { w: 390, h: 844, tag: 'mobile' },
];

const browser = await chromium.launch();
for (const { w, h, tag } of viewports) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1000); // fonts + tide settle

  // hero / above the fold
  await page.screenshot({ path: `${outDir}/${tag}-hero.png` });

  // Sections reveal on scroll via IntersectionObserver — walk the page to trigger them all.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 250));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 400));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: `${outDir}/${tag}-full.png`, fullPage: true });

  // per-section shots
  for (const id of ['about', 'work', 'projects', 'skills', 'education', 'chat', 'contact']) {
    const el = page.locator(`#${id}`).first();
    if (await el.count()) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await el.screenshot({ path: `${outDir}/${tag}-${id}.png` }).catch(() => {});
    }
  }
  console.log(`shot: ${tag}`);
  await page.close();
}
await browser.close();
console.log('done →', outDir);
