const { chromium } = require('playwright');
const fs = require('fs');

const BOT_ID = 'bella-paws-spa-1775476955962';
const BASE = 'https://superbot007.com';
const OUT = '/home/user/webapp/bella_paws/screens';
const VIEWPORT = { width: 1280, height: 720 };

let shotNum = 23;
async function shot(page, name, delay) {
  await page.waitForTimeout(delay || 3000);
  shotNum++;
  const num = String(shotNum).padStart(2, '0');
  const file = `${OUT}/${num}_${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📸 ${num}_${name}.png`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: VIEWPORT });

  // ── LANDING PAGE
  console.log('Landing page...');
  await page.goto(`${BASE}/agent.html?id=${BOT_ID}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await shot(page, 'landing_hero', 5000);
  await page.evaluate(() => window.scrollTo(0, 500));
  await shot(page, 'landing_servicios', 2000);
  await page.evaluate(() => window.scrollTo(0, 1100));
  await shot(page, 'landing_productos', 2000);
  await page.evaluate(() => window.scrollTo(0, 1700));
  await shot(page, 'landing_galeria', 2000);

  // ── CHATBOT OPEN
  console.log('Chatbot...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const chatBtn = btns.find(b =>
      (b.id && b.id.toLowerCase().includes('chat')) ||
      b.className.includes('fab') ||
      b.className.includes('chat') ||
      b.className.includes('wz-fab')
    );
    if (chatBtn) chatBtn.click();
    else {
      // try wz-fab
      const wz = document.getElementById('wz-fab');
      if (wz) wz.click();
    }
  });
  await shot(page, 'chatbot_abierto', 3000);

  // Type message in chat
  try {
    const chatInput = await page.$('#wz-input, .wz-input, input[placeholder*="escribe"], input[placeholder*="message"], input[placeholder*="mensaje"]');
    if (chatInput) {
      await chatInput.click();
      await chatInput.type('Cuanto cuesta el bano para mi perro?');
      await shot(page, 'chatbot_pregunta', 1500);
      await page.keyboard.press('Enter');
      await shot(page, 'chatbot_respuesta_bot', 6000);
    } else {
      await shot(page, 'chatbot_con_chat', 2000);
    }
  } catch(e) {
    await shot(page, 'chatbot_pantalla', 2000);
  }

  // ── TARJETA DIGITAL
  console.log('Virtual card...');
  await page.goto(`${BASE}/card.html?id=${BOT_ID}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await shot(page, 'tarjeta_top', 4000);
  await page.evaluate(() => window.scrollTo(0, 400));
  await shot(page, 'tarjeta_contacto', 2000);

  // ── CTA FINAL
  console.log('CTA final...');
  await page.goto(`${BASE}/form.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await shot(page, 'cta_final', 3000);

  await browser.close();

  const shots = fs.readdirSync(OUT).filter(f => f.endsWith('.png')).sort();
  console.log(`\n✅ TOTAL: ${shots.length} screenshots`);
  shots.forEach(s => console.log('  -', s));
})();
