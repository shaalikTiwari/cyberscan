// Risk points assigned per issue found
const WEIGHTS = {
    // Headers (total possible: 40 pts)
    header: {
      HIGH:   15,
      MEDIUM: 8,
      LOW:    3,
    },
    // Exposed paths (total possible: 40 pts)
    path: {
      CRITICAL: 20,
      HIGH:     10,
      MEDIUM:   5,
      LOW:      2,
    },
    // SSL issues (total possible: 20 pts)
    ssl: {
      noHttps:           20,
      noRedirect:        8,
      certUnauthorized:  10,
      certExpired:       15,
      certExpiringSoon:  5,
    },
  };
  
  const MAX_SCORE = 100;
  
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  function getRiskLabel(score) {
    if (score <= 30) return 'LOW';
    if (score <= 60) return 'MEDIUM';
    return 'HIGH';
  }
  
  function getRiskColor(label) {
    if (label === 'LOW')    return 'green';
    if (label === 'MEDIUM') return 'yellow';
    return 'red';
  }
  
  export function calculateScore(headersResult, pathsResult, sslResult) {
    let riskPoints = 0;
    const breakdown = {
      headers: { points: 0, findings: [] },
      paths:   { points: 0, findings: [] },
      ssl:     { points: 0, findings: [] },
    };
  
    // --- Headers scoring ---
    if (headersResult.success) {
      for (const header of headersResult.missing) {
        const pts = WEIGHTS.header[header.severity] || 0;
        riskPoints += pts;
        breakdown.headers.points += pts;
        breakdown.headers.findings.push({
          name: header.name,
          severity: header.severity,
          description: header.description,
          points: pts,
        });
      }
    }
  
    // --- Paths scoring (only count exposed, not forbidden) ---
    if (pathsResult.success) {
      for (const finding of pathsResult.exposed) {
        const pts = WEIGHTS.path[finding.severity] || 0;
        riskPoints += pts;
        breakdown.paths.points += pts;
        breakdown.paths.findings.push({
          path: finding.path,
          severity: finding.severity,
          description: finding.description,
          status: finding.status,
          points: pts,
        });
      }
  
      // Forbidden paths (403) — note them but don't score as high
      for (const finding of pathsResult.forbidden) {
        const pts = Math.floor((WEIGHTS.path[finding.severity] || 0) / 2);
        riskPoints += pts;
        breakdown.paths.points += pts;
        breakdown.paths.findings.push({
          path: finding.path,
          severity: finding.severity,
          description: finding.description,
          status: finding.status,
          note: 'Path exists but access is restricted (403)',
          points: pts,
        });
      }
    }
  
    // --- SSL scoring ---
    if (sslResult.success) {
      if (!sslResult.isHttps) {
        const pts = WEIGHTS.ssl.noHttps;
        riskPoints += pts;
        breakdown.ssl.points += pts;
        breakdown.ssl.findings.push({
          issue: 'No HTTPS',
          severity: 'CRITICAL',
          description: 'Site is served over HTTP — all traffic is unencrypted.',
          points: pts,
        });
      } else {
        if (!sslResult.httpRedirectsToHttps) {
          const pts = WEIGHTS.ssl.noRedirect;
          riskPoints += pts;
          breakdown.ssl.points += pts;
          breakdown.ssl.findings.push({
            issue: 'No HTTP → HTTPS redirect',
            severity: 'HIGH',
            description: 'HTTP version of the site does not redirect to HTTPS.',
            points: pts,
          });
        }
  
        if (sslResult.cert?.success) {
          if (sslResult.cert.isExpired) {
            const pts = WEIGHTS.ssl.certExpired;
            riskPoints += pts;
            breakdown.ssl.points += pts;
            breakdown.ssl.findings.push({
              issue: 'SSL Certificate Expired',
              severity: 'CRITICAL',
              description: `Certificate expired ${Math.abs(sslResult.cert.daysLeft)} days ago.`,
              points: pts,
            });
          } else if (sslResult.cert.expiringSoon) {
            const pts = WEIGHTS.ssl.certExpiringSoon;
            riskPoints += pts;
            breakdown.ssl.points += pts;
            breakdown.ssl.findings.push({
              issue: 'SSL Certificate Expiring Soon',
              severity: 'MEDIUM',
              description: `Certificate expires in ${sslResult.cert.daysLeft} days.`,
              points: pts,
            });
          }
  
          if (!sslResult.cert.isAuthorized) {
            const pts = WEIGHTS.ssl.certUnauthorized;
            riskPoints += pts;
            breakdown.ssl.points += pts;
            breakdown.ssl.findings.push({
              issue: 'Untrusted SSL Certificate',
              severity: 'HIGH',
              description: 'Certificate is self-signed or issued by an untrusted authority.',
              points: pts,
            });
          }
        }
      }
    }
  
    const finalScore = clamp(riskPoints, 0, MAX_SCORE);
    const label = getRiskLabel(finalScore);
    const color = getRiskColor(label);
  
    return {
      score: finalScore,
      label,
      color,
      breakdown,
      summary: {
        totalHeadersMissing: headersResult.missingCount ?? 0,
        totalPathsExposed:   pathsResult.exposedCount ?? 0,
        sslIssues:           breakdown.ssl.findings.length,
      },
    };
  }