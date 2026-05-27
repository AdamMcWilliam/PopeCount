import { QUIZ_META, QUESTIONS, RESULTS } from "./quiz-data.js";
import { fetchMainImageForTitle } from "../wiki-images.js";

const $ = (sel) => document.querySelector(sel);

const screens = {
  intro: $("#screen-intro"),
  quiz: $("#screen-quiz"),
  loading: $("#screen-loading"),
  result: $("#screen-result"),
};

let index = 0;
const answers = [];

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    if (el) el.hidden = key !== name;
  });
}

function updateProgress() {
  const fill = $("#progress-fill");
  const label = $("#progress-label");
  const pct = Math.round((index / QUESTIONS.length) * 100);
  if (fill) fill.style.width = `${pct}%`;
  if (label) {
    label.textContent = `Question ${Math.min(index + 1, QUESTIONS.length)} of ${QUESTIONS.length}`;
  }
}

function renderQuestion() {
  const q = QUESTIONS[index];
  const title = $("#question-text");
  const opts = $("#options");

  if (title) title.textContent = q.text;
  if (!opts) return;

  opts.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-option";
    btn.textContent = opt.label;
    btn.addEventListener("click", () => selectOption(i));
    opts.appendChild(btn);
  });

  updateProgress();
}

function selectOption(optionIndex) {
  answers[index] = optionIndex;
  index += 1;

  if (index < QUESTIONS.length) {
    renderQuestion();
    return;
  }

  showScreen("loading");
  setTimeout(showResult, 1400);
}

function computeScores() {
  const totals = Object.fromEntries(Object.keys(RESULTS).map((k) => [k, 0]));

  QUESTIONS.forEach((q, qi) => {
    const opt = q.options[answers[qi]];
    if (!opt?.scores) return;
    for (const [pope, pts] of Object.entries(opt.scores)) {
      totals[pope] = (totals[pope] || 0) + pts;
    }
  });

  return totals;
}

function pickWinner(totals) {
  let max = -1;
  let winners = [];

  for (const [id, score] of Object.entries(totals)) {
    if (score > max) {
      max = score;
      winners = [id];
    } else if (score === max) {
      winners.push(id);
    }
  }

  const id = winners[Math.floor(Math.random() * winners.length)];
  return { id, score: max };
}

export function buildDirectoryUrl(result) {
  const base = new URL("../popes/", window.location.href);
  if (result.popeNumber) {
    base.searchParams.set("n", String(result.popeNumber));
  }
  if (result.directoryQuery) {
    base.searchParams.set("q", result.directoryQuery);
  }
  return base.pathname + base.search;
}

async function loadResultImage(result) {
  const wrap = $("#result-image-wrap");
  const img = $("#result-image");
  if (!wrap || !img || !result.wikiTitle) return;

  wrap.hidden = true;
  img.removeAttribute("src");

  try {
    const src = await fetchMainImageForTitle(result.wikiTitle, 400);
    if (src) {
      img.src = src;
      img.alt = `Main image: ${result.name}`;
      wrap.hidden = false;
    }
  } catch {
    /* no image */
  }
}

function showResult() {
  const { id, score } = pickWinner(computeScores());
  const result = RESULTS[id];
  const maxPossible = QUESTIONS.length * 3;
  const pct = Math.min(99, Math.round((score / maxPossible) * 100) + 62);

  $("#result-name").textContent = result.name;
  $("#result-tagline").textContent = result.tagline;
  $("#result-blurb").textContent = result.blurb;
  $("#result-percent").textContent = `${pct}% match`;

  const shareBtn = $("#share-btn");
  if (shareBtn) {
    shareBtn.dataset.share = result.share;
  }

  const dirLink = $("#directory-link");
  if (dirLink) {
    dirLink.href = buildDirectoryUrl(result);
  }

  const resultUrl = new URL(window.location.href);
  resultUrl.searchParams.set("pope", result.id);
  history.replaceState(null, "", resultUrl);

  showScreen("result");
  loadResultImage(result);
}

function resetQuiz() {
  index = 0;
  answers.length = 0;
  const clean = new URL(window.location.href);
  clean.searchParams.delete("pope");
  history.replaceState(null, "", clean.pathname + clean.search);

  const wrap = $("#result-image-wrap");
  if (wrap) wrap.hidden = true;

  showScreen("quiz");
  renderQuestion();
}

function showResultFromParam(popeId) {
  const result = RESULTS[popeId];
  if (!result) return false;

  $("#result-name").textContent = result.name;
  $("#result-tagline").textContent = result.tagline;
  $("#result-blurb").textContent = result.blurb;
  $("#result-percent").textContent = "Shared result";

  const shareBtn = $("#share-btn");
  if (shareBtn) shareBtn.dataset.share = result.share;

  const dirLink = $("#directory-link");
  if (dirLink) dirLink.href = buildDirectoryUrl(result);

  showScreen("result");
  loadResultImage(result);
  return true;
}

function init() {
  const sharedPope = new URLSearchParams(window.location.search).get("pope");
  if (sharedPope && showResultFromParam(sharedPope)) {
    /* landed on shared quiz result */
  }

  $("#start-btn")?.addEventListener("click", () => {
    showScreen("quiz");
    renderQuestion();
  });

  $("#retake-btn")?.addEventListener("click", resetQuiz);

  $("#share-btn")?.addEventListener("click", async () => {
    const text = $("#share-btn")?.dataset.share || "I took the PopeCount quiz!";
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Which Pope Are You?", text, url });
        return;
      } catch {
        /* cancelled */
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      $("#share-btn").textContent = "Copied!";
      setTimeout(() => {
        $("#share-btn").textContent = "Share your pope";
      }, 2000);
    } catch {
      window.prompt("Copy your result:", `${text}\n${url}`);
    }
  });

  if (!sharedPope || !RESULTS[sharedPope]) {
    showScreen("intro");
  }
}

init();
