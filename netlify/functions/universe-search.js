function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
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

function normalizeBraveResult(result, index, query) {
  const href = result.url || '';
  const domain = domainFromUrl(href);
  if (!href || !domain) return null;

  return {
    id: `brave-${index}-${domain}`,
    title: result.title || domain,
    domain,
    href,
    query,
    snippet: result.description || '',
    source: 'brave',
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'method_not_allowed' });
  }

  const query = normalizeQuery(event.queryStringParameters?.q);
  if (!query) {
    return json(400, { error: 'missing_query' });
  }

  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return json(503, {
      error: 'search_provider_not_configured',
      provider: 'brave',
      message: 'Set BRAVE_SEARCH_API_KEY in Netlify to enable real web search results.',
      results: [],
    });
  }

  const params = new URLSearchParams({
    q: query,
    count: '10',
    country: 'us',
    safesearch: 'moderate',
    spellcheck: '1',
  });

  try {
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      headers: {
        accept: 'application/json',
        'X-Subscription-Token': apiKey,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return json(response.status, {
        error: 'search_provider_error',
        provider: 'brave',
        message: payload?.error?.detail || payload?.message || 'Brave Search request failed.',
        results: [],
      });
    }

    const results = (payload.web?.results || [])
      .map((result, index) => normalizeBraveResult(result, index, query))
      .filter(Boolean)
      .slice(0, 8);

    return json(200, {
      provider: 'brave',
      query,
      results,
    });
  } catch {
    return json(502, {
      error: 'search_provider_unreachable',
      provider: 'brave',
      results: [],
    });
  }
};
