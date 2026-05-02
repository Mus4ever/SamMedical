# 🏥 Medical Bilan System

Web app for an Algerian medical clinic to deliver patient analysis results (bilans) securely.
The doctor uploads PDF bilans → marks them ready → the system notifies the patient automatically by **phone call** (with TTS Darija/Arabic), **SMS**, and **email**. The patient logs in and downloads their PDF.

- **Stack:** Node.js + Express + React + Vite + Tailwind
- **Database & Storage:** Supabase (hosted PostgreSQL + Storage)
- **Notifications:** Twilio Voice + Twilio SMS + Resend (email)
- **Languages:** French + Arabic (RTL ready)
- **Deployment target:** Railway / Hetzner VPS

---

## 📁 Project structure

```
medical-bilan/
├── backend/        Node.js + Express API
│   ├── src/        Source code (routes, controllers, services, middleware)
│   ├── audio/      Pre-generated TTS audio files (gitignored, generate locally)
│   ├── uploads/    Temp local PDF storage before Supabase upload (gitignored)
│   └── .env.example
├── frontend/       React + Vite + Tailwind SPA (PWA-ready)
│   ├── src/        Pages, components, locales (fr/ar)
│   ├── public/     Static assets + PWA manifest
│   └── .env.example
├── database/       SQL schema + seed
└── README.md
```

---

## 🚀 Quick setup

> Detailed setup is in `database/README.md` (Supabase) and the `.env.example` files.
> Each backend layer is built incrementally — see the development plan below.

### 1. Create a Supabase project

1. Go to https://supabase.com → New project
2. Save your **Project URL**, **anon key**, **service role key**, and **Postgres connection string**
3. In SQL editor, run `database/schema.sql`
4. Run `database/seed.sql` to create the default admin
5. In Storage, create a private bucket named `bilans`

### 2. Backend

```bash
cd backend
cp .env.example .env       # fill in Supabase, Twilio, Resend credentials
npm install
npm run dev                # starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env       # set VITE_API_URL
npm install
npm run dev                # starts on http://localhost:5173
```

### 4. First login

- **Phone:** `+213770000000`
- **Password:** `Admin@1234`
- **You MUST change this password immediately after first login.**

---

## 🔔 Notification flow

When the doctor clicks **"Marquer prêt"** on a bilan:

1. **SMS** is sent immediately (Twilio) — short Arabic message
2. **Email** is sent (Resend) — if patient has an email
3. **Phone call** is placed (Twilio Voice) — TwiML plays a TTS message in Arabic/Darija

All three are logged to the `notification_logs` table for audit.

---

## 🔐 Security

- Passwords hashed with **bcrypt cost 12**
- JWT tokens, 7-day expiry
- PDFs stored privately in Supabase Storage; **signed URLs valid 15 min**
- Patient can only access their own bilans (enforced server-side)
- Helmet HTTP headers, CORS restricted to frontend, rate limiting on `/api/`
- All SQL is parameterized
- File uploads validated: PDF only, max 20 MB
- Every bilan view is logged to `bilan_access_logs`

---

## 🗺️ Development plan (build order)

We build in layers. Each layer is functional and testable before moving on.

| Layer | Scope |
|---|---|
| 1 | Project skeleton, DB schema, seed admin |
| 2 | Backend auth (login, JWT, error handler) |
| 3 | Backend patients CRUD |
| 4 | Supabase Storage integration |
| 5 | Backend bilans CRUD |
| 6 | Notifications (call + SMS + email) |
| 7 | Frontend skeleton (Vite + Tailwind + i18n) |
| 8 | Frontend auth + patient pages |
| 9 | Frontend admin pages |
| 10 | Polish + deploy guide |

Current status: **Layer 1 complete.**

---

## 📜 License

Private / proprietary — clinic-internal use.
