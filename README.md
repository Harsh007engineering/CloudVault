# CloudVault — Private Cloud Storage Web Application

> **Secure academic cloud storage built specifically for university students working on shared laboratory workstations.**
> Access and store coursework safely without ever exposing personal Gmail, Google Drive, Microsoft, or social accounts on public PCs.

---

## Architecture Overview

CloudVault is architected around a **₹0/month free-tier model** for university deployments, pairing React and Express with MongoDB Atlas and Cloudflare R2 object storage.

```text
                    ┌─────────────────────────┐
                    │       CloudVault        │
                    │   React + Vite Frontend │
                    │   (Tailwind CSS, SPA)   │
                    └────────────┬────────────┘
                                 │
                 HTTPS / HTTP-only Session Cookie
                  (No auth tokens in localStorage)
                                 │
                    ┌────────────▼────────────┐
                    │    Express.js Backend   │
                    │     (Node.js 24 LTS)    │
                    │ Helmet, RateLimit, Auth │
                    └──────┬───────┬───────┬──┘
                           │       │       │
              ┌────────────┘       │       └────────────┐
              ▼                    ▼                    ▼
     MongoDB (Local/Atlas)   Storage Service      Session Store
      - User Metadata         Abstraction        (connect-mongo)
      - File Metadata         ├── Cloudflare R2   HttpOnly, SameSite,
      - Recovery Code Hashes  └── Local Storage   Idle Timeout
      (NO binary file blobs)  Unique Object Keys
```

---

## Key Features

### 1. Zero Personal Logins Required
- Students register using **only a Username and Password**.
- **No Gmail, no phone number, no Microsoft account, no Google OAuth**.
- Eliminates the risk of leaving personal email sessions logged in on shared lab computers.

### 2. Cryptographic Recovery Code System
- Since there is no email or phone recovery, accounts receive **5 cryptographically random recovery codes** upon signup (e.g. `8K4P-X92M`).
- Displayed **exactly once** with one-click copy and `.txt` download options.
- Only SHA-256 hashes are stored in the database.
- Used recovery codes are marked `used: true` and **can never be reused**.
- Students can regenerate 5 new codes in Settings after confirming their current password.

### 3. Shared Public Lab PC Security Hardening
- **No tokens in `localStorage` or `sessionStorage`**: All session state is maintained via server-issued `HttpOnly`, `SameSite=Lax` cookies (`cv.sid`).
- **Cache-Control defense**: All private API endpoints and file download streams send:
  ```http
  Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, private
  Pragma: no-cache
  Expires: 0
  ```
  This prevents shared PC browsers from saving students' academic files into temporary disk caches.
- **Clear Logout & Session Destruction**: Instant session purge in MongoDB upon logout.
- **Prominent Lab Security Reminder**: Visual banner reminding students to log out before leaving the lab workstation.

### 4. Pluggable Cloudflare R2 / S3 Object Storage Service
- Built using an `IStorageProvider` abstraction layer.
- **Cloudflare R2**: 100% S3-compatible, **₹0/month with 10 GB free storage and 0 egress fees**.
- **Local Storage Provider**: Built-in filesystem provider for instant zero-credential offline development.
- **Safe Keys**: Files are stored as `users/<userId>/<uuid>`; raw user filenames are never exposed as storage paths.
- MongoDB stores metadata only; no binary blobs in the database.

### 5. Configurable Logical Storage Quota
- **500 MiB default logical quota** per student (`DEFAULT_STORAGE_LIMIT=524288000`).
- Physical storage is only consumed when files are actually uploaded.
- **25 MiB maximum individual file size** (`MAX_FILE_SIZE=26214400`).
- Server-side pre-upload validation rejecting uploads that exceed remaining quota.
- Automatic storage reclamation on file deletion.

### 6. File Management
- Single and multiple file upload with drag-and-drop zone and progress indicator.
- Supported file types: `PDF`, `DOC`, `DOCX`, `TXT`, `PPT`, `PPTX`, `XLS`, `XLSX`, `JPG`, `JPEG`, `PNG`, `ZIP`.
- File rename (updates MongoDB record without moving physical cloud objects).
- Delete confirmation modal preventing accidental single-click deletions.
- Server-side search by filename scoped strictly to the authenticated user.
- Multi-criteria sorting (Newest, Oldest, Name A-Z, Name Z-A, Largest, Smallest).
- List view and card grid view toggle.

### 7. Administrator Portal & Account Recovery
- Metric overview: Total Users, Total Files, Total Physical Cloud Storage Used.
- Student account management: Search students, view file counts and storage usage.
- Account disable/enable toggle.
- Per-student quota modification (e.g. increase quota to 1 GiB for thesis projects).
- **Admin Emergency Recovery**: For students who lost both password and recovery codes, admins can generate a secure temporary password. Sets `forcePasswordChange: true`, forcing the student to set a private password upon first login. Admins never see existing passwords.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS, React Router 6, Axios, Lucide Icons |
| **Backend** | Node.js (v18+ / v24 LTS), Express.js |
| **Database** | MongoDB / Mongoose, `connect-mongo` for server-side sessions |
| **Object Storage** | Cloudflare R2 / AWS S3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) + Local Disk fallback |
| **Security** | Helmet, bcryptjs (12 rounds), crypto SHA-256, express-rate-limit |

---

## Getting Started (Local Development)

### Prerequisites
- Node.js >= 18 (Tested on Node.js 24)
- Local MongoDB running on `mongodb://127.0.0.1:27017` OR a free MongoDB Atlas connection URI

### 1. Install Dependencies
```bash
# In the root directory:
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` in `server/` to `server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cloudvault
SESSION_SECRET=cloudvault_secure_development_session_secret_99214731
SESSION_MAX_AGE=7200000
CLIENT_URL=http://localhost:5173

DEFAULT_STORAGE_LIMIT=524288000
MAX_FILE_SIZE=26214400

# Storage Provider: 'local' for offline dev, 'r2' for Cloudflare R2
STORAGE_PROVIDER=local

# Cloudflare R2 Configuration (Used when STORAGE_PROVIDER=r2)
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_BUCKET=cloudvault-files
R2_ACCESS_KEY_ID=<your-access-key-id>
R2_SECRET_ACCESS_KEY=<your-secret-access-key>
R2_REGION=auto
```

### 3. Run Development Servers
```bash
# Start both backend and frontend concurrently:
npm run dev

# Or run individually:
npm run server   # Express API on http://localhost:5000
npm run client   # React Vite on http://localhost:5173
```

Visit **http://localhost:5173** in your browser.

---

## Automated Verification & Security Testing

CloudVault includes an end-to-end automated verification test suite:

```bash
cd server
npm test
```

### Test Coverage Summary
- **Health Verification (`health.test.js`)**: API status, MongoDB connection, storage provider verification.
- **Authentication & Recovery (`auth.test.js`)**: Pure username/password signup, duplicate username prevention, session cookies, generic login errors, single-use recovery code verification, code reuse rejection, password reset, and recovery code regeneration.
- **File Management & Cross-User Security Isolation (`files_security.test.js`)**: Multipart file uploads, download streams with `no-store` headers, rename, deletion with quota reclamation, file search, sorting, and **User A vs User B cross-user isolation verification (User B is completely blocked with 404 from accessing, downloading, renaming, or deleting User A's files)**.
- **Admin & Recovery Management (`admin.test.js`)**: System metrics, user listing, quota modification, account disabling/enabling, temporary password generation, mandatory password change enforcement.

---

### 4. Modern SaaS UI/UX & Native Dark Mode
- **Dual-Theme Engine**: Full light and dark mode toggle with smooth animated transitions.
- **Anti-FOUC Architecture**: Zero-flash inline script and `color-scheme: light dark` native browser syncing.
- **High-Aesthetic Micro-Interactions**: Ambient radial glowing accents, frosted glass panels (`backdrop-blur`), interactive Bento grid, and simulated desktop vault preview.
- **Shared Lab Hygiene Reminder**: In-app banner and automatic modal checklist upon signout reminding students to purge local workstation download caches.

---

## Production Deployment (₹0/month Free Tier)

CloudVault is engineered to run at **₹0/month** for university lab environments. For an in-depth walkthrough, see the [Vercel & Production Deployment Guide](VERCEL_DEPLOYMENT.md).

### 1. Database: MongoDB Atlas (M0 Free Tier)
- 512 MB storage free forever (metadata only — binary blobs are never stored in MongoDB).
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), create a free M0 cluster, and obtain the connection string `mongodb+srv://...`.

### 2. Object Storage: Cloudflare R2
- 10 GB free storage per month with **Zero egress bandwidth fees** (unlike AWS S3).
- 10 million Class B (read) operations free per month.
- Set `STORAGE_PROVIDER=r2` with your bucket and access keys in production environment variables.

### 3. Backend Hosting: Render / Railway Free Tier
- Deploy `server/` as a Node web service.
- Handles full multipart streaming uploads without serverless payload size limitations.
- Set environment variables: `NODE_ENV=production`, `MONGODB_URI`, `SESSION_SECRET`, `CLIENT_URL`, `R2_*`.

### 4. Frontend Hosting: Vercel (Edge CDN)
- Deploy `client/` to **Vercel** with one click.
- Pre-configured `vercel.json` ensures full SPA deep-route handling (`/dashboard`, `/login`, `/settings`) without 404 errors.
- Set `VITE_API_URL=https://your-backend.onrender.com/api` in Vercel Environment Variables.
- Automatic cross-origin HTTP-only cookie negotiation (`sameSite: 'none'`, `secure: true`, `credentials: true`).

---

## Security Principles Enforced
1. Plaintext passwords are never stored (bcrypt with 12 rounds).
2. Plaintext recovery codes are never stored (SHA-256 hashes).
3. Cloud storage credentials are never exposed to the frontend.
4. User IDs provided by the frontend are never trusted; identity is derived solely from the authenticated session.
5. Strict file ownership verification on every file query (`{ _id: fileId, userId: req.user._id }`).
6. Private files are never made publicly accessible.
7. No authentication tokens in `localStorage` or `sessionStorage`.
8. Admins can never view existing student passwords.
9. Server-side validation of file extension, MIME type, and file size.
10. Rate limiting on authentication and password recovery endpoints.
11. Public computer cache-busting headers on all authenticated resources.
