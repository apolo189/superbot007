const { chromium } = require('/home/user/webapp/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const BOT_ID = 'bella-paws-spa-1775476955962';
const BASE = 'https://superbot007.com';
const OUT = '/home/user/webapp/bella_paws/good_screens';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  const landingUrl = `${BASE}/landing.html?id=${BOT_ID}`;
  console.log('Opening:', landingUrl);

  await page.goto(landingUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Wait for loading screen to disappear
  try {
    await page.waitForSelector('#loadingScreen', { state: 'hidden', timeout: 20000 });
    console.log('Loading screen gone');
  } catch(e) { console.log('Loading screen timeout'); }

  await page.waitForTimeout(3000);

  // Try to open the chat widget - try many selectors
  const chatSelectors = [
    '#chat-toggle', '#chatToggle', '.chat-toggle', '.chat-widget-toggle',
    '[id*="chat"][id*="toggle"]', '[class*="chat"][class*="toggle"]',
    '[class*="chat"][class*="fab"]', '.fab', '#fab',
    'button[class*="chat"]', '[data-chat]', '#chatBtn',
    '.chat-launcher', '#chatLauncher', '.widget-btn',
    '[class*="widget"][class*="btn"]', '[class*="bot"][class*="btn"]'
  ];

  let opened = false;
  for (const sel of chatSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        const visible = await el.isVisible();
        if (visible) {
          console.log('Found chat button:', sel);
          await el.click();
          await page.waitForTimeout(2000);
          opened = true;
          break;
        }
      }
    } catch(e) {}
  }

  if (!opened) {
    // Try clicking by text
    try {
      await page.click('text=Chat', { timeout: 3000 });
      opened = true;
      console.log('Opened by text "Chat"');
    } catch(e) {}
  }

  if (!opened) {
    // Look for any floating button at bottom-right
    const btns = await page.$$('button, .btn, [role="button"]');
    for (const btn of btns) {
      try {
        const box = await btn.boundingBox();
        if (box && box.x > 900 && box.y > 700) {
          console.log('Clicking bottom-right button at', box.x, box.y);
          await btn.click();
          await page.waitForTimeout(2000);
          opened = true;
          break;
        }
      } catch(e) {}
    }
  }

  console.log('Chat opened:', opened);

  // Screenshot with chat open (or at least the page)
  await page.screenshot({ path: path.join(OUT, 'chatbot_open.png'), fullPage: false });
  console.log('chatbot_open.png saved');

  // Try to type a message
  if (opened) {
    const inputSels = [
      '#chat-input', '.chat-input', 'input[placeholder*="escrib"]',
      'input[placeholder*="mensaje"]', 'input[placeholder*="pregunta"]',
      'input[type="text"]', 'textarea'
    ];
    for (const sel of inputSels) {
      try {
        const el = await page.$(sel);
        if (el && await el.isVisible()) {
          await el.fill('¿Cuánto cuesta el baño para mi perro?');
          await page.keyboard.press('Enter');
          console.log('Message sent via', sel);
          await page.waitForTimeout(4000);
          break;
        }
      } catch(e) {}
    }
    await page.screenshot({ path: path.join(OUT, 'chatbot_responding.png'), fullPage: false });
    console.log('chatbot_responding.png saved');
  }

  // Log page elements to understand structure
  const allIds = await page.evaluate(() => {
    const els = document.querySelectorAll('[id]');
    return Array.from(els).map(e => e.id).filter(id => 
      id.toLowerCase().includes('chat') || id.toLowerCase().includes('bot') || 
      id.toLowerCase().includes('widget') || id.toLowerCase().includes('msg')
    );
  });
  console.log('Chat-related IDs found:', allIds);

  const sizes = ['chatbot_open.png', 'chatbot_responding.png'].map(f => {
    const fp = path.join(OUT, f);
    if (fs.existsSync(fp)) return `${f}: ${Math.round(fs.statSync(fp).size/1024)}KB`;
    return `${f}: NOT FOUND`;
  });
  console.log('\nFiles:', sizes.join(', '));

  await browser.close();
})();
