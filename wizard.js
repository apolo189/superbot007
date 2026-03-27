/**
 * ═══════════════════════════════════════════════════════════════
 *  SUPER BOT 007 — GENIE STEP GUIDE  v4.0
 *
 *  - Floating Genie bubble (image + name + voice wave)
 *  - Auto-speaks on every step change
 *  - NO text input, NO microphone — guide only
 *  - First message tells client: "I'm only here to guide you,
 *    let me know when you move to the next step"
 *  - Confetti on every step completion
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  /* ── KEYS & VOICES ── */
  const EL_KEY      = atob('ZGY0YTliZTg4NTUwNDM0MDI0MmIyZDFlZjk4ZjA1NDM3MDJiNmM1ZmRlOTc4MzJkYmRjNjcwZDYyNTE1MzBiYw==');
  const EL_VOICE_ES = 'pFZP5JQG7iQjIQuC4Bku';
  const EL_VOICE_EN = 'XrExE9yKIg1WjnnlVkGX';
  const EL_MODEL_ES = 'eleven_multilingual_v2';
  const EL_MODEL_EN = 'eleven_flash_v2_5';
  const OA_KEY      = atob('c2stcHJvai1fTG11NFZfY3I5VEdVLV83QTBXYnNma0xmUjAyOFkwY1JtbnVnSUhrckxOUDRrcC1EeVB4bjZfMEgwMTFDenV5MzVjQW9DTjltOFQzQmxia0ZKR0VoV2NtMjlaQng5bGhXdFQyT2t0aWRyOHVEcHRYYVFEZ3JmQ001Qm9XSkgtcGhiY0N1ejVIZXBmOEFVTEh3VGxKQlcwWG5sSUE=');

  /* ── CONTEXT ── */
  const CTX  = window.WIZARD_CONTEXT || {};
  const PAGE = CTX.page || 'form';
  // Language priority: 1) URL ?lang=  2) WIZARD_CONTEXT  3) localStorage  4) DEFAULT SPANISH
  // We do NOT use browser language — the form is in Spanish by default.
  // Only switch to English if explicitly requested via URL or context.
  (function resolveLang(){
    const urlLang = new URLSearchParams(location.search).get('lang');
    const stored  = (() => { try { return localStorage.getItem('sb007_lang'); } catch(e){ return null; } })();
    // CTX.language may have been set by form.html from URL/localStorage already
    const resolved = urlLang || CTX.language || stored || 'es';
    CTX.language = ['en','es','pt'].includes(resolved) ? resolved : 'es';
  })();
  let LANG = CTX.language || 'es';
  const IS_ES = () => LANG === 'es';

  /* ── STATE ── */
  let currentStep   = CTX.step || 1;
  let isSpeaking    = false;
  let audioUnlocked = false;
  let autoCloseTimer = null;
  let currentAudio  = null;
  let hasGreeted    = false;

  /* ── GENIE IMAGE ── */
  const GENIE_IMG = 'genie_frame_01.jpg';

  /* ══════════════════════════════════════════════
     STEP SCRIPTS
  ══════════════════════════════════════════════ */
  const STEP_SCRIPTS = {
    es: {
      1: `¡Hola! Soy Genie, tu guía de Super Bot 007. 🧞‍♀️ Solo estoy aquí para guiarte paso a paso — no puedo responder preguntas, pero no te preocupes, el formulario es muy sencillo. Empieza llenando el nombre de tu negocio, el tipo de negocio y la ciudad. La descripción es muy importante — entre más detallada, mejor va a responder tu bot. ¡Cuando termines esta sección, pasa a la siguiente hoja y yo aparezco de nuevo! 😊`,
      2: `¡Perfecto, llegaste al paso 2! 🎨 Ahora le damos estilo visual a tu landing page. Elige los colores de tu marca, sube tu logo y la foto principal que tus clientes van a ver. Si no tienes colores definidos no te preocupes — los puedes cambiar después en el editor. ¡Cuando termines esta sección, pasa a la siguiente forma y vuelvo a aparecer! 😊`,
      3: `¡Excelente, paso 3! ✂️ Aquí listas los servicios que ofreces — nombre, precio y descripción de cada uno. Eso es exactamente lo que tu bot le va a decir a tus clientes. Si solo vendes productos y no tienes servicios, usa el botón "Omitir" de abajo. ¡Cuando termines, pasa a la siguiente hoja! 😊`,
      4: `¡Muy bien, paso 4! 💳 Esta sección tiene DOS partes importantes: primero los métodos de pago — activa PayPal, Zelle, Venmo o CashApp, los que ya usas para que tus clientes te paguen directamente. Y segundo, más abajo, ¡puedes agregar todos los productos que quieres vender! — con foto, nombre, precio y descripción. Si no cobras en línea ni vendes productos todavía, puedes saltarte esta sección. ¡Cuando termines, pasa a la siguiente hoja! 😊`,
      5: `¡Genial, paso 5! 📸 Sube fotos reales de tu negocio — tu local, tu trabajo, tu equipo. Las fotos reales generan mucha más confianza que cualquier diseño. Hasta 8 fotos desde tu galería o por URL. ¡Cuando termines, avanza a la siguiente hoja! 😊`,
      6: `¡Ya casi, paso 6! 📞 Pon tu teléfono, WhatsApp con código de país, email y dirección. Activa los días y horarios que trabajas para que el bot sepa cuándo estás disponible. ¡Un paso más y terminamos — pasa a la siguiente forma! 😊`,
      7: `¡Último paso! 🚀 Selecciona el idioma de tu bot y usa los botones de IA para generar automáticamente tu descripción, servicios y preguntas frecuentes. Cuando todo esté listo, presiona el botón "Activar Bot 007". ¡Estás a segundos de tener tu bot activo! 🎉`,
      8: `¡FELICIDADES! 🎉🏆 ¡Tu bot está ACTIVO y funcionando! Tienes 7 días completamente GRATIS — sin tarjeta, sin cobros. Comparte tu bot y tu landing page con tus clientes ahora mismo. Fue un placer guiarte. ¡Tu deseo es mi orden! 🧞‍♀️✨`,
    },
    en: {
      1: `Hi! I'm Genie, your Super Bot 007 guide. 🧞‍♀️ I'm only here to guide you step by step — I can't answer questions, but don't worry, the form is very simple. Start by filling in your business name, type, and city. The description is very important — the more detailed, the better your bot responds. When you finish this section, move to the next page and I'll appear again! 😊`,
      2: `Perfect, you made it to step 2! 🎨 Now let's give your landing page a visual style. Choose your brand colors, upload your logo and the main photo your clients will see. If you don't have set colors, no worries — you can change them later in the editor. When you finish this section, move to the next form and I'll be back! 😊`,
      3: `Excellent, step 3! ✂️ List the services you offer — name, price, and description for each. That's exactly what your bot will tell your clients. If you only sell products and don't have services, use the "Skip" button below. When you finish, move to the next page! 😊`,
      4: `Great job, step 4! 💳 This section has TWO important parts: first, payment methods — activate PayPal, Zelle, Venmo, or CashApp so your clients can pay you directly. And second, scroll down to add all the products you want to sell! — with photo, name, price and description. If you don't take online payments or sell products yet, you can skip this step. When you finish, move to the next page! 😊`,
      5: `Awesome, step 5! 📸 Upload real photos of your business — your space, your work, your team. Real photos build way more trust than any design. Up to 8 photos from your gallery or by URL. When you finish, move to the next page! 😊`,
      6: `Almost there, step 6! 📞 Enter your phone, WhatsApp with country code, email, and address. Set the days and hours you work so the bot knows when you're available. One more step and we're done — move to the next form! 😊`,
      7: `Last step! 🚀 Select your bot's language and use the AI buttons to auto-generate your description, services, and FAQs. When everything's ready, press the "Activate Bot 007" button. You're seconds away from having your bot live! 🎉`,
      8: `CONGRATULATIONS! 🎉🏆 Your bot is ACTIVE and running! You have 7 days completely FREE — no card, no charges. Share your bot and landing page with your clients right now. It was a pleasure guiding you. Your wish is my command! 🧞‍♀️✨`,
    }
  };

  /* ══════════════════════════════════════════════
     STYLES
  ══════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById('wz-styles')) return;
    const s = document.createElement('style');
    s.id = 'wz-styles';
    s.textContent = `
      /* ══ GENIE FLOATING BUTTON ══ */
      #wz-fab {
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 99992;
        width: 72px;
        height: 72px;
        border-radius: 50%;
        border: none;
        padding: 0;
        cursor: pointer;
        overflow: hidden;
        box-shadow: 0 6px 28px rgba(255,69,0,0.65), 0 0 0 0 rgba(255,0,153,0.4);
        animation: wz-fab-pulse 2.2s ease-in-out infinite;
        transition: transform .2s;
        background: transparent;
      }
      #wz-fab:hover { transform: scale(1.1); }
      #wz-fab img {
        width: 100%; height: 100%;
        object-fit: cover;
        border-radius: 50%;
        display: block;
      }
      @keyframes wz-fab-pulse {
        0%,100% { box-shadow: 0 6px 28px rgba(255,69,0,.65), 0 0 0 0 rgba(255,0,153,.5); }
        50%      { box-shadow: 0 8px 40px rgba(255,69,0,.9), 0 0 0 14px rgba(255,0,153,0); }
      }
      /* label under button */
      #wz-fab-label {
        position: fixed;
        bottom: 8px;
        right: 28px;
        z-index: 99992;
        font-size: 0.6rem;
        font-weight: 800;
        color: rgba(255,100,0,.9);
        text-align: center;
        width: 72px;
        letter-spacing: .04em;
        text-transform: uppercase;
        font-family: 'Inter', sans-serif;
        pointer-events: none;
      }
      /* step badge on fab */
      #wz-fab-badge {
        position: absolute;
        top: -2px; left: -2px;
        width: 22px; height: 22px;
        background: linear-gradient(135deg,#f59e0b,#f97316);
        border-radius: 50%;
        border: 2px solid #0a0a0f;
        font-size: .62rem; font-weight: 900;
        color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Inter', sans-serif;
      }

      /* ══ PANEL ══ */
      #wz-panel {
        position: fixed;
        bottom: 112px;
        right: 28px;
        z-index: 99991;
        width: 340px;
        max-width: calc(100vw - 32px);
        background: linear-gradient(160deg,#0d0d1f 0%,#13132a 100%);
        border: 1.5px solid rgba(255,69,0,.4);
        border-radius: 22px;
        box-shadow: 0 20px 70px rgba(0,0,0,.8), 0 0 50px rgba(255,69,0,.14);
        overflow: hidden;
        transform: scale(.9) translateY(18px);
        opacity: 0;
        pointer-events: none;
        transition: transform .32s cubic-bezier(.34,1.56,.64,1), opacity .24s ease;
      }
      #wz-panel.visible {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: all;
      }

      /* ── HEADER ── */
      #wz-header {
        display: flex;
        align-items: center;
        gap: .7rem;
        padding: .75rem 1rem;
        background: rgba(255,69,0,.08);
        border-bottom: 1px solid rgba(255,0,153,.18);
      }
      #wz-genie-av {
        width: 46px; height: 46px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        border: 2px solid rgba(255,69,0,.5);
        position: relative;
      }
      #wz-genie-av img {
        width: 100%; height: 100%;
        object-fit: cover;
      }
      .wz-av-dot {
        position: absolute; bottom: 1px; right: 1px;
        width: 11px; height: 11px;
        background: #00c853; border-radius: 50%;
        border: 2px solid #0d0d1f;
      }
      .wz-hinfo { flex: 1; min-width: 0; }
      .wz-hname {
        font-size: .88rem; font-weight: 800;
        color: #f0f0ff; font-family: 'Inter',sans-serif;
      }
      .wz-hstatus {
        font-size: .62rem; color: rgba(0,200,83,.85);
        font-weight: 600; font-family: 'Inter',sans-serif;
        display: flex; align-items: center; gap: .3rem;
      }
      .wz-hstatus::before {
        content: ''; width: 6px; height: 6px;
        background: #00c853; border-radius: 50%;
        display: inline-block;
      }
      #wz-step-label {
        font-size: .68rem; color: rgba(255,150,50,.9);
        font-weight: 700; font-family: 'Inter',sans-serif;
        background: rgba(255,69,0,.12);
        padding: .22rem .55rem; border-radius: 20px;
        white-space: nowrap;
      }
      #wz-lang-btn {
        background: rgba(255,255,255,.1);
        border: 1px solid rgba(255,255,255,.2);
        border-radius: 6px;
        color: #fff; font-size: .8rem; font-weight: 700;
        cursor: pointer; padding: .18rem .38rem;
        transition: background .2s; line-height: 1.5;
        flex-shrink: 0;
      }
      #wz-lang-btn:hover { background: rgba(255,255,255,.22); }
      #wz-close-btn {
        background: none; border: none;
        color: rgba(255,255,255,.3); font-size: .9rem;
        cursor: pointer; padding: .2rem .4rem;
        transition: color .2s; line-height: 1;
        flex-shrink: 0;
      }
      #wz-close-btn:hover { color: #fff; }

      /* ── BODY — text + wave ── */
      #wz-body {
        padding: .9rem 1rem 1rem;
        display: flex;
        gap: .6rem;
        align-items: flex-start;
      }

      /* voice wave */
      #wz-wave {
        display: none;
        flex-direction: column;
        justify-content: center;
        gap: 3px;
        flex-shrink: 0;
        margin-top: 2px;
      }
      #wz-wave.active { display: flex; }
      #wz-wave span {
        display: block;
        width: 3px; border-radius: 2px;
        background: linear-gradient(to bottom,#ff4500,#ff0099);
        animation: wz-wbar .65s ease-in-out infinite alternate;
      }
      #wz-wave span:nth-child(1){height:5px;  animation-delay:0s;}
      #wz-wave span:nth-child(2){height:12px; animation-delay:.08s;}
      #wz-wave span:nth-child(3){height:20px; animation-delay:.15s;}
      #wz-wave span:nth-child(4){height:12px; animation-delay:.1s;}
      #wz-wave span:nth-child(5){height:5px;  animation-delay:.2s;}
      @keyframes wz-wbar {
        from { transform:scaleY(.2); opacity:.3; }
        to   { transform:scaleY(1);  opacity:1; }
      }

      /* message text */
      #wz-text {
        font-size: .83rem;
        line-height: 1.68;
        color: #dde3f0;
        font-family: 'Inter',sans-serif;
        flex: 1;
      }

      /* ── HINT ROW (no questions notice) ── */
      #wz-hint {
        margin: 0 1rem .85rem;
        padding: .5rem .75rem;
        background: rgba(255,150,0,.07);
        border: 1px solid rgba(255,150,0,.2);
        border-radius: 10px;
        font-size: .72rem;
        color: rgba(255,180,80,.85);
        font-family: 'Inter',sans-serif;
        display: flex;
        align-items: center;
        gap: .4rem;
        line-height: 1.4;
      }

      /* ── PROGRESS DOTS ── */
      #wz-progress {
        display: flex;
        justify-content: center;
        gap: 6px;
        padding: 0 1rem .85rem;
      }
      .wz-pdot {
        width: 8px; height: 8px;
        border-radius: 50%;
        background: rgba(255,255,255,.1);
        transition: all .3s;
      }
      .wz-pdot.done   { background: #00c853; }
      .wz-pdot.active { background: #ff4500; transform: scale(1.35); }

      /* ── AUTO-CLOSE BAR ── */
      #wz-bar {
        height: 3px;
        background: linear-gradient(90deg,#ff4500,#ff0099);
        transform-origin: left;
        width: 100%;
      }

      /* ── STEP FLASH ── */
      .wz-flash {
        position: fixed; inset: 0;
        pointer-events: none; z-index: 99988;
        background: radial-gradient(circle at center,rgba(255,200,0,.2) 0%,transparent 68%);
        animation: wz-flash-anim .55s ease both;
      }
      @keyframes wz-flash-anim {
        0%   { opacity:0; transform:scale(.85); }
        40%  { opacity:1; transform:scale(1.04); }
        100% { opacity:0; transform:scale(1.1); }
      }

      /* MOBILE */
      @media (max-width:480px){
        #wz-panel  { width:calc(100vw - 24px); right:12px; bottom:96px; }
        #wz-fab    { bottom:16px; right:16px; width:62px; height:62px; }
        #wz-fab-label { right:16px; width:62px; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════
     BUILD UI
  ══════════════════════════════════════════════ */
  function buildUI() {
    /* ── FAB button ── */
    const fab = document.createElement('button');
    fab.id = 'wz-fab';
    fab.title = IS_ES() ? 'Genie — tu guía' : 'Genie — your guide';
    fab.innerHTML = `
      <img src="${GENIE_IMG}" alt="Genie" onerror="this.style.display='none';this.parentElement.textContent='🧞‍♀️'">
      <span id="wz-fab-badge">${currentStep}</span>
    `;
    fab.addEventListener('click', togglePanel);
    document.body.appendChild(fab);

    const fabLabel = document.createElement('div');
    fabLabel.id = 'wz-fab-label';
    fabLabel.textContent = IS_ES() ? 'Tu Guía' : 'Your Guide';
    document.body.appendChild(fabLabel);

    /* ── Panel ── */
    const panel = document.createElement('div');
    panel.id = 'wz-panel';
    panel.innerHTML = `
      <div id="wz-header">
        <div id="wz-genie-av">
          <img src="${GENIE_IMG}" alt="Genie"
               onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:1.6rem;line-height:46px;text-align:center;display:block\\'>🧞‍♀️</span>'">
          <span class="wz-av-dot"></span>
        </div>
        <div class="wz-hinfo">
          <div class="wz-hname">Genie 🧞‍♀️</div>
          <div class="wz-hstatus" id="wz-status">${IS_ES() ? 'En línea · Guiándote' : 'Online · Guiding you'}</div>
        </div>
        <span id="wz-step-label">${IS_ES() ? 'Paso 1 de 7' : 'Step 1 of 7'}</span>
        <button id="wz-lang-btn" title="Cambiar idioma / Switch language">${IS_ES() ? '🇪🇸' : '🇺🇸'}</button>
        <button id="wz-close-btn" title="Cerrar">✕</button>
      </div>

      <div id="wz-bar"></div>

      <div id="wz-body">
        <div id="wz-wave">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <div id="wz-text">${IS_ES() ? 'Cargando...' : 'Loading...'}</div>
      </div>

      <div id="wz-hint">
        <span style="font-size:.9rem;">ℹ️</span>
        <span>${IS_ES()
          ? 'Solo estoy aquí para guiarte — avísame cuando pases a la siguiente sección.'
          : 'I\'m only here to guide you — let me know when you move to the next section.'
        }</span>
      </div>

      <div id="wz-progress"></div>
    `;
    document.body.appendChild(panel);

    document.getElementById('wz-close-btn').addEventListener('click', hidePanel);

    /* Language toggle */
    document.getElementById('wz-lang-btn').addEventListener('click', () => {
      LANG = IS_ES() ? 'en' : 'es';
      // Persist choice
      try { localStorage.setItem('sb007_lang', LANG); } catch(e){}
      if (CTX) CTX.language = LANG;
      // Update all text in the panel
      const btn    = document.getElementById('wz-lang-btn');
      const status = document.getElementById('wz-status');
      const lbl    = document.getElementById('wz-step-label');
      const hint   = document.querySelector('#wz-hint span:last-child');
      const textEl = document.getElementById('wz-text');
      const fabLbl = document.getElementById('wz-fab-label');
      if (btn)    btn.textContent    = IS_ES() ? '🇪🇸' : '🇺🇸';
      if (status) status.textContent = IS_ES() ? 'En línea · Guiándote' : 'Online · Guiding you';
      if (lbl)    lbl.textContent    = IS_ES()
        ? (currentStep <= 7 ? `Paso ${currentStep} de 7` : '¡Listo!')
        : (currentStep <= 7 ? `Step ${currentStep} of 7` : 'Done!');
      if (hint)   hint.textContent   = IS_ES()
        ? 'Solo estoy aquí para guiarte — avísame cuando pases a la siguiente sección.'
        : "I'm only here to guide you — let me know when you move to the next section.";
      if (fabLbl) fabLbl.textContent = IS_ES() ? 'Tu Guía' : 'Your Guide';
      // Replace script text
      const script = STEP_SCRIPTS[LANG][currentStep];
      if (textEl && script) textEl.textContent = script;
      // Re-speak in new language
      stopSpeaking();
      if (script) setTimeout(() => speak(script), 300);
    });

    /* Progress dots (7 steps) */
    const prog = document.getElementById('wz-progress');
    for (let i = 1; i <= 7; i++) {
      const d = document.createElement('div');
      d.className = 'wz-pdot';
      d.id = `wz-pd-${i}`;
      prog.appendChild(d);
    }
    refreshDots(currentStep);
  }

  /* ══════════════════════════════════════════════
     PANEL TOGGLE
  ══════════════════════════════════════════════ */
  let panelOpen = false;
  function togglePanel() {
    unlockAudio();
    panelOpen ? hidePanel() : showPanel();
  }
  function showPanel() {
    panelOpen = true;
    document.getElementById('wz-panel').classList.add('visible');
  }
  function hidePanel() {
    panelOpen = false;
    document.getElementById('wz-panel').classList.remove('visible');
    clearTimeout(autoCloseTimer);
  }

  /* ══════════════════════════════════════════════
     STEP CHANGED
  ══════════════════════════════════════════════ */
  function onStepChanged(newStep) {
    const isForward = newStep > currentStep;
    currentStep = newStep;

    /* confetti when moving forward */
    if (isForward && newStep > 1) fireCelebration(newStep);

    const script = STEP_SCRIPTS[LANG][newStep];
    if (!script) return;

    /* Update panel content */
    const textEl    = document.getElementById('wz-text');
    const stepLbl   = document.getElementById('wz-step-label');
    const fabBadge  = document.getElementById('wz-fab-badge');

    if (textEl)   textEl.textContent  = script;
    if (stepLbl)  stepLbl.textContent = IS_ES()
      ? (newStep <= 7 ? `Paso ${newStep} de 7` : '¡Listo!')
      : (newStep <= 7 ? `Step ${newStep} of 7` : 'Done!');
    if (fabBadge) fabBadge.textContent = newStep <= 7 ? newStep : '✓';

    refreshDots(newStep);

    /* Auto-open panel + auto-close after 16s (step 8 stays open) */
    showPanel();
    clearTimeout(autoCloseTimer);
    startAutoCloseBar(newStep === 8 ? 0 : 16);
    if (newStep !== 8) {
      autoCloseTimer = setTimeout(hidePanel, 16000);
    }

    /* Speak */
    unlockAudio();
    speak(script);
  }

  /* ── progress dots ── */
  function refreshDots(step) {
    for (let i = 1; i <= 7; i++) {
      const d = document.getElementById(`wz-pd-${i}`);
      if (!d) continue;
      d.className = 'wz-pdot' + (i < step ? ' done' : i === step ? ' active' : '');
    }
  }

  /* ── auto-close progress bar ── */
  function startAutoCloseBar(sec) {
    const bar = document.getElementById('wz-bar');
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.transform  = 'scaleX(1)';
    if (sec > 0) {
      void bar.offsetWidth; // reflow
      bar.style.transition = `transform ${sec}s linear`;
      bar.style.transform  = 'scaleX(0)';
    }
  }

  /* ══════════════════════════════════════════════
     CELEBRATION
  ══════════════════════════════════════════════ */
  function fireCelebration(stepNum) {
    /* flash */
    const fl = document.createElement('div');
    fl.className = 'wz-flash';
    document.body.appendChild(fl);
    setTimeout(() => fl.remove(), 700);

    /* confetti */
    const isFinal = stepNum === 8;
    launchConfetti(isFinal ? 5500 : 2800, isFinal ? 130 : 75);
    if (isFinal) setTimeout(() => launchConfetti(4000, 100), 900);
  }

  function launchConfetti(duration, count) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999999;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const EMOJIS_NORMAL = ['🎉','✨','⭐','🎊','💫','👏','🌟','✅','🎈'];
    const EMOJIS_FINAL  = ['🏆','🎊','🎉','✨','🌟','💫','🎁','🚀','💥','🔥','⭐','🥳','🧞‍♀️'];
    const pool = (count > 100) ? EMOJIS_FINAL : EMOJIS_NORMAL;

    const parts = Array.from({length: count}, () => ({
      x:  Math.random() * canvas.width,
      y:  -20 - Math.random() * 80,
      vy: 2.5 + Math.random() * 4,
      vx: (Math.random() - .5) * 3.5,
      rot: Math.random() * 360,
      rs:  (Math.random() - .5) * 10,
      sz:  (count > 100 ? 20 : 14) + Math.random() * 18,
      em:  pool[Math.floor(Math.random() * pool.length)],
      wo:  Math.random() * Math.PI * 2,
      ws:  .04 + Math.random() * .06
    }));

    const t0 = Date.now();
    (function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const prog = (Date.now() - t0) / duration;
      parts.forEach(p => {
        p.y += p.vy; p.x += p.vx + Math.sin(p.wo) * 1.8;
        p.wo += p.ws; p.rot += p.rs;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - Math.pow(prog, 1.4));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.font = p.sz + 'px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.em, 0, 0);
        ctx.restore();
      });
      if (Date.now() - t0 < duration) requestAnimationFrame(draw);
      else if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    })();
  }

  /* ══════════════════════════════════════════════
     TTS
  ══════════════════════════════════════════════ */
  function stopSpeaking() {
    if (currentAudio) { try { currentAudio.pause(); currentAudio.src=''; } catch(e){} currentAudio=null; }
    isSpeaking = false;
    setWave(false);
  }
  function setWave(on) {
    const w = document.getElementById('wz-wave');
    if (w) w.classList.toggle('active', on);
    const st = document.getElementById('wz-status');
    if (st) st.textContent = on
      ? (IS_ES() ? '🔊 Hablando...' : '🔊 Speaking...')
      : (IS_ES() ? 'En línea · Guiándote' : 'Online · Guiding you');
  }

  async function speak(text) {
    if (!text) return;
    stopSpeaking();
    isSpeaking = true;
    setWave(true);

    const clean = text.replace(/https?:\/\/\S+/g,'').replace(/[•*_`#\[\]>~]/g,'')
                      .replace(/\n+/g,'. ').replace(/\s+/g,' ').trim().slice(0, 500);
    if (!clean) { isSpeaking=false; setWave(false); return; }

    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${IS_ES()?EL_VOICE_ES:EL_VOICE_EN}`, {
        method:'POST',
        headers:{'xi-api-key':EL_KEY,'Content-Type':'application/json'},
        body: JSON.stringify({
          text: clean,
          model_id: IS_ES() ? EL_MODEL_ES : EL_MODEL_EN,
          voice_settings:{ stability:.55, similarity_boost:.82, style:.25, use_speaker_boost:true }
        })
      });
      if (!res.ok) throw new Error('EL '+res.status);
      await playBlob(await res.blob());
    } catch(e) {
      try {
        const r2 = await fetch('https://api.openai.com/v1/audio/speech',{
          method:'POST',
          headers:{'Authorization':'Bearer '+OA_KEY,'Content-Type':'application/json'},
          body: JSON.stringify({ model:'tts-1', voice: IS_ES()?'nova':'alloy', input:clean, speed:1.0 })
        });
        if (!r2.ok) throw new Error('OA '+r2.status);
        await playBlob(await r2.blob());
      } catch(e2) { isSpeaking=false; setWave(false); }
    }
  }

  function playBlob(blob) {
    return new Promise(resolve => {
      const url   = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudio = audio;
      const done = () => { isSpeaking=false; setWave(false); URL.revokeObjectURL(url); resolve(); };
      audio.onended = done;
      audio.onerror = done;
      const p = audio.play();
      if (p) p.catch(done);
    });
  }

  /* ══════════════════════════════════════════════
     AUDIO UNLOCK
  ══════════════════════════════════════════════ */
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try {
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const buf = ctx.createBuffer(1,1,22050);
      const src = ctx.createBufferSource();
      src.buffer=buf; src.connect(ctx.destination); src.start(0); ctx.resume();
    } catch(e) {}
  }

  /* ══════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════ */
  window.wzUpdateStep = function(step) {
    if (step !== currentStep) onStepChanged(step);
  };
  window.wzUnlockAudio   = unlockAudio;
  window.wizardOpen      = showPanel;
  window.wizardClose     = hidePanel;
  window.wizardSetLang   = function(l) { LANG = l; };

  /* ══════════════════════════════════════════════
     OBSERVER (watches .step-card.active class)
  ══════════════════════════════════════════════ */
  function watchSteps() {
    const observer = new MutationObserver(() => {
      const active = document.querySelector('.step-card.active');
      if (!active) return;
      const n = parseInt(active.id.replace('step',''), 10);
      if (!isNaN(n) && n !== currentStep) onStepChanged(n);
    });
    observer.observe(document.querySelector('.form-wrap, form, main, body') || document.body, {
      attributes: true, subtree: true, attributeFilter: ['class']
    });
  }

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  function init() {
    if (PAGE !== 'form' && PAGE !== 'editor') return;

    injectStyles();
    buildUI();

    if (PAGE === 'form') {
      watchSteps();

      /* ── Wait for lead modal to be dismissed before showing Genie ── */
      function startGenie() {
        /* Show step 1 intro after 1.2s */
        setTimeout(() => {
          const script = STEP_SCRIPTS[LANG][1];
          if (document.getElementById('wz-text'))
            document.getElementById('wz-text').textContent = script;
          showPanel();
          startAutoCloseBar(18);
          autoCloseTimer = setTimeout(hidePanel, 18000);

          /* Try speaking — will succeed if user already interacted */
          setTimeout(() => speak(script), 500);
        }, 1200);

        /* Unlock audio on first user interaction */
        const unlockOnce = () => {
          unlockAudio();
          document.removeEventListener('click',    unlockOnce);
          document.removeEventListener('touchstart', unlockOnce);
          /* Retry speech for step 1 if not yet spoken */
          if (!isSpeaking && currentStep === 1 && !hasGreeted) {
            hasGreeted = true;
            speak(STEP_SCRIPTS[LANG][1]);
          }
        };
        document.addEventListener('click',     unlockOnce);
        document.addEventListener('touchstart', unlockOnce);
      }

      /* Check if lead modal already dismissed (returning visitor) */
      const alreadyCaptured = (() => {
        try { return !!localStorage.getItem('sb007_lead_captured'); } catch(e){ return false; }
      })();

      if (alreadyCaptured) {
        /* No modal will appear — start Genie normally */
        startGenie();
      } else {
        /* Lead modal will appear. Watch for it to disappear, then start Genie. */
        const leadOverlay = document.getElementById('leadOverlay');
        if (!leadOverlay) {
          startGenie();
        } else {
          /* Hide FAB until modal dismissed */
          const fab = document.getElementById('wz-fab');
          if (fab) fab.style.display = 'none';

          const obs = new MutationObserver(() => {
            const isHidden = !leadOverlay.classList.contains('show') &&
                             getComputedStyle(leadOverlay).opacity === '0';
            if (isHidden) {
              obs.disconnect();
              if (fab) fab.style.display = '';
              startGenie();
            }
          });
          obs.observe(leadOverlay, { attributes: true, attributeFilter: ['class', 'style'] });

          /* Fallback: if localStorage shows captured, stop waiting */
          const poll = setInterval(() => {
            try {
              if (localStorage.getItem('sb007_lead_captured')) {
                clearInterval(poll);
                obs.disconnect();
                if (fab) fab.style.display = '';
                startGenie();
              }
            } catch(e){}
          }, 500);
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
