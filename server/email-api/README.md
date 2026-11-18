# EL NORAN — Email API

A small serverless endpoint that receives the website contact form and emails **every inquiry to both company addresses in a single message**:

- `shahd.rafat@elnoranegypt.com`
- `Mahmoud.ElGazar@elnoranegypt.com`

```
POST /api/send-email
Content-Type: application/json
{ "name": "...", "email": "...", "message": "..." }

→ 200 { "ok": true, "id": "...", "recipients": 2 }
→ 400 { "ok": false, "error": "Please provide a valid email address." }
```

Features: server-side validation, HTML escaping, a honeypot field against spam bots, a CORS allow-list, basic per-IP rate limiting, Reply-To set to the visitor, and support for Resend or Brevo. API keys are read only from environment variables and never reach the browser.

No npm dependencies. It uses Node 18+'s built-in `fetch`.

---

## 1. Choose an email provider and verify the domain

To send from an `@elnoranegypt.com` address (and avoid spam folders), verify the domain with the provider.

**Resend (recommended)**
1. Create an account at https://resend.com.
2. Go to **Domains → Add Domain** → `elnoranegypt.com`. Add the DNS records it shows (SPF/DKIM) at your domain registrar, then wait for **Verified**.
3. Go to **API Keys → Create API Key** (permission: *Sending access*). Copy the key (`re_...`).

**Brevo (alternative)**
1. Create an account at https://www.brevo.com.
2. Go to **Senders, Domains & Dedicated IPs → Domains** → add and authenticate `elnoranegypt.com`.
3. Go to **SMTP & API → API Keys** → generate a key (`xkeysib-...`).

## 2. Deploy to Vercel

**Option A: dashboard**
1. Push the repository to GitHub (see the main README).
2. On https://vercel.com, go to **Add New → Project**, import the `ElNoranEgypt` repository, and set the **Root Directory** to `server/email-api`. Framework preset: **Other**.
3. Add the environment variables (below) and click **Deploy**.

**Option B: CLI**
```bash
npm i -g vercel
cd server/email-api
vercel            # first time: link/create the project
vercel env add RESEND_API_KEY      # repeat for each variable below
vercel --prod
```

Your endpoint will be `https://<project-name>.vercel.app/api/send-email`.

## 3. Environment variables

| Variable | Required | Example |
|---|---|---|
| `EMAIL_PROVIDER` | no (default `resend`) | `resend` or `brevo` |
| `RESEND_API_KEY` | if Resend | `re_xxx` |
| `BREVO_API_KEY` | if Brevo | `xkeysib-xxx` |
| `MAIL_FROM` | **yes** | `EL NORAN Website <website@elnoranegypt.com>` (must be on the verified domain) |
| `MAIL_TO` | no (defaults to both company addresses) | `shahd.rafat@elnoranegypt.com,Mahmoud.ElGazar@elnoranegypt.com` |
| `ALLOWED_ORIGINS` | no | `https://shahdgamil.github.io,http://localhost:5173` |

See [`.env.example`](.env.example). For local development with `vercel dev`, copy it to `.env.local` and fill in real values. Never commit that file.

To change recipients later, update `MAIL_TO` in Vercel and redeploy. No frontend change is needed.

## 4. Connect the website

In the GitHub repository, go to **Settings → Secrets and variables → Actions → Variables → New variable**:

- Name: `VITE_EMAIL_API_URL`
- Value: `https://<project-name>.vercel.app/api/send-email`

Then re-run **Actions → Deploy to GitHub Pages**. (This URL is public by design. The secret API key stays on Vercel.)

## 5. Test

```bash
# Offline unit tests (no email is sent; the provider is mocked)
npm test

# Live test after deploying (sends a real email to both recipients)
curl -X POST https://<project-name>.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -H "Origin: https://shahdgamil.github.io" \
  -d '{"name":"Test","email":"you@example.com","message":"Test inquiry from the API"}'
```

Check **Vercel → Project → Logs** and the provider dashboard (Resend → Emails) if something fails.

---

## Optional: WhatsApp Business Cloud API

A `wa.me` link (used by the website's **Send via WhatsApp** button) opens a chat with **one** number and the visitor must press *Send*. It cannot reach two numbers at once.

To have **both representatives automatically receive every inquiry on WhatsApp**, this API can also send a WhatsApp template message to both numbers each time the form is submitted by email. This is implemented in [`lib/whatsapp.js`](lib/whatsapp.js) and is **disabled until configured**.

Requirements (Meta policies):
1. A **Meta Business** account and a **WhatsApp Business Platform** app (https://developers.facebook.com/apps).
2. A **dedicated sender phone number** registered to the Cloud API. It must not be a number currently used in the regular WhatsApp app.
3. An **approved message template**, because business-initiated messages must use templates. Create one in WhatsApp Manager, for example:
   - Name: `new_website_inquiry`, Category: *Utility*, Language: *English*
   - Body: `New website inquiry from {{1}} ({{2}}): {{3}}`
4. A **permanent access token** (System User token with `whatsapp_business_messaging` permission).

Then set in Vercel:

| Variable | Example |
|---|---|
| `WHATSAPP_TOKEN` | `EAAG...` |
| `WHATSAPP_PHONE_NUMBER_ID` | `123456789012345` (from WhatsApp Manager → API Setup) |
| `WHATSAPP_TO` | `201156002078,201005857878` |
| `WHATSAPP_TEMPLATE` | `new_website_inquiry` |
| `WHATSAPP_TEMPLATE_LANG` | `en` |

Messaging costs follow Meta's per-conversation pricing. If the WhatsApp alert fails, the email is still delivered, and the failure is logged.
