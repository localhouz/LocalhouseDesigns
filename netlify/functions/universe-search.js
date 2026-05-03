const fs = require('fs');
const path = require('path');

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const buckets = new Map();
let localEnvLoaded = false;

function loadLocalEnv() {
  if (localEnvLoaded) return;
  localEnvLoaded = true;

  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  const env = fs.readFileSync(envPath, 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const equalsAt = trimmed.indexOf('=');
    if (equalsAt < 1) continue;

    const key = trimmed.slice(0, equalsAt).trim();
    const value = trimmed.slice(equalsAt + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function normalizeQuery(value = '') {
  return String(value).replace(/\s+/g, ' ').trim().slice(0, 160);
}

function domainFromUrl(url = '') {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
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

function sanitizeResult(result, index, query, source) {
  const href = result.href || result.url || result.link || '';
  const domain = domainFromUrl(href);
  if (!href || !domain || !/^https?:\/\//i.test(href)) return null;

  return {
    id: `${source}-${index}-${domain}`,
    title: result.title || domain,
    domain,
    href,
    query,
    snippet: result.snippet || result.description || '',
    source,
  };
}

async function searchBrave(query) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      body: {
        error: 'search_provider_not_configured',
        provider: 'brave',
        message: 'Set BRAVE_SEARCH_API_KEY in Netlify to enable Brave Search.',
        results: [],
      },
    };
  }

  const params = new URLSearchParams({
    q: query,
    count: '10',
    country: 'us',
    safesearch: 'moderate',
    spellcheck: '1',
  });
  const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
    headers: {
      accept: 'application/json',
      'X-Subscription-Token': apiKey,
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      statusCode: response.status,
      body: {
        error: 'search_provider_error',
        provider: 'brave',
        message: payload?.error?.detail || payload?.message || 'Brave Search request failed.',
        results: [],
      },
    };
  }

  return {
    statusCode: 200,
    body: {
      provider: 'brave',
      query,
      results: (payload.web?.results || [])
        .map((result, index) => sanitizeResult(result, index, query, 'brave'))
        .filter(Boolean)
        .slice(0, 8),
    },
  };
}

async function searchGoogle(query) {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  if (!apiKey || !cx) {
    return {
      statusCode: 503,
      body: {
        error: 'search_provider_not_configured',
        provider: 'google',
        message: 'Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CX in Netlify to enable Google Custom Search.',
        results: [],
      },
    };
  }

  const params = new URLSearchParams({
    key: apiKey,
    cx,
    q: query,
    num: '10',
    safe: 'active',
  });
  const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`, {
    headers: { accept: 'application/json' },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      statusCode: response.status,
      body: {
        error: 'search_provider_error',
        provider: 'google',
        message: payload?.error?.message || 'Google Custom Search request failed.',
        results: [],
      },
    };
  }

  return {
    statusCode: 200,
    body: {
      provider: 'google',
      query,
      results: (payload.items || [])
        .map((result, index) => sanitizeResult(result, index, query, 'google'))
        .filter(Boolean)
        .slice(0, 8),
    },
  };
}

exports.handler = async (event) => {
  loadLocalEnv();

  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'method_not_allowed', results: [] });
  }

  if (isRateLimited(clientKey(event))) {
    return json(429, {
      error: 'rate_limited',
      message: 'Search is cooling down. Try again in a minute.',
      results: [],
    });
  }

  const query = normalizeQuery(event.queryStringParameters?.q);
  if (!query || query.length < 2) {
    return json(400, { error: 'invalid_query', message: 'Search query is too short.', results: [] });
  }

  if (/[<>{}[\]\\]/.test(query)) {
    return json(400, { error: 'invalid_query', message: 'Search query contains unsupported characters.', results: [] });
  }

  const provider = (process.env.UNIVERSE_SEARCH_PROVIDER || 'brave').toLowerCase();
  if (!['brave', 'google'].includes(provider)) {
    return json(503, {
      error: 'search_provider_not_configured',
      provider,
      message: 'Set UNIVERSE_SEARCH_PROVIDER to google or brave.',
      results: [],
    });
  }

  try {
    const result = provider === 'google'
      ? await searchGoogle(query)
      : await searchBrave(query);
    return json(result.statusCode, result.body);
  } catch {
    return json(502, {
      error: 'search_provider_unreachable',
      provider,
      message: 'Search provider is not reachable yet.',
      results: [],
    });
  }
};
