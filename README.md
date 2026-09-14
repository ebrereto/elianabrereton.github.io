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

## Fishing

`fishing.html` is an original static fishing game. Its source page is
`_source/pages/fishing.html`, styles are in `css/fishing.css`, and JavaScript modules
are in `js/fishing/`. Original pixel sprites and the catch catalogue live in
`assets/fishing/`. No external services or game engine are required.

Use space, click, or tap to cast, hook a bite, and stop the reeling marker in the
striped target. Instructions open only through the how-to-play button. Sound effects
start muted and only play after interaction. Reduced-motion preferences stop ambient
animation. Switching screens pauses fishing; returning from a hidden browser tab
requires an explicit resume.

The localStorage key `eliana.fishing.v1` stores the collection, tackle, best score,
sound preference, and rare-catch bonus counter. Saves are validated; unknown future
versions are not overwritten. Resetting progress requires confirmation. Session
score starts fresh on reload. Saves belong to the browser and origin; localhost
preview progress does not transfer automatically to the live domain.

Run the dependency-free game checks with Node 22 or newer:

```sh
node --experimental-default-type=module scripts/test-fishing.mjs
```

These cover state transitions, timing boundaries, probability normalization, bait
effects, unlocks, persistence, corrupted saves, and drawing commands. Visual browser
checks are separate: verify desktop and mobile layouts, touch and keyboard controls,
catch reveals, aquarium dialogs, audio, and saved progress after reloading.
