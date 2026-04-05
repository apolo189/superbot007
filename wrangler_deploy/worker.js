// Super Bot 007 — Cloudflare Worker (Twilio WhatsApp) v3.0
// Secrets stored as CF env vars: TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM
// KV namespace SBDATA used for persistent appointments + messages storage
// ═══════════════════════════════════════════════════

const FIREBASE_PROJECT = 'super-bot-007';
const FIREBASE_BASE    = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;

// KV keys
const KV_APPOINTMENTS_KEY = 'appointments_list';
const KV_MESSAGES_KEY     = 'messages_list';
const KV_MAX_APPTS        = 500;
const KV_MAX_MSGS         = 500;

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

// ── KV helpers ────────────────────────────────────
async function kvGetList(kv, key){
  try{
    const val = await kv.get(key, 'json');
    return Array.isArray(val) ? val : [];
  }catch(e){ return []; }
}

async function kvPutList(kv, key, list){
  try{
    await kv.put(key, JSON.stringify(list));
  }catch(e){ console.warn('KV put error:', e.message); }
}

// ── Save appointment to KV (persistent across all worker instances) ──
async function saveAppointmentKV(kv, appt){
  try{
    const list = await kvGetList(kv, KV_APPOINTMENTS_KEY);
    // Avoid exact duplicates (same name+phone+botId within 60s)
    const isDup = list.some(a =>
      a.name === appt.name && a.phone === appt.phone &&
      a.botId === appt.botId && Math.abs((a.createdAt||0)-(appt.createdAt||0)) < 60000
    );
    if(!isDup){
      list.unshift(appt);
      if(list.length > KV_MAX_APPTS) list.length = KV_MAX_APPTS;
      await kvPutList(kv, KV_APPOINTMENTS_KEY, list);
    }
    return true;
  }catch(e){
    console.warn('saveAppointmentKV error:', e.message);
    return false;
  }
}

// ── Save message to KV (persistent across all worker instances) ──
async function saveMessageKV(kv, msg){
  try{
    const list = await kvGetList(kv, KV_MESSAGES_KEY);
    list.unshift(msg);
    if(list.length > KV_MAX_MSGS) list.length = KV_MAX_MSGS;
    await kvPutList(kv, KV_MESSAGES_KEY, list);
    return true;
  }catch(e){
    console.warn('saveMessageKV error:', e.message);
    return false;
  }
}

// ── Also save appointment to Firestore (best-effort, no auth needed for write) ──
async function saveAppointmentFirestore(appt){
  try{
    const now   = appt.createdAt || Date.now();
    const docId = `${now}_${Math.random().toString(36).slice(2,8)}`;
    const fields = {};
    ['name','phone','email','service','date','time','note','botId','botName','status','source','businessName'].forEach(k=>{
      if(appt[k] !== undefined) fields[k] = { stringValue: String(appt[k] || '') };
    });
    fields.createdAt = { integerValue: String(now) };
    fields.channel   = { stringValue: 'whatsapp' };
    await fetch(`${FIREBASE_BASE}/appointments/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
  }catch(e){ console.warn('saveAppointmentFirestore error:', e.message); }
}

// ── Also save message to Firestore (best-effort) ──
async function saveMessageFirestore(msg){
  try{
    const now   = msg.createdAt || Date.now();
    const docId = `${now}_${Math.random().toString(36).slice(2,8)}`;
    const payload = {
      fields: {
        from:      { stringValue: msg.from      || '' },
        to:        { stringValue: msg.to        || '' },
        body:      { stringValue: msg.body      || '' },
        message:   { stringValue: msg.body      || '' },
        direction: { stringValue: msg.direction || 'inbound' },
        botId:     { stringValue: msg.botId     || '' },
        botName:   { stringValue: msg.botName   || '' },
        channel:   { stringValue: 'whatsapp' },
        createdAt: { integerValue: now.toString() }
      }
    };
    await fetch(`${FIREBASE_BASE}/messages/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }catch(e){ console.warn('saveMessageFirestore error:', e.message); }
}

// ── Try to read appointments from Firestore (public read not guaranteed) ──
async function readAppointmentsFromFirestore(){
  try{
    const r = await fetch(`${FIREBASE_BASE}:runQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'appointments' }],
          orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
          limit: 200
        }
      })
    });
    if(!r.ok) return [];
    const docs = await r.json();
    if(!Array.isArray(docs)) return [];
    return docs
      .filter(d => d.document && d.document.fields)
      .map(d => {
        const f = d.document.fields || {};
        return {
          id: d.document.name?.split('/').pop() || '',
          name:    f.name?.stringValue    || '',
          phone:   f.phone?.stringValue   || '',
          email:   f.email?.stringValue   || '',
          service: f.service?.stringValue || '',
          date:    f.date?.stringValue    || '',
          time:    f.time?.stringValue    || '',
          note:    f.note?.stringValue    || '',
          botId:   f.botId?.stringValue   || '',
          botName: f.businessName?.stringValue || '',
          businessName: f.businessName?.stringValue || '',
          status:  f.status?.stringValue  || 'pending',
          source:  f.source?.stringValue  || '',
          createdAt: parseInt(f.createdAt?.integerValue || '0')
        };
      });
  }catch(e){ return []; }
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

// ── In-memory conversation history (per-isolate, OK for conversations) ──
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
    const kv  = env.SBDATA; // KV namespace binding

    // ── CORS preflight ──
    if(request.method === 'OPTIONS'){
      return new Response(null, { status: 204, headers: CORS });
    }

    const TWILIO_SID   = env.TWILIO_SID   || '';
    const TWILIO_TOKEN = env.TWILIO_TOKEN || '';
    const TWILIO_FROM  = env.TWILIO_FROM  || 'whatsapp:+14155238886';

    // ── /health ──
    if(url.pathname === '/health'){
      let apptCount = 0, msgCount = 0;
      if(kv){
        try{
          const appts = await kvGetList(kv, KV_APPOINTMENTS_KEY);
          const msgs  = await kvGetList(kv, KV_MESSAGES_KEY);
          apptCount = appts.length;
          msgCount  = msgs.length;
        }catch(e){}
      }
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'superbot007-whatsapp-worker',
        version: '3.0',
        storage: kv ? 'KV (persistent)' : 'memory (degraded)',
        apptCount,
        msgCount
      }), { headers:{...CORS,'Content-Type':'application/json'} });
    }

    // ── /messages — Lista de mensajes ──
    if(url.pathname === '/messages'){
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const botId = url.searchParams.get('botId') || '';
      let list = [];
      if(kv){
        list = await kvGetList(kv, KV_MESSAGES_KEY);
      }
      if(botId) list = list.filter(m => m.botId === botId);
      list = list.slice(0, limit);
      return new Response(JSON.stringify({ ok: true, count: list.length, messages: list }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    // ── /appointments — Lista de citas (KV + Firestore fallback) ──
    if(url.pathname === '/appointments'){
      const limit = parseInt(url.searchParams.get('limit') || '200');
      const botId = url.searchParams.get('botId') || '';
      let list = [];

      if(kv){
        list = await kvGetList(kv, KV_APPOINTMENTS_KEY);
      }

      // If KV is empty or unavailable, try reading from Firestore
      if(list.length === 0){
        const fsAppts = await readAppointmentsFromFirestore();
        if(fsAppts.length > 0){
          list = fsAppts;
          // Populate KV for future reads
          if(kv){
            await kvPutList(kv, KV_APPOINTMENTS_KEY, list.slice(0, KV_MAX_APPTS));
          }
        }
      }

      if(botId) list = list.filter(a => a.botId === botId);
      list = list.slice(0, limit);
      return new Response(JSON.stringify({ ok: true, count: list.length, appointments: list }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    // ── /save-appointment — Guardar cita desde el formulario del bot ──
    if(request.method === 'POST' && url.pathname === '/save-appointment'){
      try{
        const appt = await request.json();
        appt.createdAt = appt.createdAt || Date.now();
        appt.status    = appt.status    || 'pending';
        appt.source    = appt.source    || 'chatbot-form';

        const results = await Promise.allSettled([
          kv ? saveAppointmentKV(kv, appt) : Promise.resolve(false),
          saveAppointmentFirestore(appt)
        ]);

        const kvSaved = results[0].status === 'fulfilled' && results[0].value === true;
        const fsSaved = results[1].status === 'fulfilled';

        return new Response(JSON.stringify({
          ok: true,
          kv: kvSaved,
          firestore: fsSaved
        }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
      }catch(e){
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      }
    }

    // ── /stats ──
    if(url.pathname === '/stats'){
      try{
        const botId   = url.searchParams.get('botId') || '';
        const botData = botId ? await getBot(botId) : null;
        let apptCount = 0, msgCount = 0;
        if(kv){
          const appts = await kvGetList(kv, KV_APPOINTMENTS_KEY);
          const msgs  = await kvGetList(kv, KV_MESSAGES_KEY);
          apptCount = appts.length;
          msgCount  = msgs.length;
        }
        return new Response(JSON.stringify({
          ok: true,
          botActive: botData ? true : false,
          botName: botData?.businessName || '',
          conversations: conversations.size,
          messagesWA: msgCount,
          appointments: apptCount,
          version: '3.0'
        }), { headers:{...CORS,'Content-Type':'application/json'} });
      }catch(e){
        return new Response(JSON.stringify({ok:false, error:e.message}), {
          status:500, headers:{...CORS,'Content-Type':'application/json'}
        });
      }
    }

    // ── /notify ──
    if(request.method === 'POST' && url.pathname === '/notify'){
      try{
        const data = await request.json();
        const to   = `whatsapp:+${(data.to||'').replace(/\D/g,'')}`;
        const msg  = data.message || '🔔 Nueva cita agendada';
        const ok   = await sendWA(to, msg, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);
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
        'Super Bot 007 WhatsApp Worker v3.0 — Online ✅',
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

      // ── Mensaje ENTRANTE: guardar en KV + Firestore ──
      const inboundEntry = {
        from, to: TWILIO_FROM, body: msgBody, message: msgBody,
        direction: 'inbound', botId, botName,
        channel: 'whatsapp', createdAt: now
      };
      if(kv) saveMessageKV(kv, inboundEntry);
      saveMessageFirestore(inboundEntry);

      const openaiKey = botData.openaiKey || '';
      if(!openaiKey){
        const noKeyMsg = botData.botLanguage==='en'
          ? '⚠️ This bot has no OpenAI key configured.'
          : '⚠️ Este bot no tiene clave OpenAI configurada.';
        await sendWA(from, noKeyMsg, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);
        const errEntry = { from: TWILIO_FROM, to: from, body: noKeyMsg, message: noKeyMsg, direction: 'outbound', botId, botName, channel: 'whatsapp', createdAt: Date.now() };
        if(kv) saveMessageKV(kv, errEntry);
        saveMessageFirestore(errEntry);
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
        if(kv) saveMessageKV(kv, errEntry);
        saveMessageFirestore(errEntry);
        return new Response('', {status:200, headers:CORS});
      }

      addToHistory(from, 'user', msgBody);
      addToHistory(from, 'assistant', reply);
      await sendWA(from, reply, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);

      // ── Respuesta SALIENTE: guardar en KV + Firestore ──
      const outboundEntry = {
        from: TWILIO_FROM, to: from, body: reply, message: reply,
        direction: 'outbound', botId, botName,
        channel: 'whatsapp', createdAt: Date.now()
      };
      if(kv) saveMessageKV(kv, outboundEntry);
      saveMessageFirestore(outboundEntry);

      return new Response('', {status:200, headers:CORS});

    }catch(e){
      console.error('Worker error:', e);
      return new Response('', {status:200, headers:CORS});
    }
  }
};
