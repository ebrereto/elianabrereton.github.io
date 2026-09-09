"""Check all local HTML links, fragments, assets, and basic document structure."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re

ROOT = Path(__file__).resolve().parents[1]

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links, self.ids, self.h1, self.errors = [], set(), 0, []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                self.errors.append('Duplicate id: ' + attrs['id'])
            self.ids.add(attrs['id'])
        if tag == 'h1':
            self.h1 += 1
        if tag == 'img' and 'alt' not in attrs:
            self.errors.append('Image missing alt attribute')
        for attr in ('href', 'src'):
            if attrs.get(attr):
                self.links.append(attrs[attr])
        if 'srcset' in attrs:
            self.links += [v.strip().split()[0] for v in attrs['srcset'].split(',')]

def check():
    docs = {p: Document(p.read_text()) for p in ROOT.glob('*.html')}
    failures = []
    count = 0
    for path, doc in docs.items():
        failures += [f'{path.name}: {error}' for error in doc.errors]
        if doc.h1 != 1:
            failures.append(f'{path.name}: expected one h1, found {doc.h1}')
        if '{{' in path.read_text():
            failures.append(f'{path.name}: unexpanded template variable')
        for href in doc.links:
            url = urlsplit(href)
            if url.scheme or url.netloc:
                continue
            target = (ROOT / unquote(url.path.lstrip('/'))) if url.path.startswith('/') else path.parent / unquote(url.path)
            if not url.path:
                target = path
            if target.is_dir():
                target /= 'index.html'
            count += 1
            if not target.is_file():
                failures.append(f'{path.name}: missing {href}')
            elif url.fragment and target in docs and url.fragment not in docs[target].ids:
                failures.append(f'{path.name}: missing fragment {href}')
    for asset in re.findall(r'url\([\'"]?([^\)\'\"]+)', (ROOT / 'css/site.css').read_text()):
        if asset.startswith('/') and not (ROOT / asset.lstrip('/')).is_file():
            failures.append('CSS missing asset: ' + asset)
    if failures:
        raise SystemExit('\n'.join(failures))
    print(f'PASS: {len(docs)} pages, {count} internal references, unique IDs, image alt attributes, heading count, and CSS assets.')

if __name__ == '__main__':
    check()
