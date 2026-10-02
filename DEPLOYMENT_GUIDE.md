# FREE CLOUD DEPLOYMENT GUIDE — CODE-B MIS & INVOICING

This guide provides instructions for deploying the **CODE-B MIS & Invoicing System** for **100% free** on popular cloud hosting platforms.

---

## 🌟 Architecture Overview

```text
  [ Frontend: React + Vite ]          [ Backend: Spring Boot 3 ]          [ Database ]
       (Vercel / Render)      ──────>      (Render / Railway)       ──────> (TiDB / Aiven / H2)
          Static Site                     Docker Web Service                 MySQL Engine
```

---

## 🚀 Option 1: 1-Click Fullstack Deployment on Render (Recommended)

Render provides free hosting for both Docker Web Services and Static Sites with auto-deploy on git push.

### Step 1: Sign Up on Render
1. Go to [https://render.com](https://render.com) and click **Get Started for Free**.
2. Sign in with your **GitHub account**.

### Step 2: Deploy using Render Blueprint (1-Click)
1. On the Render Dashboard, click **New +** &rarr; **Blueprint**.
2. Connect your GitHub repository: `602sumit602/CODE-B-INTERNSHIP`.
3. Render will automatically detect `render.yaml` and configure:
   - `codeb-mis-backend` (Spring Boot API)
   - `codeb-mis-frontend` (React Dashboard)
4. Click **Apply**.
5. Render will build both services automatically!

### Step 3: Connect Frontend to Backend URL
Once `codeb-mis-backend` finishes deploying:
1. Copy its URL (e.g., `https://codeb-mis-backend.onrender.com`).
2. Go to your `codeb-mis-frontend` service in Render &rarr; **Environment**.
3. Add environment variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://codeb-mis-backend.onrender.com` (your backend URL)
4. Click **Save Changes** (Render will automatically re-deploy the frontend).

---

## ⚡ Option 2: Frontend on Vercel + Backend on Render

If you prefer Vercel's ultra-fast global CDN for the frontend:

### Deploy Frontend on Vercel:
1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** &rarr; **Project**.
3. Import `602sumit602/CODE-B-INTERNSHIP`.
4. In the Project Configuration:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (or leave default root `.`)
   - **Environment Variables**:
     - **Option A (Interactive Demo Mode - Recommended for quick evaluation)**:
       Leave `VITE_API_BASE_URL` empty or omitted. The application comes with a complete embedded mock database in `localStorage` supporting all CRUD operations, test accounts, PDF generation, and analytics out of the box!
     - **Option B (Connected to Live Spring Boot)**:
       Deploy `codeb-mis-backend` to Render first (see Option 1), then set `VITE_API_BASE_URL` to your **actual live Render backend URL** (e.g., `https://codeb-mis-backend-xxxx.onrender.com`).
       *Note: Do NOT enter dummy placeholders like `https://your-backend-url.onrender.com` as that will result in 404 responses.*
5. Click **Deploy**.

---

## 🗄️ Optional: Free Persistent Cloud MySQL Databases

If you want a dedicated cloud MySQL database instead of the built-in storage:

### 1. TiDB Cloud Serverless (Free Forever — Recommended)
- Website: [https://tidbcloud.com](https://tidbcloud.com)
- 5 GB free MySQL-compatible cloud storage forever.
- Create a free cluster, click **Connect**, select **General**, and copy the JDBC connection string.
- Set the `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` in your Render backend settings!

### 2. Aiven for MySQL (Free Tier)
- Website: [https://aiven.io](https://aiven.io)
- Offers free managed MySQL instances with full SSL support.

---

## 👥 Demo Logins on Live Servers

| Account | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@codeb.com` | `admin123` | Full administrative control |
| **Sales Representative** | `john.sales@codeb.com` | `sales123` | Sales quotes & invoice management |
