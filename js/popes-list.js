import { fetchPopesFromWikipedia, WIKI_LIST_URL } from "./popes-parser.js";

const CACHE_KEY = "popecount-popes-v5";
/** Same-tab reloads reuse this; cleared when the browser tab closes. */
const cacheStore = sessionStorage;

const $ = (sel) => document.querySelector(sel);

let allPopes = [];
let filtered = [];
/** @type {"asc" | "desc"} */
let numberOrder = "asc";

function loadCache() {
  try {
    const raw = cacheStore.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.popes?.length || !data.fetchedAt) return null;
    return data;
  } catch {
    return null;
  }
}

function saveCache(data) {
  try {
    cacheStore.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* quota or private mode */
  }
}

function setStatus(text) {
  const el = $("#list-status");
  if (el) el.textContent = text;
}

function setLoading(show) {
  const el = $("#list-loading");
  if (el) el.hidden = !show;
}

function normalizeQuery(q) {
  return q.trim().toLowerCase();
}

/** @param {string} text @param {string} query @param {{ exact: number, starts: number, word: number, includes: number }} weights */
function scoreField(text, query, weights) {
  if (!text || !query) return 0;
  const t = text.toLowerCase();
  if (t === query) return weights.exact;
  if (t.startsWith(query)) return weights.starts;
  const wordRe = new RegExp(`\\b${escapeRegExp(query)}\\b`, "i");
  if (wordRe.test(t)) return weights.word;
  if (t.includes(query)) return weights.includes;
  return 0;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Higher score = more relevant. Used only when searching.
 */
function relevanceScore(pope, query) {
  if (!query) return 0;

  let score = 0;

  if (/^\d+$/.test(query)) {
    const numStr = String(pope.number);
    if (numStr === query) return 10000;
    if (numStr.startsWith(query)) score = Math.max(score, 8500);
  }

  const name = pope.displayName || "";
  const birth = pope.birthName || "";
  const raw = pope.rawName || "";

  score = Math.max(
    score,
    scoreField(name, query, { exact: 5000, starts: 3200, word: 2400, includes: 900 })
  );
  score = Math.max(
    score,
    scoreField(birth, query, { exact: 3600, starts: 2300, word: 1700, includes: 550 })
  );
  score = Math.max(
    score,
    scoreField(raw, query, { exact: 3000, starts: 1900, word: 1300, includes: 450 })
  );

  const words = query.split(/\s+/).filter((w) => w.length > 0);
  if (words.length > 1) {
    const nameLower = name.toLowerCase();
    const birthLower = birth.toLowerCase();
    if (words.every((w) => nameLower.includes(w))) score += 2800;
    else if (words.every((w) => birthLower.includes(w))) score += 1800;
  }

  score = Math.max(
    score,
    scoreField(pope.pontificate || "", query, {
      exact: 1200,
      starts: 900,
      word: 700,
      includes: 250,
    })
  );

  const bio = pope.notes || pope.bio || "";
  score = Math.max(
    score,
    scoreField(bio, query, { exact: 400, starts: 300, word: 200, includes: 80 })
  );

  return score;
}

function compareByNumber(a, b) {
  return numberOrder === "asc" ? a.number - b.number : b.number - a.number;
}

function sortByNumber(popes) {
  return [...popes].sort(compareByNumber);
}

/** When `?n=` is present, show exactly that pope (random / quiz links). */
function getPinnedNumberFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("n") ?? params.get("number");
  if (raw == null || raw === "") return null;
  const num = parseInt(raw, 10);
  if (!Number.isFinite(num) || num < 1 || num > 400) return null;
  return num;
}

function stripPinnedParamsFromUrl() {
  const u = new URL(window.location.href);
  if (
    !u.searchParams.has("n") &&
    !u.searchParams.has("number") &&
    !u.searchParams.has("q") &&
    !u.searchParams.has("search")
  ) {
    return;
  }
  u.searchParams.delete("n");
  u.searchParams.delete("number");
  u.searchParams.delete("q");
  u.searchParams.delete("search");
  const next = u.pathname + u.search + u.hash;
  history.replaceState(null, "", next);
}

function searchPopes(query) {
  const pinned = getPinnedNumberFromUrl();
  if (pinned !== null) {
    const p = allPopes.find((x) => x.number === pinned);
    return p ? [p] : [];
  }

  if (!query) {
    return sortByNumber(allPopes);
  }

  return allPopes
    .map((pope) => ({ pope, score: relevanceScore(pope, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || compareByNumber(a.pope, b.pope))
    .map(({ pope }) => pope);
}

function updateSortButton() {
  const btn = $("#sort-order-btn");
  if (!btn) return;

  const query = normalizeQuery($("#search-input")?.value || "");
  const searching = Boolean(query) || getPinnedNumberFromUrl() !== null;

  if (numberOrder === "asc") {
    btn.textContent = "↑ #1 first";
    btn.setAttribute("aria-label", "Sort by pope number, oldest first");
  } else {
    btn.textContent = "↓ #267 first";
    btn.setAttribute("aria-label", "Sort by pope number, newest first");
  }

  btn.disabled = searching;
  btn.title = searching
    ? getPinnedNumberFromUrl() !== null
      ? "Clear search or edit search to sort by number"
      : "Clear search to sort by pope number"
    : "Toggle oldest / newest first";
}

function renderCard(pope) {
  const card = document.createElement("article");
  card.className = "pope-card";
  card.id = `pope-${pope.number}`;
  card.setAttribute("role", "listitem");

  const imgWrap = document.createElement("div");
  imgWrap.className = "pope-card__media";

  if (pope.image) {
    const img = document.createElement("img");
    img.className = "pope-card__img";
    img.src = pope.image;
    img.alt = `Portrait or emblem of ${pope.displayName}`;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => {
      img.remove();
      imgWrap.appendChild(placeholderEl(pope));
    });
    imgWrap.appendChild(img);
  } else {
    imgWrap.appendChild(placeholderEl(pope));
  }

  const body = document.createElement("div");
  body.className = "pope-card__body";

  const num = document.createElement("p");
  num.className = "pope-card__number";
  num.textContent = `#${pope.number}`;

  const title = document.createElement("h2");
  title.className = "pope-card__name";
  title.textContent = pope.displayName;

  const reign = document.createElement("p");
  reign.className = "pope-card__reign";
  reign.textContent = pope.pontificate || "Dates unavailable";

  if (pope.birthName) {
    const born = document.createElement("p");
    born.className = "pope-card__birth";
    born.textContent = pope.birthName;
    body.append(born);
  }

  const bio = document.createElement("p");
  bio.className = "pope-card__bio";
  bio.textContent = truncate(pope.bio, 280);

  const source = document.createElement("p");
  source.className = "pope-card__source";
  source.innerHTML = `Source: <a href="${escapeAttr(pope.wiki || WIKI_LIST_URL)}" target="_blank" rel="noopener noreferrer">Wikipedia</a>`;

  body.append(num, title, reign, bio, source);

  card.append(imgWrap, body);
  return card;
}

function placeholderEl(pope) {
  const div = document.createElement("div");
  div.className = "pope-card__placeholder";
  div.setAttribute("aria-hidden", "true");
  div.innerHTML = `<span class="pope-card__placeholder-num">${pope.number}</span><span>☧</span>`;
  return div;
}

function truncate(text, max) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function escapeAttr(url) {
  return url.replace(/"/g, "&quot;");
}

function renderList() {
  const grid = $("#pope-grid");
  const empty = $("#list-empty");
  const page = document.querySelector(".popes-page");
  if (!grid) return;

  grid.innerHTML = "";
  filtered.forEach((p) => grid.appendChild(renderCard(p)));

  const solo = filtered.length === 1;
  grid.classList.toggle("pope-grid--solo", solo);
  page?.classList.toggle("popes-page--solo", solo);

  if (empty) empty.hidden = filtered.length > 0;
  const query = normalizeQuery($("#search-input")?.value || "");
  const pinned = getPinnedNumberFromUrl();

  if (pinned !== null) {
    if (filtered.length === 1) {
      setStatus(`Showing pope #${pinned} · type in search to browse all`);
    } else {
      setStatus(`No pope #${pinned} in this list · try Clear`);
    }
  } else if (!query) {
    setStatus(`${allPopes.length} popes · #${numberOrder === "asc" ? "1 → 267" : "267 → 1"}`);
  } else {
    setStatus(`${filtered.length} of ${allPopes.length} popes · sorted by relevance`);
  }
  updateSortButton();
}

function applySearch() {
  const query = normalizeQuery($("#search-input")?.value || "");
  filtered = searchPopes(query);
  renderList();
  scrollToSingleMatch();
}

function toggleNumberOrder() {
  numberOrder = numberOrder === "asc" ? "desc" : "asc";
  applySearch();
}

function setRandomButtonEnabled(enabled) {
  const btn = $("#random-pope-btn");
  if (!btn) return;
  btn.disabled = !enabled;
  btn.setAttribute("aria-disabled", enabled ? "false" : "true");
}

function goToRandomPope() {
  if (allPopes.length === 0) return;
  const pope = allPopes[Math.floor(Math.random() * allPopes.length)];
  const url = new URL(window.location.href);
  url.searchParams.set("n", String(pope.number));
  url.searchParams.set("q", pope.displayName || String(pope.number));
  history.replaceState(null, "", url.pathname + url.search + url.hash);
  applyQueryFromUrl();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyQueryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const input = $("#search-input");
  const n = params.get("n") ?? params.get("number");
  const q = params.get("q") ?? params.get("search");

  if (n && input) {
    const num = parseInt(n, 10);
    const pope = allPopes.find((p) => p.number === num);
    input.value = pope ? pope.displayName : n;
  } else if (q && input) {
    input.value = q;
  }

  applySearch();
}

function scrollToSingleMatch() {
  if (filtered.length !== 1) return;
  requestAnimationFrame(() => {
    document
      .getElementById(`pope-${filtered[0].number}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function updateSourceFooter(data) {
  const el = $("#wiki-source");
  if (!el) return;
  const when = new Date(data.fetchedAt).toLocaleString();
  const portraits = Array.isArray(data.popes)
    ? data.popes.filter((p) => Boolean(p.image)).length
    : null;
  el.innerHTML = `
    <p><strong>Source:</strong> <a href="${WIKI_LIST_URL}" target="_blank" rel="noopener noreferrer">Wikipedia — List of popes</a> (CC BY-SA 4.0). Portraits are direct <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> thumbnail URLs from the list table.</p>
    <p class="source-meta">
      Last loaded: ${when}.
      ${portraits !== null ? `${portraits} portrait URLs.` : ""}
      <button type="button" class="link-btn" id="refresh-wiki">Refresh from Wikipedia</button>
    </p>
  `;
  $("#refresh-wiki")?.addEventListener("click", () => loadPopes(true));
}

async function loadPopes(forceRefresh = false) {
  setLoading(true);
  $("#list-error")?.setAttribute("hidden", "");
  setRandomButtonEnabled(false);

  try {
    if (!forceRefresh) {
      const cached = loadCache();
      if (cached) {
        allPopes = cached.popes;
        filtered = [...allPopes];
        updateSourceFooter(cached);
        applyQueryFromUrl();
        setRandomButtonEnabled(true);
        setLoading(false);
        return;
      }
    }

    const data = await fetchPopesFromWikipedia({
      onStatus: setStatus,
    });
    allPopes = data.popes;
    filtered = [...allPopes];
    saveCache(data);
    updateSourceFooter(data);
    applyQueryFromUrl();
    setRandomButtonEnabled(true);
  } catch {
    const err = $("#list-error");
    if (err) err.hidden = false;
    setStatus("Could not load from Wikipedia.");
    setRandomButtonEnabled(false);
  } finally {
    setLoading(false);
  }
}

function init() {
  $("#search-input")?.addEventListener("input", () => {
    stripPinnedParamsFromUrl();
    applySearch();
  });

  $("#search-clear")?.addEventListener("click", () => {
    stripPinnedParamsFromUrl();
    const input = $("#search-input");
    if (input) {
      input.value = "";
      input.focus();
    }
    applySearch();
  });

  $("#sort-order-btn")?.addEventListener("click", toggleNumberOrder);

  $("#random-pope-btn")?.addEventListener("click", goToRandomPope);

  loadPopes();
}

init();
