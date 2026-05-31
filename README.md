# PopeCount

[popecount.com](http://www.popecount.com)

Inspired by the [Begin Bot](https://www.patreon.com/beginbot) podcast.

The live count comes from the latest entry in Wikipedia’s [List of popes](https://en.wikipedia.org/wiki/List_of_popes) (parsed from the chronological tables).

## Run locally

Static site — open `index.html` in a browser, or serve the folder:

```bash
npx --yes serve .
```

## GitHub Pages

Deploy the repo root (or `/docs` if you prefer) as a static site. `CNAME` points custom domain `popecount.com`. No build step required.

## Structure

- `index.html` — main counter + podcast player
- `js/pope-count.js` — Wikipedia fetch and odometer
- `js/podcast.js` — audio controls and autoplay hint
- `js/external-links.js` — opens off-site links in a new tab
- `games/which-pope.html` — **Which Pope Are You?** quiz (also `/which-pope/`)
- `popes/` — searchable directory (Wikipedia text + Commons portrait URLs from list table)
- `AI/` — demo variant (“So far.....”)
