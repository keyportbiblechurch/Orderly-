<p align="center"><img src="assets/orderly-logo-horizontal.png" alt="Orderly" width="520"></p>

# Orderly

A free church bulletin maker for print and digital. Pick a design, fill in the week, and download a PDF.

- **Formats:** 4-page booklet (prints on one folded sheet), letter page, tri-fold, and digital slides.
- **Ten designs**, seasonal packs, generated cover art, line illustrations, photo treatments, Google or custom fonts.
- **Built for weekly use:** new week in one click, past events drop off, paste a list of events, sermon always on its own page, no section is ever split across pages.
- **Languages:** printed headings and dates in English, Spanish, French, Portuguese and German (add more in `src/i18n.js`).
- **Photos:** a cover photo can also run as a banner on the inside pages. A built-in Help page explains printing and weekly use.
- **Private:** runs entirely in your browser. Nothing is uploaded and there are no accounts. Your bulletins are saved on your own device; use the backup button to move them to another computer.

## Use it
Open the live site (see the repository's *About* link) or download `index.html` and open it in a browser.

## Develop
```
python3 build.py     # rebuilds index.html from src/ and vendor/
```
Edit the files in `src/` (`i18n.js`, `engine.js`, `art.js`, `fonts.js`, `designs.js`, `ui.js`, `app.css`), rebuild, and open `index.html`.

## Notes
- Bible text is the public-domain Berean Standard Bible. Hymn and song lyrics, and photos, are not included; churches are responsible for licensing what they print.
- See `THIRD_PARTY.md` for attributions.

## License
MIT. Free to use, share and adapt. Made as a free ministry tool.
