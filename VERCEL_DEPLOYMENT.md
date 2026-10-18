# CloudVault Vercel & Production Deployment Guide

Deploy **CloudVault** with **₹0/month operating costs** using industry-standard free tiers:
- **Unified All-in-One Host**: **Vercel** (Global Edge CDN + Node.js Serverless Express API)
- **Database**: **MongoDB Atlas** (M0 Free Cluster — 512 MB metadata)
- **Object Storage**: **Cloudflare R2** (10 GB free storage, **0 egress fees**)

---

## 🏛️ Architecture Overview: All-in-One Vercel Deployment

Both the React + Vite frontend and the Express backend run seamlessly under a **single Vercel project** on the exact same domain:

```text
  [ User Browser / Lab PC ]
             │
             ▼ (Single Domain: https://your-cloudvault.vercel.app)
┌──────────────────────────────────────────────────────────────┐
│                            Vercel                            │
│                                                              │
│   ┌────────────────────────┐    ┌────────────────────────┐   │
│   │   Frontend (Vite SPA)  │    │  Backend (Serverless)  │   │
│   │   Path: /*             │    │  Path: /api/*          │   │
│   │   Build: client/dist   │    │  Entry: api/index.js   │   │
│   └────────────────────────┘    └───────────┬────────────┘   │
└─────────────────────────────────────────────┼────────────────┘
                                              │
                                ┌─────────────┴─────────────┐
                                │                           │
                                ▼                           ▼
                  ┌─────────────────────────┐ ┌─────────────────────────┐
                  │   MongoDB Atlas (M0)    │ │      Cloudflare R2      │
                  │ User & Metadata Store   │ │    Binary Object Store  │
                  │ (₹0 / 512 MB)           │ │ (₹0 / 10 GB, 0 Egress)  │
                  └─────────────────────────┘ └─────────────────────────┘
```

### Key Advantages of Unified Vercel Deployment:
1. **Single Origin (`https://your-app.vercel.app`)**: No CORS headaches or cross-origin domain mismatches.
2. **First-Party Session Cookies (`SameSite=Lax`)**: University lab PC browsers and incognito modes that block third-party cookies work with 100% reliability.
3. **Zero Configuration**: Vercel automatically detects the root `vercel.json`, builds the client into `client/dist`, and routes `/api/*` to the serverless Express function at `api/index.js`.
4. **Instant Global CDN**: Static assets served from Vercel's global edge network.

> **Note on Upload Sizes**:  
> Vercel Serverless Functions on the free Hobby plan impose a **4.5 MB request payload limit**.  
> If your students need to upload large files up to 25 MB directly via multipart upload, you can either upgrade Vercel or point the backend to Render (see [Alternative Split Deployment](#alternative-split-deployment-render-backend) below). For typical lab assignments, code snippets, labs, documents, spreadsheets, and compressed reports (< 4.5 MB), the unified Vercel deployment works directly.

---

## 🚀 Step-by-Step Deployment: All-in-One on Vercel

### Step 1: Push Code to GitHub
Ensure your repository is pushed to GitHub:
```bash
git add .
git commit -m "Configure all-in-one Vercel deployment with serverless API"
git push origin main
```

---

### Step 2: Set Up Free MongoDB Atlas Cluster
If you haven't already:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Create a free **M0 Sandbox** cluster (AWS / closest region).
3. Under **Database Access**, create a database user (e.g., `cloudvault_admin`) and save the password.
4. Under **Network Access**, click **Add IP Address** > select **Allow Access from Anywhere** (`0.0.0.0/0`) so Vercel's dynamic serverless IP pool can connect.
5. In your cluster dashboard, click **Connect** > **Drivers** > copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/cloudvault?retryWrites=true&w=majority
   ```

---

### Step 3: (Optional) Set Up Free Cloudflare R2 Bucket
For persistent cloud file storage with zero egress fees:
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com) and go to **R2**.
2. Click **Create Bucket**, name it `cloudvault-files`.
3. Under **Manage R2 API Tokens**, click **Create API token**:
   - Permission: **Object Read & Write**
   - Bucket: `cloudvault-files`
4. Note down:
   - **Access Key ID**
   - **Secret Access Key**
   - **Endpoint**: `https://<account-id>.r2.cloudflarestorage.com`

---

### Step 4: Import Project into Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and log in.
2. Select your repository: **`Harsh007engineering/CloudVault`**.
3. In the **Configure Project** screen:
   - **Project Name**: `cloudvault` (or your preferred name)
   - **Framework Preset**: `Vite` (or `Other`)
   - **Root Directory**: `./` (leave as root, **do not select `client`**)
   - **Build Command**: `npm run build` (detected automatically)
   - **Output Directory**: `client/dist` (detected automatically via `vercel.json`)
   - **Install Command**: `npm install` (detected automatically)

4. Expand the **Environment Variables** section and add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production environment flag |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/cloudvault?retryWrites=true&w=majority` | Your MongoDB Atlas connection URI |
| `SESSION_SECRET` | `c987a2f16e45b...` *(64 random hex chars)* | Secret used to sign session cookies |
| `SESSION_MAX_AGE` | `7200000` | Session lifetime (2 hours in ms) |
| `STORAGE_PROVIDER` | `r2` *(or `local`)* | Storage backend (`r2` recommended) |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` | Cloudflare R2 S3 API endpoint |
| `R2_BUCKET` | `cloudvault-files` | Cloudflare R2 bucket name |
| `R2_ACCESS_KEY_ID` | `<your-access-key-id>` | Cloudflare R2 Access Key |
| `R2_SECRET_ACCESS_KEY` | `<your-secret-access-key>` | Cloudflare R2 Secret Access Key |
| `R2_REGION` | `auto` | R2 Region |

> 💡 **Notice**: You **DO NOT** need to set `VITE_API_URL` or `CLIENT_URL`.  
> Because both frontend and backend reside on the exact same Vercel deployment, the client automatically defaults to `/api`, creating seamless same-origin communication!

5. Click **Deploy**.

Vercel will install dependencies, build the React SPA, package the Express serverless function at `api/index.js`, and assign your live URL (e.g., `https://cloudvault-xxx.vercel.app`).

---

## 🧪 Post-Deployment Verification Checklist

Once Vercel finishes the build:

1. **Test API Health**:  
   Visit `https://your-project.vercel.app/api/health` in your browser.  
   You should see:
   ```json
   {
     "success": true,
     "message": "CloudVault API is healthy",
     "data": {
       "service": "CloudVault API",
       "status": "online",
       "database": "connected"
     }
   }
   ```

2. **Test Frontend SPA**:  
   Open `https://your-project.vercel.app`. The landing page should load immediately with the dark theme, light theme toggle, and Windows XP Professional mode.

3. **Register / Login**:  
   - Register a new account.
   - Verify that the cryptographic recovery codes are displayed.
   - Confirm that the `cv.sid` session cookie is stored as `HttpOnly; SameSite=Lax; Secure`.

4. **Upload a File**:  
   - Upload a test document or image.
   - Confirm it appears in your file table.
   - Test in-browser preview and file download.

5. **Lab PC Signout**:  
   - Click Sign Out.
   - Verify the shared lab hygiene dialog appears and session data is wiped.

---

## Alternative: Split Deployment (Render Backend)

If you have a requirement for uploading files larger than 4.5 MB on Vercel's free tier without using client-side presigned direct uploads, you can keep the frontend on Vercel and host the Express server on Render:

1. Deploy `server/` to **Render** as a Web Service.
2. Set `VITE_API_URL=https://cloudvault-api.onrender.com/api` on your Vercel frontend.
3. Set `CLIENT_URL=https://your-cloudvault.vercel.app` on Render.
