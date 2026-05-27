/**
 * Fetches the latest papal number from Wikipedia's List of popes page.
 */
const WIKI_API =
  "https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=List_of_popes";

const STEPHEN_II_URL = "https://en.wikipedia.org/wiki/Pope-elect_Stephen";
const ODOMETER_DELAY_MS = 1000;
const FOOTNOTE_DELAY_MS = 3400;

function normalizeCellText(text) {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Scans all wikitables for pontiff numbers in the first column;
 * returns the highest valid index (handles the compact 21st-century table).
 */
function extractPopeCount(doc) {
  const tables = doc.querySelectorAll("table.wikitable");
  let best = null;

  for (const table of tables) {
    const rows = table.querySelectorAll("tr");

    for (const row of rows) {
      const cell = row.cells?.[0];
      if (!cell) continue;

      const text = normalizeCellText(cell.textContent);
      if (text === "—" || text === "" || /[a-z]/i.test(text)) continue;

      const value = parseInt(text, 10);
      if (Number.isFinite(value) && value >= 1 && value <= 400) {
        if (best === null || value > best) {
          best = value;
        }
      }
    }
  }

  return best;
}

function showFootnote(count) {
  const el = document.getElementById("truePopeCount");
  if (!el) return;

  const withStephen = count + 1;
  el.innerHTML =
    `Or ${withStephen} if you count <a href="${STEPHEN_II_URL}">Pope Stephen II</a>`;
}

function showError(message) {
  const odometer = document.getElementById("odometer");
  const footnote = document.getElementById("truePopeCount");

  if (odometer) {
    odometer.textContent = "?";
    odometer.setAttribute("aria-label", "Pope count unavailable");
    odometer.setAttribute("aria-busy", "false");
  }
  if (footnote) {
    footnote.innerHTML = `${message} <button type="button" class="retry-btn" id="retryWiki">Try again</button>`;
    document.getElementById("retryWiki")?.addEventListener("click", () => {
      footnote.textContent = "";
      odometer?.setAttribute("aria-busy", "true");
      loadPopeCount();
    });
  }
}

async function loadPopeCount() {
  const odometer = document.getElementById("odometer");
  if (!odometer) return;

  try {
    const response = await fetch(WIKI_API);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const html = data?.parse?.text?.["*"];
    if (!html) throw new Error("Missing parse payload");

    const doc = new DOMParser().parseFromString(html, "text/html");
    const count = extractPopeCount(doc);
    if (count === null) throw new Error("Could not parse pope count");

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const reveal = () => {
      odometer.innerHTML = String(count);
      odometer.setAttribute("aria-label", `${count} popes listed on Wikipedia`);
      odometer.setAttribute("aria-busy", "false");
    };

    if (reducedMotion) {
      reveal();
      showFootnote(count);
    } else {
      setTimeout(reveal, ODOMETER_DELAY_MS);
      setTimeout(() => showFootnote(count), FOOTNOTE_DELAY_MS);
    }
  } catch (err) {
    const detail =
      err instanceof TypeError && String(err.message).includes("fetch")
        ? "Network blocked or offline."
        : "Could not load the count from Wikipedia.";
    showError(detail);
  }
}

loadPopeCount();
