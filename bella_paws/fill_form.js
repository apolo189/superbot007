const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = '/home/user/webapp/bella_paws/screens';
const IMGS = '/home/user/webapp/bella_paws';
const VIEWPORT = { width: 1280, height: 720 };

fs.mkdirSync(OUT, { recursive: true });

let shotNum = 0;
async function shot(page, name, delay = 2000) {
  await page.waitForTimeout(delay);
  shotNum++;
  const num = String(shotNum).padStart(2, '0');
  const file = `${OUT}/${num}_${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📸 ${num}_${name}.png`);
  return file;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: VIEWPORT });

  // ── PANTALLA 0: Página principal superbot007.com
  console.log('\n🌐 Homepage...');
  await page.goto('https://superbot007.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await shot(page, 'homepage', 3000);

  // ── PANTALLA 1: form.html - Lead capture
  console.log('\n📋 Step 0: Lead capture...');
  await page.goto('https://superbot007.com/form.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await shot(page, 'form_lead_vacio', 2500);

  await page.fill('#leadName', 'Carlos Mendoza');
  await page.fill('#leadEmail', 'carlos@bellapawsspa.com');
  await shot(page, 'form_lead_llenado', 1500);

  await page.click('.lead-btn');
  await page.waitForTimeout(2000);
  await shot(page, 'form_step1_negocio', 2000);

  // ── PASO 1: Info del negocio
  console.log('\n📝 Step 1: Business info...');
  await page.fill('#businessName', 'Bella Paws Spa');
  await page.selectOption('#businessType', { index: 1 });
  await page.fill('#businessCity', 'Miami, FL, USA');
  await page.fill('#description', 'Somos el spa y peluqueria canina de lujo #1 en Miami. Ofrecemos bano y corte premium, tratamientos organicos, aromaterapia y masajes relajantes para tu mascota. Nuestro equipo de expertos cuida a tu perro como si fuera de la familia. Usamos solo productos naturales y organicos, libres de quimicos. Tu mascota merece lo mejor.');
  await page.fill('#heroTitle', 'El Spa de Lujo que Tu Mascota Merece');
  await page.fill('#heroSubtitle', 'Tratamientos premium 100% organicos en Miami');
  await page.fill('#welcomeMsg', 'Hola! Bienvenido a Bella Paws Spa. Estoy aqui para ayudarte a reservar el mejor tratamiento para tu mascota. Como puedo ayudarte?');
  await shot(page, 'form_step1_llenado', 2000);

  // Upload logo
  console.log('  Uploading logo...');
  try {
    const logoInput = await page.$('input[type="file"]');
    if (logoInput) {
      await logoInput.setInputFiles(`${IMGS}/logo.jpg`);
      await page.waitForTimeout(1500);
    }
  } catch(e) { console.log('  logo upload skipped:', e.message); }
  await shot(page, 'form_step1_con_logo', 2000);

  // Click Next -> Step 2
  await page.click('.btn-next');
  await page.waitForTimeout(2000);

  // ── PASO 2: Diseño & Colores
  console.log('\n🎨 Step 2: Design & Colors...');
  await shot(page, 'form_step2_diseno', 2000);

  // Set primary color to elegant purple/gold
  try {
    const colorInputs = await page.$$('input[type="color"]');
    if (colorInputs.length >= 1) await colorInputs[0].fill('#8B5CF6');
    if (colorInputs.length >= 2) await colorInputs[1].fill('#F59E0B');
    if (colorInputs.length >= 3) await colorInputs[2].fill('#FFF8F0');
  } catch(e) {}

  // Upload hero image
  try {
    const fileInputs = await page.$$('input[type="file"]');
    if (fileInputs.length >= 1) {
      await fileInputs[0].setInputFiles(`${IMGS}/hero.jpg`);
      await page.waitForTimeout(1500);
    }
    if (fileInputs.length >= 2) {
      await fileInputs[1].setInputFiles(`${IMGS}/dog_groomed.jpg`);
      await page.waitForTimeout(1500);
    }
  } catch(e) { console.log('  hero upload:', e.message); }
  await shot(page, 'form_step2_colores_imagenes', 2000);

  await page.click('.btn-next');
  await page.waitForTimeout(2000);

  // ── PASO 3: Servicios
  console.log('\n💼 Step 3: Services...');
  await shot(page, 'form_step3_servicios_vacio', 1500);

  // Add services
  const services = [
    { name: 'Bano Premium', desc: 'Bano completo con productos organicos, secado y perfume', price: '45', dur: '60' },
    { name: 'Corte & Estilo', desc: 'Corte profesional segun la raza de tu mascota', price: '55', dur: '90' },
    { name: 'Spa Completo', desc: 'Bano + Corte + Masaje relajante + Aromaterapia', price: '85', dur: '120' },
    { name: 'Tratamiento Organico', desc: 'Mascarilla hidratante de aloe vera y aceite de coco', price: '35', dur: '45' },
  ];

  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    if (i > 0) {
      try { await page.click('#addSvcBtn'); await page.waitForTimeout(800); } catch(e) {}
    }
    try {
      const svcInputs = await page.$$('.svc-name, [placeholder*="nombre"], [placeholder*="servicio"]');
      const priceInputs = await page.$$('.svc-price, [placeholder*="precio"], [placeholder*="price"]');
      const descInputs = await page.$$('.svc-desc, [placeholder*="descrip"]');
      if (svcInputs[i]) await svcInputs[i].fill(s.name);
      if (priceInputs[i]) await priceInputs[i].fill(s.price);
      if (descInputs[i]) await descInputs[i].fill(s.desc);
    } catch(e) {}

    // Upload service image
    try {
      const imgs = [
        `${IMGS}/dog_groomed.jpg`,
        `${IMGS}/dog_haircut.jpg`,
        `${IMGS}/products.jpg`,
        `${IMGS}/salon_interior.jpg`
      ];
      const fileInputs = await page.$$('input[type="file"]');
      if (fileInputs[i]) {
        await fileInputs[i].setInputFiles(imgs[i]);
        await page.waitForTimeout(800);
      }
    } catch(e) {}
  }
  await shot(page, 'form_step3_servicios_llenados', 2500);

  await page.click('.btn-next');
  await page.waitForTimeout(2000);

  // ── PASO 4: Pagos & Productos
  console.log('\n💳 Step 4: Payments & Products...');
  await shot(page, 'form_step4_pagos', 2000);

  try {
    const payInputs = await page.$$('input[placeholder*="paypal"], input[placeholder*="PayPal"]');
    if (payInputs.length) await payInputs[0].fill('bellapawsspa@paypal.com');
    const venmoInputs = await page.$$('input[placeholder*="venmo"], input[placeholder*="Venmo"], input[placeholder*="@"]');
    if (venmoInputs.length) await venmoInputs[0].fill('@BellaPawsSpa');
  } catch(e) {}
  await shot(page, 'form_step4_pagos_llenados', 1500);

  await page.click('.btn-next');
  await page.waitForTimeout(2000);

  // ── PASO 5: Galeria
  console.log('\n🖼️  Step 5: Gallery...');
  await shot(page, 'form_step5_galeria', 1500);

  try {
    const gallerySlots = await page.$$('.slot-action-btn.change');
    const galleryImgs = [
      `${IMGS}/hero.jpg`,
      `${IMGS}/dog_groomed.jpg`,
      `${IMGS}/dog_haircut.jpg`,
      `${IMGS}/products.jpg`,
      `${IMGS}/salon_interior.jpg`,
    ];
    // Upload via file inputs directly
    const fileInputs = await page.$$('input[type="file"]');
    for (let i = 0; i < Math.min(fileInputs.length, galleryImgs.length); i++) {
      await fileInputs[i].setInputFiles(galleryImgs[i]);
      await page.waitForTimeout(600);
    }
  } catch(e) {}
  await shot(page, 'form_step5_galeria_llenada', 2500);

  await page.click('.btn-next');
  await page.waitForTimeout(2000);

  // ── PASO 6: Contacto & Horarios
  console.log('\n📞 Step 6: Contact & Hours...');
  await shot(page, 'form_step6_contacto', 1500);

  try {
    const contactInputs = await page.$$('input[type="tel"], input[placeholder*="telefono"], input[placeholder*="phone"], input[placeholder*="whatsapp"]');
    if (contactInputs.length) await contactInputs[0].fill('+1 305 555 0199');

    const addressInput = await page.$('input[placeholder*="direcc"], input[placeholder*="address"]');
    if (addressInput) await addressInput.fill('1234 Brickell Ave, Miami, FL 33131');

    const websiteInput = await page.$('input[placeholder*="web"], input[placeholder*="http"]');
    if (websiteInput) await websiteInput.fill('https://bellapawsspa.com');

    const instInput = await page.$('input[placeholder*="instagram"], input[placeholder*="@insta"]');
    if (instInput) await instInput.fill('@bellapawsspa');
  } catch(e) {}
  await shot(page, 'form_step6_contacto_llenado', 2000);

  await page.click('.btn-next');
  await page.waitForTimeout(2000);

  // ── PASO 7: IA & Activar
  console.log('\n🤖 Step 7: AI & Activate...');
  await shot(page, 'form_step7_ia_activar', 2000);

  // Click AI buttons to auto-generate content
  try {
    const aiBtns = await page.$$('.btn-ai');
    if (aiBtns.length > 0) {
      await aiBtns[0].click(); // Generate description
      await page.waitForTimeout(3000);
      await shot(page, 'form_step7_ia_generando', 2000);
    }
  } catch(e) {}

  await shot(page, 'form_step7_listo_activar', 1500);

  // ── ACTIVAR BOT!
  console.log('\n🚀 Activating bot...');
  await page.click('#activateBtn');
  await page.waitForTimeout(8000); // Wait for bot generation

  await shot(page, 'form_step8_bot_generado', 3000);

  // Capture full success screen
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, 'form_step8_success_top', 2000);
  await page.evaluate(() => window.scrollTo(0, 400));
  await shot(page, 'form_step8_success_links', 2000);

  // Get the generated bot ID from URL or page
  const botLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="agent"], a[href*="card"], input[value*="agent"], input[value*="card"]'));
    return links.map(l => l.href || l.value || l.textContent).filter(Boolean);
  });
  console.log('  Bot links found:', botLinks);

  // Get bot ID from copy button or visible text
  const botId = await page.evaluate(() => {
    const copyBtn = document.querySelector('#copyAgentBtn');
    const allText = document.body.innerText;
    const match = allText.match(/agent\.html\?id=([a-z0-9-]+)/);
    return match ? match[1] : null;
  });
  console.log('  Bot ID:', botId);
  fs.writeFileSync(`${OUT}/bot_id.txt`, botId || '');

  await browser.close();

  const shots = fs.readdirSync(OUT).filter(f => f.endsWith('.png')).sort();
  console.log(`\n✅ ${shots.length} screenshots captured:`);
  shots.forEach(s => console.log('  -', s));
  console.log('\nBot ID saved to bot_id.txt');
})();
