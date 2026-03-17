// ═══════════════════════════════════════════════════════════════
// Super Bot 007 — PayPal Webhook Worker
// Escucha pagos de PayPal y activa el bot en Firestore
// Secrets: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID
// ═══════════════════════════════════════════════════════════════

const FIREBASE_PROJECT = 'super-bot-007';
const FIREBASE_BASE    = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;

// ── CORS headers ──────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// ── Firestore REST helpers ────────────────────────────────────
function fsVal(v) {
  if (!v) return null;
  if (v.stringValue  !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return parseInt(v.integerValue);
  if (v.doubleValue  !== undefined) return parseFloat(v.doubleValue);
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.arrayValue)  return (v.arrayValue.values || []).map(fsVal);
  if (v.mapValue)    return fsMap(v.mapValue.fields || {});
  return null;
}
function fsMap(fields) {
  const o = {};
  for (const k in fields) o[k] = fsVal(fields[k]);
  return o;
}

// Get a Firestore document (public read — no auth needed)
async function getDoc(path) {
  const r = await fetch(`${FIREBASE_BASE}/${path}`);
  if (!r.ok) return null;
  const doc = await r.json();
  return doc.fields ? fsMap(doc.fields) : null;
}

// Patch a Firestore document using Firebase REST API with API key
async function patchDoc(path, fields, apiKey) {
  const fieldPaths = Object.keys(fields).join('&updateMask.fieldPaths=');
  const url = `${FIREBASE_BASE}/${path}?updateMask.fieldPaths=${fieldPaths}&key=${apiKey}`;

  // Build Firestore field values
  const fsFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string')  fsFields[k] = { stringValue: v };
    else if (typeof v === 'boolean') fsFields[k] = { booleanValue: v };
    else if (typeof v === 'number')  fsFields[k] = { doubleValue: v };
    else fsFields[k] = { stringValue: String(v) };
  }

  const r = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: fsFields })
  });
  return r.ok;
}

// ── PayPal token ──────────────────────────────────────────────
async function getPayPalToken(clientId, clientSecret) {
  const r = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  if (!r.ok) return null;
  const d = await r.json();
  return d.access_token || null;
}

// ── Verify PayPal webhook signature ──────────────────────────
async function verifyWebhook(request, bodyText, env) {
  // If no WEBHOOK_ID configured, skip verification (dev mode)
  if (!env.PAYPAL_WEBHOOK_ID || env.PAYPAL_WEBHOOK_ID === 'placeholder') {
    return true;
  }

  const token = await getPayPalToken(env.PAYPAL_CLIENT_ID, env.PAYPAL_CLIENT_SECRET);
  if (!token) return false;

  const headers = {
    'paypal-auth-algo':         request.headers.get('paypal-auth-algo') || '',
    'paypal-cert-url':          request.headers.get('paypal-cert-url') || '',
    'paypal-transmission-id':   request.headers.get('paypal-transmission-id') || '',
    'paypal-transmission-sig':  request.headers.get('paypal-transmission-sig') || '',
    'paypal-transmission-time': request.headers.get('paypal-transmission-time') || ''
  };

  const r = await fetch('https://api-m.paypal.com/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      auth_algo:         headers['paypal-auth-algo'],
      cert_url:          headers['paypal-cert-url'],
      transmission_id:   headers['paypal-transmission-id'],
      transmission_sig:  headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id:        env.PAYPAL_WEBHOOK_ID,
      webhook_event:     JSON.parse(bodyText)
    })
  });

  if (!r.ok) return false;
  const d = await r.json();
  return d.verification_status === 'SUCCESS';
}

// ── Activate bot in Firestore ─────────────────────────────────
async function activateBot(botId, transactionId, amount, env) {
  console.log(`[PayPal] Activating bot: ${botId} | tx: ${transactionId}`);

  const ok = await patchDoc(`bots/${botId}`, {
    status:        'active',
    paidAt:        new Date().toISOString(),
    transactionId: transactionId,
    amountPaid:    amount || '10.99',
    plan:          'pro'
  }, 'AIzaSyDuc8AX8NTfEJHsJP018uG1J3b1PG4KKrQ');

  if (ok) {
    console.log(`[PayPal] ✅ Bot ${botId} activated!`);
  } else {
    console.error(`[PayPal] ❌ Failed to activate bot ${botId}`);
  }
  return ok;
}

// ── Main fetch handler ────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // Health check
    if (url.pathname === '/health' || url.pathname === '/') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'superbot007-paypal-webhook',
        version: '1.1.0'
      }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // ── Image Upload endpoint → pushes to GitHub repo ──
    // POST /upload-image { base64, fileName, botId, fieldName }
    if (request.method === 'POST' && url.pathname === '/upload-image') {
      try {
        const { base64, fileName, botId, fieldName } = await request.json();
        if (!base64 || !fileName) {
          return new Response(JSON.stringify({ ok: false, error: 'base64 and fileName required' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
          });
        }

        const GITHUB_TOKEN = env.GITHUB_TOKEN || '';
        const REPO   = 'apolo189/superbot007';
        const BRANCH = 'ESTIMADO-PRO-DEMO';

        if (!GITHUB_TOKEN) {
          return new Response(JSON.stringify({ ok: false, error: 'GITHUB_TOKEN not configured' }), {
            status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
          });
        }

        const GITHUB_HEADERS = {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SuperBot007-Worker/1.0'
        };

        // Check if file already exists (need SHA to update)
        let sha = undefined;
        const checkRes = await fetch(
          `https://api.github.com/repos/${REPO}/contents/${fileName}?ref=${BRANCH}`,
          { headers: GITHUB_HEADERS }
        );
        if (checkRes.ok) {
          const existing = await checkRes.json();
          sha = existing.sha;
        }

        // Upload file to GitHub
        const body = {
          message: `upload: image for bot ${botId} field ${fieldName}`,
          content: base64,
          branch: BRANCH
        };
        if (sha) body.sha = sha;

        const uploadRes = await fetch(
          `https://api.github.com/repos/${REPO}/contents/${fileName}`,
          {
            method: 'PUT',
            headers: GITHUB_HEADERS,
            body: JSON.stringify(body)
          }
        );

        if (!uploadRes.ok) {
          const err = await uploadRes.text();
          throw new Error('GitHub API error: ' + err);
        }

        // Return GitHub Pages public URL
        const publicUrl = `https://apolo189.github.io/superbot007/${fileName}`;
        return new Response(JSON.stringify({ ok: true, url: publicUrl }), {
          headers: { ...CORS, 'Content-Type': 'application/json' }
        });

      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      }
    }

    // ── Manual activation endpoint (for admin use) ──
    // POST /activate  { botId, transactionId }
    if (request.method === 'POST' && url.pathname === '/activate') {
      try {
        const data = await request.json();
        const { botId, transactionId, secret } = data;

        // Simple admin secret check
        if (secret !== (env.ADMIN_SECRET || 'superbot007admin')) {
          return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
            status: 401, headers: { ...CORS, 'Content-Type': 'application/json' }
          });
        }

        if (!botId) {
          return new Response(JSON.stringify({ ok: false, error: 'botId required' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
          });
        }

        const ok = await activateBot(botId, transactionId || 'manual', '10.99', env);
        return new Response(JSON.stringify({ ok, botId }), {
          headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      }
    }

    // ── PayPal IPN/Webhook endpoint ──
    if (request.method === 'POST' && url.pathname === '/paypal-webhook') {
      const bodyText = await request.text();
      let event;
      try { event = JSON.parse(bodyText); }
      catch (e) {
        return new Response('Bad JSON', { status: 400 });
      }

      console.log(`[PayPal] Event received: ${event.event_type}`);

      // Verify signature (skip if WEBHOOK_ID not set)
      const valid = await verifyWebhook(request, bodyText, env);
      if (!valid) {
        console.error('[PayPal] ❌ Signature verification failed');
        return new Response('Verification failed', { status: 400 });
      }

      // Handle payment completed events
      const eventType = event.event_type || '';
      if (
        eventType === 'PAYMENT.CAPTURE.COMPLETED' ||
        eventType === 'CHECKOUT.ORDER.APPROVED' ||
        eventType === 'PAYMENT.SALE.COMPLETED'
      ) {
        const resource = event.resource || {};
        const txId     = resource.id || event.id || '';
        const amount   = resource.amount?.value || resource.amount?.total || '10.99';

        // botId is passed via custom_id or invoice_id
        const botId =
          resource.custom_id ||
          resource.invoice_id ||
          resource.purchase_units?.[0]?.custom_id ||
          resource.purchase_units?.[0]?.invoice_id ||
          url.searchParams.get('botId') || '';

        if (botId) {
          await activateBot(botId, txId, amount, env);
        } else {
          console.warn('[PayPal] ⚠️ No botId found in webhook event');
        }
      }

      return new Response('OK', { status: 200 });
    }

    return new Response('Super Bot 007 PayPal Worker ✅', { status: 200 });
  }
};
