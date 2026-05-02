# Database setup — Supabase (hybrid mode)

We use Supabase as a hosted PostgreSQL + file storage. The Express backend connects to it just like any other Postgres database.

---

## 1. Create a Supabase project

1. Go to https://supabase.com → **New project**
2. Pick a **region close to Algeria** (e.g. `eu-west-3` Paris or `eu-central-1` Frankfurt)
3. Set a strong DB password — **save it**, you'll need it for `DATABASE_URL`
4. Wait ~2 minutes for the project to provision

## 2. Get your credentials

In your Supabase dashboard:

| Where | Value | Goes into |
|---|---|---|
| **Settings → API** → Project URL | `https://xxxx.supabase.co` | `SUPABASE_URL` |
| **Settings → API** → `anon` `public` key | `eyJhbGc...` | `SUPABASE_ANON_KEY` (frontend, optional) |
| **Settings → API** → `service_role` `secret` key | `eyJhbGc...` | `SUPABASE_SERVICE_ROLE_KEY` (backend ONLY) |
| **Settings → Database** → Connection string (URI, "Transaction" mode) | `postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres` | `DATABASE_URL` |

> ⚠️ **NEVER** expose the `service_role` key to the frontend or commit it. It bypasses Row-Level Security.

## 3. Run the schema

Open **SQL Editor** in Supabase and paste the contents of `schema.sql`, then click Run.

Then run `seed.sql` the same way to create the default admin user.

You can verify with:

```sql
SELECT id, full_name, phone, role FROM users;
```

You should see `Dr. Admin` with phone `+213770000000`.

## 4. Create the storage bucket

1. Go to **Storage** in the Supabase sidebar
2. Click **New bucket**
3. Name: `bilans`
4. **Public bucket: OFF** (must stay private — we serve via signed URLs)
5. File size limit: 20 MB
6. Allowed MIME types: `application/pdf`

That's it — the backend will upload PDFs into this bucket and generate 15-minute signed URLs on demand.

---

## 5. Default admin login

- **Phone:** `+213770000000`
- **Password:** `Admin@1234`

⚠️ **Change this immediately after first login.**

To regenerate the seed hash with a different password, run (after Layer 2 is built):

```bash
node backend/src/scripts/hash-password.js "YourNewPassword"
```

Copy the output hash and replace the value in `seed.sql`.

---

## Notes on Supabase Auth

We are **not** using Supabase Auth. The `users` table is our own and authentication happens via JWT in the Express backend. This keeps the spec consistent and avoids vendor lock-in. If you ever want to migrate to Supabase Auth later, the data shape is compatible.
