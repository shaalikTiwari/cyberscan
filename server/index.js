import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import scanRouter from './routes/scan.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5007;

// Rate limiting — 10 scans per IP per 15 minutes
const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many scans from this IP. Please wait 15 minutes before scanning again.'
  }
});

app.use(cors({
  origin: [
    'http://localhost:5173',
    /\.vercel\.app$/,
    'https://cyberscan-nu.vercel.app',
  ],
  credentials: true,
}));

app.use(express.json());

// Apply rate limiter only to scan route
app.use('/api/scan', scanLimiter);
app.use('/api/scan', scanRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'CyberScan API running', version: '2.0.0' });
});

app.listen(PORT, () => {
  console.log(`CyberScan server running on http://localhost:${PORT}`);
});