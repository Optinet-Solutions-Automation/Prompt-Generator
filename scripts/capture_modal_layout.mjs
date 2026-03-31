// capture_modal_layout.mjs — Captures a screenshot of localhost:8081
import { chromium } from 'playwright';

const OUTPUT_PATH = 'C:/Users/User/Prompt-Generator/screenshots/modal_layout.png';
const URL = 'http://localhost:8081';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  console.log('Navigating to:', URL);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for network to settle and JS to render
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
    console.log('networkidle timed out — continuing anyway');
  });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: OUTPUT_PATH, fullPage: false });
  console.log('Screenshot saved to:', OUTPUT_PATH);

  await browser.close();
})();
