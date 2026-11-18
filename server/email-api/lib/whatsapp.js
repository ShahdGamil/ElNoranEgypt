/**
 * OPTIONAL: notify BOTH company WhatsApp numbers automatically using the
 * WhatsApp Business Cloud API (Meta). This is the only way to deliver one
 * inquiry to two WhatsApp numbers simultaneously — a wa.me link can only open
 * one chat at a time and the visitor must press "send" themselves.
 *
 * Disabled unless WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID are set.
 *
 * Requirements (see README):
 *  - A Meta Business account + WhatsApp Business Platform app.
 *  - A dedicated sender phone number registered to the Cloud API
 *    (it cannot be one of the two recipient numbers' personal WhatsApp).
 *  - An APPROVED message template (business-initiated messages must use templates).
 *    The default template name is "new_website_inquiry" with 3 body variables:
 *    {{1}} = name, {{2}} = email, {{3}} = message.
 */
const env = (k, d = '') => (process.env[k] ?? d).trim();

export async function notifyWhatsApp({ name, email, message }) {
  const token = env('WHATSAPP_TOKEN');
  const phoneId = env('WHATSAPP_PHONE_NUMBER_ID');
  if (!token || !phoneId) return 'disabled';

  const recipients = env('WHATSAPP_TO', '201156002078,201005857878').split(',').map((s) => s.trim()).filter(Boolean);
  const template = env('WHATSAPP_TEMPLATE', 'new_website_inquiry');
  const lang = env('WHATSAPP_TEMPLATE_LANG', 'en');
  // Template parameters cannot contain newlines/tabs or 4+ consecutive spaces.
  const clean = (s, max) => String(s).replace(/[\n\t]+/g, ' ').replace(/ {4,}/g, '   ').slice(0, max);

  const results = await Promise.allSettled(
    recipients.map(async (to) => {
      const r = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: template,
            language: { code: lang },
            components: [{
              type: 'body',
              parameters: [
                { type: 'text', text: clean(name, 100) },
                { type: 'text', text: clean(email, 254) },
                { type: 'text', text: clean(message, 900) },
              ],
            }],
          },
        }),
      });
      if (!r.ok) throw new Error(`${to}: ${r.status} ${await r.text()}`);
    })
  );
  const failed = results.filter((r) => r.status === 'rejected');
  failed.forEach((f) => console.error('WhatsApp:', f.reason?.message));
  return failed.length ? `sent ${results.length - failed.length}/${results.length}` : 'sent';
}
