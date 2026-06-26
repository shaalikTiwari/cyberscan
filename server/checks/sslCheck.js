import tls from 'tls';
import { URL } from 'url';

function checkCertificate(hostname, port = 443) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: hostname, port, servername: hostname, rejectUnauthorized: false },
      () => {
        const cert = socket.getPeerCertificate();
        const isAuthorized = socket.authorized;
        socket.destroy();

        if (!cert || !cert.subject) {
          return resolve({ success: false, error: 'No certificate returned' });
        }

        const validTo   = new Date(cert.valid_to);
        const validFrom = new Date(cert.valid_from);
        const now       = new Date();
        const daysLeft  = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
        const isExpired = daysLeft < 0;
        const expiringSoon = daysLeft >= 0 && daysLeft <= 30;

        resolve({
          success: true,
          isAuthorized,          // false = self-signed or untrusted CA
          subject: cert.subject,
          issuer: cert.issuer,
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          daysLeft,
          isExpired,
          expiringSoon,
        });
      }
    );

    socket.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    socket.setTimeout(8000, () => {
      socket.destroy();
      resolve({ success: false, error: 'TLS connection timed out' });
    });
  });
}

async function checkHttpsRedirect(url) {
  // If already HTTPS, check if HTTP version redirects to HTTPS
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:') {
      const httpUrl = `http://${parsed.host}${parsed.pathname}`;
      const { default: axios } = await import('axios');

      try {
        const response = await axios.get(httpUrl, {
          timeout: 6000,
          maxRedirects: 0,
          validateStatus: () => true,
        });

        const location = response.headers['location'] || '';
        const redirectsToHttps =
          (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) &&
          location.startsWith('https://');

        return { httpRedirectsToHttps: redirectsToHttps, httpStatus: response.status };
      } catch {
        // HTTP not reachable at all — likely HTTPS-only, which is good
        return { httpRedirectsToHttps: true, httpStatus: null };
      }
    }

    // URL was HTTP — no redirect in place
    return { httpRedirectsToHttps: false, httpStatus: null };
  } catch {
    return { httpRedirectsToHttps: false, httpStatus: null };
  }
}

export async function sslCheck(url) {
  try {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';

    if (!isHttps) {
      return {
        success: true,
        isHttps: false,
        error: 'Site is served over HTTP — no SSL/TLS in use.',
        cert: null,
        httpRedirectsToHttps: false,
      };
    }

    const hostname = parsed.hostname;
    const [certResult, redirectResult] = await Promise.all([
      checkCertificate(hostname),
      checkHttpsRedirect(url),
    ]);

    return {
      success: true,
      isHttps: true,
      cert: certResult,
      httpRedirectsToHttps: redirectResult.httpRedirectsToHttps,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      isHttps: false,
      cert: null,
      httpRedirectsToHttps: false,
    };
  }
}