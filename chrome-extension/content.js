// LH Universe - content script.
// Runs only on /lab/universe and posts extension context into the page.

function sendContext() {
  chrome.runtime.sendMessage({ type: 'GET_CONTEXT' }, (response) => {
    if (chrome.runtime.lastError || !response?.clusters?.length) return;
    window.postMessage(
      { type: 'LH_UNIVERSE_CONTEXT', clusters: response.clusters },
      location.origin,
    );
  });
}

setTimeout(sendContext, 800);
document.addEventListener('LH_UNIVERSE_REQUEST', () => setTimeout(sendContext, 100));
