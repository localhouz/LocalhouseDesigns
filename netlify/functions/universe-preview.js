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

function parseSrcset(value = '') {
  return value
    .split(',')
    .map(part => {
      const [url, descriptor = ''] = part.trim().split(/\s+/, 2);
      const width = Number((descriptor.match(/^(\d+)w$/) || [])[1] || 0);
      const density = Number((descriptor.match(/^(\d+(?:\.\d+)?)x$/) || [])[1] || 0);
      return { url, score: width || density * 1000 || 1 };
    })
    .filter(item => item.url)
    .sort((a, b) => b.score - a.score);
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

function imageCandidates(html = '', baseUrl = '') {
  const candidates = [];
  const add = (value = '', source = 'page', priority = 0) => {
    const url = absoluteUrl(value, baseUrl);
    if (url && !candidates.some(item => item.url === url)) candidates.push({ url, source, priority });
  };

  add(metaContent(html, ['og:image:secure_url', 'og:image']), 'meta', 80);
  add(metaContent(html, ['twitter:image', 'twitter:image:src']), 'meta', 70);
  add(linkHref(html, ['image_src']), 'meta', 60);

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  for (const tag of imgTags.slice(0, 80)) {
    const srcset = attr(tag, 'srcset') || attr(tag, 'data-srcset');
    const bestSrcset = parseSrcset(srcset)[0]?.url;
    const src = bestSrcset || attr(tag, 'data-src') || attr(tag, 'data-lazy-src') || attr(tag, 'src');
    const alt = attr(tag, 'alt').toLowerCase();
    const className = attr(tag, 'class').toLowerCase();
    const width = Number(attr(tag, 'width') || 0);
    const height = Number(attr(tag, 'height') || 0);
    let priority = 20;
    if (/hero|feature|cover|product|photo|image|media|post|article/.test(`${alt} ${className}`)) priority += 25;
    if (width >= 800 || height >= 600) priority += 20;
    if (/logo|icon|avatar|spinner|badge|tracking|pixel/.test(`${src} ${alt} ${className}`.toLowerCase())) priority -= 45;
    add(src, 'img', priority);
  }

  return candidates.sort((a, b) => b.priority - a.priority).slice(0, 16);
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

function imageDimensions(bytes) {
  if (!bytes || bytes.length < 24) return null;
  const isPng = bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4e
    && bytes[3] === 0x47;
  if (isPng) {
    return {
      width: bytes.readUInt32BE(16),
      height: bytes.readUInt32BE(20),
    };
  }

  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  if (!isJpeg) return null;
  let offset = 2;
  while (offset < bytes.length - 9) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if (length < 2) return null;
    if (
      marker === 0xc0 || marker === 0xc1 || marker === 0xc2
      || marker === 0xc3 || marker === 0xc5 || marker === 0xc6
      || marker === 0xc7 || marker === 0xc9 || marker === 0xca
      || marker === 0xcb || marker === 0xcd || marker === 0xce
      || marker === 0xcf
    ) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  return null;
}

function isCrispEnough(candidate, dimensions) {
  if (!dimensions) return candidate.source === 'meta' && !/logo|icon|favicon/i.test(candidate.url);
  const area = dimensions.width * dimensions.height;
  if (/logo|icon|favicon|avatar|spinner|badge/i.test(candidate.url) && area < 480_000) return false;
  return dimensions.width >= 640 && dimensions.height >= 360 && area >= 300_000;
}

async function inspectImage(candidate) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(candidate.url, {
      signal: controller.signal,
      headers: {
        accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'user-agent': 'LocalhouseUniversePreview/0.1 (+https://localhousedesigns.com/lab/universe)',
      },
      redirect: 'follow',
    });
    if (!response.ok) return null;
    const type = response.headers.get('content-type') || '';
    if (!type.startsWith('image/')) return null;
    if (type.includes('svg')) {
      return /logo|icon|favicon/i.test(candidate.url)
        ? null
        : { ...candidate, width: 1200, height: 800 };
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    const dimensions = imageDimensions(bytes);
    if (!isCrispEnough(candidate, dimensions)) return null;
    return {
      ...candidate,
      width: dimensions?.width || 1200,
      height: dimensions?.height || 800,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
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
    const candidates = imageCandidates(html, response.url || url.toString());
    let image = '';
    let width = 0;
    let height = 0;
    for (const candidate of candidates) {
      const inspected = await inspectImage(candidate);
      if (!inspected) continue;
      image = inspected.url;
      width = inspected.width;
      height = inspected.height;
      break;
    }

    if (!image) return null;
    return {
      url: url.toString(),
      domain: domainFromUrl(url.toString()),
      image,
      width,
      height,
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
