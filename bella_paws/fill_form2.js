// Continue form from Step 3 onwards
const { chromium } = require('playwright');
const fs = require('fs');

const OUT = '/home/user/webapp/bella_paws/screens';
const IMGS = '/home/user/webapp/bella_paws';
const VIEWPORT = { width: 1280, height: 720 };

fs.mkdirSync(OUT, { recursive: true });

let shotNum = 8; // continue from 08
async function shot(page, name, delay = 2000) {
  await page.waitForTimeout(delay);
  shotNum++;
  const num = String(shotNum).padStart(2, '0');
  const file = `${OUT}/${num}_${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📸 ${num}_${name}.png`);
  return file;
}

// Click next button scrolling into view first
async function clickNext(page) {
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.btn-next'));
    const visible = btns.find(b => b.offsetParent !== null);
    if (visible) visible.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.btn-next'));
    const visible = btns.find(b => b.offsetParent !== null);
    if (visible) visible.click();
  });
  await page.waitForTimeout(2500);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: VIEWPORT });

  // Re-fill from start quickly to get to step 3
  console.log('Re-navigating to form...');
  await page.goto('https://superbot007.com/form.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Step 0: Lead
  await page.fill('#leadName', 'Carlos Mendoza');
  await page.fill('#leadEmail', 'carlos@bellapawsspa.com');
  await page.click('.lead-btn');
  await page.waitForTimeout(2000);

  // Step 1: Business info
  await page.fill('#businessName', 'Bella Paws Spa');
  await page.selectOption('#businessType', { index: 1 });
  await page.fill('#businessCity', 'Miami, FL, USA');
  await page.fill('#description', 'Somos el spa y peluqueria canina de lujo en Miami. Bano premium, corte, tratamientos organicos y masajes para tu mascota. Solo productos naturales.');
  await page.fill('#heroTitle', 'El Spa de Lujo que Tu Mascota Merece');
  await page.fill('#heroSubtitle', 'Tratamientos premium 100% organicos en Miami');
  await page.fill('#welcomeMsg', 'Hola! Bienvenido a Bella Paws Spa. Como puedo ayudarte?');

  // Upload logo
  try {
    const fileInputs = await page.$$('input[type="file"]');
    if (fileInputs[0]) { await fileInputs[0].setInputFiles(`${IMGS}/logo.jpg`); await page.waitForTimeout(1000); }
  } catch(e) {}
  await clickNext(page);

  // Step 2: Design - skip colors, just click next
  await clickNext(page);
  console.log('Reached Step 3: Services');

  // ── PASO 3: Servicios
  await shot(page, 'form_step3_servicios', 1500);

  // Fill services using JS directly for reliability
  await page.evaluate(() => {
    // Find all service name inputs
    const nameInputs = document.querySelectorAll('input[placeholder*="nombre"], .svc-row input:first-child, .service-name');
    const priceInputs = document.querySelectorAll('input[placeholder*="precio"], input[placeholder*="$"], .svc-price');
    const descAreas = document.querySelectorAll('textarea[placeholder*="descrip"], .svc-desc');
    
    if (nameInputs[0]) { nameInputs[0].value = 'Bano Premium'; nameInputs[0].dispatchEvent(new Event('input')); }
    if (priceInputs[0]) { priceInputs[0].value = '45'; priceInputs[0].dispatchEvent(new Event('input')); }
    if (descAreas[0]) { descAreas[0].value = 'Bano completo con productos organicos, secado y perfume'; descAreas[0].dispatchEvent(new Event('input')); }
  });

  try {
    const addBtn = await page.$('#addSvcBtn');
    if (addBtn) { await addBtn.click(); await page.waitForTimeout(800); }
  } catch(e) {}

  await page.evaluate(() => {
    const nameInputs = document.querySelectorAll('input[placeholder*="nombre"], .svc-row input:first-child');
    const priceInputs = document.querySelectorAll('input[placeholder*="precio"], input[placeholder*="$"]');
    const descAreas = document.querySelectorAll('textarea[placeholder*="descrip"]');
    if (nameInputs[1]) { nameInputs[1].value = 'Corte y Estilo'; nameInputs[1].dispatchEvent(new Event('input')); }
    if (priceInputs[1]) { priceInputs[1].value = '55'; priceInputs[1].dispatchEvent(new Event('input')); }
    if (descAreas[1]) { descAreas[1].value = 'Corte profesional segun la raza de tu mascota'; descAreas[1].dispatchEvent(new Event('input')); }
  });

  try {
    const addBtn = await page.$('#addSvcBtn');
    if (addBtn) { await addBtn.click(); await page.waitForTimeout(800); }
  } catch(e) {}

  await page.evaluate(() => {
    const nameInputs = document.querySelectorAll('input[placeholder*="nombre"], .svc-row input:first-child');
    const priceInputs = document.querySelectorAll('input[placeholder*="precio"], input[placeholder*="$"]');
    const descAreas = document.querySelectorAll('textarea[placeholder*="descrip"]');
    if (nameInputs[2]) { nameInputs[2].value = 'Spa Completo VIP'; nameInputs[2].dispatchEvent(new Event('input')); }
    if (priceInputs[2]) { priceInputs[2].value = '85'; priceInputs[2].dispatchEvent(new Event('input')); }
    if (descAreas[2]) { descAreas[2].value = 'Bano + Corte + Masaje relajante + Aromaterapia todo incluido'; descAreas[2].dispatchEvent(new Event('input')); }
  });

  // Upload service images
  try {
    const fileInputs = await page.$$('input[type="file"]');
    const imgs = [`${IMGS}/dog_groomed.jpg`, `${IMGS}/dog_haircut.jpg`, `${IMGS}/products.jpg`];
    for (let i = 0; i < Math.min(fileInputs.length, imgs.length); i++) {
      await fileInputs[i].setInputFiles(imgs[i]);
      await page.waitForTimeout(600);
    }
  } catch(e) {}

  await shot(page, 'form_step3_servicios_llenados', 2000);
  await clickNext(page);

  // ── PASO 4: Pagos & Productos
  console.log('Step 4: Payments...');
  await shot(page, 'form_step4_pagos', 1500);

  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="email"], input[placeholder*="paypal"]');
    if (inputs[0]) { inputs[0].value = 'bellapawsspa@gmail.com'; inputs[0].dispatchEvent(new Event('input')); }
    const venmo = document.querySelector('input[placeholder*="venmo"], input[placeholder*="@"]');
    if (venmo) { venmo.value = '@BellaPawsSpa'; venmo.dispatchEvent(new Event('input')); }
  });

  // Add a product
  try {
    const addProd = await page.$('#addProdBtn');
    if (addProd) {
      await addProd.click();
      await page.waitForTimeout(800);
      await page.evaluate(() => {
        const pNameInputs = document.querySelectorAll('.prod-name, input[placeholder*="producto"]');
        const pPriceInputs = document.querySelectorAll('.prod-price, input[placeholder*="precio"]');
        if (pNameInputs[0]) { pNameInputs[0].value = 'Shampoo Organico Premium'; pNameInputs[0].dispatchEvent(new Event('input')); }
        if (pPriceInputs[0]) { pPriceInputs[0].value = '22'; pPriceInputs[0].dispatchEvent(new Event('input')); }
      });
      try {
        const prodFileInputs = await page.$$('input[type="file"]');
        if (prodFileInputs[0]) { await prodFileInputs[0].setInputFiles(`${IMGS}/products.jpg`); await page.waitForTimeout(800); }
      } catch(e) {}
    }
  } catch(e) {}

  await shot(page, 'form_step4_pagos_productos', 2000);
  await clickNext(page);

  // ── PASO 5: Galeria
  console.log('Step 5: Gallery...');
  await shot(page, 'form_step5_galeria', 1500);

  try {
    const galleryImgs = [
      `${IMGS}/hero.jpg`,
      `${IMGS}/dog_groomed.jpg`,
      `${IMGS}/dog_haircut.jpg`,
      `${IMGS}/products.jpg`,
      `${IMGS}/salon_interior.jpg`,
    ];
    const fileInputs = await page.$$('input[type="file"]');
    for (let i = 0; i < Math.min(fileInputs.length, galleryImgs.length); i++) {
      await fileInputs[i].setInputFiles(galleryImgs[i]);
      await page.waitForTimeout(500);
    }
  } catch(e) {}

  await shot(page, 'form_step5_galeria_llenada', 2500);
  await clickNext(page);

  // ── PASO 6: Contacto & Horarios
  console.log('Step 6: Contact & Hours...');
  await shot(page, 'form_step6_contacto', 1500);

  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="tel"], input[type="text"]'))
      .filter(i => i.offsetParent !== null);
    inputs.forEach(inp => {
      const ph = (inp.placeholder || '').toLowerCase();
      if (ph.includes('telefono') || ph.includes('phone') || ph.includes('whatsapp')) {
        inp.value = '+1 305 555 0199'; inp.dispatchEvent(new Event('input'));
      }
      if (ph.includes('direcc') || ph.includes('address')) {
        inp.value = '1234 Brickell Ave, Miami, FL'; inp.dispatchEvent(new Event('input'));
      }
      if (ph.includes('instagram')) {
        inp.value = '@bellapawsspa'; inp.dispatchEvent(new Event('input'));
      }
      if (ph.includes('facebook')) {
        inp.value = 'fb.com/bellapawsspa'; inp.dispatchEvent(new Event('input'));
      }
    });
  });
  await shot(page, 'form_step6_contacto_llenado', 2000);
  await clickNext(page);

  // ── PASO 7: IA & Activar
  console.log('Step 7: AI & Activate...');
  await shot(page, 'form_step7_ia', 2000);

  // Click AI generate buttons
  try {
    const aiBtns = await page.$$('.btn-ai');
    for (let i = 0; i < Math.min(aiBtns.length, 3); i++) {
      const isVisible = await aiBtns[i].isVisible();
      if (isVisible) {
        await aiBtns[i].scrollIntoViewIfNeeded();
        await aiBtns[i].click();
        await page.waitForTimeout(2000);
      }
    }
  } catch(e) {}
  await shot(page, 'form_step7_ia_generado', 2500);

  // Scroll to activate button
  await page.evaluate(() => {
    const btn = document.querySelector('#activateBtn');
    if (btn) btn.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await shot(page, 'form_step7_boton_activar', 1500);

  // ── ACTIVAR!
  console.log('\n🚀 ACTIVATING BOT...');
  await page.evaluate(() => {
    const btn = document.querySelector('#activateBtn');
    if (btn) btn.click();
  });
  await page.waitForTimeout(10000);
  await shot(page, 'form_step8_generando', 3000);
  await page.waitForTimeout(5000);
  await shot(page, 'form_step8_bot_listo', 3000);

  // Scroll to show links
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, 'form_step8_success_top', 2000);
  await page.evaluate(() => window.scrollTo(0, 400));
  await shot(page, 'form_step8_success_links', 2000);

  // Get bot ID
  const botId = await page.evaluate(() => {
    const allText = document.body.innerText;
    const match = allText.match(/agent\.html\?id=([a-zA-Z0-9-]+)/);
    if (match) return match[1];
    const inp = document.querySelector('input[value*="agent"]');
    if (inp) { const m = inp.value.match(/id=([a-zA-Z0-9-]+)/); return m ? m[1] : null; }
    return null;
  });
  console.log('  Bot ID:', botId);
  if (botId) fs.writeFileSync(`${OUT}/bot_id.txt`, botId);

  await browser.close();

  const shots = fs.readdirSync(OUT).filter(f => f.endsWith('.png')).sort();
  console.log(`\n✅ Total: ${shots.length} screenshots:`);
  shots.forEach(s => console.log('  -', s));
})();
