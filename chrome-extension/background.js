// LH Universe - background service worker.
// Collects open tabs + recent history, clusters by topic, returns page pins.

const TOPICS = [
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
  if (!topicPages[id]) topicPages[id] = [];
  if (topicPages[id].some(existing => existing.url === page.url)) return;
  if (topicPages[id].length < 8) topicPages[id].push(page);
}

async function buildClusters() {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const [historyItems, openTabs] = await Promise.all([
    chrome.history.search({ text: '', startTime: oneWeekAgo, maxResults: 220 }),
    chrome.tabs.query({}),
  ]);

  const topicScores = {};
  const topicPages = {};

  for (const tab of openTabs) {
    if (!tab.url?.startsWith('http')) continue;
    const scores = scoreText(tab.url, tab.title);
    for (const [id, score] of Object.entries(scores)) {
      topicScores[id] = (topicScores[id] || 0) + score * 8;
      addPage(topicPages, id, { url: tab.url, title: tab.title || tab.url });
    }
  }

  for (const item of historyItems) {
    if (!item.url?.startsWith('http')) continue;
    const scores = scoreText(item.url, item.title);
    for (const [id, score] of Object.entries(scores)) {
      topicScores[id] = (topicScores[id] || 0) + score * Math.max(item.visitCount || 1, 1);
      addPage(topicPages, id, { url: item.url, title: item.title || item.url });
    }
  }

  return Object.entries(topicScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([id]) => {
      const topic = TOPICS.find(t => t.id === id);
      return {
        id,
        label: topic?.label ?? id,
        icon: topic?.icon ?? '#',
        pages: topicPages[id] ?? [],
      };
    });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'GET_CONTEXT') return false;

  buildClusters()
    .then(clusters => sendResponse({ clusters }))
    .catch(() => sendResponse({ clusters: [] }));

  return true;
});
