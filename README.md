# Orderly

A free church bulletin maker for print and digital. Booklet, letter page, tri-fold and slides. Runs entirely in the browser; no account, nothing is uploaded.

- Open `index.html` to use it (or host it anywhere static, e.g. GitHub Pages).
- Edit the files in `src/`, then run `python3 build.py` to regenerate `index.html`.
- `vendor/bible.js` holds the Berean Standard Bible text (public domain); `vendor/qrcode.js` is qrcode-generator (MIT).
- `dist/orderly-artifact.html` is the variant without the HTML wrapper, used for publishing as a Claude Artifact (git-ignored).
