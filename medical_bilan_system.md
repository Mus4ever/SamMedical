# 🏥 Medical Bilan System — Full Project Specification
> **For Claude Code** — Complete implementation guide, no steps skipped.

---

## 📋 Project Overview

A web-based medical analysis result (bilan) management system for a doctor's clinic.  
When a patient's bilan is ready, the system:
1. Notifies the patient via **WhatsApp message** (primary) + **phone call** (backup) in Algerian Darija using a pre-recorded MP3
2. The patient **logs in** and **downloads/views their bilan PDF** securely

**Type:** Full Stack Web Application (PWA-ready)  
**Target Country:** Algeria 🇩🇿  
**Language of UI:** French + Arabic (bilingual)

---

## 👥 Users & Roles

| Role | Description |
|------|-------------|
| **Admin/Doctor** | Uploads bilans, manages patients, triggers notifications |
| **Patient/Client** | Logs in, views and downloads their own bilan PDFs |

---

## 🗂️ Project Structure

```
medical-bilan/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js         # PostgreSQL connection (pg pool)
│   │   │   ├── s3.js         # AWS S3 / Cloudflare R2 config
│   │   │   ├── twilio.js     # Twilio client config
│   │   │   └── env.js        # Environment variable validation
│   │   ├── middleware/
│   │   │   ├── auth.js       # JWT verification middleware
│   │   │   ├── role.js       # Role-based access (admin vs patient)
│   │   │   ├── upload.js     # Multer config for PDF uploads
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── patient.routes.js
│   │   │   ├── bilan.routes.js
│   │   │   └── notification.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── patient.controller.js
│   │   │   ├── bilan.controller.js
│   │   │   └── notification.controller.js
│   │   ├── services/
│   │   │   ├── twilio.service.js     # Phone call logic
│   │   │   ├── whatsapp.service.js   # WhatsApp via Twilio
│   │   │   ├── s3.service.js         # File upload/download/signed URLs
│   │   │   └── notification.service.js # Orchestrates call + WA
│   │   ├── models/
│   │   │   └── index.js      # SQL query helpers (no ORM, raw pg)
│   │   └── app.js            # Express app setup
│   ├── uploads/              # Temp local storage before S3 upload
│   ├── audio/
│   │   └── bilan_ready_darija.mp3   # Pre-recorded Darija notification audio
│   ├── .env
│   ├── package.json
│   └── server.js             # Entry point
│
├── frontend/                 # React.js + Tailwind CSS
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json     # PWA manifest
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js      # Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── Modal.jsx
│   │   │   ├── admin/
│   │   │   │   ├── PatientTable.jsx
│   │   │   │   ├── UploadBilanModal.jsx
│   │   │   │   ├── PatientForm.jsx
│   │   │   │   └── BilanStatusBadge.jsx
│   │   │   └── patient/
│   │   │       ├── BilanCard.jsx
│   │   │       └── BilanViewer.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Patients.jsx
│   │   │   │   ├── AddPatient.jsx
│   │   │   │   └── PatientDetail.jsx
│   │   │   └── patient/
│   │   │       └── MyBilans.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── utils/
│   │   │   └── formatDate.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   ├── schema.sql            # Full DB schema
│   └── seed.sql              # Initial admin user seed
│
├── docker-compose.yml        # PostgreSQL + pgAdmin local dev
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema (PostgreSQL)

```sql
-- database/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (both admin and patients)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,        -- Algerian format: +213XXXXXXXXX
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'patient')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bilans (medical analysis results)
CREATE TABLE bilans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,              -- e.g. "Analyse de sang - Juin 2025"
  description TEXT,
  file_key VARCHAR(500) NOT NULL,           -- S3 object key
  file_name VARCHAR(255) NOT NULL,          -- original filename
  file_size INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'viewed')),
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMP,
  notification_call_status VARCHAR(50),     -- Twilio call status
  notification_whatsapp_status VARCHAR(50), -- WA message status
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification logs
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bilan_id UUID NOT NULL REFERENCES bilans(id),
  patient_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('whatsapp', 'call', 'sms')),
  status VARCHAR(50),                       -- delivered, failed, queued
  provider_id VARCHAR(255),                 -- Twilio SID
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bilan access logs (when patient views their bilan)
CREATE TABLE bilan_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bilan_id UUID NOT NULL REFERENCES bilans(id),
  patient_id UUID NOT NULL REFERENCES users(id),
  accessed_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(50)
);

-- Indexes
CREATE INDEX idx_bilans_patient_id ON bilans(patient_id);
CREATE INDEX idx_bilans_status ON bilans(status);
CREATE INDEX idx_notification_logs_bilan_id ON notification_logs(bilan_id);
```

```sql
-- database/seed.sql
-- Default admin user (password: Admin@1234)
INSERT INTO users (full_name, phone, email, password_hash, role)
VALUES (
  'Dr. Admin',
  '+213770000000',
  'admin@clinique.dz',
  '$2b$12$placeholder_bcrypt_hash_here',  -- replace with real bcrypt hash
  'admin'
);
```

---

## ⚙️ Backend Implementation

### package.json

```json
{
  "name": "medical-bilan-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5",
    "multer-s3": "^3.0.1",
    "@aws-sdk/client-s3": "^3.400.0",
    "@aws-sdk/s3-request-presigner": "^3.400.0",
    "twilio": "^4.19.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.1.0",
    "express-validator": "^7.0.1",
    "uuid": "^9.0.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### .env (template)

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/medical_bilan

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# AWS S3 (or Cloudflare R2 — same SDK)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-west-1
AWS_BUCKET_NAME=medical-bilans
# If using Cloudflare R2, also add:
# AWS_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX        # Your Twilio number
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  # Twilio sandbox or approved number

# App public URL (needed for Twilio to serve the audio file)
APP_PUBLIC_URL=https://yourdomain.com
```

### src/config/db.js

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected DB client error', err);
});

module.exports = pool;
```

### src/config/s3.js

```javascript
const { S3Client } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Uncomment for Cloudflare R2:
  // endpoint: process.env.AWS_ENDPOINT,
});

module.exports = s3Client;
```

### src/config/twilio.js

```javascript
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports = client;
```

### src/middleware/auth.js

```javascript
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      'SELECT id, full_name, phone, email, role FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé au médecin' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
```

### src/middleware/upload.js

```javascript
const multer = require('multer');
const path = require('path');

// Store temp locally before uploading to S3
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});

module.exports = upload;
```

### src/services/s3.service.js

```javascript
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3');
const fs = require('fs');
const path = require('path');

const uploadBilanToS3 = async (localFilePath, originalName, patientId) => {
  const fileKey = `bilans/${patientId}/${Date.now()}-${path.basename(originalName)}`;
  const fileContent = fs.readFileSync(localFilePath);

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: fileContent,
    ContentType: 'application/pdf',
  }));

  // Delete local temp file
  fs.unlinkSync(localFilePath);

  return fileKey;
};

const generatePresignedUrl = async (fileKey) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
  });

  // URL valid for 15 minutes
  const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  return url;
};

const deleteFromS3 = async (fileKey) => {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
  }));
};

module.exports = { uploadBilanToS3, generatePresignedUrl, deleteFromS3 };
```

### src/services/notification.service.js

```javascript
const twilioClient = require('../config/twilio');
const pool = require('../config/db');

/**
 * Send WhatsApp message to patient
 */
const sendWhatsApp = async (patientPhone, patientName, bilan) => {
  const message = `
🔬 *مرحبا ${patientName}*

نتائج تحاليلكم جاهزة ✅

يمكنكم الاطلاع عليها بتسجيل الدخول على:
${process.env.FRONTEND_URL}/login

*رقم الملف:* ${bilan.title}

— عيادة Dr. ...
  `.trim();

  const result = await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${patientPhone}`,
    body: message,
  });

  return result;
};

/**
 * Make automated phone call using pre-recorded Darija MP3
 * The MP3 file must be publicly accessible at APP_PUBLIC_URL/audio/bilan_ready_darija.mp3
 */
const makePhoneCall = async (patientPhone) => {
  const twimlUrl = `${process.env.APP_PUBLIC_URL}/api/notifications/twiml`;

  const call = await twilioClient.calls.create({
    to: patientPhone,
    from: process.env.TWILIO_PHONE_NUMBER,
    url: twimlUrl, // Twilio fetches TwiML from this URL
  });

  return call;
};

/**
 * Log notification attempt to DB
 */
const logNotification = async (bilanId, patientId, type, status, providerId, errorMessage = null) => {
  await pool.query(
    `INSERT INTO notification_logs (bilan_id, patient_id, type, status, provider_id, error_message)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [bilanId, patientId, type, status, providerId, errorMessage]
  );
};

/**
 * Main function: send WhatsApp + phone call
 */
const notifyPatient = async (bilan, patient) => {
  const results = { whatsapp: null, call: null, errors: [] };

  // 1. WhatsApp (primary)
  try {
    const waResult = await sendWhatsApp(patient.phone, patient.full_name, bilan);
    results.whatsapp = waResult.sid;
    await logNotification(bilan.id, patient.id, 'whatsapp', 'sent', waResult.sid);
  } catch (err) {
    results.errors.push({ type: 'whatsapp', error: err.message });
    await logNotification(bilan.id, patient.id, 'whatsapp', 'failed', null, err.message);
  }

  // 2. Phone call (backup — runs 30 seconds after WhatsApp)
  setTimeout(async () => {
    try {
      const callResult = await makePhoneCall(patient.phone);
      results.call = callResult.sid;
      await logNotification(bilan.id, patient.id, 'call', 'initiated', callResult.sid);
    } catch (err) {
      results.errors.push({ type: 'call', error: err.message });
      await logNotification(bilan.id, patient.id, 'call', 'failed', null, err.message);
    }
  }, 30000);

  // Update bilan notification status
  await pool.query(
    `UPDATE bilans SET notification_sent = true, notification_sent_at = NOW() WHERE id = $1`,
    [bilan.id]
  );

  return results;
};

module.exports = { notifyPatient };
```

### src/controllers/auth.controller.js

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1 AND is_active = true',
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Numéro ou mot de passe incorrect' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: 'Numéro ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, getMe };
```

### src/controllers/patient.controller.js

```javascript
const bcrypt = require('bcrypt');
const pool = require('../config/db');

// Admin: get all patients
const getAllPatients = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, phone, email, is_active, created_at,
       (SELECT COUNT(*) FROM bilans WHERE patient_id = users.id) AS bilan_count
       FROM users WHERE role = 'patient' ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Admin: create patient
const createPatient = async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;
    const hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (full_name, phone, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'patient') RETURNING id, full_name, phone, email`,
      [fullName, phone, email, hash]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ce numéro existe déjà' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Admin: get single patient with bilans
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const userResult = await pool.query(
      'SELECT id, full_name, phone, email, is_active, created_at FROM users WHERE id = $1 AND role = $2',
      [id, 'patient']
    );
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'Patient introuvable' });

    const bilansResult = await pool.query(
      'SELECT id, title, description, status, notification_sent, created_at FROM bilans WHERE patient_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({ ...userResult.rows[0], bilans: bilansResult.rows });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Admin: update patient
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, email, isActive } = req.body;

    const result = await pool.query(
      `UPDATE users SET full_name = $1, phone = $2, email = $3, is_active = $4, updated_at = NOW()
       WHERE id = $5 AND role = 'patient' RETURNING id, full_name, phone, email, is_active`,
      [fullName, phone, email, isActive, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Patient introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getAllPatients, createPatient, getPatientById, updatePatient };
```

### src/controllers/bilan.controller.js

```javascript
const pool = require('../config/db');
const { uploadBilanToS3, generatePresignedUrl, deleteFromS3 } = require('../services/s3.service');
const { notifyPatient } = require('../services/notification.service');

// Admin: upload bilan for a patient
const uploadBilan = async (req, res) => {
  try {
    const { patientId, title, description } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'Fichier PDF requis' });

    // Check patient exists
    const patientResult = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND role = $2', [patientId, 'patient']
    );
    if (patientResult.rows.length === 0) return res.status(404).json({ message: 'Patient introuvable' });

    // Upload to S3
    const fileKey = await uploadBilanToS3(file.path, file.originalname, patientId);

    // Save to DB
    const bilanResult = await pool.query(
      `INSERT INTO bilans (patient_id, uploaded_by, title, description, file_key, file_name, file_size, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING *`,
      [patientId, req.user.id, title, description, fileKey, file.originalname, file.size]
    );

    res.status(201).json(bilanResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur upload' });
  }
};

// Admin: mark bilan as ready and trigger notifications
const markBilanReady = async (req, res) => {
  try {
    const { id } = req.params;

    const bilanResult = await pool.query(
      'SELECT * FROM bilans WHERE id = $1', [id]
    );
    if (bilanResult.rows.length === 0) return res.status(404).json({ message: 'Bilan introuvable' });

    const bilan = bilanResult.rows[0];

    if (bilan.notification_sent) {
      return res.status(400).json({ message: 'Notification déjà envoyée pour ce bilan' });
    }

    // Update status to ready
    await pool.query(
      "UPDATE bilans SET status = 'ready', updated_at = NOW() WHERE id = $1", [id]
    );

    // Get patient info
    const patientResult = await pool.query(
      'SELECT * FROM users WHERE id = $1', [bilan.patient_id]
    );
    const patient = patientResult.rows[0];

    // Send notifications async (don't block response)
    notifyPatient(bilan, patient).catch(console.error);

    res.json({ message: 'Bilan marqué prêt, notifications en cours d\'envoi' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Admin: get all bilans
const getAllBilans = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.full_name AS patient_name, u.phone AS patient_phone
       FROM bilans b JOIN users u ON b.patient_id = u.id
       ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Patient: get my bilans
const getMyBilans = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, status, created_at, notification_sent_at
       FROM bilans WHERE patient_id = $1 AND status != 'pending'
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Patient or admin: get signed URL to view/download PDF
const getBilanDownloadUrl = async (req, res) => {
  try {
    const { id } = req.params;

    const query = req.user.role === 'admin'
      ? 'SELECT * FROM bilans WHERE id = $1'
      : 'SELECT * FROM bilans WHERE id = $1 AND patient_id = $2';

    const params = req.user.role === 'admin' ? [id] : [id, req.user.id];
    const result = await pool.query(query, params);

    if (result.rows.length === 0) return res.status(404).json({ message: 'Bilan introuvable' });

    const bilan = result.rows[0];
    const url = await generatePresignedUrl(bilan.file_key);

    // Log access
    await pool.query(
      'INSERT INTO bilan_access_logs (bilan_id, patient_id, ip_address) VALUES ($1, $2, $3)',
      [id, req.user.id, req.ip]
    );

    // Mark as viewed if patient first time
    if (req.user.role === 'patient' && bilan.status === 'ready') {
      await pool.query("UPDATE bilans SET status = 'viewed' WHERE id = $1", [id]);
    }

    res.json({ url, fileName: bilan.file_name });
  } catch (err) {
    res.status(500).json({ message: 'Erreur génération lien' });
  }
};

// Admin: delete bilan
const deleteBilan = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM bilans WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Bilan introuvable' });

    await deleteFromS3(result.rows[0].file_key);
    await pool.query('DELETE FROM bilans WHERE id = $1', [id]);

    res.json({ message: 'Bilan supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur suppression' });
  }
};

module.exports = { uploadBilan, markBilanReady, getAllBilans, getMyBilans, getBilanDownloadUrl, deleteBilan };
```

### src/routes/auth.routes.js

```javascript
const router = require('express').Router();
const { login, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', authenticate, getMe);

module.exports = router;
```

### src/routes/patient.routes.js

```javascript
const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getAllPatients, createPatient, getPatientById, updatePatient } = require('../controllers/patient.controller');

router.use(authenticate, requireAdmin);

router.get('/', getAllPatients);
router.post('/', createPatient);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);

module.exports = router;
```

### src/routes/bilan.routes.js

```javascript
const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadBilan, markBilanReady, getAllBilans,
  getMyBilans, getBilanDownloadUrl, deleteBilan
} = require('../controllers/bilan.controller');

// Patient routes
router.get('/my', authenticate, getMyBilans);
router.get('/:id/download', authenticate, getBilanDownloadUrl);

// Admin routes
router.post('/', authenticate, requireAdmin, upload.single('bilanFile'), uploadBilan);
router.patch('/:id/ready', authenticate, requireAdmin, markBilanReady);
router.get('/', authenticate, requireAdmin, getAllBilans);
router.delete('/:id', authenticate, requireAdmin, deleteBilan);

module.exports = router;
```

### src/routes/notification.routes.js

```javascript
const router = require('express').Router();

/**
 * Twilio fetches this URL when making the phone call
 * Returns TwiML XML that plays the pre-recorded Darija MP3
 */
router.get('/twiml', (req, res) => {
  const audioUrl = `${process.env.APP_PUBLIC_URL}/audio/bilan_ready_darija.mp3`;

  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play loop="2">${audioUrl}</Play>
</Response>`);
});

module.exports = router;
```

### src/app.js

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const bilanRoutes = require('./routes/bilan.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Parse JSON
app.use(express.json());
app.use(morgan('dev'));

// Serve pre-recorded audio file publicly (Twilio needs to fetch it)
app.use('/audio', express.static(path.join(__dirname, '../audio')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/bilans', bilanRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
```

### server.js

```javascript
require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }
};

start();
```

---

## 🎨 Frontend Implementation

### package.json

```json
{
  "name": "medical-bilan-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hot-toast": "^2.4.1",
    "react-hook-form": "^7.48.0",
    "lucide-react": "^0.290.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "vite": "^5.0.0"
  }
}
```

### src/api/axios.js

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

### src/context/AuthContext.jsx

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (phone, password) => {
    const res = await api.post('/auth/login', { phone, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### src/components/common/ProtectedRoute.jsx

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
```

### src/pages/Login.jsx

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(phone, password);
      toast.success('Bienvenue !');
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/patient/bilans');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-2">🏥 Clinique</h1>
        <p className="text-center text-gray-500 mb-6">Accédez à vos résultats d'analyses</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+213XXXXXXXXX"
              required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

### src/pages/admin/Dashboard.jsx (structure)

```jsx
// Admin dashboard shows:
// - Total patients count
// - Total bilans (pending / ready / viewed)
// - Recent uploads with status
// - Quick action: "Ajouter patient" and "Upload bilan"
// Uses React Query to fetch /api/patients and /api/bilans
// All data refresh every 30 seconds
```

### src/pages/admin/Patients.jsx (structure)

```jsx
// Table listing all patients with columns:
// Nom | Téléphone | Email | Nb Bilans | Actions (voir, modifier)
// Search bar to filter by name or phone
// "Ajouter patient" button opens modal
```

### src/pages/admin/PatientDetail.jsx (structure)

```jsx
// Shows one patient's info + their list of bilans
// Each bilan row shows: Title | Date | Status badge | Notification sent?
// Actions per bilan:
//   - Upload bilan (if creating new)
//   - "Marquer prêt + Notifier" button → calls PATCH /api/bilans/:id/ready
//   - Download bilan
//   - Delete bilan
```

### src/pages/patient/MyBilans.jsx

```jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const MyBilans = () => {
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bilans/my')
      .then(res => setBilans(res.data))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false));
  }, []);

  const downloadBilan = async (bilanId, fileName) => {
    try {
      const res = await api.get(`/bilans/${bilanId}/download`);
      window.open(res.data.url, '_blank');
    } catch {
      toast.error('Impossible de télécharger');
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement de vos bilans...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 Mes résultats d'analyses</h1>
      {bilans.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Aucun bilan disponible pour le moment</div>
      ) : (
        <div className="space-y-4">
          {bilans.map(bilan => (
            <div key={bilan.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-gray-800">{bilan.title}</h2>
                <p className="text-sm text-gray-400">{new Date(bilan.created_at).toLocaleDateString('fr-DZ')}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${bilan.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {bilan.status === 'ready' ? '✅ Prêt' : '👁 Consulté'}
                </span>
              </div>
              <button
                onClick={() => downloadBilan(bilan.id, bilan.file_name)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                📥 Voir / Télécharger
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBilans;
```

### src/App.jsx

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Patients from './pages/admin/Patients';
import PatientDetail from './pages/admin/PatientDetail';
import MyBilans from './pages/patient/MyBilans';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>
          } />
          <Route path="/admin/patients" element={
            <ProtectedRoute role="admin"><Patients /></ProtectedRoute>
          } />
          <Route path="/admin/patients/:id" element={
            <ProtectedRoute role="admin"><PatientDetail /></ProtectedRoute>
          } />
          <Route path="/patient/bilans" element={
            <ProtectedRoute role="patient"><MyBilans /></ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

## 🔊 Audio File (Darija Notification)

Place the pre-recorded MP3 at: `backend/audio/bilan_ready_darija.mp3`

**Script to record (example in Darija Algérienne):**
> *"Salam alikoum. Ntija nta3 l'analyse dyalak wajda. Dakhal l'compte dyalak 3la site ta3 cabinet bach tchoufo. Choukran."*

**Translation:** *"Hello. Your analysis results are ready. Log in to your account on the clinic's website to view them. Thank you."*

Options to get the MP3:
1. Record it yourself with any phone or microphone
2. Use **ElevenLabs** (https://elevenlabs.io) — type the Darija text, generate realistic AI voice, export as MP3
3. Hire a voice actor on **Fiverr** for 5$

---

## 🐳 Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: medical_bilan
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## 🚀 Deployment Guide

### Option A — Railway (Recommended for beginners)

1. Push code to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add PostgreSQL plugin
4. Set all environment variables from `.env`
5. Deploy backend + frontend as two separate services
6. Get public URL, update `APP_PUBLIC_URL` in env

### Option B — Hetzner VPS (Cheaper, more control)

```bash
# On the VPS (Ubuntu 22.04)
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Clone and setup
git clone https://github.com/yourrepo/medical-bilan.git
cd medical-bilan/backend
npm install
pm2 start server.js --name medical-backend

# Build frontend
cd ../frontend
npm install && npm run build
# Serve with Nginx pointing to dist/ folder

# SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.dz
```

### Nginx Config

```nginx
server {
    server_name yourdomain.dz;

    # Frontend (static files)
    location / {
        root /var/www/medical-bilan/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Audio files for Twilio
    location /audio {
        proxy_pass http://localhost:5000/audio;
    }
}
```

---

## 🔗 API Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/login` | ❌ | - | Login |
| GET | `/api/auth/me` | ✅ | Any | Get current user |
| GET | `/api/patients` | ✅ | Admin | List all patients |
| POST | `/api/patients` | ✅ | Admin | Create patient |
| GET | `/api/patients/:id` | ✅ | Admin | Get patient + bilans |
| PUT | `/api/patients/:id` | ✅ | Admin | Update patient |
| POST | `/api/bilans` | ✅ | Admin | Upload bilan PDF |
| PATCH | `/api/bilans/:id/ready` | ✅ | Admin | Mark ready + notify |
| GET | `/api/bilans` | ✅ | Admin | All bilans |
| DELETE | `/api/bilans/:id` | ✅ | Admin | Delete bilan |
| GET | `/api/bilans/my` | ✅ | Patient | My bilans |
| GET | `/api/bilans/:id/download` | ✅ | Any | Get signed download URL |
| GET | `/api/notifications/twiml` | ❌ | - | TwiML for Twilio call |

---

## 🔒 Security Checklist

- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] JWT tokens with expiry
- [x] Helmet.js HTTP security headers
- [x] Rate limiting on API routes (100 req/15min)
- [x] CORS restricted to frontend domain
- [x] PDF files stored on S3 (not public), accessed via signed URLs (15 min expiry)
- [x] Patient can only access their own bilans
- [x] File type validation (PDF only)
- [x] File size limit (20MB)
- [x] All DB queries use parameterized statements (no SQL injection)

---

## 📦 Third-Party Services & Costs

| Service | Purpose | Cost |
|---------|---------|------|
| **Twilio** | WhatsApp + phone calls | ~$20/month for low volume |
| **AWS S3 / Cloudflare R2** | PDF storage | R2 is free up to 10GB/month |
| **Railway or Hetzner** | Hosting | $5–25/month |
| **Domain .dz** | Your domain | ~2000 DZD/year |

**Total monthly infra cost: ~$30-50/month**

---

## 🧪 Testing Workflow

1. Start PostgreSQL with Docker Compose: `docker-compose up -d`
2. Run DB migrations: `psql -U postgres -d medical_bilan -f database/schema.sql`
3. Start backend: `cd backend && npm run dev`
4. Start frontend: `cd frontend && npm run dev`
5. Login as admin with seed credentials
6. Create a test patient
7. Upload a PDF bilan
8. Click "Marquer prêt" → verify WhatsApp + call are triggered
9. Login as patient → verify bilan is visible and downloadable

---

## ✅ Development Order (Recommended)

1. **Setup DB** — Run schema.sql, create admin seed user
2. **Backend Auth** — Login endpoint + JWT middleware
3. **Backend Patients CRUD** — Create/list/update patients
4. **Backend S3** — Upload PDF to S3, generate signed URLs
5. **Backend Bilans CRUD** — Upload, list, download bilans
6. **Backend Notifications** — Twilio WhatsApp + phone call
7. **Frontend Auth** — Login page + AuthContext
8. **Frontend Admin** — Dashboard, patients list, patient detail
9. **Frontend Upload** — Upload bilan form + "mark ready" button
10. **Frontend Patient** — MyBilans page with download
11. **Deploy** — Railway or Hetzner VPS
12. **Test end-to-end** — Full flow from upload to notification to patient view
