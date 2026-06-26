# CyberScan 🔍

A full-stack web vulnerability scanner for developers. Enter any public URL and CyberScan runs three parallel security checks, calculates a weighted risk score, and returns a detailed breakdown report.

**Live:** [cyberscan-nu.vercel.app](https://cyberscan-nu.vercel.app) · **API:** [cyberscan-api-imxz.onrender.com](https://cyberscan-api-imxz.onrender.com)

---

## What It Checks

| Check | What It Looks For |
|---|---|
| 🛡 **HTTP Security Headers** | Missing CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| 📂 **Sensitive Path Exposure** | 16 paths probed — `/.env`, `/.git`, `/admin`, `/backup.sql`, `/phpinfo.php` and more |
| 🔒 **SSL / TLS Certificate** | HTTPS enforcement, cert validity, days until expiry, trusted CA, HTTP→HTTPS redirect |

Results are aggregated into a **0–100 risk score** labeled LOW / MEDIUM / HIGH.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS v3 |
| Backend | Node.js + Express (ES Modules) |
| HTTP Probing | Axios |
| SSL Inspection | Node.js built-in `tls` module |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## Architecture

```
User enters URL
      ↓
React → POST /api/scan { url }
      ↓
Express validates URL + blocks private IPs (SSRF prevention)
      ↓
Promise.all runs 3 checks in parallel
      ├── headersCheck  → Axios GET, inspect response headers
      ├── pathsCheck    → 16 parallel Axios probes
      └── sslCheck      → Node.js tls socket, read peer certificate
      ↓
scoreEngine calculates weighted 0–100 risk score
      ↓
Full JSON report → React renders score ring + breakdown cards
```

---

## Security Features

- **SSRF Prevention** — blocks localhost, 127.0.0.1, and all private IP ranges before any outbound request
- **Input Validation** — URL parsed with native `URL` constructor, rejects malformed input
- **Axios Safety** — explicit timeouts, `validateStatus: () => true`, custom User-Agent
- **TLS Safety** — raw socket destroyed after cert read, self-signed certs inspected not crashed on
- **CORS Allowlist** — only accepts requests from localhost (dev) and exact Vercel production URL

---

## Running Locally

**Prerequisites:** Node.js >= 18

```bash
# Clone
git clone https://github.com/shaalikTiwari/cyberscan.git
cd cyberscan
```

```bash
# Backend (Terminal 1)
cd server
npm install
npm run dev
# Runs on http://localhost:5007
```

```bash
# Frontend (Terminal 2)
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

**Environment variables:**

`client/.env.development`
```
VITE_API_URL=http://localhost:5007
```

`client/.env.production`
```
VITE_API_URL=https://cyberscan-api-imxz.onrender.com
```

---

## Risk Score Weights

| Category | Issue | Points |
|---|---|---|
| Headers | Missing HIGH header | +15 each |
| Headers | Missing MEDIUM header | +8 each |
| Headers | Missing LOW header | +3 each |
| Paths | CRITICAL path exposed (200) | +20 each |
| Paths | HIGH path exposed (200) | +10 each |
| Paths | Forbidden path (403) | Half weight |
| SSL | No HTTPS | +20 |
| SSL | No HTTP→HTTPS redirect | +8 |
| SSL | Expired certificate | +15 |
| SSL | Expiring soon (<30 days) | +5 |
| SSL | Untrusted certificate | +10 |

Score 0–30 → **LOW** · 31–60 → **MEDIUM** · 61–100 → **HIGH**

---

## Project Structure

```
cyberscan/
├── client/                  # React + Vite + Tailwind
│   └── src/
│       ├── components/
│       │   ├── ScanForm.jsx
│       │   ├── RiskScore.jsx
│       │   ├── ScanSummary.jsx
│       │   ├── HeadersCheck.jsx
│       │   ├── PathsCheck.jsx
│       │   └── SSLCheck.jsx
│       └── App.jsx
└── server/                  # Node.js + Express
    ├── checks/
    │   ├── headersCheck.js
    │   ├── pathsCheck.js
    │   └── sslCheck.js
    ├── utils/
    │   └── scoreEngine.js
    ├── routes/
    │   └── scan.js
    └── index.js
```

---

Built by Shaalik Tiwari
