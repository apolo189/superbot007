const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BOT_ID = 'bella-paws-spa-1775476955962';
const BASE = 'https://superbot007.com';
const OUT = '/home/user/webapp/bella_paws/fullpage_screens';

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });

  async function shot(url, filename, scrollY = 0, waitMs = 5000) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(waitMs);
      if (scrollY > 0) {
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await page.waitForTimeout(2000);
      }
      const outPath = path.join(OUT, filename);
      await page.screenshot({ path: outPath, fullPage: false });
      const size = fs.statSync(outPath).size;
      console.log(`✅ ${filename} (${Math.round(size/1024)}KB)`);
    } catch (e) {
      console.log(`❌ ${filename}: ${e.message.slice(0,100)}`);
    }
    await page.close();
  }

  async function fullShot(url, filename, waitMs = 6000) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      // scroll to bottom to trigger lazy images
      await page.waitForTimeout(3000);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);
      const outPath = path.join(OUT, filename);
      await page.screenshot({ path: outPath, fullPage: true });
      const size = fs.statSync(outPath).size;
      console.log(`✅ ${filename} FULLPAGE (${Math.round(size/1024)}KB)`);
    } catch (e) {
      console.log(`❌ ${filename}: ${e.message.slice(0,100)}`);
    }
    await page.close();
  }

  const landingUrl = `${BASE}/landing.html?id=${BOT_ID}`;
  const cardUrl = `${BASE}/card.html?id=${BOT_ID}`;

  console.log('=== FULL PAGE SCREENSHOTS ===\n');

  // Landing page sections
  console.log('-- LANDING PAGE --');
  await fullShot(landingUrl, '06_landing_fullpage.png');
  await shot(landingUrl, '06a_hero.png', 0, 5000);
  await shot(landingUrl, '06b_services.png', 800, 3000);
  await shot(landingUrl, '06c_gallery.png', 1600, 3000);
  await shot(landingUrl, '06d_more.png', 2400, 3000);

  // Digital card
  console.log('\n-- DIGITAL CARD --');
  await fullShot(cardUrl, '09_card_fullpage.png');
  await shot(cardUrl, '09a_card_top.png', 0, 4000);

  await browser.close();

  console.log('\nAll done. Files:');
  fs.readdirSync(OUT).filter(f=>f.endsWith('.png')).forEach(f => {
    const sz = Math.round(fs.statSync(path.join(OUT,f)).size/1024);
    console.log(`  ${f}: ${sz}KB`);
  });
})();
