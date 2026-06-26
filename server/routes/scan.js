import express from 'express';
import { headersCheck } from '../checks/headersCheck.js';
import { pathsCheck }   from '../checks/pathsCheck.js';
import { sslCheck }     from '../checks/sslCheck.js';
import { calculateScore } from '../utils/scoreEngine.js';

const router = express.Router();

// POST /api/scan
router.post('/', async (req, res) => {
  const { url } = req.body;

  // Presence check
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Format check
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format. Include http:// or https://' });
  }

  // Block private/local IPs — prevent SSRF attacks
  const hostname = parsedUrl.hostname;
  const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  if (
    blockedHosts.includes(hostname) ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.')
  ) {
    return res.status(400).json({ error: 'Scanning private/local addresses is not allowed.' });
  }

  try {
    console.log(`[CyberScan] Starting scan for: ${url}`);
    const startTime = Date.now();

    // Run all three checks in parallel
    const [headersResult, pathsResult, sslResult] = await Promise.all([
      headersCheck(url),
      pathsCheck(url),
      sslCheck(url),
    ]);

    // Calculate risk score
    const scoreResult = calculateScore(headersResult, pathsResult, sslResult);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[CyberScan] Scan complete in ${duration}s — Score: ${scoreResult.score} (${scoreResult.label})`);

    res.json({
      url,
      scannedAt: new Date().toISOString(),
      duration: `${duration}s`,
      score: scoreResult,
      headers: headersResult,
      paths: pathsResult,
      ssl: sslResult,
    });

  } catch (err) {
    console.error('[CyberScan] Scan error:', err.message);
    res.status(500).json({ error: 'Scan failed. The target may be unreachable.' });
  }
});

export default router;