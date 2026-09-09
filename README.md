# Eliana Brereton

Personal website at https://eliana.brereton.me, hosted on GitHub Pages.
Plain HTML, CSS, and JavaScript with no framework or package installation.

## Editing and previewing

- Page content: `_source/pages/`
- Shared navigation and footer: `_source/includes/`
- Metadata: `_source/template.html`
- Styles: `css/site.css`
- Mobile menu and optional motion: `js/site.js`

After editing templates, run `python3 scripts/build.py` and `python3 scripts/check.py`.
Commit both source and generated HTML. GitHub Pages serves the generated files directly.
To preview, run `python3 -m http.server 8765 --bind 127.0.0.1` from this directory.

## Assets and preservation

Keep `CNAME` and `.nojekyll` intact. Original PDFs, images, and legacy assets retain their
paths. Old page URLs redirect to the relevant redesigned sections. Original content is
recoverable from Git history. The pre-redesign version is also retained on the
`backup/pre-redesign-2026-09-09` branch.

The decorative pine is `assets/blue-pine-lines.png`. Inter is self-hosted with its
SIL Open Font License in `assets/INTER-LICENSE.txt`. Motion respects reduced-motion
preferences. The writing section is deferred until there are posts to publish.

## Publishing

Prepare changes on a separate branch, run the link checks, and review phone and desktop
layouts before merging into `main`. GitHub Pages publishes the repository root.
