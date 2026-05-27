const WIKI_API =
  "https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=List_of_popes";

const res = await fetch(WIKI_API);
const data = await res.json();
const html = data?.parse?.text?.["*"];
console.log("status", res.status, "length", html?.length);

const tableChunks = html.split(/<table[^>]*class="[^"]*wikitable[^"]*"/i);
console.log("wikitable chunks", tableChunks.length - 1);

// table index 20 (original)
const chunk20 = tableChunks[21];
if (chunk20) {
  const rows = [...chunk20.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const last = rows[rows.length - 1];
  const firstTd = last?.[1]?.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/i);
  const text = firstTd?.[1]?.replace(/<[^>]+>/g, "").trim();
  console.log("table[20] last cell raw:", JSON.stringify(text));
}

// find all first-column numbers in large tables via simple scan
let best = 0;
for (let i = 1; i < tableChunks.length; i++) {
  const chunk = tableChunks[i];
  const rowCount = (chunk.match(/<tr/gi) || []).length;
  if (rowCount < 40) continue;
  const rows = [...chunk.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  for (let r = rows.length - 1; r >= 0; r--) {
    const firstTd = rows[r][1].match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/i);
    const text = firstTd?.[1]?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!text || text === "—") continue;
    const n = parseInt(text, 10);
    if (n >= 1 && n <= 400) {
      if (n > best) best = n;
      break;
    }
  }
}
console.log("regex best", best);
