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
  const EL_VOICE_ES = 'pFZP5JQG7iQjIQuC4Bku'; // Valentina — Spanish
  const EL_VOICE_EN = 'dfeOmy6Uay63tNhyO99j'; // Shirley — English
  const EL_MODEL    = 'eleven_flash_v2_5';

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
          color: '#a855f7' },
    en: { name: 'Shirley', emoji: '🧙‍♀️', lang: 'en', voice: EL_VOICE_EN,
          welcome: "Hi! I'm Shirley, your personal Super Bot 007 guide. I'm here to help you build your perfect bot step by step. Ready to start? 🚀",
          color: '#6C63FF' }
  };

  /* ── KNOWLEDGE BASE ── */
  const KB = {
    es: {
      product: 'Super Bot 007 crea un bot IA con GPT-4, landing page, pagos PayPal y tarjeta digital — todo sin código, en 5 minutos, por $10.99/mes.',
      price: 'El Plan Pro cuesta $10.99/mes e incluye bot IA, landing page, editor visual, tarjeta digital y carrito PayPal.',
      guarantee: 'Tienes 30 días de garantía total. Si no estás satisfecho, te devolvemos el dinero sin preguntas.',
      howlong: 'En solo 5 minutos puedes tener tu bot listo. El proceso tiene 7 pasos sencillos.',
      whatsapp: 'Tu bot puede conectarse a WhatsApp usando Twilio. En el paso final te damos la URL del webhook para configurarlo.',
      agency: 'Con Super Bot 007 puedes crear bots para clientes y cobrar $50-$200/mes por cada uno. Con 5 clientes = $500-$2,000/mes.',
      businesses: 'Funciona para cualquier negocio: barberías, restaurantes, clínicas, gimnasios, spas, tiendas, abogados, fotógrafos, hoteles y más.',
      cancel: 'Puedes cancelar cuando quieras. Sin contratos ni penalizaciones.',
      security: 'Tu información está protegida con SSL y alojada en Google Firebase con 99.9% de uptime.',
      worldwide: 'Funciona en cualquier país del mundo. Acepta pagos internacionales vía PayPal.',
      barbershop: 'Para una barbería, el bot agenda citas, muestra servicios y precios, responde preguntas 24/7 y notifica por WhatsApp.',
      restaurant: 'Para un restaurante, el bot muestra el menú, toma reservaciones, responde sobre horarios y promueve promociones.',
      clinic: 'Para una clínica, el bot agenda consultas, informa sobre servicios médicos y envía recordatorios por WhatsApp.',
      gym: 'Para un gimnasio, el bot muestra membresías, agenda clases y responde sobre horarios y precios.',
      store: 'Para una tienda, el bot muestra productos, acepta pagos PayPal y responde sobre disponibilidad.',
      salon: 'Para un salón de belleza, el bot agenda citas, muestra servicios con fotos y precios, y notifica por WhatsApp.',
      spa: 'Para un spa, el bot muestra tratamientos, agenda citas y envía recordatorios automáticos.',
      lawyer: 'Para un abogado, el bot califica prospectos, agenda consultas iniciales y responde preguntas frecuentes.',
      realEstate: 'Para bienes raíces, el bot muestra propiedades, califica compradores y agenda visitas.',
      childcare: 'Para una guardería, el bot informa sobre programas, acepta inscripciones y responde a padres 24/7.',
      ecommerce: 'Para e-commerce, el bot muestra productos, procesa pedidos vía PayPal y hace seguimiento de envíos.',
    },
    en: {
      product: 'Super Bot 007 creates a GPT-4 AI bot, landing page, PayPal payments, and digital card — all with no code, in 5 minutes, for $10.99/month.',
      price: 'The Pro Plan is $10.99/month and includes an AI bot, landing page, visual editor, digital card, and PayPal cart.',
      guarantee: 'You have a 30-day full money-back guarantee. If you\'re not satisfied, we refund everything, no questions asked.',
      howlong: 'In just 5 minutes you can have your bot live. The process has 7 simple steps.',
      whatsapp: 'Your bot can connect to WhatsApp using Twilio. In the final step we give you the webhook URL to configure it.',
      agency: 'With Super Bot 007 you can create bots for clients and charge $50-$200/month each. With 5 clients = $500-$2,000/month.',
      businesses: 'Works for any business: barbershops, restaurants, clinics, gyms, spas, stores, lawyers, photographers, hotels and more.',
      cancel: 'Cancel anytime. No contracts or penalties.',
      security: 'Your data is SSL-protected and hosted on Google Firebase with 99.9% uptime.',
      worldwide: 'Works in any country. Accepts international payments via PayPal.',
      barbershop: 'For a barbershop, the bot books appointments, shows services and pricing, answers questions 24/7, and sends WhatsApp notifications.',
      restaurant: 'For a restaurant, the bot shows the menu, takes reservations, answers questions about hours, and promotes specials.',
      clinic: 'For a clinic, the bot schedules consultations, informs about medical services, and sends reminders via WhatsApp.',
      gym: 'For a gym, the bot shows memberships, schedules classes, and answers questions about hours and pricing.',
      store: 'For a store, the bot showcases products, accepts PayPal payments, and answers availability questions.',
      salon: 'For a beauty salon, the bot books appointments, shows services with photos and pricing, and sends WhatsApp notifications.',
      spa: 'For a spa, the bot shows treatments, books appointments, and sends automated reminders.',
      lawyer: 'For a lawyer, the bot qualifies leads, schedules initial consultations, and answers common questions.',
      realEstate: 'For real estate, the bot showcases properties, qualifies buyers, and schedules viewings.',
      childcare: 'For a daycare, the bot informs about programs, accepts registrations, and answers parents 24/7.',
      ecommerce: 'For e-commerce, the bot showcases products, processes orders via PayPal, and tracks shipments.',
    }
  };

  /* ── STEP SCRIPTS ── */
  const STEP_SCRIPTS = {
    es: {
      1: '¡Perfecto! Empecemos con la información básica de tu negocio. Necesito el nombre, tipo de negocio y una descripción. ¿De qué tipo de negocio es? 🏢',
      2: '¡Excelente! Ahora personalizamos el diseño. Elige tus colores, sube el logo y la imagen principal de tu landing page. 🎨',
      3: '¡Genial! Agrega los servicios que ofrece tu negocio. Puedes poner nombre, precio y descripción de cada uno. ✂️',
      4: '¿Vendes productos? Aquí los configuras con precio y puedes aceptar pagos vía PayPal. Si solo ofreces servicios, puedes omitir este paso. 🛒',
      5: '¡Las fotos son muy importantes! Sube hasta 8 fotos de tu negocio para que los clientes vean tu trabajo. 📸',
      6: 'Ahora agrega tu información de contacto: teléfono, WhatsApp, email y horarios de atención. 📞',
      7: '¡Casi listo! Este es el último paso. Configura el idioma del bot y opcionalmente genera contenido con IA. Luego haz clic en "Activar Bot 007". 🤖',
      8: '🎉 ¡Felicidades! Tu bot está 100% listo y funcionando. Copia los enlaces y compártelos con tus clientes. ¡Empezaste algo increíble!',
    },
    en: {
      1: "Let's start with your business basics! I need your business name, type, and a description. What kind of business is it? 🏢",
      2: "Excellent! Now let's personalize the design. Choose your colors, upload your logo and main banner image. 🎨",
      3: "Great! Add the services your business offers. You can include name, price, and description for each one. ✂️",
      4: "Do you sell products? Set them up here with pricing and accept PayPal payments. If you only offer services, you can skip this step. 🛒",
      5: "Photos are so important! Upload up to 8 photos of your business so clients can see your work. 📸",
      6: "Now add your contact information: phone, WhatsApp, email, and business hours. 📞",
      7: "Almost done! This is the last step. Configure the bot language and optionally generate content with AI. Then click 'Activate Bot 007'. 🤖",
      8: "🎉 Congratulations! Your bot is 100% ready and live! Copy the links and share them with your clients. You've started something amazing!",
    }
  };

  /* ── PAGE INTROS ── */
  const PAGE_INTROS = {
    es: {
      sales: '¡Hola! Soy Amanda, tu guía de Super Bot 007. Puedo contarte todo sobre cómo crear tu bot IA, precios y cómo funciona. ¿Tienes alguna pregunta? 😊',
      form: '¡Bienvenido al creador de bots! Estoy aquí para guiarte en cada paso. Cuando estés listo, empecemos con el Paso 1. ¿Tienes alguna duda antes de comenzar?',
      editor: '¡Hola! Estoy aquí para ayudarte a personalizar tu landing page. Puedo sugerirte colores, textos e imágenes según tu tipo de negocio. ¿Por dónde empezamos?',
      landing: '¡Hola! Soy Amanda. Esta es tu landing page creada con Super Bot 007. ¿Te puedo ayudar con algo? 🌟',
    },
    en: {
      sales: "Hi! I'm Shirley, your Super Bot 007 guide. I can tell you everything about creating your AI bot, pricing, and how it all works. Any questions? 😊",
      form: "Welcome to the bot creator! I'm here to guide you through every step. Whenever you're ready, let's start with Step 1. Any questions before we begin?",
      editor: "Hi! I'm here to help you customize your landing page. I can suggest colors, text, and images based on your business type. Where shall we start?",
      landing: "Hi! I'm Shirley. This is your landing page created with Super Bot 007. Can I help you with anything? 🌟",
    }
  };

  /* ── STATE ── */
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
      #wz-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99990;
        width: 62px;
        height: 62px;
        border-radius: 50%;
        background: linear-gradient(135deg, #a855f7, #7c3aed);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.6rem;
        box-shadow: 0 6px 28px rgba(168,85,247,.65), 0 0 0 0 rgba(168,85,247,.4);
        animation: wz-pulse 2.2s ease-in-out infinite;
        transition: transform .2s, box-shadow .2s;
      }
      #wz-btn:hover { transform: scale(1.1); }
      #wz-btn.open  { animation: none; background: linear-gradient(135deg,#ef4444,#dc2626); }
      #wz-btn .wz-notify {
        position: absolute;
        top: -3px; right: -3px;
        width: 16px; height: 16px;
        background: #00c853;
        border-radius: 50%;
        border: 2px solid #0a0a0f;
        animation: wz-ndot 1.4s infinite;
      }
      @keyframes wz-pulse {
        0%,100% { box-shadow: 0 6px 28px rgba(168,85,247,.55), 0 0 0 0 rgba(168,85,247,.4); }
        50%      { box-shadow: 0 6px 40px rgba(168,85,247,.8),  0 0 0 12px rgba(168,85,247,0); }
      }
      @keyframes wz-ndot {
        0%   { box-shadow: 0 0 0 0 rgba(0,200,83,.6); }
        70%  { box-shadow: 0 0 0 8px rgba(0,200,83,0); }
        100% { box-shadow: 0 0 0 0 rgba(0,200,83,0); }
      }

      /* ═══ PANEL ═══ */
      #wz-panel {
        position: fixed;
        bottom: 100px;
        right: 24px;
        z-index: 99989;
        width: 360px;
        max-width: calc(100vw - 32px);
        max-height: 560px;
        background: #0f0f1a;
        border: 1px solid rgba(168,85,247,.3);
        border-radius: 22px;
        box-shadow: 0 24px 80px rgba(0,0,0,.8), 0 0 60px rgba(168,85,247,.15);
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
        background: rgba(168,85,247,.1);
        border-bottom: 1px solid rgba(168,85,247,.15);
        flex-shrink: 0;
      }
      .wz-avatar {
        width: 42px; height: 42px;
        border-radius: 50%;
        background: linear-gradient(135deg,#a855f7,#7c3aed,#ec4899);
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
        background: rgba(168,85,247,.15);
        border: 1px solid rgba(168,85,247,.3);
        border-radius: 8px;
        color: #a855f7;
        font-size: .72rem;
        font-weight: 700;
        padding: .3rem .6rem;
        cursor: pointer;
        flex-shrink: 0;
        transition: all .2s;
      }
      #wz-lang-toggle:hover { background: rgba(168,85,247,.28); }

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
      #wz-msgs::-webkit-scrollbar-thumb { background: rgba(168,85,247,.3); border-radius: 2px; }

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
        background: linear-gradient(135deg,rgba(168,85,247,.14),rgba(124,58,237,.06));
        border: 1px solid rgba(168,85,247,.2);
        border-bottom-left-radius: 4px;
        color: #e9edef;
      }
      .wz-msg.user {
        align-self: flex-end;
        background: linear-gradient(135deg,#a855f7,#7c3aed);
        color: #fff;
        border-bottom-right-radius: 4px;
      }
      .wz-typing {
        align-self: flex-start;
        display: flex; gap: .32rem; align-items: center;
        padding: .6rem .85rem;
        background: rgba(168,85,247,.1);
        border: 1px solid rgba(168,85,247,.18);
        border-radius: 16px; border-bottom-left-radius: 4px;
        animation: wz-pop .2s ease both;
      }
      .wz-typing span {
        width: 7px; height: 7px; background: #a855f7; border-radius: 50%;
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
        border-top: 1px solid rgba(168,85,247,.1);
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
        background: rgba(168,85,247,.12);
        border-color: rgba(168,85,247,.5);
        color: #a855f7;
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
        border: 1px solid rgba(168,85,247,.2);
        border-radius: 10px;
        color: #f0f0ff;
        font-family: 'Inter', sans-serif;
        font-size: .82rem;
        outline: none;
        transition: border-color .2s;
      }
      #wz-text-inp:focus { border-color: #a855f7; }
      #wz-text-inp::placeholder { color: rgba(168,85,247,.4); }
      #wz-send-btn {
        width: 36px; height: 36px;
        background: linear-gradient(135deg,#a855f7,#7c3aed);
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
        background: linear-gradient(135deg,#a855f7,#ec4899);
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
    const btn = document.createElement('button');
    btn.id = 'wz-btn';
    btn.setAttribute('aria-label', IS_ES() ? 'Hablar con Amanda' : 'Talk to Shirley');
    btn.innerHTML = `🧙‍♀️<span class="wz-notify"></span>`;
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
    isOpen = !isOpen;
    const panel = document.getElementById('wz-panel');
    const btn   = document.getElementById('wz-btn');
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
    speak(intro);
    chatHistory = [{ role: 'system', content: buildSystemPrompt() }];
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
- Agencia: ${kb.agency}
- Negocios: ${kb.businesses}
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
1. SIEMPRE responde la pregunta del cliente
2. Máximo 2-3 oraciones cortas
3. Termina con una pregunta o llamada a la acción
4. Máximo 1 emoji por respuesta
5. Nunca inventes precios ni datos
6. Si el cliente menciona su tipo de negocio, adapta tu respuesta
7. Cuando el cliente quiera crear su bot, guíalo al formulario`;
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
- Agency: ${kb.agency}
- Businesses: ${kb.businesses}
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
1. ALWAYS answer the client's question
2. Maximum 2-3 short sentences
3. End with a question or call to action
4. Maximum 1 emoji per response
5. Never invent prices or data
6. If the client mentions their business type, adapt your response
7. When the client wants to create their bot, guide them to the form`;
    }
  }

  /* ── SEND MESSAGE ── */
  async function sendMessage(text) {
    if (!text || isSpeaking) return;
    text = text.trim();
    if (!text) return;

    addUserMsg(text);
    chatHistory.push({ role: 'user', content: text });
    resetInactivityTimer();

    // Detect business type from user input
    detectBusinessType(text);

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
      ? '¡Claro! Con Super Bot 007 creas un bot IA completo en 5 minutos por $10.99/mes. ¿Qué tipo de negocio tienes? 😊'
      : 'Of course! With Super Bot 007 you create a full AI bot in 5 minutes for $10.99/month. What type of business do you have? 😊';
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

    // Sanitize
    const clean = text.replace(/[*_`#[\]()>~]/g, '').replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();

    try {
      // Try ElevenLabs first
      const voice = LANG === 'es' ? EL_VOICE_ES : EL_VOICE_EN;
      const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
        method: 'POST',
        headers: { 'xi-api-key': EL_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, model_id: EL_MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3 } })
      });

      if (!elRes.ok) throw new Error('EL failed');
      const blob = await elRes.blob();
      await playBlob(blob);
    } catch (e) {
      try {
        // Fallback: OpenAI TTS
        const oaRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + OA_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'tts-1', voice: 'shimmer', input: clean, speed: 1.05 })
        });
        if (!oaRes.ok) throw new Error('OA TTS failed');
        const blob = await oaRes.blob();
        await playBlob(blob);
      } catch (e2) {
        // Offline: no audio, text only
        isSpeaking = false;
        setSpeakingUI(false);
      }
    }
  }

  function playBlob(blob) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudio = audio;
      audio.onended = () => {
        isSpeaking = false;
        setSpeakingUI(false);
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        isSpeaking = false;
        setSpeakingUI(false);
        resolve();
      };
      audio.play().catch(() => {
        isSpeaking = false;
        setSpeakingUI(false);
        resolve();
      });
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
    if (isSpeaking) return; // Don't allow during speech
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

    // Reset history and greet in new lang
    chatHistory = [{ role: 'system', content: buildSystemPrompt() }];
    const msgs = document.getElementById('wz-msgs');
    if (msgs) msgs.innerHTML = '';
    const intro = PAGE_INTROS[LANG][PAGE] || PAGE_INTROS[LANG].sales;
    addAgentMsg(intro);
    speak(intro);
  }

  /* ── INACTIVITY TIMER ── */
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (!isOpen) return;
    inactivityTimer = setTimeout(() => {
      if (isOpen && !isSpeaking && !isListening) {
        const msg = IS_ES()
          ? '¿Sigues ahí? ¿Necesitas ayuda con algo? Estoy aquí para guiarte. 😊'
          : "Still there? Need help with anything? I'm here to guide you. 😊";
        addAgentMsg(msg);
        speak(msg);
      }
    }, 30000); // 30 seconds
  }

  /* ── STEP UPDATE (called by form.html when step changes) ── */
  window.wzUpdateStep = function(step) {
    currentStep = step;
    if (isOpen && hasGreeted) {
      const hint = STEP_SCRIPTS[LANG][step];
      if (hint) {
        setTimeout(() => {
          addAgentMsg(hint);
          speak(hint);
        }, 800);
      }
    }
  };

  /* ── EXPOSE GLOBALS ── */
  window.__wzToggleMic  = toggleMic;
  window.__wzSend       = sendText;
  window.__wzToggleLang = toggleLang;

  /* ── INIT ── */
  function init() {
    injectStyles();
    buildUI();

    // Auto-open after 3s on sales page to catch attention
    if (PAGE === 'sales') {
      setTimeout(() => {
        if (!isOpen) {
          // Just show notify dot pulse — don't auto-open on mobile
          const btn = document.getElementById('wz-btn');
          if (btn) btn.style.animation = 'wz-pulse 1s ease-in-out infinite';
        }
      }, 3000);
    }

    // On form page — listen for step changes via MutationObserver
    if (PAGE === 'form') {
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
      const main = document.querySelector('.main') || document.body;
      observer.observe(main, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }
  }

  /* ── WAIT FOR DOM ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
