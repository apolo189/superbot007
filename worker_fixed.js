// Super Bot 007 — Cloudflare Worker (Twilio WhatsApp) v2.2
// Secrets stored as CF env vars: TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, FIREBASE_API_KEY
// ═══════════════════════════════════════════════════

const FIREBASE_PROJECT = 'super-bot-007';
const FIREBASE_BASE    = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;

// ── CORS headers globales ─────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// ── Firestore helpers ─────────────────────────────
function fsVal(v){
  if(!v) return null;
  if(v.stringValue  !== undefined) return v.stringValue;
  if(v.integerValue !== undefined) return parseInt(v.integerValue);
  if(v.doubleValue  !== undefined) return parseFloat(v.doubleValue);
  if(v.booleanValue !== undefined) return v.booleanValue;
  if(v.arrayValue)  return (v.arrayValue.values||[]).map(fsVal);
  if(v.mapValue)    return fsMap(v.mapValue.fields||{});
  return null;
}
function fsMap(fields){
  const o={};
  for(const k in fields) o[k]=fsVal(fields[k]);
  return o;
}

async function getBot(botId){
  const r = await fetch(`${FIREBASE_BASE}/bots/${botId}`);
  if(!r.ok) return null;
  const doc = await r.json();
  if(!doc.fields) return null;
  return fsMap(doc.fields);
}

// ── Guardar mensaje en Firestore ────────────────────
// Requiere que las reglas de Firestore permitan write en /messages
async function saveMessage({ from, to, body, direction, botId, botName }){
  try {
    const now   = Date.now();
    const docId = `${now}_${Math.random().toString(36).slice(2,8)}`;
    const payload = {
      fields: {
        from:      { stringValue: from      || '' },
        to:        { stringValue: to        || '' },
        body:      { stringValue: body      || '' },
        message:   { stringValue: body      || '' },
        direction: { stringValue: direction || 'inbound' },
        botId:     { stringValue: botId     || '' },
        botName:   { stringValue: botName   || '' },
        channel:   { stringValue: 'whatsapp' },
        createdAt: { integerValue: now.toString() }
      }
    };
    const r = await fetch(
      `${FIREBASE_BASE}/messages/${docId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );
    if(!r.ok){
      const err = await r.json().catch(()=>({}));
      console.warn('saveMessage HTTP error:', r.status, JSON.stringify(err));
    }
    return r.ok;
  } catch(e){
    console.warn('saveMessage error:', e.message);
    return false;
  }
}

// ── In-memory message log (fallback if Firestore rules block writes) ──
// Max 500 entries to avoid memory issues
const msgLog = [];
function logMessage(entry){
  msgLog.unshift(entry);
  if(msgLog.length > 500) msgLog.length = 500;
}

// ── Twilio helpers ────────────────────────────────
function twilioAuth(sid, token){
  return 'Basic ' + btoa(`${sid}:${token}`);
}
async function sendWA(to, body, sid, token, from){
  const params = new URLSearchParams({ From: from, To: to, Body: body });
  const r = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': twilioAuth(sid, token),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    }
  );
  return r.ok;
}

// ── OpenAI helper ─────────────────────────────────
async function callOpenAI(apiKey, model, messages){
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model: model||'gpt-4o-mini', messages, max_tokens:500, temperature:0.7 })
  });
  if(!r.ok) return null;
  const d = await r.json();
  return d.choices?.[0]?.message?.content || null;
}

// ── System prompt builder ─────────────────────────
function buildSystemPrompt(d){
  const lang = d.botLanguage||'es';
  const isEN = lang==='en';
  const isPT = lang==='pt';

  const services = (Array.isArray(d.services)?d.services:[])
    .map(s=>`- ${s.name||''}${s.price?' ('+s.price+')':''}${s.desc?' — '+s.desc:''}`).join('\n')||'No especificado';
  const products = (Array.isArray(d.products)?d.products:[])
    .map(p=>`- ${p.name||''}${p.price?' ($'+p.price+')':''}${p.desc?' — '+p.desc:''}`).join('\n')||'';
  const faqs = (Array.isArray(d.faqs)?d.faqs:[])
    .map(f=>`Q: ${f.q||''}\nA: ${f.a||''}`).join('\n')||'';

  const hours = d.hours||{};
  const DAYS = isEN
    ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    : isPT
    ? ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
    : ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const DOW_KEYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const hoursStr = DAYS.map((day,i)=>{
    const k=DOW_KEYS[i]; const h=hours[k];
    if(!h) return `${day}: ${isEN?'Closed':'Cerrado'}`;
    return h.open ? `${day}: ${h.from||'09:00'} - ${h.to||'18:00'}` : `${day}: ${isEN?'Closed':'Cerrado'}`;
  }).join('\n');

  if(isEN) return `You are a virtual assistant for ${d.businessName||'this business'}, a ${d.businessType||'business'} in ${d.city||d.businessCity||''}.
Description: ${d.description||'A business dedicated to providing the best service.'}
SERVICES:\n${services}
${products?'PRODUCTS:\n'+products:''}
HOURS:\n${hoursStr}
Phone: ${d.phone||''}  WhatsApp: ${d.whatsapp||d.phone||''}
${d.email?'Email: '+d.email:''}  ${d.address?'Address: '+d.address:''}
${faqs?'FAQ:\n'+faqs:''}
${d.botInstruction?'Special instructions: '+d.botInstruction:''}
RULES: Always reply in English. Be helpful, friendly and concise. For appointments say they can book on the website. Never invent info.`;

  if(isPT) return `Você é assistente virtual de ${d.businessName||''}, ${d.businessType||''} em ${d.city||d.businessCity||''}.
Descrição: ${d.description||''}
SERVIÇOS:\n${services}
${products?'PRODUTOS:\n'+products:''}
HORÁRIOS:\n${hoursStr}
Telefone: ${d.phone||''}
${faqs?'FAQ:\n'+faqs:''}
REGRAS: Sempre em Português. Seja útil e conciso.`;

  return `Eres el asistente virtual de ${d.businessName||''}, ${d.businessType||''} en ${d.city||d.businessCity||''}.
Descripción: ${d.description||''}
SERVICIOS:\n${services}
${products?'PRODUCTOS:\n'+products:''}
HORARIO:\n${hoursStr}
Teléfono: ${d.phone||''}  WhatsApp: ${d.whatsapp||d.phone||''}
${d.email?'Email: '+d.email:''}  ${d.address?'Dirección: '+d.address:''}
${faqs?'PREGUNTAS FRECUENTES:\n'+faqs:''}
${d.botInstruction?'Instrucciones especiales: '+d.botInstruction:''}
REGLAS: Siempre en español. Sé útil, amable y conciso. Para citas di que pueden reservar en la página web. Nunca inventes info que no esté aquí.`;
}

// ── In-memory conversation history ───────────────
const conversations = new Map();
function getHistory(phone){ return conversations.get(phone)||[]; }
function addToHistory(phone, role, content){
  const hist = getHistory(phone);
  hist.push({role, content});
  if(hist.length>10) hist.splice(0, hist.length-10);
  conversations.set(phone, hist);
}

// ── Main handler ──────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── CORS preflight — responde a TODAS las rutas ──
    if(request.method === 'OPTIONS'){
      return new Response(null, { status: 204, headers: CORS });
    }

    // Secrets from env
    const TWILIO_SID   = env.TWILIO_SID   || '';
    const TWILIO_TOKEN = env.TWILIO_TOKEN || '';
    const TWILIO_FROM  = env.TWILIO_FROM  || 'whatsapp:+14155238886';

    // ── Health check ──
    if(url.pathname === '/health'){
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'superbot007-whatsapp-worker',
          version: '2.2',
          msgCount: msgLog.length
        }),
        { headers:{...CORS,'Content-Type':'application/json'} }
      );
    }

    // ── /messages — Lista de mensajes desde memoria (fallback dashboard) ──
    if(url.pathname === '/messages'){
      const limit  = parseInt(url.searchParams.get('limit') ||'100');
      const botId  = url.searchParams.get('botId')||'';
      let list = botId ? msgLog.filter(m=>m.botId===botId) : msgLog;
      list = list.slice(0, limit);
      return new Response(JSON.stringify({ ok: true, count: list.length, messages: list }), {
        headers:{...CORS,'Content-Type':'application/json'}
      });
    }

    // ── /stats — Estadísticas para el dashboard ──
    if(url.pathname === '/stats'){
      try{
        const botId   = url.searchParams.get('botId') || '';
        const botData = botId ? await getBot(botId) : null;
        const stats   = {
          ok: true,
          botActive: botData ? true : false,
          botName: botData?.businessName || '',
          conversations: conversations.size,
          messagesWA: msgLog.length,
          version: '2.2'
        };
        return new Response(JSON.stringify(stats), {
          headers:{...CORS,'Content-Type':'application/json'}
        });
      }catch(e){
        return new Response(JSON.stringify({ok:false, error:e.message}), {
          status:500, headers:{...CORS,'Content-Type':'application/json'}
        });
      }
    }

    // ── /notify — Notificación al dueño cuando alguien agenda una cita ──
    if(request.method === 'POST' && url.pathname === '/notify'){
      try{
        const data   = await request.json();
        const to     = `whatsapp:+${(data.to||'').replace(/\D/g,'')}`;
        const msg    = data.message || '🔔 Nueva cita agendada';
        const ok     = await sendWA(to, msg, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);
        return new Response(JSON.stringify({ok}), {
          headers:{...CORS,'Content-Type':'application/json'}
        });
      }catch(e){
        return new Response(JSON.stringify({ok:false, error:e.message}), {
          status:500, headers:{...CORS,'Content-Type':'application/json'}
        });
      }
    }

    // ── /whatsapp — Webhook principal de Twilio ──
    if(request.method !== 'POST' || url.pathname !== '/whatsapp'){
      return new Response(
        'Super Bot 007 WhatsApp Worker v2.2 — Online ✅',
        { status:200, headers: CORS }
      );
    }

    try{
      const body    = await request.text();
      const params  = new URLSearchParams(body);
      const from    = params.get('From')||'';
      const msgBody = (params.get('Body')||'').trim();
      const botId   = url.searchParams.get('botId')||'';

      if(!from || !msgBody) return new Response('', {status:200, headers:CORS});

      if(!botId){
        await sendWA(from, '❌ No botId en la URL del webhook.', TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);
        return new Response('', {status:200, headers:CORS});
      }

      const botData = await getBot(botId);
      if(!botData){
        await sendWA(from, '❌ Bot no encontrado.', TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);
        return new Response('', {status:200, headers:CORS});
      }

      const botName = botData.businessName || botId;
      const now     = Date.now();

      // ── Mensaje ENTRANTE: guardar en Firebase + memoria ──
      const inboundEntry = {
        from, to: TWILIO_FROM, body: msgBody, message: msgBody,
        direction: 'inbound', botId, botName,
        channel: 'whatsapp', createdAt: now
      };
      logMessage(inboundEntry);
      // Intentar guardar en Firestore (requiere reglas abiertas para /messages)
      saveMessage(inboundEntry); // sin await — no bloquear el flujo

      const openaiKey = botData.openaiKey || '';
      if(!openaiKey){
        const noKeyMsg = botData.botLanguage==='en'
          ? '⚠️ This bot has no OpenAI key configured.'
          : '⚠️ Este bot no tiene clave OpenAI configurada.';
        await sendWA(from, noKeyMsg, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);
        const errEntry = { from: TWILIO_FROM, to: from, body: noKeyMsg, message: noKeyMsg, direction: 'outbound', botId, botName, channel: 'whatsapp', createdAt: Date.now() };
        logMessage(errEntry);
        saveMessage(errEntry);
        return new Response('', {status:200, headers:CORS});
      }

      const systemPrompt = buildSystemPrompt(botData);
      const history = getHistory(from);
      const messages = [
        {role:'system', content: systemPrompt},
        ...history,
        {role:'user', content: msgBody}
      ];

      const reply = await callOpenAI(openaiKey, botData.gptModel||'gpt-4o-mini', messages);
      if(!reply){
        const errMsg = botData.botLanguage==='en'
          ? '⚠️ Could not process your message. Try again.'
          : '⚠️ No pude procesar tu mensaje. Intenta de nuevo.';
        await sendWA(from, errMsg, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);
        const errEntry = { from: TWILIO_FROM, to: from, body: errMsg, message: errMsg, direction: 'outbound', botId, botName, channel: 'whatsapp', createdAt: Date.now() };
        logMessage(errEntry);
        saveMessage(errEntry);
        return new Response('', {status:200, headers:CORS});
      }

      addToHistory(from, 'user', msgBody);
      addToHistory(from, 'assistant', reply);
      await sendWA(from, reply, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);

      // ── Respuesta SALIENTE: guardar en Firebase + memoria ──
      const outboundEntry = {
        from: TWILIO_FROM, to: from, body: reply, message: reply,
        direction: 'outbound', botId, botName,
        channel: 'whatsapp', createdAt: Date.now()
      };
      logMessage(outboundEntry);
      saveMessage(outboundEntry); // sin await

      return new Response('', {status:200, headers:CORS});

    }catch(e){
      console.error('Worker error:', e);
      return new Response('', {status:200, headers:CORS});
    }
  }
};
