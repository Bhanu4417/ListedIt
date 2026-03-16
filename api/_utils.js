// Shared proxy logic for all Vercel serverless API functions
const API_SERVERS = [
  'https://hifi-one.spotisaver.net',
  'https://hifi-two.spotisaver.net',
  'https://arran.monochrome.tf',
  'https://triton.squid.wtf',
  'https://vogel.qqdl.site',
  'https://hund.qqdl.site',
  'https://maus.qqdl.site',
  'https://wolf.qqdl.site',
  'https://katze.qqdl.site',
  'https://tidal.kinoplus.online',
];

export async function proxyWithFallback(apiPath, queryParams) {
  const qs = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      qs.append(key, value);
    }
  });
  const queryString = qs.toString();
  const errors = [];

  for (const server of API_SERVERS) {
    const url = `${server}${apiPath}${queryString ? '?' + queryString : ''}`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, {
        headers: { 'User-Agent': 'ListedIt/1.0', 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.ok) {
        return await response.json();
      }
      errors.push(`${server}: HTTP ${response.status}`);
    } catch (err) {
      errors.push(`${server}: ${err.message}`);
    }
  }
  throw new Error(`All servers failed: ${errors.join(' | ')}`);
}

export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
