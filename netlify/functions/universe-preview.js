const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const MAX_URLS = 30;
const buckets = new Map();

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'private, max-age=3600',
    },
    body: JSON.stringify(body),
  };
}

function clientKey(event) {
  return event.headers?.['x-nf-client-connection-ip']
    || event.headers?.['client-ip']
    || event.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    || 'unknown';
}

function isRateLimited(key) {
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, resetAt: now + WINDOW_MS };
  if (bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  return bucket.count > MAX_REQUESTS;
}

function normalizeUrl(value = '') {
  try {
    const parsed = new URL(String(value));
    const host = parsed.hostname.toLowerCase();
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (isPrivateHost(host)) return null;
    parsed.username = '';
    parsed.password = '';
    parsed.hash = '';
    parsed.search = '';
    return parsed;
  } catch {
    return null;
  }
}

function isPrivateHost(host = '') {
  if (
    host === 'localhost'
    || host.endsWith('.local')
    || host.endsWith('.internal')
    || host === '0.0.0.0'
    || host === '127.0.0.1'
    || host === '::1'
  ) return true;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;
  const [a, b] = ipv4.slice(1).map(Number);
  return a === 10
    || a === 127
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168);
}

function domainFromUrl(url = '') {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function decodeEntities(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function attr(tag = '', name = '') {
  const pattern = new RegExp(`${name}\\s*=\\s*(['"])(.*?)\\1`, 'i');
  return decodeEntities(tag.match(pattern)?.[2] || '').trim();
}

function metaContent(html = '', names = []) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const name of names) {
    const wanted = name.toLowerCase();
    for (const tag of tags) {
      const key = (attr(tag, 'property') || attr(tag, 'name')).toLowerCase();
      if (key === wanted) return attr(tag, 'content');
    }
  }
  return '';
}

function linkHref(html = '', relNames = []) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const relName of relNames) {
    for (const tag of tags) {
      const rel = attr(tag, 'rel').toLowerCase();
      if (rel.split(/\s+/).includes(relName)) return attr(tag, 'href');
    }
  }
  return '';
}

function absoluteUrl(value = '', baseUrl = '') {
  if (!value) return '';
  try {
    const parsed = new URL(value, baseUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    if (isPrivateHost(parsed.hostname.toLowerCase())) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

async function fetchPreview(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);
  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'LocalhouseUniversePreview/0.1 (+https://localhousedesigns.com/lab/universe)',
      },
      redirect: 'follow',
    });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('text/html')) return null;

    const html = (await response.text()).slice(0, 450_000);
    const image = absoluteUrl(
      metaContent(html, [
        'og:image:secure_url',
        'og:image',
        'twitter:image',
        'twitter:image:src',
      ]) || linkHref(html, ['image_src']),
      response.url || url.toString(),
    );

    if (!image) return null;
    return {
      url: url.toString(),
      domain: domainFromUrl(url.toString()),
      image,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'method_not_allowed', previews: [] });
  }

  if (isRateLimited(clientKey(event))) {
    return json(429, { error: 'rate_limited', previews: [] });
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'invalid_json', previews: [] });
  }

  const urls = [...new Set((body.urls || [])
    .map(normalizeUrl)
    .filter(Boolean)
    .map(url => url.toString()))]
    .slice(0, MAX_URLS)
    .map(value => new URL(value));

  if (!urls.length) return json(200, { previews: [] });

  const previews = (await Promise.all(urls.map(fetchPreview))).filter(Boolean);
  return json(200, { previews });
};
