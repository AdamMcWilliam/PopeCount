const url =
  "https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=List_of_popes";
const res = await fetch(url);
const html = (await res.json()).parse.text["*"];

function strip(s) {
  return s
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#91;/g, "[")
    .replace(/&#93;/g, "]")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function imgFromCell(cellHtml) {
  const m = cellHtml.match(/<img[^>]+src="([^"]+)"/i);
  if (!m) return null;
  let src = m[1].replace(/^\/\//, "https://");
  // prefer larger portrait - upgrade thumb to 220px if thumb path
  src = src.replace(/\/(\d+)px-/, "/220px-");
  return src;
}

function wikiFromCell(cellHtml) {
  const m = cellHtml.match(/<a[^>]+href="(\/wiki\/(?!File:|Category:)[^"#]+)"/i);
  return m ? "https://en.wikipedia.org" + decodeEntities(m[1]) : null;
}

function mapColumns(headerCells) {
  const headers = headerCells.map((c) => strip(c).toLowerCase());
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

const tables = [...html.matchAll(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>[\s\S]*?<\/table>/gi)].map(
  (m) => m[0]
);

const byNumber = new Map();

for (const table of tables) {
  const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
  if (rows.length < 2) continue;

  const headerCells = [...rows[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => c[1]);
  const col = mapColumns(headerCells);
  if (col.number < 0 || col.name < 0) continue;

  for (let r = 1; r < rows.length; r++) {
    const cells = [...rows[r].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => c[1]);
    if (cells.length <= col.name) continue;

    const numText = strip(cells[col.number] ?? cells[0]);
    const num = parseInt(numText, 10);
    if (!Number.isFinite(num) || num < 1 || num > 400) continue;

    const nameCell = cells[col.name];
    const portraitCell = col.portrait >= 0 ? cells[col.portrait] : "";
    const entry = {
      number: num,
      pontificate: col.pontificate >= 0 ? strip(cells[col.pontificate]).slice(0, 140) : "",
      image: imgFromCell(portraitCell) || imgFromCell(nameCell),
      name: strip(nameCell).slice(0, 100),
      birthName: col.birthName >= 0 ? strip(cells[col.birthName]).slice(0, 120) : "",
      notes: col.notes >= 0 ? strip(cells[col.notes]).slice(0, 320) : "",
      wiki: wikiFromCell(nameCell) || wikiFromCell(rows[r]),
    };

    const prev = byNumber.get(num);
    const score = (e) =>
      (e.image ? 4 : 0) + (e.wiki && !e.wiki.includes("File:") ? 2 : 0) + (e.notes ? 1 : 0) + e.name.length / 100;

    if (!prev || score(entry) > score(prev)) {
      byNumber.set(num, entry);
    }
  }
}

const list = [...byNumber.values()].sort((a, b) => a.number - b.number);
console.log("count", list.length);
console.log("first", list[0]);
console.log("mid", list[130]);
console.log("last", list[list.length - 1]);
console.log("images", list.filter((p) => p.image).length);
console.log("wiki ok", list.filter((p) => p.wiki && !p.wiki.includes("File:")).length);
