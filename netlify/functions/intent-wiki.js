const TOPIC_LIBRARY = {
  'SEO & content': {
    intent: 'search visibility work',
    gravity: 0.82,
    ghosts: [
      { title: 'Technical SEO field guide', domain: 'developers.google.com', href: 'https://developers.google.com/search/docs' },
      { title: 'Schema vocabulary explorer', domain: 'schema.org', href: 'https://schema.org' },
      { title: 'Search visibility audit ideas', domain: 'ahrefs.com', href: 'https://ahrefs.com/blog/' },
    ],
  },
  'Frontend dev': {
    intent: 'interface build work',
    gravity: 0.76,
    ghosts: [
      { title: 'Angular docs', domain: 'angular.dev', href: 'https://angular.dev' },
      { title: 'Three.js examples', domain: 'threejs.org', href: 'https://threejs.org/examples/' },
      { title: 'MDN Web APIs', domain: 'developer.mozilla.org', href: 'https://developer.mozilla.org' },
    ],
  },
  'AI tools': {
    intent: 'agentic browser research',
    gravity: 0.9,
    ghosts: [
      { title: 'OpenAI platform docs', domain: 'platform.openai.com', href: 'https://platform.openai.com/docs' },
      { title: 'Browser agent research', domain: 'github.com', href: 'https://github.com/topics/browser-agent' },
      { title: 'Perplexity search', domain: 'perplexity.ai', href: 'https://www.perplexity.ai' },
    ],
  },
  'ERP & ops': {
    intent: 'operations systems work',
    gravity: 0.74,
    ghosts: [
      { title: 'Infor SyteLine resources', domain: 'infor.com', href: 'https://www.infor.com' },
      { title: 'Microsoft Dynamics docs', domain: 'learn.microsoft.com', href: 'https://learn.microsoft.com/dynamics365/' },
      { title: 'Manufacturing operations patterns', domain: 'lean.org', href: 'https://www.lean.org' },
    ],
  },
  Learning: {
    intent: 'learning path',
    gravity: 0.64,
    ghosts: [
      { title: 'Deep-dive video search', domain: 'youtube.com', href: 'https://www.youtube.com' },
      { title: 'Course marketplace', domain: 'udemy.com', href: 'https://www.udemy.com' },
      { title: 'Developer Q&A', domain: 'stackoverflow.com', href: 'https://stackoverflow.com' },
    ],
  },
};

function domainFromUrl(url = '') {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function normalizeQuery(query = '') {
  return String(query).replace(/\s+/g, ' ').trim().slice(0, 120);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'method_not_allowed' }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const clusters = Array.isArray(payload.clusters) ? payload.clusters : [];
    const searches = Array.isArray(payload.searches) ? payload.searches.map(normalizeQuery).filter(Boolean) : [];
    const prior = Array.isArray(payload.memory?.searches) ? payload.memory.searches.map(normalizeQuery).filter(Boolean) : [];
    const allSearches = [...prior, ...searches].filter((query, index, all) => all.indexOf(query) === index).slice(-24);

    const domains = clusters.flatMap(cluster => (cluster.pages || []).map(page => domainFromUrl(page.url)));
    const domainCounts = domains.reduce((acc, domain) => {
      if (!domain) return acc;
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {});

    const intents = clusters.map((cluster) => {
      const library = TOPIC_LIBRARY[cluster.label] || {
        intent: `${cluster.label} intent`,
        gravity: 0.58,
        ghosts: [],
      };
      const pages = Array.isArray(cluster.pages) ? cluster.pages : [];
      return {
        id: cluster.id,
        label: cluster.label,
        intent: library.intent,
        confidence: Math.min(0.96, library.gravity + pages.length * 0.025),
        evidenceCount: pages.length,
        ghosts: library.ghosts,
      };
    });

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        intents,
        memory: {
          searches: allSearches,
          domains: Object.entries(domainCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 16)
            .map(([domain, count]) => ({ domain, count })),
          eventCount: (payload.memory?.eventCount || 0) + clusters.length + searches.length,
          updatedAt: new Date().toISOString(),
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'bad_request' }),
    };
  }
};
