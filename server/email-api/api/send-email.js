/**
 * EL NORAN — contact form email endpoint (Vercel serverless function).
 *
 * POST /api/send-email   { name, email, message, website? }
 *
 * Sends ONE email addressed to ALL recipients in MAIL_TO (both company contacts),
 * via Resend (default) or Brevo. Optionally also notifies both WhatsApp numbers
 * through the WhatsApp Business Cloud API (see lib/whatsapp.js).
 *
 * Secrets live only in environment variables — never in the frontend.
 */
import { notifyWhatsApp } from '../lib/whatsapp.js';

const DEFAULT_RECIPIENTS = 'shahd.rafat@elnoranegypt.com,Mahmoud.ElGazar@elnoranegypt.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { name: 100, email: 254, message: 3000 };

// Basic in-memory rate limit (per warm instance): 5 requests / 10 min per IP.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const env = (k, d = '') => (process.env[k] ?? d).trim();
const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function setCors(req, res) {
  const allowed = list(env('ALLOWED_ORIGINS', 'https://shahdgamil.github.io,http://localhost:5173,http://localhost:4173'));
  const origin = req.headers.origin || '';
  if (allowed.includes('*') || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', allowed.includes('*') ? '*' : origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  return !origin || allowed.includes('*') || allowed.includes(origin);
}

function validate(body) {
  const name = String(body?.name ?? '').trim();
  const email = String(body?.email ?? '').trim();
  const message = String(body?.message ?? '').trim();
  if (!name || name.length > LIMITS.name) return { error: 'Please provide a valid name.' };
  if (!EMAIL_RE.test(email) || email.length > LIMITS.email) return { error: 'Please provide a valid email address.' };
  if (message.length < 10 || message.length > LIMITS.message) return { error: 'Please provide a message between 10 and 3000 characters.' };
  return { name, email, message };
}

function buildEmail({ name, email, message }) {
  const subject = `New website inquiry from ${name}`;
  const text = [
    'New inquiry from the EL NORAN website',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    'Message:',
    message,
    '',
    '— Reply directly to this email to respond to the sender.',
  ].join('\n');
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;border:1px solid #e6e6d8;border-radius:12px;overflow:hidden">
    <div style="background:#285900;color:#fff;padding:18px 24px">
      <h2 style="margin:0;font-size:18px">New inquiry — EL NORAN website</h2>
    </div>
    <div style="padding:24px;color:#26351D;font-size:15px;line-height:1.6">
      <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 16px"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p style="margin:0 0 6px"><strong>Message:</strong></p>
      <div style="white-space:pre-wrap;background:#FFF8DC;border-left:4px solid #F5A623;padding:12px 14px;border-radius:6px">${escapeHtml(message)}</div>
      <p style="margin:20px 0 0;font-size:13px;color:#6A775E">Reply to this email to respond directly to the sender.</p>
    </div>
  </div>`;
  return { subject, text, html };
}

async function sendWithResend({ to, from, replyTo, subject, text, html }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, reply_to: replyTo, subject, text, html }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Resend ${r.status}: ${data.message || JSON.stringify(data)}`);
  return data.id;
}

async function sendWithBrevo({ to, from, replyTo, subject, text, html }) {
  // "Name <address>" -> { name, email }
  const m = from.match(/^(.*)<(.+)>$/);
  const sender = m ? { name: m[1].trim(), email: m[2].trim() } : { email: from };
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env('BREVO_API_KEY'), 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender, to: to.map((email) => ({ email })), replyTo: { email: replyTo }, subject, textContent: text, htmlContent: html }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Brevo ${r.status}: ${data.message || JSON.stringify(data)}`);
  return data.messageId;
}

export default async function handler(req, res) {
  const originOk = setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(originOk ? 204 : 403).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  if (!originOk) return res.status(403).json({ ok: false, error: 'Origin not allowed' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  // Honeypot: real users never fill this hidden field. Pretend success for bots.
  if (body?.website) return res.status(200).json({ ok: true });

  const input = validate(body);
  if (input.error) return res.status(400).json({ ok: false, error: input.error });

  const provider = env('EMAIL_PROVIDER', 'resend').toLowerCase();
  const to = list(env('MAIL_TO', DEFAULT_RECIPIENTS));
  const from = env('MAIL_FROM');
  if (!from || !to.length || (provider === 'resend' ? !env('RESEND_API_KEY') : !env('BREVO_API_KEY'))) {
    console.error('Email API misconfigured: check EMAIL_PROVIDER, MAIL_FROM, MAIL_TO and the API key.');
    return res.status(500).json({ ok: false, error: 'Email service is not configured' });
  }

  const mail = { to, from, replyTo: input.email, ...buildEmail(input) };
  try {
    const id = provider === 'brevo' ? await sendWithBrevo(mail) : await sendWithResend(mail);
    // Optional, non-blocking for the visitor: WhatsApp alert to both representatives.
    const whatsapp = await notifyWhatsApp(input).catch((e) => { console.error('WhatsApp notify failed:', e.message); return 'failed'; });
    return res.status(200).json({ ok: true, id, recipients: to.length, whatsapp });
  } catch (err) {
    console.error('Email send failed:', err.message);
    return res.status(502).json({ ok: false, error: 'Email delivery failed' });
  }
}
