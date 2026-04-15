const { chromium } = require('playwright');
const fs = require('fs');

const BOT_ID = 'amor-perruno-1774564874213';
const BASE = 'https://superbot007.com';
const OUT = '/home/user/webapp/amor_perruno_screens';

const VIEWPORT = { width: 1280, height: 720 }; // 16:9 Facebook

async function shot(page, name, delay = 3000) {
  await page.waitForTimeout(delay);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`✅ ${name}.png`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  // ── 1. FORM.HTML – Formulario vacío
  console.log('📸 1. Formulario inicio...');
  await page.goto(`${BASE}/form.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await shot(page, '01_formulario_inicio', 3000);

  // ── 2. FORM – con texto escrito
  console.log('📸 2. Formulario llenando...');
  try {
    const inputs = await page.$$('input[type="text"], input[type="email"], input[type="tel"]');
    if (inputs.length > 0) await inputs[0].fill('Amor Perruno');
    if (inputs.length > 1) await inputs[1].fill('tu@email.com');
    if (inputs.length > 2) await inputs[2].fill('+51 912 557 631');
  } catch(e) {}
  await shot(page, '02_formulario_llenando', 2000);

  // ── 3. LANDING PAGE del bot – top hero
  console.log('📸 3. Landing page hero...');
  await page.goto(`${BASE}/agent.html?id=${BOT_ID}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await shot(page, '03_landing_hero', 5000);

  // ── 4. Landing – scroll medio (servicios)
  console.log('📸 4. Landing servicios...');
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
  await shot(page, '04_landing_servicios', 2000);

  // ── 5. Landing – scroll bajo (testimonios/productos)
  console.log('📸 5. Landing productos...');
  await page.evaluate(() => window.scrollTo({ top: 1100, behavior: 'instant' }));
  await shot(page, '05_landing_productos', 2000);

  // ── 6. Chat – abrir chatbot
  console.log('📸 6. Chat abierto...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  try {
    // click floating chat button - try multiple selectors
    await page.click('.chat-fab, .fab, #openChat, [class*="chat-btn"], [class*="chatBtn"], button.fixed, button[style*="fixed"]', { timeout: 5000 });
  } catch(e) {
    try { await page.click('button:visible:last-of-type', { timeout: 3000 }); } catch(e2) {}
  }
  await shot(page, '06_chat_abierto', 3000);

  // ── 7. Escribir pregunta en chat
  console.log('📸 7. Chat con pregunta...');
  try {
    await page.click('input[type="text"]:visible, textarea:visible', { timeout: 5000 });
    await page.keyboard.type('¿Qué productos tienen?');
  } catch(e) {}
  await shot(page, '07_chat_pregunta', 2000);

  // ── 8. Respuesta del bot
  console.log('📸 8. Respuesta del bot...');
  try { await page.keyboard.press('Enter'); } catch(e) {}
  await shot(page, '08_chat_respuesta', 5000);

  // ── 9. TARJETA DIGITAL
  console.log('📸 9. Tarjeta digital...');
  await page.goto(`${BASE}/card.html?id=${BOT_ID}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await shot(page, '09_tarjeta_top', 4000);

  // ── 10. Tarjeta scroll
  console.log('📸 10. Tarjeta contacto...');
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
  await shot(page, '10_tarjeta_contacto', 2000);

  // ── 11. EDITOR
  console.log('📸 11. Panel editor...');
  await page.goto(`${BASE}/editor.html?id=${BOT_ID}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await shot(page, '11_editor_panel', 4000);

  // ── 12. CTA – superbot007.com homepage
  console.log('📸 12. CTA final...');
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await shot(page, '12_cta_homepage', 3000);

  await browser.close();

  const shots = fs.readdirSync(OUT).filter(f => f.endsWith('.png')).sort();
  console.log(`\n🎉 ${shots.length} screenshots listos:`);
  shots.forEach(s => console.log(' -', s));
})();
