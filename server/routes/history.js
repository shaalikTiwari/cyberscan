import express from 'express';
import Scan from '../models/Scan.js';

const router = express.Router();

// GET /api/history — last 20 scans
router.get('/', async (req, res) => {
  try {
    const scans = await Scan.find()
      .sort({ scannedAt: -1 })
      .limit(20)
      .select('url scannedAt score duration isHttps certDaysLeft');

    res.json({ scans });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scan history' });
  }
});

// GET /api/history/:id — single scan
router.get('/:id', async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    res.json({ scan });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scan' });
  }
});

export default router;