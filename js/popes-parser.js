/**
 * Parses pope rows from Wikipedia "List of popes" parse HTML.
 * @see https://en.wikipedia.org/wiki/List_of_popes
 */
import { imageFromCellHtml, fillMissingPortraitUrls } from "./wiki-images.js";

export const WIKI_LIST_URL = "https://en.wikipedia.org/wiki/List_of_popes";
export const WIKI_API =
  "https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=List_of_popes";

export const PORTRAIT_WIDTH = 330;

export function stripHtml(text) {
  return text
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#91;/g, "[")
    .replace(/&#93;/g, "]")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatDisplayName(raw) {
  if (!raw) return "Unknown";
  const idx = raw.search(/[A-Z]{4,}/);
  if (idx > 2) return raw.slice(0, idx).trim();
  return raw;
}

function wikiFromCell(cellHtml) {
  const m = cellHtml.match(/<a[^>]+href="(\/wiki\/(?!File:|Category:)[^"#]+)"/i);
  return m ? `https://en.wikipedia.org${m[1]}` : null;
}

function mapColumns(headerCells) {
  const headers = headerCells.map((c) => stripHtml(c).toLowerCase());
  const idx = (patterns) => {
    const i = headers.findIndex((h) => patterns.some((p) => h.includes(p)));
    return i >= 0 ? i : -1;
  };
  return {
    number: idx(["pontiff", "number", "#"]),
    pontificate: idx(["pontificate", "dates", "reign"]),
    portrait: idx(["portrait", "image"]),
    name: idx(["name: english", "regnal", "name"]),
    birthName: idx(["personal name", "birth"]),
    notes: idx(["notes", "remark"]),
  };
}

function entryScore(entry) {
  return (
    (entry.image ? 4 : 0) +
    (entry.wiki ? 2 : 0) +
    (entry.notes ? 1 : 0) +
    entry.displayName.length / 80
  );
}

function buildBio(entry) {
  if (entry.notes) return entry.notes;
  const parts = [];
  if (entry.birthName) parts.push(entry.birthName);
  if (entry.pontificate) parts.push(`Pontificate: ${entry.pontificate}`);
  return parts.join(" · ") || "See Wikipedia for details.";
}

function imageFromRow(cells, col) {
  const portraitCell = col.portrait >= 0 ? cells[col.portrait] : "";
  const nameCell = cells[col.name] ?? "";

  return (
    imageFromCellHtml(portraitCell) ||
    imageFromCellHtml(nameCell)
  );
}

/** @param {string} html - parse API HTML blob */
export function parsePopesFromHtml(html) {
  const tables = [
    ...html.matchAll(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>[\s\S]*?<\/table>/gi),
  ].map((m) => m[0]);

  const byNumber = new Map();

  for (const table of tables) {
    const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
    if (rows.length < 2) continue;

    const headerCells = [...rows[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
      (c) => c[1]
    );
    const col = mapColumns(headerCells);
    if (col.number < 0 || col.name < 0) continue;

    for (let r = 1; r < rows.length; r++) {
      const cells = [...rows[r].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
        (c) => c[1]
      );
      if (cells.length <= col.name) continue;

      const num = parseInt(stripHtml(cells[col.number] ?? cells[0]), 10);
      if (!Number.isFinite(num) || num < 1 || num > 400) continue;

      const nameCell = cells[col.name];
      const rawName = stripHtml(nameCell).slice(0, 120);

      const entry = {
        number: num,
        displayName: formatDisplayName(rawName),
        rawName,
        pontificate:
          col.pontificate >= 0 ? stripHtml(cells[col.pontificate]).slice(0, 160) : "",
        image: imageFromRow(cells, col),
        birthName: col.birthName >= 0 ? stripHtml(cells[col.birthName]).slice(0, 140) : "",
        notes: col.notes >= 0 ? stripHtml(cells[col.notes]).slice(0, 500) : "",
        wiki: wikiFromCell(nameCell),
      };

      entry.bio = buildBio(entry);

      const prev = byNumber.get(num);
      if (!prev || entryScore(entry) > entryScore(prev)) {
        byNumber.set(num, entry);
      }
    }
  }

  return [...byNumber.values()].sort((a, b) => a.number - b.number);
}

/**
 * @param {{ onStatus?: (msg: string) => void }} [options]
 */
export async function fetchPopesFromWikipedia(options = {}) {
  const response = await fetch(WIKI_API);
  if (!response.ok) throw new Error(`Wikipedia HTTP ${response.status}`);

  const data = await response.json();
  const html = data?.parse?.text?.["*"];
  if (!html) throw new Error("Missing Wikipedia parse data");

  options.onStatus?.("Loading pope list from Wikipedia…");
  const popes = parsePopesFromHtml(html);
  if (popes.length < 50) throw new Error("Could not parse enough popes");

  await fillMissingPortraitUrls(popes, { onStatus: options.onStatus });

  const withImages = popes.filter((p) => p.image).length;
  options.onStatus?.(`${popes.length} popes · ${withImages} portraits from Commons`);

  return {
    popes,
    fetchedAt: new Date().toISOString(),
    sourceUrl: WIKI_LIST_URL,
  };
}
