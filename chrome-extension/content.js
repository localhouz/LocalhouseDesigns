// LH Universe — content script
// Runs on localhousedesigns.com/lab/universe.
// Requests browser context from background, posts it to the page.

function sendContext() {
  chrome.runtime.sendMessage({ type: 'GET_CONTEXT' }, (response) => {
    if (chrome.runtime.lastError || !response?.clusters?.length) return;
    window.postMessage(
      { type: 'LH_UNIVERSE_CONTEXT', clusters: response.clusters },
      location.origin,
    );
  });
}

// Fresh page load: wait a beat for Angular to hydrate before posting
setTimeout(sendContext, 800);

// SPA navigation: component dispatches this event when it mounts
document.addEventListener('LH_UNIVERSE_REQUEST', () => setTimeout(sendContext, 100));
