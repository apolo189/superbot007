// ═══════════════════════════════════════════════════
// Super Bot 007 — Cloudflare Worker (Twilio WhatsApp)
// Secrets stored as CF env vars: TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM
// ═══════════════════════════════════════════════════

const FIREBASE_PROJECT = 'super-bot-007';
const FIREBASE_BASE    = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;

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

    // Secrets from env
    const TWILIO_SID   = env.TWILIO_SID   || '';
    const TWILIO_TOKEN = env.TWILIO_TOKEN || '';
    const TWILIO_FROM  = env.TWILIO_FROM  || 'whatsapp:+14155238886';

    // Health check
    if(url.pathname === '/health'){
      return new Response(JSON.stringify({status:'ok', service:'superbot007-whatsapp-worker'}),
        {headers:{'Content-Type':'application/json'}});
    }

    if(request.method !== 'POST' || url.pathname !== '/whatsapp'){
      return new Response('Super Bot 007 WhatsApp Worker — Online ✅', {status:200});
    }

    try{
      const body   = await request.text();
      const params = new URLSearchParams(body);
      const from    = params.get('From')||'';
      const msgBody = (params.get('Body')||'').trim();
      const botId   = url.searchParams.get('botId')||'';

      if(!from || !msgBody) return new Response('', {status:200});

      if(!botId){
        await sendWA(from, '❌ No botId en la URL del webhook.', TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);
        return new Response('', {status:200});
      }

      const botData = await getBot(botId);
      if(!botData){
        await sendWA(from, '❌ Bot no encontrado.', TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);
        return new Response('', {status:200});
      }

      const openaiKey = botData.openaiKey || '';
      if(!openaiKey){
        await sendWA(from,
          botData.botLanguage==='en'
            ? '⚠️ This bot has no OpenAI key configured.'
            : '⚠️ Este bot no tiene clave OpenAI configurada.',
          TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);
        return new Response('', {status:200});
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
        await sendWA(from,
          botData.botLanguage==='en'
            ? '⚠️ Could not process your message. Try again.'
            : '⚠️ No pude procesar tu mensaje. Intenta de nuevo.',
          TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);
        return new Response('', {status:200});
      }

      addToHistory(from, 'user', msgBody);
      addToHistory(from, 'assistant', reply);
      await sendWA(from, reply, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM);

      return new Response('', {status:200});

    }catch(e){
      console.error('Worker error:', e);
      return new Response('', {status:200});
    }
  }
};
