# CyberScan 🔍

A web vulnerability scanner built for developers. Enter any URL and CyberScan checks for:

- 🛡️ Missing HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
- 📂 Exposed sensitive paths (/.env, /.git, /admin, /backup.sql, etc.)
- 🔒 SSL/TLS certificate validity and expiry

Returns an overall risk score (LOW / MEDIUM / HIGH) with a detailed breakdown.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **HTTP Probing:** Axios
- **SSL Check:** Node.js built-in `tls` module

## Running Locally

\`\`\`bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm run dev
\`\`\`

Backend runs on http://localhost:5007
Frontend runs on http://localhost:5173

Built by Shaalik Tiwari