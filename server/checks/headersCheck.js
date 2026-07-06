import axios from 'axios';

const SECURITY_HEADERS = [
  {
    name: 'Content-Security-Policy',
    key: 'content-security-policy',
    severity: 'HIGH',
    description: 'Prevents XSS attacks by controlling which resources the browser can load.',
  },
  {
    name: 'Strict-Transport-Security',
    key: 'strict-transport-security',
    severity: 'HIGH',
    description: 'Forces HTTPS connections, preventing protocol downgrade attacks.',
  },
  {
    name: 'X-Frame-Options',
    key: 'x-frame-options',
    severity: 'MEDIUM',
    description: 'Prevents clickjacking by blocking the page from being embedded in iframes.',
  },
  {
    name: 'X-Content-Type-Options',
    key: 'x-content-type-options',
    severity: 'MEDIUM',
    description: 'Stops browsers from MIME-sniffing, preventing content-type confusion attacks.',
  },
  {
    name: 'Referrer-Policy',
    key: 'referrer-policy',
    severity: 'LOW',
    description: 'Controls how much referrer information is sent with requests.',
  },
  {
    name: 'Permissions-Policy',
    key: 'permissions-policy',
    severity: 'LOW',
    description: 'Restricts access to browser features like camera, microphone, and geolocation.',
  },
];

export async function headersCheck(url) {
  try {
    const response = await axios.get(url, {
      timeout: 8000,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'CyberScan/1.0 Security Auditor',
      },
    });

    const receivedHeaders = response.headers;
    const missing = [];
    const present = [];

    for (const header of SECURITY_HEADERS) {
      if (receivedHeaders[header.key]) {
        present.push({
          ...header,
          value: receivedHeaders[header.key],
        });
      } else {
        missing.push(header);
      }
    }

    return {
      success: true,
      missing,
      present,
      totalChecked: SECURITY_HEADERS.length,
      missingCount: missing.length,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      missing: [],
      present: [],
      totalChecked: SECURITY_HEADERS.length,
      missingCount: 0,
    };
  }
}