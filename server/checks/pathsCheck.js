import axios from 'axios';

const SENSITIVE_PATHS = [
  { path: '/.env',              severity: 'CRITICAL', description: 'Environment file — may expose API keys, DB credentials, secrets.' },
  { path: '/.git/HEAD',         severity: 'CRITICAL', description: 'Git repository exposed — source code and history may be downloadable.' },
  { path: '/.git/config',       severity: 'CRITICAL', description: 'Git config exposed — reveals remote URLs and repository structure.' },
  { path: '/backup.sql',        severity: 'CRITICAL', description: 'SQL database backup exposed — full data dump accessible.' },
  { path: '/dump.sql',          severity: 'CRITICAL', description: 'SQL dump file exposed — full database accessible.' },
  { path: '/db.sql',            severity: 'CRITICAL', description: 'Database file exposed publicly.' },
  { path: '/admin',             severity: 'HIGH',     description: 'Admin panel accessible — may allow unauthorized access.' },
  { path: '/admin/login',       severity: 'HIGH',     description: 'Admin login page exposed — brute force risk.' },
  { path: '/wp-admin',          severity: 'HIGH',     description: 'WordPress admin panel exposed.' },
  { path: '/wp-admin/login.php',severity: 'HIGH',     description: 'WordPress login page exposed — common brute force target.' },
  { path: '/phpinfo.php',       severity: 'HIGH',     description: 'PHP configuration info exposed — reveals server internals.' },
  { path: '/server-status',     severity: 'HIGH',     description: 'Apache server status page exposed — reveals server activity.' },
  { path: '/config.php',        severity: 'HIGH',     description: 'PHP config file exposed — may contain credentials.' },
  { path: '/.DS_Store',         severity: 'MEDIUM',   description: 'macOS metadata file exposed — reveals directory structure.' },
  { path: '/robots.txt',        severity: 'LOW',      description: 'Robots file present — check for disallowed sensitive paths.' },
  { path: '/crossdomain.xml',   severity: 'LOW',      description: 'Flash crossdomain policy present — legacy security risk.' },
];

async function probePath(baseUrl, pathObj) {
  const fullUrl = baseUrl.replace(/\/$/, '') + pathObj.path;

  try {
    const response = await axios.get(fullUrl, {
      timeout: 6000,
      maxRedirects: 0,           // don't follow redirects — a redirect != exposed
      validateStatus: () => true,
      headers: {
        'User-Agent': 'CyberScan/1.0 Security Auditor',
      },
    });

    const status = response.status;

    // 200 = exposed, 403 = exists but forbidden (still a finding), anything else = not found
    const isExposed = status === 200;
    const isForbidden = status === 403;

    if (isExposed || isForbidden) {
      return {
        ...pathObj,
        fullUrl,
        status,
        exposed: isExposed,
        forbidden: isForbidden,
      };
    }

    return null; // clean
  } catch {
    return null; // timeout or connection error = path not accessible
  }
}

export async function pathsCheck(url) {
  try {
    // Probe all paths in parallel
    const results = await Promise.all(
      SENSITIVE_PATHS.map((pathObj) => probePath(url, pathObj))
    );

    const findings = results.filter(Boolean); // remove nulls
    const exposed  = findings.filter((f) => f.exposed);
    const forbidden = findings.filter((f) => f.forbidden);

    return {
      success: true,
      findings,
      exposed,
      forbidden,
      totalChecked: SENSITIVE_PATHS.length,
      exposedCount: exposed.length,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      findings: [],
      exposed: [],
      forbidden: [],
      totalChecked: SENSITIVE_PATHS.length,
      exposedCount: 0,
    };
  }
}