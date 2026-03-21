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
      1: `¡Bienvenido! Vamos paso a paso. 🏢

Paso 1 — Información del negocio:
• Escribe el nombre de tu negocio
• Selecciona el tipo de negocio
• Escribe tu ciudad y país
• Descripción: esto es clave 💡 — escribe una descripción MUY detallada de lo que ofreces. Mientras más información le das al bot, mejor responde a tus clientes.
• Título principal Hero: la frase que verán tus clientes al entrar (ej: "Transforma tu imagen con nosotros")
• Subtítulo Hero: una frase corta de apoyo
• Mensaje de bienvenida del bot: lo primero que dirá tu bot al abrir
• Avatar del bot: pega aquí la URL de la foto que quieres para tu bot

¿Ya tienes el nombre de tu negocio listo?`,

      2: `¡Perfecto! Paso 2 — Diseño & Colores. 🎨

• Colores: tu bot ya viene con colores por defecto (fondo negro, texto blanco, rojo y verde fosforescente) — puedes cambiarlos aquí o después en el editor.
• Logo: sube tu logo desde tu librería o pega la URL directa aquí. Si no tienes, no hay problema, se puede cambiar después en el editor.
• Imagen Hero / Banner: sube la foto principal de tu landing desde tu librería o pega la URL. Es la imagen grande que se ve de fondo al entrar.
• Título y subtítulo de la sección Servicios: el encabezado que aparece encima de tus servicios.

Recuerda: todo — colores, imágenes y textos — se puede cambiar después en el editor visual. 😊`,

      3: `Paso 3 — Servicios. ✂️

Agrega cada servicio que ofrece tu negocio:
• Nombre del servicio
• Precio
• Descripción del servicio

💡 Tip importante: mientras más detallada sea la descripción de cada servicio, mejor responderá tu bot cuando los clientes pregunten. Incluye duración, qué incluye, para quién es, etc.

Puedes agregar hasta 8 servicios. En el Paso 7 también puedes generarlos automáticamente con IA. ¡Añade al menos uno para continuar!`,

      4: `Paso 4 — Productos & PayPal. 🛒

¿Tu negocio vende productos online?
• Si SÍ: agrega tu email de PayPal para recibir pagos, y el link de tu PayPal.me si tienes. Luego añade tus productos con nombre, precio e imagen.
• Si NO vendes productos: puedes saltar este paso directamente con el botón "Galería".

Máximo 8 productos. Los pagos se procesan directo por PayPal sin comisión extra. 💳`,

      5: `Paso 5 — Galería de Fotos. 📸

Sube hasta 8 fotos de tu negocio:
• Haz clic en cada cuadro y sube la foto desde tu librería, o pega la URL directa de la imagen.
• Las fotos muestran tu trabajo a los clientes — entre más reales y de calidad, mejor.
• También puedes editar el título de la sección galería abajo.

Recuerda: puedes cambiar o agregar fotos después en el editor visual. 😊`,

      6: `Paso 6 — Contacto & Horarios. 📞

Llena tu información de contacto:
• Teléfono
• WhatsApp (solo números, con código de país, ej: 13055550000)
• Email
• Sitio web (opcional)
• Dirección

Redes sociales — pega tus links directamente:
• Instagram, Facebook, TikTok, YouTube

Horario de atención: activa cada día y pon la hora de apertura y cierre.

Todo esto lo usará el bot para responder a tus clientes. 💪`,

      7: `Paso 7 — IA & Activar Bot. 🤖

Este es el último paso:
• OpenAI API Key: pega aquí tu clave de OpenAI para activar el chatbot con IA. Si no tienes, obtenla gratis en platform.openai.com/api-keys
• Modelo GPT: GPT-4o Mini es el recomendado — rápido y económico.
• Generar con IA: usa los botones ✨ para generar automáticamente descripción, título, servicios, testimonios y FAQs. Para mejores resultados, asegúrate de haber escrito una descripción bien detallada en el Paso 1.
• Idioma del bot: español, inglés o portugués.
• Instrucción especial: cualquier regla para tu bot (ej: "No hacer descuentos mayores al 10%").
• Testimonios y FAQs: agrégalos manualmente o con IA.

Cuando termines, haz clic en 🚀 Activar Bot 007 y tu bot estará listo. ¡Todo se puede cambiar después en el editor!`,

      8: `🎉 ¡Felicidades! Tu bot está 100% activo y funcionando.

Copia tus enlaces y compártelos con tus clientes. Recuerda que puedes cambiar cualquier cosa — colores, imágenes, textos, servicios — en el editor visual cuando quieras. ¡Empezaste algo increíble! 🚀`,
    },
    en: {
      1: `Welcome! Let's go step by step. 🏢

Step 1 — Business Information:
• Enter your business name
• Select your business type
• Enter your city and country
• Description: this is KEY 💡 — write a very detailed description of what you offer. The more info you give the bot, the better it answers your clients.
• Hero Title: the headline your clients see when they land (e.g. "Transform Your Look With Us")
• Hero Subtitle: a short supporting line
• Bot Welcome Message: the first thing your bot says when opened
• Bot Avatar: paste the URL of the photo you want for your bot

Do you have your business name ready?`,

      2: `Great! Step 2 — Design & Colors. 🎨

• Colors: your bot comes with default colors (black background, white text, red and phosphorescent green) — you can change them here or later in the editor.
• Logo: upload your logo from your library or paste the direct URL here. No logo? No problem — you can change it later in the visual editor.
• Hero Image / Banner: upload your main landing page photo from your library or paste the URL. This is the big background image clients see when they arrive.
• Services section title and subtitle: the header shown above your services list.

Remember: everything — colors, images, and text — can be changed anytime in the visual editor. 😊`,

      3: `Step 3 — Services. ✂️

Add each service your business offers:
• Service name
• Price
• Service description

💡 Important tip: the more detailed the description of each service, the better your bot answers when clients ask about them. Include duration, what's included, who it's for, etc.

You can add up to 8 services. In Step 7 you can also auto-generate them with AI. Add at least one to continue!`,

      4: `Step 4 — Products & PayPal. 🛒

Does your business sell products online?
• If YES: add your PayPal email to receive payments, and your PayPal.me link if you have one. Then add your products with name, price, and image.
• If NO products: you can skip this step directly with the "Gallery" button.

Maximum 8 products. Payments go directly through PayPal with no extra commission. 💳`,

      5: `Step 5 — Photo Gallery. 📸

Upload up to 8 photos of your business:
• Click each square and upload the photo from your library, or paste the image URL directly.
• Photos show your work to clients — the more real and high quality, the better.
• You can also edit the gallery section title below.

Remember: you can change or add photos later in the visual editor. 😊`,

      6: `Step 6 — Contact & Hours. 📞

Fill in your contact information:
• Phone number
• WhatsApp (numbers only, with country code, e.g. 13055550000)
• Email
• Website (optional)
• Address

Social media — paste your links directly:
• Instagram, Facebook, TikTok, YouTube

Business hours: enable each day and set your opening and closing times.

Your bot uses all this info to answer your clients. 💪`,

      7: `Step 7 — AI & Activate Bot. 🤖

This is the last step:
• OpenAI API Key: paste your OpenAI key here to power the AI chatbot. Don't have one? Get it free at platform.openai.com/api-keys
• GPT Model: GPT-4o Mini is recommended — fast and affordable.
• Generate with AI: use the ✨ buttons to auto-generate description, title, services, testimonials, and FAQs. For best results, make sure you wrote a detailed description in Step 1.
• Bot language: Spanish, English, or Portuguese.
• Special instruction: any rule for your bot (e.g. "No discounts over 10%").
• Testimonials and FAQs: add them manually or with AI.

When done, click 🚀 Activate Bot 007 and your bot is live. Everything can be changed later in the editor!`,

      8: `🎉 Congratulations! Your bot is 100% active and live.

Copy your links and share them with your clients. Remember you can change anything — colors, images, text, services — in the visual editor anytime. You've started something amazing! 🚀`,
    }
  };

  /* ── PAGE INTROS ── */
  const PAGE_INTROS = {
    es: {
      sales: '¡Hola! Soy Amanda, tu guía de Super Bot 007. Puedo contarte todo sobre cómo crear tu bot IA, precios y cómo funciona. ¿Tienes alguna pregunta? 😊',
      form: '¡Hola! Soy tu guía personal. Voy a acompañarte paso a paso para crear tu bot. Son 7 pasos sencillos y al final tu bot estará 100% listo. ¡Empecemos con el Paso 1! 🚀',
      editor: '¡Hola! Estoy aquí para ayudarte a personalizar tu landing page. Puedes cambiar colores, imágenes y textos en tiempo real. ¿Por dónde empezamos?',
      landing: '¡Hola! Soy Amanda. Esta es tu landing page creada con Super Bot 007. ¿Te puedo ayudar con algo? 🌟',
    },
    en: {
      sales: "Hi! I'm Shirley, your Super Bot 007 guide. I can tell you everything about creating your AI bot, pricing, and how it all works. Any questions? 😊",
      form: "Hi! I'm your personal guide. I'll walk you through every step to build your bot. Just 7 simple steps and your bot will be 100% live at the end. Let's start with Step 1! 🚀",
      editor: "Hi! I'm here to help you customize your landing page. You can change colors, images and text in real time. Where shall we start?",
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
        bottom: 28px;
        right: 28px;
        z-index: 99990;
        width: 76px;
        height: 76px;
        border-radius: 50%;
        background: linear-gradient(135deg, #a855f7, #6d28d9);
        border: 3px solid rgba(255,255,255,.18);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        box-shadow: 0 8px 32px rgba(168,85,247,.75), 0 0 0 0 rgba(168,85,247,.4), inset 0 1px 0 rgba(255,255,255,.15);
        animation: wz-pulse 2s ease-in-out infinite;
        transition: transform .2s, box-shadow .2s;
      }
      #wz-btn:hover { transform: scale(1.12); box-shadow: 0 12px 42px rgba(168,85,247,.9), 0 0 0 0 rgba(168,85,247,.4); }
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
        color: rgba(168,85,247,.9);
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
        0%,100% { box-shadow: 0 8px 32px rgba(168,85,247,.65), 0 0 0 0 rgba(168,85,247,.5); }
        50%      { box-shadow: 0 8px 48px rgba(168,85,247,.9),  0 0 0 16px rgba(168,85,247,0); }
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
        bottom: 118px;
        right: 28px;
        z-index: 99989;
        width: 380px;
        max-width: calc(100vw - 32px);
        max-height: 580px;
        background: linear-gradient(180deg, #0d0d1f 0%, #0a0a14 100%);
        border: 1px solid rgba(168,85,247,.4);
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
    btn.setAttribute('data-label', IS_ES() ? 'Habla conmigo' : 'Talk to me');
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
7. Cuando el cliente quiera crear su bot o llenar el formulario, dile que lo llevas ahora mismo — el sistema maneja la redirección automáticamente
8. En pasos del formulario: explica EXACTAMENTE qué llenar en el paso actual, sé específico y motivador
9. NUNCA digas "haz click en el link" — tú manejas la navegación automáticamente`;
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
7. When the client says they want to create their bot or fill the form, tell them you are taking them there NOW and use action words like "Taking you there!" — the system handles the redirect automatically
8. In form steps: explain EXACTLY what to fill in the current step, be specific and encouraging
9. NEVER say "click the link" — you handle navigation automatically`;
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
      console.log('[WIZARD TTS] Calling ElevenLabs, voice:', voice);
      const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
        method: 'POST',
        headers: { 'xi-api-key': EL_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, model_id: EL_MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3 } })
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
          body: JSON.stringify({ model: 'tts-1', voice: 'shimmer', input: clean, speed: 1.05 })
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
    const hint = STEP_SCRIPTS[LANG][step];
    if (!hint) return;

    // If panel closed, open it and greet
    if (!isOpen) {
      const btn = document.getElementById('wz-btn');
      if (btn) btn.click();
      // Wait for open animation then show hint
      setTimeout(() => {
        addAgentMsg(hint);
        speak(hint);
      }, 700);
    } else {
      setTimeout(() => {
        addAgentMsg(hint);
        speak(hint);
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

    // Form page: auto-open wizard after 1.5s and greet with step guide
    if (PAGE === 'form') {
      setTimeout(() => {
        if (!isOpen) {
          const btn = document.getElementById('wz-btn');
          if (btn) btn.click();
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
