/**
 * Open external http(s) links in a new tab; leave same-site links unchanged.
 */
(function initExternalLinks() {
  const origin = window.location.origin;

  function isExternal(href) {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return false;
    }
    if (href.startsWith("/") && !href.startsWith("//")) {
      return false;
    }
    try {
      const url = new URL(href, window.location.href);
      return url.origin !== origin;
    } catch {
      return false;
    }
  }

  function apply(el) {
    if (!isExternal(el.getAttribute("href"))) return;
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  }

  document.querySelectorAll("a[href]").forEach(apply);

  new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches?.("a[href]")) apply(node);
        node.querySelectorAll?.("a[href]").forEach(apply);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
