/**
 * Wikimedia Commons thumbnail URLs — direct links, no upscaling.
 * Upscaling thumb paths (e.g. 120px → 400px) often returns HTTP 400 from upload.wikimedia.org.
 */

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const COMMONS = "https://upload.wikimedia.org/wikipedia/commons";

/** Use Wikipedia's thumb URL as-is; only fix protocol. */
export function normalizeCommonsUrl(src) {
  if (!src) return null;
  return src.replace(/^\/\//, "https://");
}

function md5(str) {
  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function md5blk(s) {
    const md5blks = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] =
        s.charCodeAt(i) +
        (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) +
        (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }
  function md51(s) {
    let n = s.length;
    let state = [1732584193, -271733879, -1732584194, 271733878];
    let i;
    for (i = 64; i <= n; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    const tail = Array(16).fill(0);
    for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      tail.fill(0);
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }
  function md5cycle(x, k) {
    let [a, b, c, d] = x;
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }
  function add32(a, b) {
    return (a + b) & 0xffffffff;
  }
  function rhex(n) {
    const hex = "0123456789abcdef";
    let s = "";
    for (let j = 0; j < 4; j++) {
      s += hex.charAt((n >> (j * 8 + 4)) & 0x0f) + hex.charAt((n >> (j * 8)) & 0x0f);
    }
    return s;
  }
  function hex(x) {
    return x.map(rhex).join("");
  }
  return hex(md51(unescape(encodeURIComponent(str))));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function titleFromWikiUrl(url) {
  if (!url) return null;
  try {
    const segment = new URL(url).pathname.split("/wiki/")[1];
    if (!segment) return null;
    return decodeURIComponent(segment).replace(/_/g, " ");
  } catch {
    return null;
  }
}

/** Build Commons thumb from File: name (330px — safe size on Commons). */
export function commonsThumbUrl(filename, width = 330) {
  let name = filename.replace(/^File:/i, "").trim();
  try {
    name = decodeURIComponent(name.replace(/\+/g, " "));
  } catch {
    /* keep */
  }
  const hash = md5(name);
  const encoded = encodeURIComponent(name).replace(/%2F/g, "/");
  return `${COMMONS}/thumb/${hash[0]}/${hash.slice(0, 2)}/${encoded}/${width}px-${encoded}`;
}

/** Portrait cell → Commons URL (table img preferred, unchanged size). */
export function imageFromCellHtml(cellHtml) {
  if (!cellHtml) return null;

  const img = cellHtml.match(/<img[^>]+src="([^"]+)"/i);
  if (img) return normalizeCommonsUrl(img[1]);

  const file = cellHtml.match(/href="\/wiki\/File:([^"#]+)"/i);
  if (file) return commonsThumbUrl(file[1]);

  return null;
}

async function queryThumbnails(titles, attempt = 0) {
  const body = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    redirects: "1",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "330",
    titles: titles.join("|"),
  });

  const response = await fetch(WIKI_API, { method: "POST", body });

  if ((response.status === 429 || response.status === 503) && attempt < 4) {
    await sleep(800 * 2 ** attempt);
    return queryThumbnails(titles, attempt + 1);
  }
  if (!response.ok) return new Map();

  const data = await response.json();
  const byTitle = new Map();
  for (const page of Object.values(data?.query?.pages ?? {})) {
    if (page.missing !== undefined || !page.thumbnail?.source) continue;
    byTitle.set(page.title, normalizeCommonsUrl(page.thumbnail.source));
  }
  for (const { from, to } of data?.query?.normalized ?? []) {
    const src = byTitle.get(to);
    if (src) byTitle.set(from, src);
  }
  return byTitle;
}

/** Article main image for popes with no portrait in the list table (e.g. St Peter). */
export async function fillMissingPortraitUrls(popes, options = {}) {
  const need = popes.filter((p) => !p.image && p.wiki);
  if (need.length === 0) return popes;

  options.onStatus?.(`Loading ${need.length} article portraits…`);

  const titleForPope = new Map();
  for (const pope of need) {
    const title = titleFromWikiUrl(pope.wiki);
    if (title) titleForPope.set(pope.number, title);
  }

  const titles = [...new Set(titleForPope.values())];
  const images = new Map();

  for (let i = 0; i < titles.length; i += 10) {
    const batch = titles.slice(i, i + 10);
    const chunk = await queryThumbnails(batch);
    chunk.forEach((src, title) => images.set(title, src));
    options.onStatus?.(
      `Article portraits (${Math.min(i + batch.length, titles.length)}/${titles.length})…`
    );
    if (i + 10 < titles.length) await sleep(500);
  }

  for (const pope of need) {
    const title = titleForPope.get(pope.number);
    const src = title ? images.get(title) : null;
    if (src) pope.image = src;
  }

  return popes;
}

export async function fetchMainImageForTitle(title) {
  const map = await queryThumbnails([title.replace(/_/g, " ")]);
  return map.get(title.replace(/_/g, " ")) ?? null;
}

/** @deprecated use normalizeCommonsUrl */
export function resizeCommonsThumb(src) {
  return normalizeCommonsUrl(src);
}
