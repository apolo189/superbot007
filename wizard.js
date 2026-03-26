/**
 * ═══════════════════════════════════════════════════════════════
 *  SUPER BOT 007 — GENIE STEP GUIDE  v3.0
 *  Auto-voice bubble on each step change. No chat, no button.
 *  Confetti + celebration on every step completion.
 *
 *  Usage: Add to any page:
 *    <script src="wizard.js"></script>
 *
 *  Optional context (set BEFORE the script tag):
 *    window.WIZARD_CONTEXT = {
 *      page: 'form',        // sales|form|editor|landing
 *      step: 1,
 *      language: 'es'
 *    }
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  /* ── KEYS & VOICES ── */
  const EL_KEY      = atob('ZGY0YTliZTg4NTUwNDM0MDI0MmIyZDFlZjk4ZjA1NDM3MDJiNmM1ZmRlOTc4MzJkYmRjNjcwZDYyNTE1MzBiYw==');
  const EL_VOICE_ES = 'pFZP5JQG7iQjIQuC4Bku'; // multilingual warm Spanish
  const EL_VOICE_EN = 'XrExE9yKIg1WjnnlVkGX'; // warm English
  const EL_MODEL_ES = 'eleven_multilingual_v2';
  const EL_MODEL_EN = 'eleven_flash_v2_5';
  const OA_KEY      = atob('c2stcHJvai1fTG11NFZfY3I5VEdVLV83QTBXYnNma0xmUjAyOFkwY1JtbnVnSUhrckxOUDRrcC1EeVB4bjZfMEgwMTFDenV5MzVjQW9DTjltOFQzQmxia0ZKR0VoV2NtMjlaQng5bGhXdFQyT2t0aWRyOHVEcHRYYVFEZ3JmQ001Qm9XSkgtcGhiY0N1ejVIZXBmOEFVTEh3VGxKQlcwWG5sSUE=');

  /* ── CONTEXT ── */
  const CTX  = window.WIZARD_CONTEXT || {};
  const PAGE = CTX.page || 'form';
  let   LANG = CTX.language || (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
  const IS_ES = () => LANG === 'es';

  /* ── STATE ── */
  let currentStep    = CTX.step || 1;
  let isSpeaking     = false;
  let audioUnlocked  = false;
  let bubbleTimer    = null;
  let currentAudio   = null;

  /* ══════════════════════════════════════════════
     STEP SCRIPTS — short, warm, conversational
  ══════════════════════════════════════════════ */
  const STEP_SCRIPTS = {
    es: {
      1: `¡Hola! Soy Amanda, tu guía de Super Bot 007. 🧞‍♀️ Vamos a crear tu bot juntos — son 7 pasos súper sencillos. Empieza llenando el nombre de tu negocio, el tipo, y la ciudad. La descripción es clave — entre más detallada, mejor responde tu bot a tus clientes. ¡Tú puedes!`,
      2: `¡Excelente, paso 2! Ahora le damos estilo a tu landing page. Elige los colores de tu marca — primario, secundario y fondo. Sube tu logo y la foto principal que tus clientes verán al entrar. Si no tienes colores definidos, no te preocupes — los cambias después en el editor.`,
      3: `Paso 3 — Servicios. Si tu negocio ofrece servicios como cortes, consultas o clases, agrégalos aquí con nombre, precio y descripción. Si solo vendes productos, puedes omitir este paso con el botón «Omitir» que está abajo y pasar directo a configurar tus productos. ¿Tienes servicios o solo vendes productos?`,
      4: `¡Vamos, paso 4! Ahora configuras cómo cobrar. Activa PayPal, Zelle, Venmo o CashApp — los que ya usas. Solo pon tu info de pago y listo. Si no cobras en línea todavía, puedes saltar este paso por ahora.`,
      5: `¡Casi a la mitad, paso 5! Sube fotos reales de tu negocio — tu local, tu trabajo, tu equipo. Hasta 8 fotos desde tu galería o por URL. Las fotos reales generan muchísima más confianza que cualquier diseño.`,
      6: `¡Paso 6, ya casi! Pon tu teléfono, WhatsApp con código de país, email y dirección. Activa tus días y horarios de atención para que el bot sepa cuándo estás disponible para citas. ¡Un paso más y terminamos!`,
      7: `¡Último paso! 🚀 Selecciona el idioma del bot y usa los botones de IA para generar automáticamente tu descripción, servicios, testimonios y preguntas frecuentes. Cuando todo esté listo, presiona Activar Bot 007. ¡Tu bot está a segundos de vivir!`,
      8: `¡FELICIDADES! 🎉 ¡Tu bot está ACTIVO! Tienes 7 días completamente GRATIS para probarlo — sin tarjeta de crédito, sin cobros. Comparte tu bot y tu landing page con tus clientes ahora mismo. Cuando termines el trial, activas tu plan desde $19.99 al mes. ¡Empezaste algo increíble, mucho éxito! 🧞‍♀️✨`,
    },
    en: {
      1: `Hi! I'm Amanda, your Super Bot 007 guide. 🧞‍♀️ We're going to create your bot together — just 7 super simple steps. Start by filling in your business name, type, and city. The description is key — the more detailed it is, the better your bot responds to clients. You've got this!`,
      2: `Excellent, step 2! Now let's style your landing page. Choose your brand colors — primary, secondary, and background. Upload your logo and the main photo your clients will see when they arrive. If you don't have set colors, no worries — you can change them later in the editor.`,
      3: `Step 3 — Services. If your business offers services like haircuts, consultations, or classes, add them here with name, price, and description. If you only sell products, you can skip this step using the «Skip» button below and go straight to setting up your products. Do you offer services or do you only sell products?`,
      4: `Let's go, step 4! Now set up how you get paid. Activate PayPal, Zelle, Venmo, or CashApp — whichever you already use. Just enter your payment info and you're done. If you don't take online payments yet, you can skip this step for now.`,
      5: `Almost halfway, step 5! Upload real photos of your business — your space, your work, your team. Up to 8 photos from your gallery or by URL. Real photos build way more trust than any design.`,
      6: `Step 6, almost there! Enter your phone, WhatsApp with country code, email, and address. Activate your business days and hours so the bot knows when you're available for appointments. One more step and we're done!`,
      7: `Last step! 🚀 Select the bot language and use the AI buttons to auto-generate your description, services, testimonials, and FAQs. When everything's ready, press Activate Bot 007. Your bot is seconds away from going live!`,
      8: `CONGRATULATIONS! 🎉 Your bot is LIVE! You have 7 days completely FREE to try it out — no credit card, no charges. Share your bot and landing page with your clients right now. When your trial ends, activate your plan starting at $19.99 per month. You started something amazing, great success! 🧞‍♀️✨`,
    }
  };

  /* ══════════════════════════════════════════════
     CONFETTI ENGINE — pure canvas, no library
  ══════════════════════════════════════════════ */
  function launchConfetti(duration) {
    duration = duration || 3000;
    const canvas = document.createElement('canvas');
    canvas.id = 'wz-confetti-canvas';
    canvas.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      pointer-events:none;z-index:999999;
    `;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const emojis = ['🎉','🎊','✨','🌟','💫','🎁','🏆','⭐','🎈','🚀','💥','🔥'];
    const particles = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        vy: 2 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 3,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        size: 16 + Math.random() * 20,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        opacity: 1,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.05 + Math.random() * 0.05
      });
    }

    const startTime = Date.now();
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.wobble) * 1.5;
        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotSpeed;
        p.opacity = Math.max(0, 1 - Math.pow(progress, 1.5));

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      });

      if (elapsed < duration) {
        requestAnimationFrame(draw);
      } else {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }
    draw();
  }

  /* special big celebration for last step */
  function launchMegaCelebration() {
    launchConfetti(5000);
    // second wave after 800ms
    setTimeout(() => launchConfetti(4000), 800);
  }

  /* ══════════════════════════════════════════════
     BUBBLE UI
  ══════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById('wz-styles')) return;
    const style = document.createElement('style');
    style.id = 'wz-styles';
    style.textContent = `
      /* ── GENIE BUBBLE ── */
      #wz-bubble {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99990;
        width: 340px;
        max-width: calc(100vw - 32px);
        background: linear-gradient(160deg, #0d0d1f 0%, #13132a 100%);
        border: 1.5px solid rgba(255,69,0,0.45);
        border-radius: 20px;
        box-shadow: 0 16px 60px rgba(0,0,0,0.75), 0 0 40px rgba(255,69,0,0.15);
        padding: 0;
        overflow: hidden;
        transform: translateY(30px) scale(0.92);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease;
      }
      #wz-bubble.visible {
        transform: translateY(0) scale(1);
        opacity: 1;
        pointer-events: all;
      }

      /* header strip */
      #wz-bubble-header {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.65rem 0.9rem;
        background: rgba(255,69,0,0.09);
        border-bottom: 1px solid rgba(255,0,153,0.18);
      }
      .wz-bav {
        width: 36px; height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg,#ff4500,#ff0099);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.15rem; flex-shrink: 0;
        position: relative;
      }
      .wz-bav-dot {
        position: absolute; bottom: 0px; right: 0px;
        width: 10px; height: 10px;
        background: #00c853; border-radius: 50%;
        border: 2px solid #0d0d1f;
      }
      .wz-bname {
        font-size: 0.85rem; font-weight: 800;
        color: #f0f0ff; font-family: 'Inter',sans-serif;
        flex: 1;
      }
      .wz-bstep {
        font-size: 0.68rem; color: rgba(255,150,50,0.85);
        font-weight: 700; font-family: 'Inter',sans-serif;
        background: rgba(255,69,0,0.12);
        padding: 0.2rem 0.5rem; border-radius: 20px;
      }
      #wz-bubble-close {
        background: none; border: none;
        color: rgba(255,255,255,0.35); font-size: 0.9rem;
        cursor: pointer; padding: 0.2rem 0.4rem;
        transition: color 0.2s; line-height: 1;
      }
      #wz-bubble-close:hover { color: #fff; }

      /* body */
      #wz-bubble-body {
        padding: 0.85rem 1rem 1rem;
        display: flex; gap: 0.55rem; align-items: flex-start;
      }

      /* wave animation (speaking) */
      #wz-bwave {
        display: none;
        flex-shrink: 0;
        align-items: flex-end;
        gap: 2px;
        height: 28px;
        margin-top: 2px;
      }
      #wz-bwave.active { display: flex; }
      #wz-bwave span {
        width: 3px; border-radius: 2px;
        background: linear-gradient(to top,#ff4500,#ff0099);
        animation: wz-wbar 0.65s ease-in-out infinite alternate;
      }
      #wz-bwave span:nth-child(1){height:6px; animation-delay:0s;}
      #wz-bwave span:nth-child(2){height:14px;animation-delay:0.08s;}
      #wz-bwave span:nth-child(3){height:22px;animation-delay:0.15s;}
      #wz-bwave span:nth-child(4){height:14px;animation-delay:0.1s;}
      #wz-bwave span:nth-child(5){height:6px; animation-delay:0.2s;}
      @keyframes wz-wbar {
        from { transform:scaleY(0.25); opacity:0.3; }
        to   { transform:scaleY(1);    opacity:1; }
      }

      /* text */
      #wz-bubble-text {
        font-size: 0.83rem;
        line-height: 1.65;
        color: #dde3f0;
        font-family: 'Inter',sans-serif;
        flex: 1;
      }

      /* progress dots */
      #wz-progress {
        display: flex; justify-content: center; gap: 5px;
        padding: 0 1rem 0.85rem;
      }
      .wz-pdot {
        width: 7px; height: 7px; border-radius: 50%;
        background: rgba(255,255,255,0.12);
        transition: all 0.3s;
      }
      .wz-pdot.done  { background: #00c853; }
      .wz-pdot.active { background: #ff4500; transform: scale(1.3); }

      /* auto-close bar */
      #wz-autoclose-bar {
        height: 3px;
        background: linear-gradient(90deg,#ff4500,#ff0099);
        width: 100%;
        transform-origin: left;
        transition: none;
      }
      #wz-autoclose-bar.running {
        transition: transform linear;
      }

      /* step celebration flash */
      .wz-step-flash {
        position: fixed; inset: 0;
        pointer-events: none; z-index: 99988;
        background: radial-gradient(circle at center, rgba(255,180,0,0.18) 0%, transparent 70%);
        animation: wz-flash 0.6s ease both;
      }
      @keyframes wz-flash {
        0%   { opacity: 0; transform: scale(0.8); }
        40%  { opacity: 1; transform: scale(1.05); }
        100% { opacity: 0; transform: scale(1.1); }
      }

      /* MOBILE */
      @media (max-width: 480px) {
        #wz-bubble { width: calc(100vw - 24px); right: 12px; bottom: 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  function buildUI() {
    const bubble = document.createElement('div');
    bubble.id = 'wz-bubble';
    bubble.innerHTML = `
      <div id="wz-bubble-header">
        <div class="wz-bav">🧞‍♀️<span class="wz-bav-dot"></span></div>
        <div class="wz-bname">Amanda</div>
        <span class="wz-bstep" id="wz-bstep-label">${IS_ES() ? 'Paso 1 de 7' : 'Step 1 of 7'}</span>
        <button id="wz-bubble-close" title="Cerrar">✕</button>
      </div>
      <div id="wz-autoclose-bar"></div>
      <div id="wz-bubble-body">
        <div id="wz-bwave">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <div id="wz-bubble-text"></div>
      </div>
      <div id="wz-progress"></div>
    `;
    document.body.appendChild(bubble);

    document.getElementById('wz-bubble-close').addEventListener('click', hideBubble);

    // Build 7 progress dots
    const prog = document.getElementById('wz-progress');
    for (let i = 1; i <= 7; i++) {
      const dot = document.createElement('div');
      dot.className = 'wz-pdot';
      dot.id = `wz-pdot-${i}`;
      prog.appendChild(dot);
    }
    updateProgressDots(currentStep);
  }

  function updateProgressDots(step) {
    for (let i = 1; i <= 7; i++) {
      const dot = document.getElementById(`wz-pdot-${i}`);
      if (!dot) continue;
      dot.className = 'wz-pdot' + (i < step ? ' done' : i === step ? ' active' : '');
    }
  }

  function showBubble(text, stepNum, autoCloseSec) {
    const bubble   = document.getElementById('wz-bubble');
    const textEl   = document.getElementById('wz-bubble-text');
    const stepLbl  = document.getElementById('wz-bstep-label');
    const bar      = document.getElementById('wz-autoclose-bar');
    if (!bubble || !textEl) return;

    // Update content
    textEl.textContent = text;
    if (stepLbl && stepNum) {
      stepLbl.textContent = IS_ES()
        ? (stepNum <= 7 ? `Paso ${stepNum} de 7` : '¡Listo!')
        : (stepNum <= 7 ? `Step ${stepNum} of 7` : 'Done!');
    }
    updateProgressDots(stepNum || currentStep);

    // Show
    bubble.classList.add('visible');

    // Auto-close bar
    clearTimeout(bubbleTimer);
    bar.style.transition = 'none';
    bar.style.transform  = 'scaleX(1)';
    if (autoCloseSec && autoCloseSec > 0) {
      // Trigger reflow then animate
      void bar.offsetWidth;
      bar.classList.add('running');
      bar.style.transition  = `transform ${autoCloseSec}s linear`;
      bar.style.transform   = 'scaleX(0)';
      bubbleTimer = setTimeout(() => hideBubble(), autoCloseSec * 1000);
    }
  }

  function hideBubble() {
    const bubble = document.getElementById('wz-bubble');
    if (bubble) bubble.classList.remove('visible');
    clearTimeout(bubbleTimer);
    stopSpeaking();
  }

  /* ══════════════════════════════════════════════
     STEP CHANGED — main trigger
  ══════════════════════════════════════════════ */
  function onStepChanged(newStep) {
    // Fire confetti on completing step (going from step N to N+1)
    if (newStep > currentStep && newStep > 1) {
      fireCelebration(newStep);
    }
    currentStep = newStep;

    const script = STEP_SCRIPTS[LANG][newStep];
    if (!script) return;

    // Show bubble — last step stays longer
    const autoSec = newStep === 8 ? 0 : 14; // step 8 stays until closed
    showBubble(script, newStep, autoSec);

    // Speak it (TTS)
    unlockAudio();
    speak(script);
  }

  /* ══════════════════════════════════════════════
     CELEBRATION
  ══════════════════════════════════════════════ */
  function fireCelebration(stepNum) {
    // Flash overlay
    const flash = document.createElement('div');
    flash.className = 'wz-step-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 700);

    // Confetti — bigger for last step
    if (stepNum === 8) {
      launchMegaCelebration();
    } else {
      launchConfetti(2800);
    }
  }

  /* ══════════════════════════════════════════════
     TTS — speak text
  ══════════════════════════════════════════════ */
  function stopSpeaking() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.src = ''; } catch(e) {}
      currentAudio = null;
    }
    isSpeaking = false;
    setWave(false);
  }

  function setWave(active) {
    const w = document.getElementById('wz-bwave');
    if (w) w.classList.toggle('active', active);
  }

  async function speak(text) {
    if (!text) return;
    stopSpeaking(); // stop any previous audio
    isSpeaking = true;
    setWave(true);

    const clean = text
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[•*_`#\[\]>~]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500);

    if (!clean) { isSpeaking = false; setWave(false); return; }

    try {
      const voice = IS_ES() ? EL_VOICE_ES : EL_VOICE_EN;
      const model = IS_ES() ? EL_MODEL_ES : EL_MODEL_EN;
      const vs    = IS_ES()
        ? { stability:0.55, similarity_boost:0.82, style:0.25, use_speaker_boost:true }
        : { stability:0.50, similarity_boost:0.80, style:0.40, use_speaker_boost:true };

      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
        method: 'POST',
        headers: { 'xi-api-key': EL_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, model_id: model, voice_settings: vs })
      });
      if (!res.ok) throw new Error('EL ' + res.status);
      const blob = await res.blob();
      await playBlob(blob);
    } catch (e) {
      // Fallback: OpenAI TTS
      try {
        const res2 = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + OA_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model:'tts-1', voice: IS_ES() ? 'nova' : 'alloy', input: clean, speed: 1.0 })
        });
        if (!res2.ok) throw new Error('OA ' + res2.status);
        const blob2 = await res2.blob();
        await playBlob(blob2);
      } catch (e2) {
        isSpeaking = false;
        setWave(false);
      }
    }
  }

  function playBlob(blob) {
    return new Promise((resolve) => {
      const url   = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudio = audio;
      audio.volume = 1;
      audio.onended = () => {
        isSpeaking = false; setWave(false);
        URL.revokeObjectURL(url); resolve();
      };
      audio.onerror = () => {
        isSpeaking = false; setWave(false);
        URL.revokeObjectURL(url); resolve();
      };
      const p = audio.play();
      if (p) p.catch(() => { isSpeaking = false; setWave(false); resolve(); });
    });
  }

  /* ══════════════════════════════════════════════
     AUDIO UNLOCK (browser autoplay policy)
  ══════════════════════════════════════════════ */
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf; src.connect(ctx.destination); src.start(0); ctx.resume();
    } catch(e) {}
  }

  /* ══════════════════════════════════════════════
     PUBLIC HOOKS
  ══════════════════════════════════════════════ */

  /* Called by form.html when step changes */
  window.wzUpdateStep = function(step) {
    if (step !== currentStep) {
      onStepChanged(step);
    }
  };

  /* Called by form.html on any user interaction (unlock audio) */
  window.wzUnlockAudio = function() { unlockAudio(); };

  /* Legacy open/close kept for compatibility */
  window.wizardOpen  = function() {};
  window.wizardClose = function() { hideBubble(); };

  /* Expose lang toggle if needed */
  window.wizardSetLang = function(newLang) {
    LANG = newLang;
  };

  /* ══════════════════════════════════════════════
     OBSERVER — watch for step-card class changes
  ══════════════════════════════════════════════ */
  function watchSteps() {
    const observer = new MutationObserver(() => {
      const active = document.querySelector('.step-card.active');
      if (!active) return;
      const n = parseInt(active.id.replace('step', ''), 10);
      if (!isNaN(n) && n !== currentStep) {
        onStepChanged(n);
      }
    });
    const root = document.querySelector('.form-wrap, form, main, body');
    observer.observe(root || document.body, {
      attributes: true, subtree: true, attributeFilter: ['class']
    });
  }

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  function init() {
    if (PAGE !== 'form' && PAGE !== 'editor') return; // only on form/editor pages

    injectStyles();
    buildUI();

    // Show step 1 intro after short delay (wait for user first interaction for audio)
    if (PAGE === 'form') {
      watchSteps();

      // Show text immediately, speak on first user gesture
      setTimeout(() => {
        const script = STEP_SCRIPTS[LANG][1];
        showBubble(script, 1, 18);

        // Try to speak after a small delay — will succeed if user already interacted
        setTimeout(() => speak(script), 600);
      }, 1200);

      // Unlock audio on first click/touch anywhere on page
      const unlockOnce = () => {
        unlockAudio();
        document.removeEventListener('click', unlockOnce);
        document.removeEventListener('touchstart', unlockOnce);
        // Retry speaking step 1 if not already speaking
        if (!isSpeaking && currentStep === 1) {
          speak(STEP_SCRIPTS[LANG][1]);
        }
      };
      document.addEventListener('click', unlockOnce);
      document.addEventListener('touchstart', unlockOnce);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
