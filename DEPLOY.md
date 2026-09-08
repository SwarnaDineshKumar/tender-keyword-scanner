# Deployment Architecture & Production Guide

> [!NOTE]
> **Important**: In accordance with the assignment brief, actual cloud deployment is **optional / not required** for this take-home exercise. The application is fully configured and verified for local development and self-contained execution. This document details the exact production architecture, hosting strategy, and environment configuration required should the application be deployed to production.

---

## 1. Recommended Deployment Architecture

To maximize availability, simplify CI/CD, and keep operational costs low, a decoupled PaaS architecture is recommended:

```
[Browser Client]
       │
       ▼ (HTTPS)
[Frontend Hosting: Vercel or Netlify]
       │
       ▼ (HTTPS REST API /api/scan)
[Backend API: Render, Railway, or Fly.io (Node.js Express)]
       │
       ├── In-Memory Extraction (pdf-parse / mammoth)
       ├── Deterministic Keyword Engine
       └── Dynamic Excel Generator (exceljs)
```

### Frontend
- **Recommended Host**: **Vercel** or **Netlify**
- **Reason**: Native support for Vite/React, global Edge CDN distribution, instant preview deployments, and zero server maintenance.
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Publish Directory**: `client/dist`

### Backend API
- **Recommended Host**: **Render**, **Railway**, or **Fly.io**
- **Reason**: Container-native Node.js hosting with persistent memory, predictable request routing for file uploads, and automatic HTTPS provisioning.
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `node src/index.js`
- **Resource Allocation**: Minimum 512MB RAM / 0.5 CPU to comfortably buffer multi-page PDFs in memory.

---

## 2. Environment Variables

### Backend Environment (`server`)

| Variable | Description | Example (Production) | Default (Local) |
| :--- | :--- | :--- | :--- |
| `PORT` | Listening port for Express | `4000` or assigned by host | `4000` |
| `NODE_ENV` | Runtime environment mode | `production` | `development` |
| `ALLOWED_ORIGIN` | Allowed CORS origin for client | `https://tender-scanner.tritorc.com` | `*` or `http://localhost:5173` |

### Frontend Environment (`client`)

| Variable | Description | Example (Production) | Default (Local) |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Production Backend API Base URL | `https://api.tender-scanner.tritorc.com` | `/api` (via Vite proxy) |

---

## 3. How Frontend Points to Production Backend

In local development, the Vite dev server uses a proxy in `vite.config.js` forwarding `/api` to `http://localhost:4000`.

For production:
1. In `client/src/services/api.js`, the API base URL can use an environment variable with fallback:
   ```javascript
   const API_BASE = import.meta.env.VITE_API_URL 
     ? `${import.meta.env.VITE_API_URL}/api` 
     : '/api';
   ```
2. Alternatively, configure Vercel / Netlify rewrites in `vercel.json` or `_redirects` to proxy `/api/*` requests directly to the production backend URL, which avoids cross-origin requests completely.

Example `vercel.json` (if deployed on Vercel):
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://tender-scanner-api.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 4. CORS Considerations

In production, cross-origin requests must be explicitly permitted if the frontend and backend are hosted on separate domains:

In `server/src/index.js`:
```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://tender-scanner.tritorc.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
}));
```

---

## 5. Build and Start Commands Summary

| Workspace | Build Command | Start Command | Test Command |
| :--- | :--- | :--- | :--- |
| **Root** | `npm run build` | `npm run start` | `npm test` |
| **Server** | *(None required)* | `node src/index.js` | `node --test test/` |
| **Client** | `npm run build` (vite build) | `vite preview` | *(Built during client build)* |

---

## 6. Note on MongoDB (Bonus / Optional Feature)

- The core scanner is completely stateless; uploaded documents are processed in-memory and an Excel workbook is returned without database dependency.
- If persistent scan history is enabled in the future as an optional bonus feature:
  - Host a managed database on **MongoDB Atlas** (Free M0 cluster).
  - Set `MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/tender_scanner?retryWrites=true&w=majority` in the backend environment.
  - The server should gracefully degrade if `MONGO_URI` is not provided, allowing document scanning to function reliably without interruption.
