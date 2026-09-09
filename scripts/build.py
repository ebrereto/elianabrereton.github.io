"""Assemble shared HTML partials; output remains buildless GitHub Pages HTML.

Run python3 scripts/build.py after editing _source. No third-party packages.
"""
from pathlib import Path
from html import escape
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / '_source'
PAGES = {
    'index': ('Eliana Brereton | Recruiting, Technology & AI Ethics', 'Recruiter at PostHog with a research background in AI ethics. Explore my work, research, and interests.', '/', ''),
    'work': ('Work | Eliana Brereton', 'Selected recruiting and accessibility work, followed by my professional history.', '/work.html', 'work'),
    'research': ('Research | Eliana Brereton', 'Research into AI ethics, algorithmic hiring, and AI-generated interview assessments. Papers, results, and figures.', '/research.html', 'research'),
    'about': ('About | Eliana Brereton', 'My background in psychology and AI ethics, education, Ethics Bowl leadership, and interests outside work.', '/about.html', 'about'),
    'MRPfigures': ('Research Figures | Eliana Brereton', 'Figures and graphs from my MA research on AI-generated hiring assessments.', '/MRPfigures.html', 'research'),
}
ALIASES = {'projects.html': '/research.html', 'work-experience.html': '/work.html', 'education.html': '/about.html#education', 'now.html': '/about.html#outside-work', 'contact.html': '/#contact'}

def build():
    template = (SOURCE / 'template.html').read_text()
    header = (SOURCE / 'includes/header.html').read_text()
    footer = (SOURCE / 'includes/footer.html').read_text()
    for slug, (title, description, canonical, active) in PAGES.items():
        source = SOURCE / 'pages' / (slug + '.html')
        if not source.exists():
            continue
        page = template
        # User preference applies to page metadata as well as visible prose.
        title = re.sub(r'(?<=\w)-(?=\w)', ' ', title).replace('—', '|').replace('–', '|')
        description = re.sub(r'(?<=\w)-(?=\w)', ' ', description).replace('—', ', ').replace('–', ', ')
        values = {'title': escape(title), 'description': escape(description, quote=True), 'canonical': canonical, 'header': header, 'footer': footer, 'content': source.read_text()}
        for key, value in values.items():
            page = page.replace('{{' + key + '}}', value)
        for name in ('work', 'research', 'about'):
            page = page.replace('{{' + name + '_current}}', 'aria-current="page"' if active == name else '')
        (ROOT / (slug + '.html')).write_text(page)
    # Old incoming links remain valid. The fallback link also works without JS.
    for old, new in ALIASES.items():
        (ROOT / old).write_text(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0; url={new}"><link rel="canonical" href="https://eliana.brereton.me{new.split("#")[0]}"><title>Page moved | Eliana Brereton</title></head><body><main><h1>This page has moved.</h1><p><a href="{new}">Continue to the updated page</a></p></main></body></html>')
    print('Static pages generated. CNAME, .nojekyll, and original assets are unchanged.')

if __name__ == '__main__':
    build()
