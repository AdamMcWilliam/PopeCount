/**
 * Wikipedia pageimages API — main article thumbnail per title.
 * @see https://www.mediawiki.org/wiki/API:Query#pageimages
 */
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const BATCH_SIZE = 45;
const DEFAULT_THUMB = 400;

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

function upgradeThumbUrl(src, size = DEFAULT_THUMB) {
  if (!src) return src;
  return src.replace(/\/(\d+)px-/, `/${size}px-`);
}

async function queryThumbnails(titles, thumbSize) {
  const url = new URL(WIKI_API);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  url.searchParams.set("prop", "pageimages");
  url.searchParams.set("piprop", "thumbnail");
  url.searchParams.set("pithumbsize", String(thumbSize));
  url.searchParams.set("titles", titles.join("|"));

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Wikipedia images HTTP ${response.status}`);

  const data = await response.json();
  const pages = data?.query?.pages ?? {};
  const byTitle = new Map();

  for (const page of Object.values(pages)) {
    if (page.missing !== undefined || !page.thumbnail?.source) continue;
    byTitle.set(page.title, upgradeThumbUrl(page.thumbnail.source, thumbSize));
  }

  return byTitle;
}

/**
 * @param {string[]} titles - Wikipedia page titles (spaces or underscores)
 * @param {number} [thumbSize]
 * @returns {Promise<Map<string, string>>} title → image URL
 */
export async function fetchMainImagesForTitles(titles, thumbSize = DEFAULT_THUMB) {
  const unique = [...new Set(titles.filter(Boolean).map((t) => t.replace(/_/g, " ")))];
  const merged = new Map();

  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    const chunk = await queryThumbnails(batch, thumbSize);
    chunk.forEach((src, title) => merged.set(title, src));
  }

  return merged;
}

/** @param {string} title */
export async function fetchMainImageForTitle(title, thumbSize = DEFAULT_THUMB) {
  const map = await fetchMainImagesForTitles([title], thumbSize);
  const normalized = title.replace(/_/g, " ");
  return map.get(normalized) ?? null;
}

/**
 * Sets each pope's `image` from the main image on their Wikipedia article.
 * @param {Array<{ number: number, wiki?: string, image?: string }>} popes
 */
export async function enrichPopesWithWikiImages(popes, thumbSize = DEFAULT_THUMB) {
  const titleForPope = new Map();

  for (const pope of popes) {
    const title = titleFromWikiUrl(pope.wiki);
    if (title) titleForPope.set(pope.number, title);
  }

  const images = await fetchMainImagesForTitles([...titleForPope.values()], thumbSize);

  for (const pope of popes) {
    const title = titleForPope.get(pope.number);
    if (!title) continue;
    const src = images.get(title);
    if (src) {
      pope.image = src;
      pope.imageFrom = "wikipedia-main";
    }
  }

  return popes;
}
