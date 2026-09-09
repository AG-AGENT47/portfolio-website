// E2E: drive the real chat UI against a running backend, assert the reply is
// clean plain prose (no raw markdown), capture a screenshot.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:3000';
const outDir = 'design/shots';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.locator('#chat').scrollIntoViewIfNeeded();
await page.waitForTimeout(600);

const questions = ['Tell me about Uber', 'hi', "What's the capital of France?"];
for (const q of questions) {
  await page.fill('#chat input[placeholder="ask anything…"]', q);
  await page.getByRole('button', { name: 'send' }).click();
  // wait for the streaming dot to appear then disappear (reply complete)
  await page.waitForTimeout(800);
  await page.waitForFunction(() => {
    const log = document.querySelector('#chat [class*="log"]');
    if (!log) return false;
    const last = log.lastElementChild;
    return last && !last.querySelector('[class*="thinking"]') && last.textContent.trim().length > 0;
  }, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1200);
}

const bubbles = await page.evaluate(() => {
  const log = document.querySelector('#chat [class*="log"]');
  return [...log.children].map((el) => ({
    who: el.className.includes('me') ? 'me' : 'ai',
    text: el.textContent.trim(),
  }));
});

console.log('\n=== TRANSCRIPT ===');
for (const b of bubbles) console.log(`[${b.who}] ${b.text}\n`);

const aiTexts = bubbles.filter((b) => b.who === 'ai').map((b) => b.text);
const markdownLeak = aiTexts.filter((t) => /\*\*|^#{1,6}\s|^\s*[-*]\s/m.test(t));
console.log('=== CHECKS ===');
console.log('AI replies:', aiTexts.length);
console.log('markdown leak in bubble:', markdownLeak.length === 0 ? 'NONE ✓' : markdownLeak);
console.log('console errors:', consoleErrors.length === 0 ? 'NONE ✓' : consoleErrors);

await page.locator('#chat').screenshot({ path: `${outDir}/e2e-chat-formatting.png` });
console.log(`\nscreenshot → ${outDir}/e2e-chat-formatting.png`);

await browser.close();
process.exit(markdownLeak.length === 0 ? 0 : 1);
