// LH Universe - content script.
// Runs only on /lab/universe and posts extension context into the page.

function sendContext(includeHistoryImport = false) {
  chrome.runtime.sendMessage({ type: 'GET_CONTEXT', includeHistoryImport }, (response) => {
    if (chrome.runtime.lastError || !response?.clusters?.length) return;
    window.postMessage(
      {
        type: 'LH_UNIVERSE_CONTEXT',
        importMode: response.importMode ?? 'event',
        clusters: response.clusters,
        interests: response.interests ?? [],
        searches: response.searches ?? [],
        bookmarks: response.bookmarks ?? [],
        domains: response.domains ?? [],
      },
      location.origin,
    );
  });
}

setTimeout(() => sendContext(false), 800);
document.addEventListener('LH_UNIVERSE_REQUEST', (event) => {
  setTimeout(() => sendContext(Boolean(event.detail?.includeHistoryImport)), 100);
});
