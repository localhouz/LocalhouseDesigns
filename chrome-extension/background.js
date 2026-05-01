// LH Universe - background service worker.
// Collects open tabs + recent history, then annotates that history with secondary topic groups.

const TOPICS = [
  {
    id: 'socials',
    label: 'Socials',
    icon: '@',
    keywords: ['instagram', 'facebook', 'threads', 'tiktok', 'x.com', 'twitter',
      'linkedin', 'reddit', 'pinterest', 'youtube', 'social'],
  },
  {
    id: 'food',
    label: 'Food & flavor',
    icon: 'hot',
    keywords: ['sauce', 'sauces', 'hot sauce', 'spice', 'pepper', 'restaurant',
      'food', 'drink', 'bar', 'gastropub', 'rooseveltstulsa'],
  },
  {
    id: 'design',
    label: 'Design',
    icon: 'grid',
    keywords: ['design', 'style', 'styles', 'north-styles', 'portfolio', 'brand',
      'visual', 'ui', 'ux', 'web studio'],
  },
  {
    id: 'frontend',
    label: 'Frontend dev',
    icon: '+',
    keywords: ['angular', 'react', 'vue', 'typescript', 'javascript', 'css', 'webpack', 'vite',
      'nextjs', 'astro', 'tailwind', 'three.js', 'webgl', 'svelte', 'npm', 'node'],
  },
  {
    id: 'erp',
    label: 'ERP & ops',
    icon: '#',
    keywords: ['erp', 'syteline', 'infor', 'business central', 'dynamics', 'sap', 'netsuite',
      'manufacturing', 'inventory', 'bom', 'warehouse', 'oracle', 'supply chain'],
  },
  {
    id: 'seo',
    label: 'SEO & content',
    icon: 'o',
    keywords: ['seo', 'ahrefs', 'semrush', 'moz', 'search console', 'keyword', 'backlink',
      'schema', 'structured data', 'geo', 'serp', 'content strategy'],
  },
  {
    id: 'jobs',
    label: 'Job hunting',
    icon: '->',
    keywords: ['linkedin', 'indeed', 'glassdoor', 'resume', 'career', 'hiring', 'job listing',
      'salary', 'levelsfyi', 'interviewing', 'offer'],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: '$',
    keywords: ['mortgage', 'refinance', 'zillow', 'redfin', 'loan', 'bank', 'invest',
      'stocks', '401k', 'realtor', 'property', 'brokerage', 'etf'],
  },
  {
    id: 'learning',
    label: 'Learning',
    icon: '*',
    keywords: ['youtube', 'tutorial', 'course', 'udemy', 'docs', 'documentation',
      'stackoverflow', 'mdn', 'devdocs', 'pluralsight', 'egghead'],
  },
  {
    id: 'ai',
    label: 'AI tools',
    icon: 'ai',
    keywords: ['chatgpt', 'openai', 'claude', 'anthropic', 'gemini', 'copilot',
      'midjourney', 'llm', 'gpt', 'perplexity', 'cursor', 'v0'],
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: '[]',
    keywords: ['amazon', 'shopify', 'etsy', 'ebay', 'cart', 'checkout', 'buy', 'product'],
  },
];

function scoreText(url = '', title = '') {
  const text = `${url} ${title}`.toLowerCase();
  const scores = {};
  for (const topic of TOPICS) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > 0) scores[topic.id] = score;
  }
  return scores;
}

function addPage(topicPages, id, page) {
  if (isLocalUrl(page.url)) return;
  if (!topicPages[id]) topicPages[id] = [];
  const domain = domainFromUrl(page.url);
  if (topicPages[id].some(existing => existing.url === page.url || domainFromUrl(existing.url) === domain)) return;
  if (topicPages[id].length < 8) topicPages[id].push(page);
}

function isLocalUrl(url = '') {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return parsed.protocol === 'file:'
      || host === 'localhost'
      || host === '127.0.0.1'
      || host === '0.0.0.0'
      || host === '::1';
  } catch {
    return /^[a-z]:[\\/]/i.test(url);
  }
}

function domainFromUrl(url = '') {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function extractSearch(url = '') {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const searchHosts = ['google.com', 'bing.com', 'duckduckgo.com', 'search.brave.com', 'perplexity.ai', 'youtube.com'];
    if (!searchHosts.some(searchHost => host === searchHost || host.endsWith(`.${searchHost}`))) return '';
    return parsed.searchParams.get('q')
      || parsed.searchParams.get('p')
      || parsed.searchParams.get('query')
      || parsed.searchParams.get('search_query')
      || '';
  } catch {
    return '';
  }
}

async function buildClusters() {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const [historyItems, openTabs] = await Promise.all([
    chrome.history.search({ text: '', startTime: oneWeekAgo, maxResults: 800 }),
    chrome.tabs.query({}),
  ]);
  const bookmarkTree = await chrome.bookmarks.getTree().catch(() => []);

  const topicScores = {};
  const topicPages = {};
  const searches = [];
  const domains = {};
  const recentPages = [];
  const bookmarks = [];

  function trackDomain(url) {
    if (isLocalUrl(url)) return;
    try {
      const host = new URL(url).hostname.replace(/^www\./, '');
      domains[host] = (domains[host] || 0) + 1;
    } catch {}
  }

  function addRecentPage(page) {
    if (isLocalUrl(page.url)) return;
    const domain = domainFromUrl(page.url);
    if (recentPages.some(existing => existing.url === page.url || domainFromUrl(existing.url) === domain)) return;
    if (recentPages.length < 40) recentPages.push(page);
  }

  function walkBookmarks(nodes = []) {
    for (const node of nodes) {
      if (node.url?.startsWith('http') && !isLocalUrl(node.url)) {
        bookmarks.push({ url: node.url, title: node.title || node.url });
        trackDomain(node.url);
      }
      if (node.children) walkBookmarks(node.children);
    }
  }
  walkBookmarks(bookmarkTree);

  for (const tab of openTabs) {
    if (!tab.url?.startsWith('http') || isLocalUrl(tab.url)) continue;
    trackDomain(tab.url);
    addRecentPage({ url: tab.url, title: tab.title || tab.url });
    const search = extractSearch(tab.url);
    if (search && !searches.includes(search)) searches.push(search);
    const scores = scoreText(tab.url, tab.title);
    for (const [id, score] of Object.entries(scores)) {
      topicScores[id] = (topicScores[id] || 0) + score * 8;
      addPage(topicPages, id, { url: tab.url, title: tab.title || tab.url });
    }
  }

  for (const item of historyItems) {
    if (!item.url?.startsWith('http') || isLocalUrl(item.url)) continue;
    trackDomain(item.url);
    addRecentPage({ url: item.url, title: item.title || item.url });
    const search = extractSearch(item.url);
    if (search && !searches.includes(search)) searches.push(search);
    const scores = scoreText(item.url, item.title);
    for (const [id, score] of Object.entries(scores)) {
      topicScores[id] = (topicScores[id] || 0) + score * Math.max(item.visitCount || 1, 1);
      addPage(topicPages, id, { url: item.url, title: item.title || item.url });
    }
  }

  const topicClusters = Object.entries(topicScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([id]) => {
      const topic = TOPICS.find(t => t.id === id);
      return {
        id,
        label: topic?.label ?? id,
        icon: topic?.icon ?? '#',
        pages: topicPages[id] ?? [],
      };
    });

  const clusters = [];
  if (recentPages.length) {
    clusters.push({
      id: 'recent',
      label: 'History',
      icon: '...',
      pages: recentPages.slice(0, 28),
    });
  }
  clusters.push(...topicClusters);

  return {
    clusters,
    searches: searches.slice(0, 8),
    bookmarks: bookmarks.slice(0, 40),
    domains: Object.entries(domains)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([domain, count]) => ({ domain, count })),
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'GET_CONTEXT') return false;

  buildClusters()
    .then(context => sendResponse(context))
    .catch(() => sendResponse({ clusters: [] }));

  return true;
});
