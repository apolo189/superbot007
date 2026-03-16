/**
 * upgrade-popup.js — Super Bot 007
 * Sistema de upgrade con YES SET + ilusión de elección
 * Se inyecta en: hub.html, card.html, landing.html, agent.html
 *
 * Uso:
 *   <script src="upgrade-popup.js"></script>
 *   Luego llamar: SB7Upgrade.intercept(e, 'landing') — pasa el evento y el tipo
 *   O automático: SB7Upgrade.init() — intercepta todos los .bot-link
 */

(function(global){
'use strict';

/* ─── STORAGE KEY ─── */
const STORAGE_KEY = 'sb7_pro_activated';
const YESSET_KEY  = 'sb7_yesset_done';

/* ─── CHECK SI YA ES PRO ─── */
function isPro(){
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

/* ─── INYECTAR CSS ─── */
function injectCSS(){
  if(document.getElementById('sb7-upgrade-css')) return;
  const s = document.createElement('style');
  s.id = 'sb7-upgrade-css';
  s.textContent = `
/* ════════════════════════════════════════
   SB7 UPGRADE SYSTEM — Estilos
════════════════════════════════════════ */
#sb7-overlay{
  position:fixed;inset:0;z-index:99998;
  background:rgba(0,0,0,0.88);
  backdrop-filter:blur(6px);
  display:flex;align-items:center;justify-content:center;
  padding:1rem;
  opacity:0;transition:opacity 0.3s ease;
  pointer-events:none;
}
#sb7-overlay.sb7-open{opacity:1;pointer-events:all;}

/* ── MODAL BASE ── */
#sb7-modal{
  background:#080810;
  border:1px solid rgba(242,66,7,0.3);
  border-radius:24px;
  width:100%;max-width:480px;
  max-height:90vh;overflow-y:auto;
  transform:translateY(30px) scale(0.97);
  transition:transform 0.35s cubic-bezier(.25,.8,.25,1);
  position:relative;
  scrollbar-width:none;
}
#sb7-modal::-webkit-scrollbar{display:none;}
#sb7-overlay.sb7-open #sb7-modal{transform:translateY(0) scale(1);}

/* Glow top border */
#sb7-modal::before{
  content:'';position:absolute;top:0;left:0;right:0;
  height:3px;border-radius:24px 24px 0 0;
  background:linear-gradient(90deg,#f24207,#FF6584,#f24207);
  background-size:200%;
  animation:sb7shimmer 2.5s linear infinite;
}
@keyframes sb7shimmer{0%{background-position:0%}100%{background-position:200%}}

#sb7-modal-inner{padding:2rem 1.8rem 1.8rem;}

/* ── CLOSE BTN ── */
#sb7-close{
  position:absolute;top:1rem;right:1rem;
  width:32px;height:32px;border-radius:50%;
  background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.1);
  color:rgba(255,255,255,0.4);
  font-size:0.85rem;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all 0.2s;z-index:1;
}
#sb7-close:hover{background:rgba(255,0,0,0.15);color:#fff;border-color:rgba(255,0,0,0.3);}

/* ── YESSET SCREEN ── */
#sb7-yesset{font-family:'Inter',sans-serif;}
.sb7-ys-title{
  font-size:1.1rem;font-weight:900;
  text-align:center;margin-bottom:0.3rem;
  color:#fff;
}
.sb7-ys-sub{
  font-size:0.78rem;color:rgba(255,255,255,0.4);
  text-align:center;margin-bottom:1.5rem;
}
.sb7-ys-q{
  margin-bottom:1.2rem;
}
.sb7-ys-q-text{
  font-size:0.85rem;font-weight:700;color:#fff;
  margin-bottom:0.6rem;display:flex;align-items:center;gap:0.5rem;
}
.sb7-ys-q-num{
  width:20px;height:20px;border-radius:50%;
  background:rgba(242,66,7,0.15);
  border:1px solid rgba(242,66,7,0.4);
  font-size:0.6rem;font-weight:900;color:#f24207;
  display:inline-flex;align-items:center;justify-content:center;
  flex-shrink:0;
}
.sb7-ys-opts{display:flex;gap:0.5rem;}
.sb7-ys-opt{
  flex:1;padding:0.65rem 0.5rem;
  background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.1);
  border-radius:12px;
  color:rgba(255,255,255,0.65);
  font-size:0.78rem;font-weight:700;
  cursor:pointer;text-align:center;
  transition:all 0.2s;
  font-family:'Inter',sans-serif;
}
.sb7-ys-opt:hover{border-color:rgba(242,66,7,0.4);color:#fff;background:rgba(242,66,7,0.06);}
.sb7-ys-opt.sb7-selected{
  border-color:#f24207;
  background:rgba(242,66,7,0.12);
  color:#f24207;
}
.sb7-ys-opt.sb7-selected::before{content:'✓ ';}

.sb7-ys-progress{
  display:flex;gap:0.3rem;margin-bottom:1.5rem;
}
.sb7-ys-prog-dot{
  flex:1;height:3px;border-radius:3px;
  background:rgba(255,255,255,0.08);
  transition:background 0.3s;
}
.sb7-ys-prog-dot.done{background:#f24207;}

.sb7-ys-next{
  width:100%;padding:0.85rem;
  background:linear-gradient(135deg,#f24207,#FF6584);
  border:none;border-radius:14px;
  color:#fff;font-weight:800;font-size:0.9rem;
  cursor:pointer;
  opacity:0.4;pointer-events:none;
  transition:all 0.3s;
  font-family:'Inter',sans-serif;
  margin-top:0.5rem;
}
.sb7-ys-next.sb7-ready{opacity:1;pointer-events:all;}
.sb7-ys-next.sb7-ready:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(242,66,7,0.4);}

/* ── UPGRADE SCREEN ── */
#sb7-upgrade{font-family:'Inter',sans-serif;display:none;}

.sb7-up-badge{
  display:inline-flex;align-items:center;gap:0.4rem;
  padding:0.3rem 0.9rem;
  background:rgba(242,66,7,0.1);
  border:1px solid rgba(242,66,7,0.3);
  border-radius:50px;
  font-size:0.68rem;font-weight:800;
  color:#f24207;text-transform:uppercase;letter-spacing:0.1em;
  margin-bottom:1rem;
}
.sb7-up-ready-anim{
  font-size:3rem;text-align:center;
  margin-bottom:0.5rem;
  animation:sb7bounce 0.6s ease;
}
@keyframes sb7bounce{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}

.sb7-up-title{
  font-size:1.3rem;font-weight:900;
  text-align:center;margin-bottom:0.3rem;color:#fff;
  line-height:1.3;
}
.sb7-up-title .grad{
  background:linear-gradient(135deg,#f24207,#FF6584);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.sb7-up-sub{
  font-size:0.8rem;color:rgba(255,255,255,0.45);
  text-align:center;margin-bottom:1.3rem;line-height:1.6;
}

/* Choice cards */
.sb7-choices{display:flex;flex-direction:column;gap:0.7rem;margin-bottom:1rem;}

.sb7-choice{
  border-radius:16px;padding:1.1rem 1.2rem;
  cursor:pointer;transition:all 0.3s;
  position:relative;overflow:hidden;
}
.sb7-choice-now{
  background:linear-gradient(135deg,rgba(242,66,7,0.12),rgba(255,101,132,0.08));
  border:2px solid rgba(242,66,7,0.4);
}
.sb7-choice-now:hover{
  border-color:#f24207;
  box-shadow:0 8px 30px rgba(242,66,7,0.25);
  transform:translateY(-2px);
}
.sb7-choice-demo{
  background:rgba(255,255,255,0.02);
  border:1px solid rgba(255,255,255,0.08);
  opacity:0.7;
}
.sb7-choice-demo:hover{border-color:rgba(255,255,255,0.2);opacity:0.9;}

.sb7-choice-tag{
  font-size:0.62rem;font-weight:800;
  text-transform:uppercase;letter-spacing:0.1em;
  margin-bottom:0.4rem;
}
.sb7-choice-now .sb7-choice-tag{color:#f24207;}
.sb7-choice-demo .sb7-choice-tag{color:rgba(255,255,255,0.3);}

.sb7-choice-main{
  font-size:0.95rem;font-weight:800;
  color:#fff;margin-bottom:0.35rem;
}
.sb7-choice-items{
  display:flex;flex-wrap:wrap;gap:0.3rem;
}
.sb7-choice-item{
  font-size:0.65rem;font-weight:700;
  padding:0.18rem 0.5rem;border-radius:20px;
}
.sb7-choice-now .sb7-choice-item{
  background:rgba(242,66,7,0.1);
  border:1px solid rgba(242,66,7,0.25);
  color:rgba(255,255,255,0.7);
}
.sb7-choice-demo .sb7-choice-item{
  background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.08);
  color:rgba(255,255,255,0.3);
}

/* Price inside now card */
.sb7-price-row{
  display:flex;align-items:center;justify-content:space-between;
  margin-top:0.6rem;padding-top:0.6rem;
  border-top:1px solid rgba(242,66,7,0.15);
}
.sb7-price-big{
  font-family:'Orbitron',monospace;
  font-size:1.5rem;font-weight:900;
  background:linear-gradient(135deg,#f24207,#FF6584);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  line-height:1;
}
.sb7-price-info{text-align:right;}
.sb7-price-per{font-size:0.65rem;color:rgba(255,255,255,0.4);display:block;}
.sb7-price-save{
  font-size:0.65rem;font-weight:800;
  color:#43E97B;
  background:rgba(67,233,123,0.1);
  border:1px solid rgba(67,233,123,0.25);
  border-radius:20px;padding:0.1rem 0.5rem;
}

/* Timer */
.sb7-timer{
  display:flex;align-items:center;justify-content:center;gap:0.4rem;
  margin-bottom:1rem;
  font-size:0.72rem;color:rgba(255,191,36,0.8);font-weight:700;
}
.sb7-timer-num{
  font-family:'Orbitron',monospace;
  font-size:0.85rem;color:#fbbf24;font-weight:900;
}

/* Bottom trust */
.sb7-trust{
  display:flex;flex-wrap:wrap;gap:0.5rem 1rem;
  justify-content:center;
  padding-top:0.8rem;
  border-top:1px solid rgba(255,255,255,0.05);
  margin-top:0.5rem;
}
.sb7-trust-item{
  display:flex;align-items:center;gap:0.3rem;
  font-size:0.65rem;color:rgba(255,255,255,0.3);font-weight:600;
}
.sb7-trust-item::before{content:'✓';color:#43E97B;}
`;
  document.head.appendChild(s);
}

/* ─── INYECTAR HTML ─── */
function injectHTML(){
  if(document.getElementById('sb7-overlay')) return;
  const div = document.createElement('div');
  div.innerHTML = `
<div id="sb7-overlay">
  <div id="sb7-modal">
    <button id="sb7-close" onclick="SB7Upgrade.close()">✕</button>
    <div id="sb7-modal-inner">

      <!-- ── YES SET ── -->
      <div id="sb7-yesset">
        <div class="sb7-ys-title">🎯 Casi listo — 3 preguntas rápidas</div>
        <div class="sb7-ys-sub">Configuremos tu bot exactamente como lo necesitas</div>
        <div class="sb7-ys-progress">
          <div class="sb7-ys-prog-dot" id="sb7p1"></div>
          <div class="sb7-ys-prog-dot" id="sb7p2"></div>
          <div class="sb7-ys-prog-dot" id="sb7p3"></div>
        </div>

        <!-- Q1 -->
        <div class="sb7-ys-q" id="sb7q1">
          <div class="sb7-ys-q-text">
            <span class="sb7-ys-q-num">1</span>
            ¿Tu bot responde en español o en inglés?
          </div>
          <div class="sb7-ys-opts">
            <button class="sb7-ys-opt" onclick="SB7Upgrade.ysSelect(1,'es',this)">🇪🇸 Español</button>
            <button class="sb7-ys-opt" onclick="SB7Upgrade.ysSelect(1,'en',this)">🇺🇸 Inglés</button>
          </div>
        </div>

        <!-- Q2 -->
        <div class="sb7-ys-q" id="sb7q2" style="opacity:0.3;pointer-events:none;transition:all 0.3s;">
          <div class="sb7-ys-q-text">
            <span class="sb7-ys-q-num">2</span>
            ¿Recibes notificaciones de citas por WhatsApp o email?
          </div>
          <div class="sb7-ys-opts">
            <button class="sb7-ys-opt" onclick="SB7Upgrade.ysSelect(2,'wa',this)">💬 WhatsApp</button>
            <button class="sb7-ys-opt" onclick="SB7Upgrade.ysSelect(2,'email',this)">📧 Email</button>
          </div>
        </div>

        <!-- Q3 -->
        <div class="sb7-ys-q" id="sb7q3" style="opacity:0.3;pointer-events:none;transition:all 0.3s;">
          <div class="sb7-ys-q-text">
            <span class="sb7-ys-q-num">3</span>
            ¿Quieres aparecer en Google o solo en redes sociales?
          </div>
          <div class="sb7-ys-opts">
            <button class="sb7-ys-opt" onclick="SB7Upgrade.ysSelect(3,'google',this)">🔍 Google + Redes</button>
            <button class="sb7-ys-opt" onclick="SB7Upgrade.ysSelect(3,'social',this)">📱 Solo redes</button>
          </div>
        </div>

        <button class="sb7-ys-next" id="sb7-ys-next-btn" onclick="SB7Upgrade.showUpgrade()">
          Continuar → Ver mi bot activado
        </button>
      </div>

      <!-- ── UPGRADE ── -->
      <div id="sb7-upgrade">
        <div class="sb7-up-ready-anim">🚀</div>
        <div style="text-align:center;margin-bottom:0.8rem;">
          <span class="sb7-up-badge">⚡ Tu bot está listo</span>
        </div>
        <div class="sb7-up-title">
          Solo falta <span class="grad">encenderlo</span>
        </div>
        <div class="sb7-up-sub">
          Construiste algo increíble. ¿Lo activas ahora<br/>
          y recibes tu primer cliente hoy... o esperas?
        </div>

        <!-- Timer -->
        <div class="sb7-timer">
          🔥 Precio de lanzamiento termina en:&nbsp;
          <span class="sb7-timer-num" id="sb7tH">--</span>:
          <span class="sb7-timer-num" id="sb7tM">--</span>:
          <span class="sb7-timer-num" id="sb7tS">--</span>
        </div>

        <div class="sb7-choices">

          <!-- OPCIÓN A: Activar ahora -->
          <div class="sb7-choice sb7-choice-now" onclick="SB7Upgrade.goActivate()">
            <div class="sb7-choice-tag">⚡ Activar AHORA — Oferta de hoy</div>
            <div class="sb7-choice-main">Tu bot va LIVE hoy mismo</div>
            <div class="sb7-choice-items">
              <span class="sb7-choice-item">✓ Landing page pública</span>
              <span class="sb7-choice-item">✓ WhatsApp activo</span>
              <span class="sb7-choice-item">✓ Citas abiertas</span>
              <span class="sb7-choice-item">✓ QR funcional</span>
              <span class="sb7-choice-item">✓ 4 bots extra</span>
              <span class="sb7-choice-item">✓ Hosting incluido</span>
            </div>
            <div class="sb7-price-row">
              <div class="sb7-price-big">$10.99</div>
              <div class="sb7-price-info">
                <span class="sb7-price-per">/mes · todo incluido</span>
                <span class="sb7-price-save">Ahorra $4 vs el lunes</span>
              </div>
            </div>
          </div>

          <!-- OPCIÓN B: Quedarse en demo -->
          <div class="sb7-choice sb7-choice-demo" onclick="SB7Upgrade.close()">
            <div class="sb7-choice-tag">😴 Esperar al lunes</div>
            <div class="sb7-choice-main">Seguir en modo DEMO</div>
            <div class="sb7-choice-items">
              <span class="sb7-choice-item">✗ Links no compartibles</span>
              <span class="sb7-choice-item">✗ WhatsApp inactivo</span>
              <span class="sb7-choice-item">✗ Sin clientes aún</span>
              <span class="sb7-choice-item">+ pagas $14.99/mes el lunes</span>
            </div>
          </div>

        </div>

        <div class="sb7-trust">
          <div class="sb7-trust-item">Sin contrato</div>
          <div class="sb7-trust-item">Cancela cuando quieras</div>
          <div class="sb7-trust-item">Sin cargos ocultos</div>
          <div class="sb7-trust-item">Soporte en español</div>
        </div>
      </div>

    </div>
  </div>
</div>`;
  document.body.appendChild(div.firstElementChild);
}

/* ─── YES SET STATE ─── */
let ysAnswers = {1:null, 2:null, 3:null};
let ysCount = 0;

/* ─── TIMER ─── */
let timerInterval = null;
function startTimer(){
  function tick(){
    const now = new Date();
    const target = new Date();
    target.setHours(23,59,59,0);
    if(now > target) target.setDate(target.getDate()+1);
    const diff = target - now;
    const h = Math.floor(diff/3600000);
    const m = Math.floor((diff%3600000)/60000);
    const s = Math.floor((diff%60000)/1000);
    const tH = document.getElementById('sb7tH');
    const tM = document.getElementById('sb7tM');
    const tS = document.getElementById('sb7tS');
    if(tH) tH.textContent = String(h).padStart(2,'0');
    if(tM) tM.textContent = String(m).padStart(2,'0');
    if(tS) tS.textContent = String(s).padStart(2,'0');
  }
  tick();
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(tick, 1000);
}

/* ─── API PÚBLICA ─── */
const SB7Upgrade = {

  init: function(){
    injectCSS();
    injectHTML();
    // Interceptar todos los .bot-link en hub
    document.addEventListener('click', function(e){
      const link = e.target.closest('.bot-link');
      if(!link) return;
      const href = link.getAttribute('href') || '';
      // Solo interceptar landing, card, agent — NO editor
      if(href.includes('landing') || href.includes('card') || href.includes('agent')){
        if(!isPro()){
          e.preventDefault();
          SB7Upgrade.open(href);
        }
      }
    });
    // Interceptar botones de compartir en card.html
    document.addEventListener('click', function(e){
      const btn = e.target.closest('#shareWA, .share-btn-sm');
      if(!btn) return;
      if(!isPro()){
        e.preventDefault();
        e.stopImmediatePropagation();
        SB7Upgrade.open(null);
      }
    });
  },

  // Abrir el popup con YES SET
  open: function(redirectUrl){
    SB7Upgrade._redirect = redirectUrl;
    // Reset YES SET
    ysAnswers = {1:null,2:null,3:null};
    ysCount = 0;
    // Reset UI
    const ysEl = document.getElementById('sb7-yesset');
    const upEl = document.getElementById('sb7-upgrade');
    if(ysEl) ysEl.style.display = 'block';
    if(upEl) upEl.style.display = 'none';
    // Reset progress dots
    [1,2,3].forEach(n=>{
      const d = document.getElementById('sb7p'+n);
      if(d) d.classList.remove('done');
    });
    // Reset questions
    const q2 = document.getElementById('sb7q2');
    const q3 = document.getElementById('sb7q3');
    if(q2){q2.style.opacity='0.3';q2.style.pointerEvents='none';}
    if(q3){q3.style.opacity='0.3';q3.style.pointerEvents='none';}
    // Reset buttons
    document.querySelectorAll('.sb7-ys-opt').forEach(b=>b.classList.remove('sb7-selected'));
    const nextBtn = document.getElementById('sb7-ys-next-btn');
    if(nextBtn) nextBtn.classList.remove('sb7-ready');
    // Show overlay
    const overlay = document.getElementById('sb7-overlay');
    if(overlay){
      overlay.style.display='flex';
      requestAnimationFrame(()=>overlay.classList.add('sb7-open'));
    }
  },

  close: function(){
    const overlay = document.getElementById('sb7-overlay');
    if(overlay){
      overlay.classList.remove('sb7-open');
      setTimeout(()=>{overlay.style.display='none';},300);
    }
    if(timerInterval) clearInterval(timerInterval);
  },

  // YES SET — seleccionar opción
  ysSelect: function(q, val, btn){
    // Deselect siblings
    btn.parentElement.querySelectorAll('.sb7-ys-opt').forEach(b=>b.classList.remove('sb7-selected'));
    btn.classList.add('sb7-selected');
    ysAnswers[q] = val;
    // Mark dot
    const dot = document.getElementById('sb7p'+q);
    if(dot) dot.classList.add('done');
    // Unlock next question
    if(q===1){
      const q2 = document.getElementById('sb7q2');
      if(q2){q2.style.opacity='1';q2.style.pointerEvents='all';}
    }
    if(q===2){
      const q3 = document.getElementById('sb7q3');
      if(q3){q3.style.opacity='1';q3.style.pointerEvents='all';}
    }
    // Check if all answered
    if(ysAnswers[1] && ysAnswers[2] && ysAnswers[3]){
      const nextBtn = document.getElementById('sb7-ys-next-btn');
      if(nextBtn) nextBtn.classList.add('sb7-ready');
    }
  },

  // Mostrar pantalla de upgrade después del YES SET
  showUpgrade: function(){
    localStorage.setItem(YESSET_KEY,'true');
    const ysEl = document.getElementById('sb7-yesset');
    const upEl = document.getElementById('sb7-upgrade');
    if(ysEl){
      ysEl.style.transition='opacity 0.25s';
      ysEl.style.opacity='0';
      setTimeout(()=>{
        ysEl.style.display='none';
        if(upEl){
          upEl.style.display='block';
          upEl.style.opacity='0';
          upEl.style.transition='opacity 0.25s';
          requestAnimationFrame(()=>{upEl.style.opacity='1';});
        }
        startTimer();
      },250);
    }
  },

  // Ir a activar (Stripe / link de pago)
  goActivate: function(){
    // Por ahora abre el form de registro con parámetro upgrade
    // Cuando tengas Stripe, reemplaza esta URL
    const payUrl = 'https://apolo189.github.io/superbot007/form.html?upgrade=pro&price=10.99';
    window.open(payUrl,'_blank');
    SB7Upgrade.close();
  },

  // Forzar modo PRO (para testing o cuando se confirma pago)
  activatePro: function(){
    localStorage.setItem(STORAGE_KEY,'true');
    SB7Upgrade.close();
    console.log('%c✅ Super Bot 007 — PRO activado','color:#43E97B;font-weight:bold;font-size:14px;');
  },

  // Para testing: resetear
  reset: function(){
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(YESSET_KEY);
    console.log('%c🔄 SB7 Upgrade reset','color:#f24207;font-weight:bold;');
  },

  isPro: isPro,
  _redirect: null
};

global.SB7Upgrade = SB7Upgrade;

/* ─── AUTO-INIT cuando DOM esté listo ─── */
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ()=>SB7Upgrade.init());
} else {
  SB7Upgrade.init();
}

})(window);
