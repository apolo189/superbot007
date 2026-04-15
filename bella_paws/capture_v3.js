const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BOT_ID = 'bella-paws-spa-1775476955962';
const BASE = 'https://superbot007.com';
const OUT = '/home/user/webapp/bella_paws/good_screens';

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });

  async function waitForLandingPage(page) {
    // Wait for loading screen to disappear
    try {
      await page.waitForSelector('#loadingScreen', { state: 'hidden', timeout: 20000 });
      console.log('  Loading screen hidden');
    } catch(e) {
      console.log('  Loading screen timeout - continuing');
    }
    // Extra wait for images
    await page.waitForTimeout(3000);
    // Scroll through page to trigger lazy loads
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 200));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(2000);
  }

  async function screenshotAt(url, filename, scrollY, waitFn) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      if (waitFn) await waitFn(page);
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(1000);
      const outPath = path.join(OUT, filename);
      await page.screenshot({ path: outPath, fullPage: false });
      const { size } = fs.statSync(outPath);
      console.log(`  ✅ ${filename}: ${Math.round(size/1024)}KB`);
    } catch(e) {
      console.log(`  ❌ ${filename}: ${e.message.slice(0,80)}`);
    }
    await page.close();
  }

  async function fullPageShot(url, filename, waitFn) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      if (waitFn) await waitFn(page);
      const outPath = path.join(OUT, filename);
      await page.screenshot({ path: outPath, fullPage: true });
      const { size } = fs.statSync(outPath);
      console.log(`  ✅ ${filename} (FULL): ${Math.round(size/1024)}KB`);
    } catch(e) {
      console.log(`  ❌ ${filename}: ${e.message.slice(0,80)}`);
    }
    await page.close();
  }

  const landingUrl = `${BASE}/landing.html?id=${BOT_ID}`;
  const cardUrl = `${BASE}/card.html?id=${BOT_ID}`;

  console.log('=== CAPTURING WITH LOADING SCREEN WAIT ===');
  console.log('Landing:', landingUrl);

  console.log('\n--- LANDING PAGE SECTIONS ---');
  await screenshotAt(landingUrl, 'landing_s1_hero.png', 0, waitForLandingPage);
  await screenshotAt(landingUrl, 'landing_s2_services.png', 900, waitForLandingPage);
  await screenshotAt(landingUrl, 'landing_s3_gallery.png', 1800, waitForLandingPage);
  await screenshotAt(landingUrl, 'landing_s4_contact.png', 2700, waitForLandingPage);
  await fullPageShot(landingUrl, 'landing_fullpage.png', waitForLandingPage);

  // Digital card
  async function waitForCard(page) {
    try {
      await page.waitForSelector('#loadingScreen', { state: 'hidden', timeout: 15000 });
    } catch(e) {}
    await page.waitForTimeout(3000);
  }

  console.log('\n--- DIGITAL CARD ---');
  await screenshotAt(cardUrl, 'card_top.png', 0, waitForCard);
  await fullPageShot(cardUrl, 'card_full.png', waitForCard);

  await browser.close();

  console.log('\n=== RESULTS ===');
  fs.readdirSync(OUT).filter(f=>f.endsWith('.png')).sort().forEach(f=>{
    const sz = Math.round(fs.statSync(path.join(OUT,f)).size/1024);
    console.log(`  ${f}: ${sz}KB`);
  });
})();
