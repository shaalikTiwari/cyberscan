import express from 'express';

const router = express.Router();

// POST /api/scan
router.post('/', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format. Include http:// or https://' });
  }

  // Placeholder — real checks get wired in Phase 3
  res.json({
    message: 'Scan route working',
    receivedUrl: url,
  });
});

export default router;