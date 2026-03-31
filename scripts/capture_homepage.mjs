// capture_homepage.mjs — Takes two screenshots of the live site homepage
// Screenshot 1: Immediately after navigation
// Screenshot 2: After waiting for network idle (fully loaded)

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'screenshots');
const URL = 'https://prompt-generator-eight-umber.vercel.app';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  console.log('Navigating to:', URL);

  // Go to the page, wait for DOM to be loaded
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Screenshot 1 — right after DOM content loaded
  const shot1 = path.join(outputDir, 'homepage_1_initial.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log('Screenshot 1 saved:', shot1);

  // Wait for network to fully settle (images, fonts, async data)
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
    console.log('networkidle timed out — continuing anyway');
  });

  // Extra 2-second pause for any JS-rendered content
  await page.waitForTimeout(2000);

  // Screenshot 2 — fully loaded
  const shot2 = path.join(outputDir, 'homepage_2_loaded.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log('Screenshot 2 saved:', shot2);

  await browser.close();
  console.log('Done.');
})();
