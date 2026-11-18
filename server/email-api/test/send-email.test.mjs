// Offline test: runs the handler with a mocked fetch (no real email is sent).
// Usage: node test/send-email.test.mjs
import assert from 'node:assert/strict';

const calls = [];
globalThis.fetch = async (url, opts) => {
  calls.push({ url, body: JSON.parse(opts.body), headers: opts.headers });
  return { ok: true, status: 200, json: async () => ({ id: 'test-id', messageId: 'test-mid' }), text: async () => '' };
};

const { default: handler } = await import('../api/send-email.js');

function run(body, { method = 'POST', origin = 'https://shahdgamil.github.io', ip } = {}) {
  return new Promise((resolve) => {
    const res = {
      statusCode: 200, headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      status(c) { this.statusCode = c; return this; },
      json(d) { resolve({ status: this.statusCode, data: d, headers: this.headers }); },
      end() { resolve({ status: this.statusCode, headers: this.headers }); },
    };
    handler({ method, body, headers: { origin, 'x-forwarded-for': ip || String(Math.random()) } }, res);
  });
}

const valid = { name: 'Test Buyer', email: 'buyer@example.com', message: 'Please send a quotation for oranges <b>now</b>.' };
let passed = 0;
const t = async (name, fn) => { await fn(); passed++; console.log('PASS', name); };

// --- misconfigured
delete process.env.RESEND_API_KEY;
await t('500 when not configured', async () => { const r = await run(valid); assert.equal(r.status, 500); });

process.env.RESEND_API_KEY = 're_test';
process.env.MAIL_FROM = 'EL NORAN Website <website@elnoranegypt.com>';

await t('Resend: one request to BOTH recipients', async () => {
  calls.length = 0;
  const r = await run(valid);
  assert.equal(r.status, 200); assert.equal(r.data.ok, true); assert.equal(r.data.recipients, 2);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.deepEqual(calls[0].body.to, ['shahd.rafat@elnoranegypt.com', 'Mahmoud.ElGazar@elnoranegypt.com']);
  assert.equal(calls[0].body.reply_to, 'buyer@example.com');
  assert.match(calls[0].body.html, /&lt;b&gt;now&lt;\/b&gt;/, 'HTML is escaped');
  assert.equal(r.data.whatsapp, 'disabled');
});

await t('Brevo: one request to BOTH recipients', async () => {
  process.env.EMAIL_PROVIDER = 'brevo'; process.env.BREVO_API_KEY = 'xkeysib-test';
  calls.length = 0;
  const r = await run(valid);
  assert.equal(r.status, 200);
  assert.equal(calls[0].url, 'https://api.brevo.com/v3/smtp/email');
  assert.deepEqual(calls[0].body.to.map((x) => x.email), ['shahd.rafat@elnoranegypt.com', 'Mahmoud.ElGazar@elnoranegypt.com']);
  assert.deepEqual(calls[0].body.sender, { name: 'EL NORAN Website', email: 'website@elnoranegypt.com' });
  delete process.env.EMAIL_PROVIDER;
});

await t('WhatsApp Cloud API notifies both numbers when enabled', async () => {
  process.env.WHATSAPP_TOKEN = 'tok'; process.env.WHATSAPP_PHONE_NUMBER_ID = '123';
  calls.length = 0;
  const r = await run(valid);
  assert.equal(r.data.whatsapp, 'sent');
  const wa = calls.filter((c) => c.url.includes('graph.facebook.com'));
  assert.deepEqual(wa.map((c) => c.body.to), ['201156002078', '201005857878']);
  delete process.env.WHATSAPP_TOKEN; delete process.env.WHATSAPP_PHONE_NUMBER_ID;
});

await t('400 on invalid email', async () => { const r = await run({ ...valid, email: 'nope' }); assert.equal(r.status, 400); });
await t('400 on missing name', async () => { const r = await run({ ...valid, name: ' ' }); assert.equal(r.status, 400); });
await t('400 on short message', async () => { const r = await run({ ...valid, message: 'hi' }); assert.equal(r.status, 400); });
await t('honeypot silently accepted, nothing sent', async () => {
  calls.length = 0; const r = await run({ ...valid, website: 'spam.com' });
  assert.equal(r.status, 200); assert.equal(calls.length, 0);
});
await t('403 for disallowed origin', async () => { const r = await run(valid, { origin: 'https://evil.example' }); assert.equal(r.status, 403); });
await t('CORS preflight allowed', async () => {
  const r = await run(null, { method: 'OPTIONS' });
  assert.equal(r.status, 204); assert.equal(r.headers['Access-Control-Allow-Origin'], 'https://shahdgamil.github.io');
});
await t('405 on GET', async () => { const r = await run(null, { method: 'GET' }); assert.equal(r.status, 405); });
await t('429 after 5 requests from one IP', async () => {
  let last; for (let i = 0; i < 6; i++) last = await run(valid, { ip: '9.9.9.9' });
  assert.equal(last.status, 429);
});

console.log(`\n${passed} tests passed`);
