# 🔔 Setup guide: SMS + Phone Call + Email + ElevenLabs

This is the operational setup for Layer 6 — the notification system. The code is done; this doc tells you how to plug in the three external services so notifications actually reach patients.

> **TL;DR:** You need 3 free accounts (Twilio, Resend, ElevenLabs) + ngrok for local testing. Total setup time: ~30 min. Total monthly cost for a small clinic: ~$10–20.

---

## What gets sent and when

| Trigger | SMS | Voice call | Email |
|---|:---:|:---:|:---:|
| **Admin creates a patient** (or resets password) | ✅ Login credentials in Arabic + French | — | ✅ HTML email with credentials (only if patient has email) |
| **Admin clicks "Marquer prêt" on a bilan** | ✅ "Your results are ready" (Arabic) | ✅ 30s later, plays ElevenLabs Darija MP3 | ✅ HTML email with bilan info |

All attempts are logged to the `notification_logs` table for audit.

---

## Part 1 — Twilio (SMS + Voice)

### 1.1 Create account
1. Go to https://www.twilio.com/try-twilio
2. Sign up (free trial gives ~$15 credit, no card needed initially)
3. Verify your personal phone number when prompted

### 1.2 Get a phone number that supports Algeria
1. **Console** → **Phone Numbers** → **Buy a number**
2. Filter:
   - **Country:** any (US numbers are cheapest, ~$1.15/month, and work for sending to Algeria)
   - **Capabilities:** check ☑ **Voice** and ☑ **SMS**
3. Buy the number — copy it (looks like `+1XXXXXXXXXX`)

### 1.3 ⚠️ Enable Algeria — CRITICAL STEP

**Twilio blocks SMS and voice to most countries by default.** You must explicitly enable Algeria, otherwise every SMS/call will fail with `30450 - Permission to send an SMS has not been enabled for the region indicated by the 'To' number`.

**For SMS:**
1. **Console** → **Messaging** → **Settings** → **Geo Permissions** (or directly: https://console.twilio.com/us1/develop/sms/settings/geo-permissions)
2. Find **Algeria** → check the box → **Save**

**For Voice:**
1. **Console** → **Voice** → **Settings** → **Geo Permissions** (https://console.twilio.com/us1/develop/voice/settings/geo-permissions)
2. Find **Algeria** → check the box → **Save**

### 1.4 Trial account caveat
On a trial account, Twilio can only send to **verified phone numbers**. Add the patient's number under **Phone Numbers → Verified Caller IDs** before testing, or upgrade to a paid account.

### 1.5 Add to `.env`
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```
- **SID** + **Token** from https://console.twilio.com/ (right on the dashboard)
- **PHONE_NUMBER** is the one you just bought

### 1.6 Pricing (real-world)
- Number rental: ~$1.15/month
- SMS to Algeria: ~$0.07 per message
- Voice call to Algeria: ~$0.18/min
- For a clinic doing 100 bilans/month: ~$15–20/month

---

## Part 2 — Resend (Email)

### 2.1 Create account
1. Go to https://resend.com/signup
2. Sign up with GitHub or email (no credit card)
3. Free tier: **3,000 emails/month, 100/day** — plenty for a small clinic

### 2.2 Get API key
1. **API Keys** → **Create API Key** → name it `medical-bilan` → permission `Sending access`
2. Copy the key (starts with `re_`) — **shown only once**

### 2.3 Sending domain (two options)

**Option A — Use Resend's test sender (zero setup, fine for development)**
- `RESEND_FROM_EMAIL=Clinique <onboarding@resend.dev>`
- Works immediately, no domain needed
- ⚠️ Patients may see "via resend.com" — fine for testing, not for production

**Option B — Verify your own domain (production)**
1. Resend → **Domains** → **Add Domain** → enter e.g. `clinique.dz`
2. Add the DNS records they show you (SPF, DKIM) at your domain registrar
3. Wait 5-30 min for verification
4. Then use: `RESEND_FROM_EMAIL=Clinique <noreply@clinique.dz>`

### 2.4 Add to `.env`
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Clinique <onboarding@resend.dev>
```

---

## Part 3 — ElevenLabs (TTS for the voice call)

### 3.1 Create account
1. Go to https://elevenlabs.io/sign-up
2. Sign up free (no credit card needed for the free tier)
3. Free tier: **10,000 characters/month** — our message is ~120 chars, so 80+ regenerations/month

### 3.2 Get API key
1. Click your profile (top right) → **Profile + API key**
2. Copy your API key (starts with `sk_`)

### 3.3 Pick a voice (optional — default works)
The default `pNInz6obpgDQGcFmaJgB` ("Adam", multilingual) handles Arabic well.

To preview/swap:
- Browse https://elevenlabs.io/app/voice-library
- Filter by **"Multilingual"** in the language dropdown
- Click any voice → **Sample with text** → paste Darija text and listen
- Click **Use** → copy the voice ID from the URL

### 3.4 Add to `.env`
```env
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
AUDIO_FILENAME=bilan_ready_darija.mp3
```

### 3.5 Generate the MP3
```bash
cd backend
npm run generate-audio
```

You'll see:
```
🎙️  ElevenLabs audio generation
   Voice ID: pNInz6obpgDQGcFmaJgB
   Output:   .../backend/audio/bilan_ready_darija.mp3
✅ Wrote 38.4 KB to .../backend/audio/bilan_ready_darija.mp3
```

Open the MP3 and listen. To regenerate with different text:
```bash
npm run generate-audio -- --text "السلام عليكم. تحاليلكم جاهزة..."
```

---

## Part 4 — `APP_PUBLIC_URL` (so Twilio can reach your server)

When Twilio places a call, it makes an HTTP request to **your backend** to fetch the TwiML XML and the MP3. So your backend must be reachable from the public internet.

### Local development → use ngrok

ngrok exposes your local `localhost:5000` over a temporary HTTPS URL.

1. Download from https://ngrok.com/download (free account required, no card)
2. Install + authenticate (one-time setup, ngrok shows the command)
3. In a separate terminal (keep your `npm run dev` running):
```bash
ngrok http 5000
```
4. ngrok prints a URL like `https://abc123.ngrok-free.app` — copy it
5. Add to `.env`:
```env
APP_PUBLIC_URL=https://abc123.ngrok-free.app
```
6. **Restart your backend** (`Ctrl+C` then `npm run dev` again)

### Test the audio is reachable
Open in your browser:
```
https://abc123.ngrok-free.app/audio/bilan_ready_darija.mp3
```
You should hear the audio. If not, Twilio won't either.

### Production
Replace `APP_PUBLIC_URL` with your real https domain (e.g. `https://api.clinique.dz`).

---

## Final `.env` checklist

By the end you should have all of this:

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
APP_PUBLIC_URL=https://YOUR-NGROK-URL.ngrok-free.app

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=...
JWT_EXPIRES_IN=7d

# Supabase
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_BUCKET=bilans

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Clinique <onboarding@resend.dev>

# ElevenLabs
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
AUDIO_FILENAME=bilan_ready_darija.mp3

# Clinic
CLINIC_NAME=Clinique Dr. Example
CLINIC_PHONE=+213XXXXXXXXX
```

Restart the backend after every `.env` change.

---

## End-to-end test (5 min)

1. Make sure backend + frontend are running (`npm run dev` in each)
2. Make sure ngrok is running and `APP_PUBLIC_URL` is set
3. Generate the audio: `npm run generate-audio`
4. Login to admin → create a patient with **your own phone + email**
5. Within ~5 seconds: you should receive an **SMS** with the password and an **email** with credentials
6. Login to the patient account in another browser/incognito
7. As admin: upload a PDF for that patient → click **"Marquer prêt"** (paper-plane icon)
8. The patient gets:
   - **SMS** immediately
   - **Email** immediately
   - **Phone call** ~30 seconds later (ElevenLabs voice plays twice)

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `30450 Permission to send SMS not enabled for region` | Algeria not enabled in Twilio Geo Permissions | Section 1.3 |
| `21608 phone number is unverified` | Twilio trial — only verified numbers allowed | Verify the number in Twilio console, or upgrade |
| `21659 'From' phone number not a valid` | `TWILIO_PHONE_NUMBER` is wrong format | Must be `+1XXXXXXXXXX` (E.164) |
| Email arrives but goes to spam | Using `onboarding@resend.dev` | Verify your own domain (Section 2.3 Option B) |
| Voice call rings but plays nothing | `APP_PUBLIC_URL` unreachable, or audio file missing | Open the audio URL in a browser to verify |
| `ELEVENLABS_API_KEY missing` | Forgot to add to `.env` | Add it, restart backend |
| `quota_exceeded` from ElevenLabs | Used your 10k chars | Wait until next month or upgrade |
| Backend crashes when admin clicks "Marquer prêt" | A required env var missing | Check backend console for the exact error |

---

## Future improvements (not blocking)

- **WhatsApp Business** as a 4th channel (Twilio supports it, requires approved templates)
- **Webhook callbacks** — Twilio can POST back the call status (answered, voicemail, busy) to update `notification_logs`
- **Retry queue** — currently if SMS fails it logs and stops; a queue (BullMQ + Redis) would retry with backoff
- **Admin "Resend notifications" button** — already wired in `POST /api/notifications/resend/:bilanId`, just needs a frontend button
