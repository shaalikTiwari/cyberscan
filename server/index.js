import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scanRouter from './routes/scan.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5007;

app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
}));
app.use(express.json());

// Routes
app.use('/api/scan', scanRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'CyberScan server is running' });
});

app.listen(PORT, () => {
  console.log(`CyberScan server running on http://localhost:${PORT}`);
});