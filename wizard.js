/**
 * ═══════════════════════════════════════════════════════════════
 *  SUPER BOT 007 — WIZARD VOICE AGENT  v1.0
 *  Universal overlay component for all pages
 *
 *  Usage: Add to any page:
 *    <script src="wizard.js"></script>
 *
 *  Optional context (set BEFORE the script tag):
 *    window.WIZARD_CONTEXT = {
 *      page: 'form',        // sales|form|editor|landing
 *      step: 1,             // current form step (1-7)
 *      language: 'es',      // es|en (auto-detected if omitted)
 *      agentName: 'Amanda', // Amanda|Shirley
 *      businessType: ''     // filled when client mentions it
 *    }
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  /* ── KEYS & VOICES (same as salespage) ── */
  const OA_KEY     = atob('c2stcHJvai1fTG11NFZfY3I5VEdVLV83QTBXYnNma0xmUjAyOFkwY1JtbnVnSUhrckxOUDRrcC1EeVB4bjZfMEgwMTFDenV5MzVjQW9DTjltOFQzQmxia0ZKR0VoV2NtMjlaQng5bGhXdFQyT2t0aWRyOHVEcHRYYVFEZ3JmQ001Qm9XSkgtcGhiY0N1ejVIZXBmOEFVTEh3VGxKQlcwWG5sSUE=');
  const EL_KEY     = atob('ZGY0YTliZTg4NTUwNDM0MDI0MmIyZDFlZjk4ZjA1NDM3MDJiNmM1ZmRlOTc4MzJkYmRjNjcwZDYyNTE1MzBiYw==');
  // 🎙️ VOICES — updated for best quality per language
  const EL_VOICE_ES = 'pFZP5JQG7iQjIQuC4Bku'; // Lily/Valentina — multilingual, sounds great in Spanish
  const EL_VOICE_EN = 'XrExE9yKIg1WjnnlVkGX'; // Matilda — warm, American, natural (replaces Shirley)
  const EL_MODEL_ES  = 'eleven_multilingual_v2'; // Better Spanish pronunciation
  const EL_MODEL_EN  = 'eleven_flash_v2_5';      // Fast & clear English
  const EL_MODEL     = 'eleven_flash_v2_5';      // default fallback

  /* ── DETECT LANGUAGE ── */
  function detectBrowserLang() {
    const lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    return lang.startsWith('es') ? 'es' : 'en';
  }

  /* ── CONTEXT ── */
  const CTX = window.WIZARD_CONTEXT || {};
  const PAGE = CTX.page || 'sales';
  let   LANG = CTX.language || detectBrowserLang();
  const IS_ES = () => LANG === 'es';

  /* ── AGENTS ── */
  const AGENTS = {
    es: { name: 'Amanda', emoji: '🧙‍♀️', lang: 'es', voice: EL_VOICE_ES,
          welcome: '¡Hola! Soy Amanda, tu guía personal de Super Bot 007. Estoy aquí para ayudarte a crear tu bot perfecto paso a paso. ¿Empezamos? 🚀',
          color: '#ff4500' },
    en: { name: 'Matilda', emoji: '🧙‍♀️', lang: 'en', voice: EL_VOICE_EN,
          welcome: "Hi! I'm Matilda, your personal Super Bot 007 guide. I'll walk you through every step so your bot is ready in minutes. Let's do this! 🚀",
          color: '#ff0099' }
  };

  /* ── KNOWLEDGE BASE ── */
  const KB = {
    es: {
      product: 'Super Bot 007 crea un bot IA con GPT-4, landing page cinematic, pagos (PayPal, Stripe, Zelle, Venmo, CashApp), Google Calendar para citas reales, WhatsApp integrado y tarjeta digital con QR — todo sin código, en 5 minutos.',
      price: '3 planes: Starter $19.99/mes (bot + landing + tarjeta + editor), Pro $49/mes (todo activado + Calendar + pagos + WhatsApp), Agencia $99/mes (bots ilimitados + white-label). Precio de introducción — sube sin aviso.',
      guarantee: 'Tienes 30 días de garantía total. Si no estás satisfecho, te devolvemos el dinero completo sin preguntas.',
      howlong: 'En solo 5 minutos puedes tener tu bot listo. El proceso tiene 7 pasos súper sencillos guiados paso a paso.',
      whatsapp: 'Tu bot se conecta a WhatsApp automáticamente. El sistema genera el webhook — solo lo pegas en Twilio y listo. Las notificaciones de citas llegan directo a tu WhatsApp.',
      calendar: 'Integración nativa con Google Calendar. El bot agenda citas reales con duración personalizada, tiempo de anticipación y mensaje de confirmación automático. Las citas aparecen en tu Google Calendar al instante.',
      payments: 'Acepta pagos con PayPal, Stripe, Zelle, Venmo y CashApp — los 5 métodos populares, sin comisión adicional nuestra. Solo necesitas configurar tu cuenta en el paso 4.',
      agency: 'Con Super Bot 007 puedes crear bots para clientes y cobrar $50-$200/mes por cada uno. Con 5 clientes = $250-$1,000/mes de ingreso recurrente. Incluye licencia comercial completa.',
      businesses: 'Funciona para cualquier negocio: barberías, restaurantes, clínicas, gimnasios, spas, tiendas, abogados, fotógrafos, hoteles, dentistas, coaches y más.',
      cancel: 'Cancelas cuando quieras. Sin contratos ni penalizaciones. Sin letra pequeña.',
      security: 'Tu información está protegida con SSL y alojada en Google Firebase con 99.9% de uptime.',
      worldwide: 'Funciona en cualquier país. Acepta pagos internacionales y el bot es bilingüe español/inglés nativo.',
      try: 'Puedes configurar TODO tu bot gratis — bot, landing page, tarjeta digital — y verlo funcionando al 100%. Solo necesitas activar el plan ($19.99/mes) para poder compartirlo con tus clientes.',
      barbershop: 'Para una barbería: el bot agenda citas con Google Calendar, muestra servicios y precios, notifica al dueño por WhatsApp y acepta pagos por adelantado con PayPal/Zelle.',
      restaurant: 'Para un restaurante: el bot muestra el menú completo, toma reservaciones con Google Calendar, responde sobre horarios y promueve promociones especiales.',
      clinic: 'Para una clínica: el bot agenda consultas con Google Calendar, informa sobre especialistas y servicios, envía recordatorios por WhatsApp y acepta pagos con Stripe.',
      gym: 'Para un gimnasio: el bot muestra planes de membresía, agenda clases, acepta pagos mensuales con PayPal y responde sobre horarios e instructores.',
      store: 'Para una tienda: el bot muestra catálogo de productos, acepta pagos con los 5 métodos, responde sobre disponibilidad y envío.',
      salon: 'Para un salón de belleza: el bot agenda citas con Google Calendar, muestra servicios con fotos y precios, envía recordatorios y acepta pagos con Venmo o PayPal.',
      spa: 'Para un spa: el bot muestra tratamientos con descripciones detalladas, agenda sesiones con Google Calendar y envía recordatorios automáticos por WhatsApp.',
      lawyer: 'Para un abogado: el bot califica prospectos, agenda consultas iniciales con Google Calendar, responde preguntas frecuentes y acepta pagos de consulta con Zelle o PayPal.',
      realEstate: 'Para bienes raíces: el bot muestra propiedades con fotos, califica compradores con preguntas inteligentes y agenda visitas con Google Calendar.',
      childcare: 'Para una guardería: el bot informa sobre programas, acepta inscripciones con pagos vía PayPal, responde a padres 24/7 y agenda entrevistas.',
      ecommerce: 'Para e-commerce: el bot muestra catálogo, procesa pedidos con PayPal o Stripe, confirma compras por WhatsApp y hace seguimiento de envíos.',
    },
    en: {
      product: 'Super Bot 007 creates a GPT-4 AI bot, cinematic landing page, payments (PayPal, Stripe, Zelle, Venmo, CashApp), Google Calendar for real appointments, integrated WhatsApp, and digital card with QR — all no-code, in 5 minutes.',
      price: '3 plans: Starter $19.99/mo (bot + landing + card + editor), Pro $49/mo (everything + Calendar + payments + WhatsApp), Agency $99/mo (unlimited bots + white-label). Intro price — goes up without notice.',
      guarantee: 'You get a full 30-day money-back guarantee. Not satisfied? Full refund, no questions asked.',
      howlong: 'In just 5 minutes your bot can be live. There are 7 super simple steps, guided one by one.',
      whatsapp: 'Your bot connects to WhatsApp automatically. The system generates the webhook — just paste it in Twilio and done. Appointment notifications go straight to your WhatsApp.',
      calendar: 'Native Google Calendar integration. The bot books real appointments with custom duration, notice period, and automatic confirmation message. Appointments appear in your Google Calendar instantly.',
      payments: 'Accept payments with PayPal, Stripe, Zelle, Venmo, and CashApp — all 5 popular methods, no extra commission from us. Just configure your account in step 4.',
      agency: 'With Super Bot 007 you can create bots for clients and charge $50-$200/month each. With 5 clients = $250-$1,000/month recurring income. Full commercial license included.',
      businesses: 'Works for any business: barbershops, restaurants, clinics, gyms, spas, stores, lawyers, photographers, hotels, dentists, coaches and more.',
      cancel: 'Cancel anytime. No contracts, no penalties. No fine print.',
      security: 'Your data is SSL-protected and hosted on Google Firebase with 99.9% uptime.',
      worldwide: 'Works in any country. Accepts international payments and the bot is natively bilingual Spanish/English.',
      try: 'You can configure your entire bot for free — bot, landing page, digital card — and see it working 100%. You only need to activate a plan ($19.99/mo) to share it with your clients.',
      barbershop: 'For a barbershop: the bot books appointments with Google Calendar, shows services and pricing, notifies the owner via WhatsApp, and accepts advance payments with PayPal/Zelle.',
      restaurant: 'For a restaurant: the bot shows the full menu, takes reservations with Google Calendar, answers hours questions, and promotes specials.',
      clinic: 'For a clinic: the bot schedules consultations with Google Calendar, informs about specialists and services, sends WhatsApp reminders, and accepts payments with Stripe.',
      gym: 'For a gym: the bot shows membership plans, schedules classes, accepts monthly payments with PayPal, and answers questions about hours and trainers.',
      store: 'For a store: the bot shows the product catalog, accepts payments with all 5 methods, and answers availability and shipping questions.',
      salon: 'For a beauty salon: the bot books appointments with Google Calendar, shows services with photos and pricing, sends reminders, and accepts payments with Venmo or PayPal.',
      spa: 'For a spa: the bot shows treatments with detailed descriptions, books sessions with Google Calendar, and sends automatic WhatsApp reminders.',
      lawyer: 'For a lawyer: the bot qualifies leads, schedules initial consultations with Google Calendar, answers FAQs, and accepts consultation payments with Zelle or PayPal.',
      realEstate: 'For real estate: the bot showcases properties with photos, qualifies buyers with smart questions, and schedules viewings with Google Calendar.',
      childcare: 'For a daycare: the bot informs about programs, accepts enrollments with PayPal payments, answers parents 24/7, and schedules interviews.',
      ecommerce: 'For e-commerce: the bot showcases catalog, processes orders with PayPal or Stripe, confirms purchases via WhatsApp, and tracks shipments.',
    }
  };

  /* ── STEP SCRIPTS ── */
  const STEP_SCRIPTS = {
    es: {
      1: `Perfecto, empecemos con el primer paso. Esta sección es para que el bot te conozca — necesito saber el nombre de tu negocio, el tipo de negocio que tienes y en qué ciudad estás. Lo más importante aquí es la descripción: mientras más detallada sea, mejor va a responder tu bot a tus clientes, así que tómate tu tiempo para escribirla bien. También vas a poner el título principal y subtítulo que verán tus clientes al entrar a tu landing page, el mensaje de bienvenida de tu bot, y si quieres, la URL de una foto para el avatar del bot. Llena todos los campos y cuando termines esta sección, aprieta Next y yo aparezco para seguir guiándote.`,
      2: `Excelente, llegamos al paso de diseño. Esta sección va a definir la apariencia visual de tu landing page y tu tarjeta digital — los colores primario, secundario, de acento y el fondo. No te preocupes si no estás seguro de los colores ahora mismo, porque una vez que tu bot esté listo puedes cambiarlos cuando quieras en el editor visual. También aquí subes tu logo — puedes arrastrarlo directamente o pegar la URL si lo tienes en línea. Y la imagen principal de tu landing page, que es la foto grande que tus clientes ven al entrar. Por último el título y subtítulo de tu sección de servicios. Llena lo que puedas y cuando termines esta sección, aprieta Next y yo aparezco para seguir guiándote.`,
      3: `Muy bien, ahora vamos con tus servicios. Esta sección está diseñada para listar todo lo que ofrece tu negocio — con nombre, precio y descripción de cada servicio. Te recomiendo que la descripción de cada servicio sea lo más detallada posible, porque es exactamente lo que tu bot va a decirle a tus clientes cuando pregunten. Puedes agregar hasta 8 servicios. Si prefieres, en el último paso también puedes generarlos automáticamente con inteligencia artificial. Agrega al menos uno y cuando termines esta sección, aprieta Next y yo aparezco para seguir guiándote.`,
      4: `Ahora llegamos a la sección de pagos. Esta parte es donde configuras cómo quieres cobrar — tienes PayPal, Stripe, Zelle, Venmo y CashApp disponibles. Activa los que uses y llena tu información de pago. Si no vendes productos físicos también puedes saltar este paso. Con el Plan Pro todos los métodos de pago quedan activos y conectados al bot. Cuando termines esta sección, aprieta Next y yo aparezco para seguir guiándote.`,
      5: `Llegamos a la galería de fotos. Aquí subes las imágenes que tus clientes van a ver cuando visiten tu landing page — fotos reales de tu negocio, de tu trabajo, de tu local. Puedes subir hasta 8 fotos, ya sea desde tu librería de archivos o pegando la URL directa de cada imagen. Entre más reales y de calidad sean las fotos, mejor impresión le das a tus clientes. Llena lo que puedas y cuando termines esta sección, aprieta Next y yo aparezco para seguir guiándote.`,
      6: `Perfecto, ahora el paso de contacto, horarios y Google Calendar. Aquí pones tu teléfono, WhatsApp con código de país, email y dirección. También puedes activar Google Calendar para que el bot agende citas reales directamente en tu calendario — solo necesitas tu Google Calendar ID. Y tu horario de atención activando cada día que trabajas. Cuando termines esta sección, aprieta Next y yo aparezco para seguir guiándote.`,
      7: `Llegamos al último paso. Aquí seleccionas el idioma del bot, puedes agregar una instrucción especial, y tienes botones para generar automáticamente con IA tu descripción, servicios, testimonios y preguntas frecuentes. Para mejores resultados asegúrate de haber escrito una buena descripción en el paso 1. Cuando todo esté listo, presiona Activar Bot 007 y tu bot estará funcionando al 100%.`,
      8: `¡Felicidades! Tu bot está activo y funcionando. Configura el plan para compartir tus enlaces con tus clientes. Recuerda que puedes cambiar cualquier cosa — colores, imágenes, textos, servicios — en el editor visual cuando quieras. ¡Empezaste algo increíble!`,
    },
    en: {
      1: `Perfect, let's start with step one. This section is so the bot gets to know your business — I need your business name, type, and city. The most important part is the description: the more detailed it is, the better your bot answers clients. You'll also set the title, subtitle, welcome message, and optionally a bot avatar photo URL. Fill everything in and when you're done with this section, press Next and I'll be right here to guide you through the next step.`,
      2: `Excellent, now the design step. This defines the visual look of your landing page and digital card — primary, secondary, accent, and background colors. Don't worry about colors now — you can change them anytime in the visual editor. You'll also upload your logo and main landing page image. Fill in what you can and when you're done with this section, press Next and I'll be right here to guide you through the next step.`,
      3: `Great, now your services. List everything your business offers — name, price, and description for each. Make descriptions as detailed as possible — that's exactly what your bot tells clients when they ask. Add at least one and when you're done with this section, press Next and I'll be right here to guide you through the next step.`,
      4: `Now the payments section. Configure how you want to get paid — PayPal, Stripe, Zelle, Venmo, and CashApp are all available. Enable the ones you use and fill in your payment info. With the Pro Plan all payment methods are active and connected to the bot. When you're done with this section, press Next and I'll be right here to guide you through the next step.`,
      5: `Now the photo gallery. Upload images your clients will see — real photos of your business, work, and space. Up to 8 photos from files or direct URLs. The more real and high-quality, the better impression you make. Fill in what you can and when you're done with this section, press Next and I'll be right here to guide you through the next step.`,
      6: `Perfect, now contact, hours, and Google Calendar. Enter your phone, WhatsApp with country code, email, and address. You can also activate Google Calendar so the bot books real appointments directly in your calendar — just need your Google Calendar ID. Set your business hours too. When you're done with this section, press Next and I'll be right here to guide you through the next step.`,
      7: `Last step! Select the bot language, add any special instruction, and use the AI buttons to auto-generate your description, services, testimonials, and FAQs. For best results make sure you wrote a good description in step 1. When ready, press Activate Bot 007 and your bot goes live 100%.`,
      8: `Congratulations! Your bot is live and active. Activate your plan to share your links with clients. Remember you can change anything — colors, images, text, services — in the visual editor anytime. You've started something amazing!`,
    }
  };

  /* ── PAGE INTROS ── */
  /* Sales page: lead with the 2 psychological questions */
  const PAGE_INTROS = {
    es: {
      sales: '¿Tienes un negocio que necesita más clientes? Si la respuesta es sí, tengo algo que te va a encantar. Soy Amanda, tu guía de Super Bot 007. Cuéntame — ¿qué tipo de negocio tienes?',
      form: 'Hola, soy Amanda. Estoy aquí para acompañarte en crear tu primer bot. Son 7 pasos — yo te explico cada uno. Cuando termines un paso, dime "listo" y avanzamos juntos. ¡Empecemos!',
      editor: 'Hola, soy Amanda. Estás en el editor visual — aquí puedes cambiar colores, imágenes y textos en tiempo real. ¿Qué quieres personalizar?',
      landing: 'Hola, soy Amanda. Esta es la landing page de tu negocio creada con Super Bot 007. ¿Te puedo ayudar con algo?',
    },
    en: {
      sales: 'Do you have a business that needs more clients? If the answer is yes, I have something you\'re going to love. I\'m Shirley, your Super Bot 007 guide. Tell me — what type of business do you have?',
      form: "Hi, I'm Shirley. I'm here to help you create your first bot. There are 7 steps — I'll explain each one. When you finish a step, just say \"done\" and we'll move forward together. Let's go!",
      editor: "Hi, I'm Shirley. You're in the visual editor — change colors, images and text in real time. What would you like to customize?",
      landing: "Hi, I'm Shirley. This is your business landing page created with Super Bot 007. Can I help you with anything?",
    }
  };

  /* ── 2-QUESTION FUNNEL STATE (sales page only) ── */
  let _q2State = 0; // 0=not started, 1=asked Q1 (biz type), 2=asked Q2 (automate)


  let isOpen       = false;
  let isListening  = false;
  let isSpeaking   = false;
  let recognition  = null;
  let audioCtx     = null;
  let currentAudio = null;
  let inactivityTimer = null;
  let chatHistory  = [];
  let currentStep  = CTX.step || 1;
  let businessType = CTX.businessType || '';
  let hasGreeted   = false;

  /* ── GET AGENT ── */
  function agent() { return AGENTS[LANG]; }

  /* ── INJECT CSS ── */
  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'wz-styles';
    style.textContent = `
      /* ═══ WIZARD OVERLAY ═══ */
      /* ── CTA Banner ── */
      #wz-cta-banner {
        position: fixed;
        bottom: 108px;
        right: 18px;
        z-index: 99989;
        background: linear-gradient(135deg,#ff4500,#ff0099);
        color: #fff;
        padding: .55rem 1rem .55rem .9rem;
        border-radius: 14px;
        font-size: .78rem;
        font-weight: 800;
        font-family: 'Inter',sans-serif;
        max-width: 220px;
        text-align: center;
        box-shadow: 0 6px 28px rgba(255,0,153,.5);
        cursor: pointer;
        animation: wz-cta-bounce .6s ease-in-out infinite alternate;
        transition: opacity .4s, transform .4s;
        line-height: 1.35;
      }
      #wz-cta-banner::after {
        content: '';
        position: absolute;
        bottom: -8px;
        right: 36px;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid #ff0099;
      }
      #wz-cta-banner.hidden {
        opacity: 0;
        transform: translateY(12px) scale(.95);
        pointer-events: none;
      }
      @keyframes wz-cta-bounce {
        from { transform: translateY(0); }
        to   { transform: translateY(-5px); }
      }
      #wz-btn {
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 99990;
        width: 86px;
        height: 86px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff4500, #ff0099);
        border: 3px solid rgba(255,255,255,.25);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.2rem;
        box-shadow: 0 8px 32px rgba(255,69,0,.7), 0 0 0 0 rgba(255,0,153,.4), inset 0 1px 0 rgba(255,255,255,.2);
        animation: wz-pulse 2s ease-in-out infinite;
        transition: transform .2s, box-shadow .2s;
      }
      #wz-btn:hover { transform: scale(1.12); box-shadow: 0 12px 42px rgba(255,69,0,.9), 0 0 24px rgba(255,0,153,.6); }
      #wz-btn.open  { animation: none; background: linear-gradient(135deg,#ef4444,#dc2626); border-color: rgba(255,255,255,.2); }
      /* Label under button */
      #wz-btn::after {
        content: attr(data-label);
        position: absolute;
        bottom: -22px;
        left: 50%; transform: translateX(-50%);
        white-space: nowrap;
        font-size: .65rem;
        font-weight: 800;
        letter-spacing: .06em;
        color: rgba(255,69,0,.95);
        text-transform: uppercase;
        font-family: 'Inter', sans-serif;
      }
      #wz-btn.open::after { content: ''; }
      #wz-btn .wz-notify {
        position: absolute;
        top: -2px; right: -2px;
        width: 20px; height: 20px;
        background: #00c853;
        border-radius: 50%;
        border: 3px solid #0a0a0f;
        animation: wz-ndot 1.4s infinite;
        display: flex; align-items: center; justify-content: center;
        font-size: .55rem; color: #fff; font-weight: 900;
      }
      @keyframes wz-pulse {
        0%,100% { box-shadow: 0 8px 32px rgba(255,69,0,.65), 0 0 0 0 rgba(255,0,153,.5); }
        50%      { box-shadow: 0 8px 48px rgba(255,69,0,.9),  0 0 0 18px rgba(255,0,153,0); }
      }
      @keyframes wz-ndot {
        0%   { box-shadow: 0 0 0 0 rgba(0,200,83,.7); }
        70%  { box-shadow: 0 0 0 10px rgba(0,200,83,0); }
        100% { box-shadow: 0 0 0 0 rgba(0,200,83,0); }
      }
      /* Step indicator on button */
      #wz-step-badge {
        position: absolute;
        top: -4px; left: -4px;
        width: 24px; height: 24px;
        background: linear-gradient(135deg,#f59e0b,#f97316);
        border-radius: 50%;
        border: 2px solid #0a0a0f;
        font-size: .65rem; font-weight: 900;
        color: #fff;
        display: none; align-items: center; justify-content: center;
        font-family: 'Inter', sans-serif;
      }
      #wz-step-badge.show { display: flex; }

      /* ═══ PANEL ═══ */
      #wz-panel {
        position: fixed;
        bottom: 130px;
        right: 28px;
        z-index: 99989;
        width: 380px;
        max-width: calc(100vw - 32px);
        max-height: 580px;
        background: linear-gradient(180deg, #0d0d1f 0%, #0a0a14 100%);
        border: 1px solid rgba(255,0,153,.35);
        border-radius: 22px;
        box-shadow: 0 24px 80px rgba(0,0,0,.8), 0 0 60px rgba(255,69,0,.18), 0 0 40px rgba(255,0,153,.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform: scale(.92) translateY(20px);
        opacity: 0;
        pointer-events: none;
        transition: transform .28s cubic-bezier(.34,1.56,.64,1), opacity .22s ease;
      }
      #wz-panel.visible {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: all;
      }

      /* HEADER */
      #wz-header {
        display: flex;
        align-items: center;
        gap: .7rem;
        padding: .8rem 1rem;
        background: rgba(255,69,0,.08);
        border-bottom: 1px solid rgba(255,0,153,.2);
        flex-shrink: 0;
      }
      .wz-avatar {
        width: 42px; height: 42px;
        border-radius: 50%;
        background: linear-gradient(135deg,#ff4500,#ff0099);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.3rem; flex-shrink: 0;
        position: relative;
      }
      .wz-avatar-dot {
        position: absolute; bottom: 1px; right: 1px;
        width: 11px; height: 11px;
        background: #00c853;
        border-radius: 50%;
        border: 2px solid #0f0f1a;
      }
      .wz-hinfo { flex: 1; }
      .wz-hname { font-size: .9rem; font-weight: 800; color: #f0f0ff; }
      .wz-hstatus { font-size: .65rem; color: rgba(0,200,83,.85); font-weight: 600; display: flex; align-items: center; gap: .3rem; }
      .wz-hstatus::before { content: ''; width: 6px; height: 6px; background: #00c853; border-radius: 50%; display: inline-block; }
      #wz-lang-toggle {
        background: rgba(255,69,0,.15);
        border: 1px solid rgba(255,0,153,.3);
        border-radius: 8px;
        color: #ff6b6b;
        font-size: .72rem;
        font-weight: 700;
        padding: .3rem .6rem;
        cursor: pointer;
        flex-shrink: 0;
        transition: all .2s;
      }
      #wz-lang-toggle:hover { background: rgba(255,69,0,.25); }

      /* MESSAGES */
      #wz-msgs {
        flex: 1;
        overflow-y: auto;
        padding: .9rem;
        display: flex;
        flex-direction: column;
        gap: .6rem;
        min-height: 0;
      }
      #wz-msgs::-webkit-scrollbar { width: 4px; }
      #wz-msgs::-webkit-scrollbar-thumb { background: rgba(255,69,0,.35); border-radius: 2px; }

      .wz-msg {
        max-width: 86%;
        padding: .65rem .85rem;
        border-radius: 16px;
        font-size: .82rem;
        line-height: 1.6;
        animation: wz-pop .25s ease both;
      }
      @keyframes wz-pop { from { opacity:0; transform:scale(.92) translateY(8px); } to { opacity:1; transform:none; } }
      .wz-msg.agent {
        align-self: flex-start;
        background: linear-gradient(135deg,rgba(255,69,0,.12),rgba(255,0,153,.06));
        border: 1px solid rgba(255,0,153,.2);
        border-bottom-left-radius: 4px;
        color: #e9edef;
      }
      .wz-msg.user {
        align-self: flex-end;
        background: linear-gradient(135deg,#ff4500,#ff0099);
        color: #fff;
        border-bottom-right-radius: 4px;
      }
      .wz-typing {
        align-self: flex-start;
        display: flex; gap: .32rem; align-items: center;
        padding: .6rem .85rem;
        background: rgba(255,69,0,.08);
        border: 1px solid rgba(255,0,153,.15);
        border-radius: 16px; border-bottom-left-radius: 4px;
        animation: wz-pop .2s ease both;
      }
      .wz-typing span {
        width: 7px; height: 7px; background: #ff4500; border-radius: 50%;
        animation: wz-dots 1.2s infinite;
      }
      .wz-typing span:nth-child(2) { animation-delay: .2s; }
      .wz-typing span:nth-child(3) { animation-delay: .4s; }
      @keyframes wz-dots {
        0%,100% { transform: scale(1); opacity: .4; }
        50%      { transform: scale(1.5); opacity: 1; }
      }

      /* INPUT AREA */
      #wz-input-area {
        padding: .65rem .8rem;
        border-top: 1px solid rgba(255,0,153,.12);
        background: rgba(0,0,0,.2);
        flex-shrink: 0;
      }

      /* VOICE BUTTON — main CTA */
      #wz-mic-btn {
        width: 100%;
        padding: .72rem 1rem;
        background: rgba(0,200,83,.08);
        border: 1.5px solid rgba(0,200,83,.3);
        border-radius: 12px;
        color: #00c853;
        font-size: .82rem;
        font-weight: 700;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: .5rem;
        transition: all .2s;
        margin-bottom: .5rem;
        letter-spacing: .02em;
      }
      #wz-mic-btn:hover { background: rgba(0,200,83,.16); }
      #wz-mic-btn.listening {
        background: rgba(255,71,87,.12);
        border-color: rgba(255,71,87,.5);
        color: #FF4757;
        animation: wz-recpulse .7s ease-in-out infinite;
      }
      #wz-mic-btn.speaking {
        background: rgba(255,69,0,.12);
        border-color: rgba(255,0,153,.5);
        color: #ff6b6b;
        pointer-events: none;
      }
      @keyframes wz-recpulse {
        0%,100% { box-shadow: 0 0 0 0 rgba(255,71,87,.5); }
        50%      { box-shadow: 0 0 0 10px rgba(255,71,87,0); }
      }

      /* TEXT INPUT ROW */
      .wz-text-row {
        display: flex; gap: .4rem; align-items: center;
      }
      #wz-text-inp {
        flex: 1;
        padding: .55rem .8rem;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(255,0,153,.18);
        border-radius: 10px;
        color: #f0f0ff;
        font-family: 'Inter', sans-serif;
        font-size: .82rem;
        outline: none;
        transition: border-color .2s;
      }
      #wz-text-inp:focus { border-color: #ff4500; }
      #wz-text-inp::placeholder { color: rgba(255,100,0,.4); }
      #wz-send-btn {
        width: 36px; height: 36px;
        background: linear-gradient(135deg,#ff4500,#ff0099);
        border: none; border-radius: 10px;
        color: #fff; font-size: .85rem;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: transform .2s;
        flex-shrink: 0;
      }
      #wz-send-btn:hover { transform: scale(1.1); }

      /* WAVE ANIMATION (speaking) */
      #wz-wave {
        display: none;
        align-items: center; gap: 3px;
        height: 20px; margin: 0 auto .4rem;
        justify-content: center;
      }
      #wz-wave.active { display: flex; }
      #wz-wave span {
        width: 4px; border-radius: 2px;
        background: linear-gradient(135deg,#ff4500,#ff0099);
        animation: wz-wave-bar .65s ease-in-out infinite alternate;
      }
      #wz-wave span:nth-child(1) { height: 8px;  animation-delay: 0s; }
      #wz-wave span:nth-child(2) { height: 16px; animation-delay: .08s; }
      #wz-wave span:nth-child(3) { height: 24px; animation-delay: .15s; }
      #wz-wave span:nth-child(4) { height: 16px; animation-delay: .1s; }
      #wz-wave span:nth-child(5) { height: 8px;  animation-delay: .2s; }
      @keyframes wz-wave-bar {
        from { transform: scaleY(.2); opacity: .3; }
        to   { transform: scaleY(1);  opacity: 1; }
      }

      /* MOBILE */
      @media (max-width: 480px) {
        #wz-panel { width: calc(100vw - 24px); right: 12px; bottom: 88px; }
        #wz-btn   { bottom: 16px; right: 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── BUILD UI ── */
  function buildUI() {
    // Floating button
    // CTA Banner
    const banner = document.createElement('div');
    banner.id = 'wz-cta-banner';
    banner.innerHTML = IS_ES()
      ? '🤖 ¡Pulsa el botón y te ayudo <em>paso a paso</em> a construir tu primer bot!'
      : '🤖 Click the button and I\'ll guide you <em>step by step</em> to build your first bot!';
    banner.addEventListener('click', () => { togglePanel(); });
    document.body.appendChild(banner);

    const btn = document.createElement('button');
    btn.id = 'wz-btn';
    btn.setAttribute('aria-label', IS_ES() ? 'Hablar con Amanda' : 'Talk to Shirley');
    btn.setAttribute('data-label', IS_ES() ? '¡Habla conmigo!' : 'Talk to me!');
    btn.innerHTML = `🧙‍♀️<span class="wz-notify">1</span><span id="wz-step-badge"></span>`;
    btn.addEventListener('click', togglePanel);
    document.body.appendChild(btn);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'wz-panel';
    panel.innerHTML = `
      <div id="wz-header">
        <div class="wz-avatar">🧙‍♀️<span class="wz-avatar-dot"></span></div>
        <div class="wz-hinfo">
          <div class="wz-hname" id="wz-agent-name">${agent().name}</div>
          <div class="wz-hstatus" id="wz-status">${IS_ES() ? 'En línea · Lista para ayudarte' : 'Online · Ready to help'}</div>
        </div>
        <button id="wz-lang-toggle" onclick="window.__wzToggleLang && window.__wzToggleLang()" title="Switch language">
          ${IS_ES() ? '🇺🇸 EN' : '🇪🇸 ES'}
        </button>
      </div>

      <div id="wz-msgs"></div>

      <div id="wz-input-area">
        <div id="wz-wave">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <button id="wz-mic-btn" onclick="window.__wzToggleMic && window.__wzToggleMic()">
          <i class="fas fa-microphone"></i>
          <span id="wz-mic-label">${IS_ES() ? '🎙️ Presiona para hablar' : '🎙️ Press to talk'}</span>
        </button>
        <div class="wz-text-row">
          <input id="wz-text-inp"
            placeholder="${IS_ES() ? 'O escribe aquí...' : 'Or type here...'}"
            onkeydown="if(event.key==='Enter') window.__wzSend && window.__wzSend()">
          <button id="wz-send-btn" onclick="window.__wzSend && window.__wzSend()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
  }

  /* ── TOGGLE PANEL ── */
  function togglePanel() {
    unlockAudio(); // unlock on first user gesture
    isOpen = !isOpen;
    const panel  = document.getElementById('wz-panel');
    const btn    = document.getElementById('wz-btn');
    const banner = document.getElementById('wz-cta-banner');
    if (banner) banner.classList.add('hidden'); // hide CTA once user interacts
    if (isOpen) {
      panel.classList.add('visible');
      btn.classList.add('open');
      btn.innerHTML = '<i class="fas fa-times"></i>';
      // Remove notify dot once opened
      const nd = btn.querySelector('.wz-notify');
      if (nd) nd.remove();
      if (!hasGreeted) greet();
      resetInactivityTimer();
    } else {
      panel.classList.remove('visible');
      btn.classList.remove('open');
      btn.innerHTML = `🧙‍♀️`;
      stopListening();
    }
  }

  /* ── GREET ── */
  function greet() {
    hasGreeted = true;
    const intro = PAGE_INTROS[LANG][PAGE] || PAGE_INTROS[LANG].sales;
    addAgentMsg(intro);
    chatHistory = [{ role: 'system', content: buildSystemPrompt() }];

    // On SALES page: start the 2-question funnel — Q1 is embedded in the intro
    if (PAGE === 'sales') {
      _q2State = 1; // waiting for Q1 answer (biz type)
      speak(intro);
      return;
    }

    // On form page: greet, then immediately show & speak the current step explanation
    if (PAGE === 'form') {
      const stepHint = STEP_SCRIPTS[LANG][currentStep];
      if (stepHint) {
        setTimeout(() => {
          addAgentMsg(stepHint);
          speak(stepHint); // speak ONLY the step hint (not the greeting)
        }, 500);
      } else {
        speak(intro); // fallback
      }
      return;
    }
    // Editor page: speak intro
    if (PAGE === 'editor') {
      speak(intro);
    }
    // Sales page: only show text, no auto-speak
  }

  /* ── ADD MESSAGE ── */
  function addAgentMsg(text) {
    const msgs = document.getElementById('wz-msgs');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'wz-msg agent';
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function addUserMsg(text) {
    const msgs = document.getElementById('wz-msgs');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'wz-msg user';
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* ── TYPING INDICATOR ── */
  function showTyping() {
    const msgs = document.getElementById('wz-msgs');
    if (!msgs) return null;
    const t = document.createElement('div');
    t.className = 'wz-typing';
    t.id = 'wz-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
    return t;
  }
  function removeTyping() {
    const t = document.getElementById('wz-typing');
    if (t) t.remove();
  }

  /* ── SYSTEM PROMPT ── */
  function buildSystemPrompt() {
    const a = agent();
    const kb = KB[LANG];
    const stepHints = STEP_SCRIPTS[LANG];
    const stepInfo = currentStep >= 1 && currentStep <= 8
      ? `\nCurrent form step: ${currentStep}. Step hint: "${stepHints[currentStep]}"`
      : '';
    const bizInfo = businessType ? `\nClient's business type: ${businessType}` : '';

    if (IS_ES()) {
      return `Eres Amanda, agente de ventas y guía personal de Super Bot 007.
Personalidad: cálida, profesional, motivadora. Siempre en ESPAÑOL.
Siempre responde directamente a lo que pregunta el cliente.
Página actual: ${PAGE}${stepInfo}${bizInfo}

CONOCIMIENTO DEL PRODUCTO:
- ${kb.product}
- Precio: ${kb.price}
- Garantía: ${kb.guarantee}
- Tiempo de setup: ${kb.howlong}
- WhatsApp: ${kb.whatsapp}
- Google Calendar: ${kb.calendar}
- Pagos: ${kb.payments}
- Modelo Agencia: ${kb.agency}
- Negocios: ${kb.businesses}
- Prueba gratis: ${kb.try}
- Cancelar: ${kb.cancel}
- Seguridad: ${kb.security}
- Internacional: ${kb.worldwide}

RESPUESTAS POR TIPO DE NEGOCIO:
- Barbería: ${kb.barbershop}
- Restaurante: ${kb.restaurant}
- Clínica/médico: ${kb.clinic}
- Gimnasio: ${kb.gym}
- Tienda: ${kb.store}
- Salón de belleza: ${kb.salon}
- Spa: ${kb.spa}
- Abogado: ${kb.lawyer}
- Bienes raíces: ${kb.realEstate}
- Guardería: ${kb.childcare}
- E-commerce: ${kb.ecommerce}

REGLAS ESTRICTAS:
1. SIEMPRE responde la pregunta del cliente directamente
2. Máximo 2-3 oraciones cortas y contundentes
3. Termina SIEMPRE con una pregunta o llamada a la acción
4. Máximo 1 emoji por respuesta
5. Nunca inventes precios ni datos fuera del KB
6. Si el cliente menciona su tipo de negocio, adapta tu respuesta con el ejemplo específico
7. Cuando el cliente quiera crear su bot o llenar el formulario, dile que lo llevas ahora mismo
8. En pasos del formulario: explica EXACTAMENTE qué llenar en el paso actual, sé específico y motivador
9. NUNCA digas "haz click en el link" — tú manejas la navegación
10. Si preguntan precio: menciona los 3 planes ($19.99/$49/$99) y el precio de introducción
11. Si preguntan cómo funciona la prueba gratis: explica que configuran TODO gratis y al compartir activan el plan`;
    } else {
      return `You are Shirley, sales agent and personal guide for Super Bot 007.
Personality: friendly, professional, energetic. Always in ENGLISH.
Always respond directly to what the client is asking.
Current page: ${PAGE}${stepInfo}${bizInfo}

PRODUCT KNOWLEDGE:
- ${kb.product}
- Price: ${kb.price}
- Guarantee: ${kb.guarantee}
- Setup time: ${kb.howlong}
- WhatsApp: ${kb.whatsapp}
- Google Calendar: ${kb.calendar}
- Payments: ${kb.payments}
- Agency model: ${kb.agency}
- Businesses: ${kb.businesses}
- Free trial: ${kb.try}
- Cancel: ${kb.cancel}
- Security: ${kb.security}
- International: ${kb.worldwide}

BUSINESS-TYPE RESPONSES:
- Barbershop: ${kb.barbershop}
- Restaurant: ${kb.restaurant}
- Clinic/medical: ${kb.clinic}
- Gym: ${kb.gym}
- Store: ${kb.store}
- Beauty salon: ${kb.salon}
- Spa: ${kb.spa}
- Lawyer: ${kb.lawyer}
- Real estate: ${kb.realEstate}
- Childcare: ${kb.childcare}
- E-commerce: ${kb.ecommerce}

STRICT RULES:
1. ALWAYS answer the client's question directly
2. Maximum 2-3 short, punchy sentences
3. ALWAYS end with a question or call to action
4. Maximum 1 emoji per response
5. Never invent prices or data outside the KB
6. If the client mentions their business type, adapt with the specific example
7. When the client wants to create their bot, tell them you're taking them there NOW
8. In form steps: explain EXACTLY what to fill in, be specific and encouraging
9. NEVER say "click the link" — you handle navigation automatically
10. If asked about price: mention all 3 plans ($19.99/$49/$99) and intro pricing
11. If asked about free trial: configure everything free, activate plan when sharing`;
    }
  }

  /* ── FORM URL ── */
  const FORM_URL = 'https://apolo189.github.io/superbot007/form.html';

  /* ── INTENT DETECTION: wants to go to form / create bot ── */
  function detectFormIntent(text) {
    const t = text.toLowerCase().replace(/[¡!¿?]/g,'');
    // Broader patterns — partial words and common short phrases
    return (
      /\b(listo|vamos|empezar|empecemos|empieza|empiezo|crear|crea|creo|quiero|quiero.*bot|quiero.*crear|quiero.*empezar|formulario|form|llenar|fill|start|ready|create|build|sign.*up|registr|hacer|activar|activate|hacer.*bot|start.*now|comenzar|comencemos|dale|go ahead|proceed|let.*go|let.*start|ayud|guia|guíame|guiame|start.*creat|build.*bot|now|ahora|si|sí|yes|yeah|sure|ok|okay|claro|andale|órale|orale|por.*favor|porfavor)\b/.test(t)
      && PAGE === 'sales'
    );
  }

  /* ── INTENT: next step in form ── */
  function detectNextStepIntent(text) {
    const t = text.toLowerCase().replace(/[¡!¿?]/g,'');
    return /\b(siguiente|next|continue|continuar|listo|paso.*siguiente|siguiente.*paso|next.*step|step.*next|done|hecho|listo|ya|avanzar|sigue|go.*on|move.*on|forward|adelante|ok|okay|claro|si|sí|yes|yeah|sure)\b/.test(t);
  }

  /* ── SEND MESSAGE ── */
  async function sendMessage(text) {
    if (!text || isSpeaking) return;
    text = text.trim();
    if (!text) return;
    unlockAudio(); // ensure audio is unlocked on send gesture

    addUserMsg(text);
    chatHistory.push({ role: 'user', content: text });
    resetInactivityTimer();

    // Detect business type from user input
    detectBusinessType(text);

    /* ── 2-QUESTION PSYCHOLOGICAL FUNNEL (sales page only) ── */
    if (PAGE === 'sales' && !detectFormIntent(text)) {
      const t = text.toLowerCase();

      // Q1 answered: they told us their biz type → ask Q2
      if (_q2State === 1) {
        _q2State = 2;
        // Detect biz type and give personalized hook
        detectBusinessType(text);
        const bizHook = businessType ? KB[LANG][businessType] || '' : '';
        const q2 = IS_ES()
          ? `¡Perfecto! ${bizHook ? 'Para ese tipo de negocio tu bot puede hacer maravillas. ' : ''}Segunda pregunta: ¿Te gustaría automatizar ese negocio y atender clientes 24/7 por menos de $1 al día? 🤔`
          : `Perfect! ${bizHook ? 'For that type of business your bot can do wonders. ' : ''}Second question: Would you like to automate that business and serve clients 24/7 for less than $1 a day? 🤔`;
        addAgentMsg(q2);
        speak(q2);
        chatHistory.push({ role: 'assistant', content: q2 });
        return;
      }

      // Q2 answered with "yes" → take them to form with excitement
      if (_q2State === 2 && /\b(si|sí|yes|yeah|sure|claro|ok|okay|quiero|dale|vamos|por.*supuesto|of course|definitely|absolutely|obvio|obviam|por.*favor)\b/.test(t)) {
        _q2State = 0;
        const goMsg = IS_ES()
          ? '¡Eso es exactamente lo que hace SuperBot007! 🔥 Te llevo ahora mismo a crear tu bot gratis — en 5 minutos lo ves funcionando con TU negocio. ¡Vamos!'
          : 'That\'s exactly what SuperBot007 does! 🔥 Taking you now to create your free bot — in 5 minutes you\'ll see it working with YOUR business. Let\'s go!';
        addAgentMsg(goMsg);
        speak(goMsg);
        chatHistory.push({ role: 'assistant', content: goMsg });
        setTimeout(() => { window.location.href = FORM_URL; }, 2800);
        return;
      }

      // Q2 answered with "no" or doubt → overcome objection then redirect
      if (_q2State === 2 && /\b(no|nop|nope|no.*creo|no.*sé|not sure|maybe|tal vez|quizas|quizás|depende)\b/.test(t)) {
        _q2State = 0;
        const objMsg = IS_ES()
          ? 'Lo entiendo. ¿Sabes qué? Puedes configurarlo todo GRATIS primero — sin tarjeta, sin compromiso. Lo ves funcionando y decides. ¿Te parece? 🙂'
          : 'I understand. You know what? You can set everything up FREE first — no card, no commitment. See it working and then decide. Sound good? 🙂';
        addAgentMsg(objMsg);
        speak(objMsg);
        chatHistory.push({ role: 'assistant', content: objMsg });
        _q2State = 3; // waiting for final yes after objection
        return;
      }

      // After objection handling, any positive → send to form
      if (_q2State === 3 && /\b(si|sí|yes|yeah|sure|claro|ok|okay|dale|vamos|por.*supuesto|of course|bueno|suena bien|sounds good|perfecto|listo|empezar|start|go|create|crear)\b/.test(t)) {
        _q2State = 0;
        const finalMsg = IS_ES()
          ? '¡Genial! Te llevo ahora. ¡En 5 minutos tienes tu bot listo! 🚀'
          : 'Great! Taking you there now. In 5 minutes your bot will be live! 🚀';
        addAgentMsg(finalMsg);
        speak(finalMsg);
        chatHistory.push({ role: 'assistant', content: finalMsg });
        setTimeout(() => { window.location.href = FORM_URL; }, 2400);
        return;
      }
    }

    /* ── FORM REDIRECT INTENT (salespage only) ── */
    if (PAGE === 'sales' && detectFormIntent(text)) {
      const reply = IS_ES()
        ? '¡Perfecto! 🚀 Te llevo al formulario ahora mismo. Son solo 7 pasos sencillos — yo te guío en cada uno. ¡Vamos!'
        : '🚀 Perfect! Taking you to the form right now. Just 7 simple steps — I\'ll guide you through each one. Let\'s go!';
      addAgentMsg(reply);
      speak(reply);
      setTimeout(() => { window.location.href = FORM_URL; }, 2800);
      return;
    }

    /* ── NEXT STEP INTENT (form page only) ── */
    if (PAGE === 'form' && detectNextStepIntent(text)) {
      // Try multiple selectors to find the next button
      const btn = document.querySelector(`.btn-next[onclick="nextStep(${currentStep})"]`)
               || document.querySelector(`#step${currentStep} .btn-next`)
               || document.querySelector('.step-card.active .btn-next');
      if (btn) {
        const nextStepNum = currentStep + 1;
        const hint = STEP_SCRIPTS[LANG][nextStepNum];
        const msg = hint
          ? hint
          : (IS_ES() ? `¡Genial! Paso ${nextStepNum}. 👉` : `Great! Step ${nextStepNum}. 👉`);
        addAgentMsg(msg);
        speak(msg);
        setTimeout(() => btn.click(), 1500);
        return;
      }
      // If already on last step
      const lastMsg = IS_ES()
        ? '¡Estás en el último paso! Configura tu bot y haz clic en "Activar Bot 007". 🚀'
        : 'You\'re on the last step! Configure your bot and click "Activate Bot 007". 🚀';
      addAgentMsg(lastMsg);
      speak(lastMsg);
      return;
    }

    const typing = showTyping();
    setStatus(IS_ES() ? 'Pensando...' : 'Thinking...');

    try {
      const messages = [
        { role: 'system', content: buildSystemPrompt() },
        ...chatHistory.slice(-10) // keep last 10 for context
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OA_KEY },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 180,
          temperature: 0.78,
          presence_penalty: 0.2,
          frequency_penalty: 0.1
        })
      });

      const data = await res.json();
      removeTyping();

      const reply = data.choices?.[0]?.message?.content?.trim();
      if (reply) {
        chatHistory.push({ role: 'assistant', content: reply });
        addAgentMsg(reply);
        speak(reply);
        setStatus(IS_ES() ? 'En línea · Lista para ayudarte' : 'Online · Ready to help');
      } else {
        throw new Error('empty');
      }
    } catch (e) {
      removeTyping();
      const fallback = localFallback(text);
      chatHistory.push({ role: 'assistant', content: fallback });
      addAgentMsg(fallback);
      speak(fallback);
      setStatus(IS_ES() ? 'En línea · Lista para ayudarte' : 'Online · Ready to help');
    }
  }

  /* ── LOCAL FALLBACK ── */
  function localFallback(text) {
    const t = text.toLowerCase();
    const kb = KB[LANG];

    if (/precio|costo|cuánto|cuanto|cost|price|how much/.test(t)) return kb.price + (IS_ES() ? ' ¿Te gustaría empezar gratis?' : ' Would you like to start for free?');
    if (/garantía|garantia|guarantee|refund|devoluci/.test(t)) return kb.guarantee;
    if (/whatsapp|twilio|webhook/.test(t)) return kb.whatsapp;
    if (/agencia|agency|cliente|client|ganar|earn/.test(t)) return kb.agency;
    if (/cancel|cance/.test(t)) return kb.cancel;
    if (/segur|secure|ssl|protect/.test(t)) return kb.security;
    if (/país|pais|country|mundial|world|internacional|international/.test(t)) return kb.worldwide;
    if (/tiempo|rápido|cuánto tarda|how long|fast/.test(t)) return kb.howlong;
    if (/barbería|barberia|barbershop|peluquería|peluqueria/.test(t)) return kb.barbershop;
    if (/restaurante|restaurant|food|comida|menú|menu/.test(t)) return kb.restaurant;
    if (/clínica|clinica|médico|medico|salud|health|doctor|dentist/.test(t)) return kb.clinic;
    if (/gimnasio|gym|fitness/.test(t)) return kb.gym;
    if (/tienda|store|shop|retail/.test(t)) return kb.store;
    if (/salón|salon|belleza|beauty|spa|masaje|massage/.test(t)) return kb.salon;
    if (/abogado|lawyer|legal/.test(t)) return kb.lawyer;
    if (/inmueble|propiedad|property|real estate|bienes raíces/.test(t)) return kb.realEstate;
    if (/guardería|guarderia|daycare|childcare/.test(t)) return kb.childcare;
    if (/ecommerce|e-commerce|tienda online|online store/.test(t)) return kb.ecommerce;
    if (/qué es|what is|como funciona|how does/.test(t)) return kb.product;

    return IS_ES()
      ? '¡Claro! Con Super Bot 007 creas un bot IA completo en 5 minutos desde $19.99/mes. ¿Qué tipo de negocio tienes? 😊'
      : 'Of course! With Super Bot 007 you create a full AI bot in 5 minutes starting at $19.99/month. What type of business do you have? 😊';
  }

  /* ── DETECT BUSINESS TYPE ── */
  function detectBusinessType(text) {
    const t = text.toLowerCase();
    const map = IS_ES() ? {
      'barber': 'Barbería', 'peluquer': 'Peluquería', 'salon': 'Salón de Belleza',
      'restaur': 'Restaurante', 'café|cafe': 'Cafetería', 'clínica|clinica': 'Clínica',
      'médico|medico|doctor': 'Consultorio Médico', 'dentist': 'Dentista',
      'gimnasio|gym': 'Gimnasio', 'spa': 'Spa', 'tienda|store': 'Tienda',
      'abogado': 'Abogado', 'fotograf': 'Fotógrafo', 'hotel': 'Hotel',
    } : {
      'barber': 'Barbershop', 'salon': 'Beauty Salon', 'restaur': 'Restaurant',
      'cafe|coffee': 'Café', 'clinic': 'Clinic', 'doctor|medical': 'Medical Office',
      'dentist': 'Dentist', 'gym|fitness': 'Gym', 'spa': 'Spa', 'store|shop': 'Store',
      'lawyer|law': 'Law Office', 'photo': 'Photography', 'hotel': 'Hotel',
    };

    for (const [key, value] of Object.entries(map)) {
      if (new RegExp(key).test(t)) {
        businessType = value;
        // Update context
        window.WIZARD_CONTEXT = Object.assign(window.WIZARD_CONTEXT || {}, { businessType });
        break;
      }
    }
  }

  /* ── SET STATUS ── */
  function setStatus(text) {
    const el = document.getElementById('wz-status');
    if (el) el.textContent = text;
  }

  /* ── SPEAK ── */
  async function speak(text) {
    if (!text) return;
    isSpeaking = true;
    setSpeakingUI(true);

    // Sanitize for TTS — safe clean, no destructive regex
    const clean = text
      .replace(/https?:\/\/\S+/g, '')        // remove URLs
      .replace(/[•*_`#\[\]>~]/g, '')         // remove markdown symbols
      .replace(/\n+/g, '. ')                  // newlines → pause
      .replace(/\s+/g, ' ')                   // collapse spaces
      .trim()
      .slice(0, 450);                         // max 450 chars

    if (!clean) { isSpeaking = false; setSpeakingUI(false); return; }

    console.log('[WIZARD TTS] lang:', LANG, '| chars:', clean.length, '| text:', clean.substring(0, 80) + '...');

    try {
      const voice = LANG === 'es' ? EL_VOICE_ES : EL_VOICE_EN;
      const model = LANG === 'es' ? EL_MODEL_ES : EL_MODEL_EN;
      // Voice settings tuned per language
      const vsES = { stability: 0.55, similarity_boost: 0.82, style: 0.25, use_speaker_boost: true };
      const vsEN = { stability: 0.50, similarity_boost: 0.80, style: 0.40, use_speaker_boost: true };
      const voiceSettings = LANG === 'es' ? vsES : vsEN;
      console.log('[WIZARD TTS] Calling ElevenLabs, voice:', voice, '| model:', model);
      const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
        method: 'POST',
        headers: { 'xi-api-key': EL_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, model_id: model, voice_settings: voiceSettings })
      });

      console.log('[WIZARD TTS] ElevenLabs response status:', elRes.status);
      if (!elRes.ok) {
        const errTxt = await elRes.text();
        console.warn('[WIZARD TTS] ElevenLabs error body:', errTxt);
        throw new Error('EL ' + elRes.status);
      }
      const blob = await elRes.blob();
      console.log('[WIZARD TTS] Got audio blob, size:', blob.size);
      await playBlob(blob);
    } catch (e) {
      console.warn('[WIZARD TTS] ElevenLabs failed:', e.message, '— trying OpenAI fallback');
      try {
        // Fallback: OpenAI TTS
        const oaRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + OA_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'tts-1', voice: LANG === 'es' ? 'nova' : 'alloy', input: clean, speed: 1.0 })
        });
        console.log('[WIZARD TTS] OpenAI TTS response status:', oaRes.status);
        if (!oaRes.ok) {
          const errTxt2 = await oaRes.text();
          console.warn('[WIZARD TTS] OpenAI TTS error body:', errTxt2);
          throw new Error('OA TTS ' + oaRes.status);
        }
        const blob = await oaRes.blob();
        console.log('[WIZARD TTS] Got OpenAI audio blob, size:', blob.size);
        await playBlob(blob);
      } catch (e2) {
        console.error('[WIZARD TTS] Both TTS services failed:', e2.message);
        isSpeaking = false;
        setSpeakingUI(false);
      }
    }
  }

  /* ── AudioContext unlock (called on first user gesture) ── */
  let audioUnlocked = false;
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    // Create and immediately suspend a silent context to satisfy browser autoplay policy
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      ctx.resume();
    } catch(e) {}
  }

  function playBlob(blob) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = 1;
      currentAudio = audio;
      console.log('[WIZARD AUDIO] playBlob — blob size:', blob.size, 'type:', blob.type);
      audio.onended = () => {
        console.log('[WIZARD AUDIO] playback ended OK');
        isSpeaking = false;
        setSpeakingUI(false);
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = (ev) => {
        console.error('[WIZARD AUDIO] audio.onerror:', ev);
        isSpeaking = false;
        setSpeakingUI(false);
        URL.revokeObjectURL(url);
        resolve();
      };
      // play() returns a Promise — catch DOMException (autoplay blocked)
      const playPromise = audio.play();
      console.log('[WIZARD AUDIO] audio.play() called, promise:', !!playPromise);
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log('[WIZARD AUDIO] audio.play() resolved — playing!'))
          .catch((err) => {
            console.error('[WIZARD AUDIO] audio.play() BLOCKED:', err.name, err.message);
            isSpeaking = false;
            setSpeakingUI(false);
            resolve();
          });
      }
    });
  }

  function setSpeakingUI(active) {
    const micBtn = document.getElementById('wz-mic-btn');
    const wave   = document.getElementById('wz-wave');
    if (!micBtn) return;
    if (active) {
      micBtn.classList.add('speaking');
      micBtn.classList.remove('listening');
      if (wave) wave.classList.add('active');
      document.getElementById('wz-mic-label').textContent = IS_ES() ? '🔊 Hablando...' : '🔊 Speaking...';
    } else {
      micBtn.classList.remove('speaking');
      if (wave) wave.classList.remove('active');
      document.getElementById('wz-mic-label').textContent = IS_ES() ? '🎙️ Presiona para hablar' : '🎙️ Press to talk';
    }
  }

  /* ── MIC TOGGLE ── */
  function toggleMic() {
    unlockAudio(); // unlock on mic press
    if (isSpeaking) return;
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addAgentMsg(IS_ES() ? 'Tu navegador no soporta reconocimiento de voz. Por favor escribe tu mensaje.' : 'Your browser does not support voice recognition. Please type your message.');
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = LANG === 'es' ? 'es-ES' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      isListening = true;
      const micBtn = document.getElementById('wz-mic-btn');
      if (micBtn) {
        micBtn.classList.add('listening');
        micBtn.classList.remove('speaking');
      }
      document.getElementById('wz-mic-label').textContent = IS_ES() ? '🔴 Escuchando... (toca para parar)' : '🔴 Listening... (tap to stop)';
      setStatus(IS_ES() ? '🎙️ Escuchando...' : '🎙️ Listening...');
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      document.getElementById('wz-text-inp').value = transcript;
      stopListening();
      sendMessage(transcript);
    };

    recognition.onerror = (e) => {
      stopListening();
      if (e.error !== 'no-speech') {
        addAgentMsg(IS_ES() ? 'No pude escucharte. ¿Puedes intentarlo de nuevo o escribir tu mensaje?' : "I couldn't hear you. Can you try again or type your message?");
      }
    };

    recognition.onend = () => {
      stopListening();
    };

    try { recognition.start(); } catch(e) { stopListening(); }
  }

  function stopListening() {
    isListening = false;
    if (recognition) { try { recognition.stop(); } catch(e) {} recognition = null; }
    const micBtn = document.getElementById('wz-mic-btn');
    if (micBtn) {
      micBtn.classList.remove('listening');
    }
    if (!isSpeaking) {
      document.getElementById('wz-mic-label').textContent = IS_ES() ? '🎙️ Presiona para hablar' : '🎙️ Press to talk';
      setStatus(IS_ES() ? 'En línea · Lista para ayudarte' : 'Online · Ready to help');
    }
  }

  /* ── SEND TEXT ── */
  function sendText() {
    const inp = document.getElementById('wz-text-inp');
    if (!inp) return;
    const text = inp.value.trim();
    if (!text) return;
    inp.value = '';
    sendMessage(text);
  }

  /* ── LANGUAGE TOGGLE ── */
  function toggleLang() {
    LANG = LANG === 'es' ? 'en' : 'es';
    // Update UI
    const nameEl = document.getElementById('wz-agent-name');
    const toggleEl = document.getElementById('wz-lang-toggle');
    const inpEl = document.getElementById('wz-text-inp');
    const micLabel = document.getElementById('wz-mic-label');

    if (nameEl)   nameEl.textContent   = agent().name;
    if (toggleEl) toggleEl.textContent = IS_ES() ? '🇺🇸 EN' : '🇪🇸 ES';
    if (inpEl)    inpEl.placeholder    = IS_ES() ? 'O escribe aquí...' : 'Or type here...';
    if (micLabel) micLabel.textContent = IS_ES() ? '🎙️ Presiona para hablar' : '🎙️ Press to talk';

    setStatus(IS_ES() ? 'En línea · Lista para ayudarte' : 'Online · Ready to help');

    // Reset history and show greeting in new lang (no auto-speak on lang change)
    chatHistory = [{ role: 'system', content: buildSystemPrompt() }];
    const msgs = document.getElementById('wz-msgs');
    if (msgs) msgs.innerHTML = '';
    const intro = PAGE_INTROS[LANG][PAGE] || PAGE_INTROS[LANG].sales;
    addAgentMsg(intro);
    // Only speak if not currently speaking
    if (!isSpeaking) speak(intro);
  }

  /* ── INACTIVITY TIMER ── */
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (!isOpen) return;
    inactivityTimer = setTimeout(() => {
      if (isOpen && !isSpeaking && !isListening) {
        const msg = IS_ES()
          ? '¿Sigues ahí? Cuando termines de llenar los campos, dime "listo" para continuar al siguiente paso. 😊'
          : "Still there? When you finish filling in the fields, just say \"done\" or \"ready\" to move to the next step. 😊";
        addAgentMsg(msg); // show text only — no auto-speak to avoid interrupting
      }
    }, 90000); // 90 seconds — give user time to interact
  }

  /* ── STEP UPDATE (called by form.html when step changes) ── */
  window.wzUpdateStep = function(step) {
    currentStep = step;
    const hint = STEP_SCRIPTS[LANG][step];
    if (!hint) return;

    // Show hint in chat — speak only if panel is already open and user is engaged
    if (!isOpen) {
      // Panel closed: just update currentStep silently, don't auto-open or speak
      return;
    } else {
      // Panel open: show text + speak only if not already speaking
      setTimeout(() => {
        if (!isSpeaking) {
          addAgentMsg(hint);
          speak(hint);
        } else {
          addAgentMsg(hint); // show text even if speaking
        }
      }, 500);
    }
  };

  /* ── EXPOSE GLOBALS ── */
  window.__wzToggleMic  = toggleMic;
  window.__wzSend       = sendText;
  window.__wzToggleLang = toggleLang;

  /* ── PUBLIC: open wizard panel (used by scrollToAmanda / CTA buttons) ── */
  window.wizardOpen = function() {
    if (!isOpen) {
      const btn = document.getElementById('wz-btn');
      if (btn) { btn.click(); }
      else { togglePanel(); }
    }
  };

  /* ── PUBLIC: toggle mic from outside ── */
  window.wizardToggleMic = function() {
    if (typeof toggleMic === 'function') toggleMic();
  };

  /* ── PUBLIC: change language from outside (e.g. salespage toggle) ── */
  window.wizardSetLang = function(newLang) {
    if(newLang !== LANG) {
      LANG = newLang;
      if(window.WIZARD_CONTEXT) {
        window.WIZARD_CONTEXT.language = newLang;
        window.WIZARD_CONTEXT.agentName = newLang === 'es' ? 'Amanda' : 'Shirley';
      }
      /* refresh agent label & icon color */
      const agent = AGENTS[LANG];
      const btn = document.getElementById('wz-btn');
      if(btn) btn.style.background = `linear-gradient(135deg, ${agent.color}, ${agent.color}cc)`;
      /* update lang toggle button text inside wizard panel */
      const langTgl = document.getElementById('wz-lang-toggle');
      if(langTgl) langTgl.textContent = LANG === 'es' ? '🇺🇸 EN' : '🇪🇸 ES';
    }
  };

  /* ── INIT ── */
  function init() {
    injectStyles();
    buildUI();

    // Sales page: pulse after 3s to attract attention
    if (PAGE === 'sales') {
      setTimeout(() => {
        if (!isOpen) {
          const btn = document.getElementById('wz-btn');
          if (btn) btn.style.animation = 'wz-pulse 1s ease-in-out infinite';
        }
      }, 3000);
    }

    // Form page: show a notification dot on the wizard button to invite the user
    // but do NOT auto-open — user opens it when ready
    if (PAGE === 'form') {
      setTimeout(() => {
        if (!isOpen) {
          const btn = document.getElementById('wz-btn');
          if (btn) {
            // Add a pulsing notification dot to invite attention
            const nd = document.createElement('span');
            nd.className = 'wz-notify';
            nd.style.cssText = 'position:absolute;top:4px;right:4px;width:12px;height:12px;background:#ff4444;border-radius:50%;border:2px solid #000;';
            btn.appendChild(nd);
          }
        }
      }, 1500);

      // Listen for step changes via MutationObserver
      const observer = new MutationObserver(() => {
        const activeCard = document.querySelector('.step-card.active');
        if (activeCard) {
          const stepNum = parseInt(activeCard.id.replace('step', ''));
          if (!isNaN(stepNum) && stepNum !== currentStep) {
            currentStep = stepNum;
            window.wzUpdateStep(stepNum);
          }
        }
      });
      const main = document.querySelector('.main, .form-wrap, form') || document.body;
      observer.observe(main, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }

    // Editor page: greet with customization help
    if (PAGE === 'editor') {
      setTimeout(() => {
        if (!isOpen) {
          const btn = document.getElementById('wz-btn');
          if (btn) btn.style.animation = 'wz-pulse 1s ease-in-out infinite';
        }
      }, 4000);
    }
  }

  /* ── WAIT FOR DOM ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
