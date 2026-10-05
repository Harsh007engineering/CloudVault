# CloudVault Vercel & Production Deployment Guide

This guide details how to deploy **CloudVault** with **₹0/month operating costs** using industry-standard free tiers:
- **Frontend**: **Vercel** (Global Edge CDN, Instant Deploys, Free)
- **Backend API**: **Render** or **Railway** (Node.js/Express, Free Tier)
- **Database**: **MongoDB Atlas** (M0 Free Cluster — 512 MB metadata)
- **Object Storage**: **Cloudflare R2** (10 GB free storage, **0 egress fees**)

---

## 🏛️ Free-First Architecture Overview

```text
  [ User Browser / Lab PC ]
             │
      ┌──────┴─────────────────────────────────┐
      │                                        │
      ▼ (Static SPA Assets)                    ▼ (API Requests & Sessions)
┌───────────────────────┐             ┌─────────────────────────┐
│        Vercel         │             │    Render / Railway     │
│   (React + Vite SPA)  │             │   (Express Node Backend)│
│  *.vercel.app         │             │  *.onrender.com         │
└───────────────────────┘             └────────────┬────────────┘
                                                   │
                                     ┌─────────────┼─────────────┐
                                     │                           │
                                     ▼                           ▼
                        ┌─────────────────────────┐ ┌─────────────────────────┐
                        │   MongoDB Atlas (M0)    │ │      Cloudflare R2      │
                        │ User & Metadata Store   │ │    Binary Object Store  │
                        │ (₹0 / 512 MB)           │ │ (₹0 / 10 GB, 0 Egress)  │
                        └─────────────────────────┘ └─────────────────────────┘
```

> **Why split Frontend (Vercel) and Backend (Render/Railway)?**  
> Vercel Serverless Functions impose a strict **4.5 MB request payload limit** on free accounts, which would prevent students from uploading standard 10–25 MB PDF textbooks, presentations, or zip archives. Hosting the Node/Express backend on a free continuous host like Render allows full streaming multipart uploads up to your configured `MAX_FILE_SIZE` (default 25 MiB).

---

## Part 1: Deploy Backend to Render (Free Tier)

1. Sign up or log into [Render.com](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository: `Harsh007engineering/CloudVault`.
4. Configure the service:
   - **Name**: `cloudvault-api`
   - **Region**: Choose the closest region (e.g., Singapore, Frankfurt, Oregon).
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   ```ini
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/cloudvault?retryWrites=true&w=majority
   SESSION_SECRET=generate_a_random_64_char_hex_secret_here
   SESSION_MAX_AGE=7200000
   CLIENT_URL=https://your-cloudvault-app.vercel.app
   DEFAULT_STORAGE_LIMIT=524288000
   MAX_FILE_SIZE=26214400
   STORAGE_PROVIDER=r2
   R2_ENDPOINT=https://<your-account-id>.r2.cloudflarestorage.com
   R2_BUCKET=cloudvault-files
   R2_ACCESS_KEY_ID=<your-r2-access-key-id>
   R2_SECRET_ACCESS_KEY=<your-r2-secret-access-key>
   R2_REGION=auto
   ```
6. Click **Create Web Service**.  
   Render will deploy your backend and provide a public URL like `https://cloudvault-api.onrender.com`.

---

## Part 2: Deploy Frontend to Vercel

### Method A: Vercel Dashboard (Recommended)

1. Log into [Vercel](https://vercel.com) and click **Add New...** > **Project**.
2. Select your GitHub repository: `Harsh007engineering/CloudVault`.
3. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `client`.
   - **Build and Output Settings**:
     - Build Command: `npm run build`
     - Output Directory: `dist`
4. Expand **Environment Variables** and add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://cloudvault-api.onrender.com/api` | Your Render backend API endpoint |
5. Click **Deploy**.
6. Once deployed, copy your production Vercel URL (e.g. `https://cloudvault-student.vercel.app`).
7. **Important**: Go back to your Render backend environment variables and ensure `CLIENT_URL` matches your actual Vercel URL (`https://cloudvault-student.vercel.app`).

### Method B: Vercel CLI

If you prefer using the CLI from your local terminal:

```bash
cd client
npx vercel
```
Follow the interactive prompts to link and deploy your project. Set `VITE_API_URL` when prompted or via the Vercel dashboard.

---

## Part 3: SPA Deep-Routing & Security (`vercel.json`)

CloudVault includes pre-configured `vercel.json` files in both the project root and `client/`:

```json
{
  "framework": "vite",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

This guarantees:
1. Navigating directly to `/dashboard`, `/login`, or `/settings` will not result in a 404 error.
2. Security headers are sent with all static frontend assets.

---

## Part 4: Cross-Origin Cookie & CORS Handling

When the React frontend (`*.vercel.app`) communicates with the Express backend (`*.onrender.com`), browsers treat the requests as **cross-site**.

CloudVault is built with production-grade cross-site session security:
1. **Dynamic CORS Whitelist** (`server/src/app.js`):
   - Automatically permits your configured `CLIENT_URL`.
   - Permits all `*.vercel.app` preview and production URLs.
   - Sets `credentials: true` for HTTP-only cookie exchange.
2. **Cross-Site Session Cookies** (`server/src/config/session.js`):
   - In production with cross-origin domains, CloudVault automatically sets `sameSite: 'none'` and `secure: true`.
   - Enables `proxy: true` so Express trusts Render/Vercel TLS termination proxies (`X-Forwarded-Proto`).
3. **No localStorage Tokens**:
   - Authentication relies strictly on HTTP-only session cookies (`cv.sid`).
   - Lab PC malicious browser extensions or XSS vectors cannot extract tokens.

---

## Part 5: Verification Checklist

After deploying to Vercel and Render:

- [ ] **Landing Page**: Loads with dark/light mode toggle functioning.
- [ ] **System Status Badge**: Shows "Cloudflare R2 Object Store" and "Operational".
- [ ] **User Registration**: Register a test student username. Recovery codes display and can be copied/downloaded.
- [ ] **File Upload**: Upload a PDF, document, or image (verifies multipart streaming to R2).
- [ ] **In-Browser Preview**: Inspect the uploaded file in the modal viewer without downloading.
- [ ] **Download File**: Direct download executes smoothly.
- [ ] **Lab Hygiene Signout**: Signing out pops up the Lab PC Hygiene Checklist and destroys the server session.
- [ ] **Refresh & Deep Links**: Refreshing `/dashboard` or `/settings` preserves login state without 404.
