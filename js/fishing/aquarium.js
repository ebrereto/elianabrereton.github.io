import { catches, spriteURL, living } from './catches.js';
const el = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };

export function renderCollection(save, filter, onSelect) {
  const grid = document.querySelector('#collection-grid'); grid.replaceChildren();
  for (const item of catches) {
    if (filter === 'living' && !living(item) || filter === 'shelf' && living(item)) continue;
    const entry = save.collection[item.id], button = el('button');
    button.type = 'button';button.className = `collection-card ${entry ? '' : 'undiscovered'} ${living(item) ? '' : 'shelf-item'}`;
    const img = el('img');img.src = spriteURL(item.id);img.alt = '';img.width = img.height = 64;
    button.append(img, el('span', entry ? item.name : '???', 'catch-name'), el('span', entry ? item.rarity : 'undiscovered', 'rarity'));
    if (entry) button.append(el('span', `×${entry.count}`, 'quantity'));
    button.setAttribute('aria-label', entry ? `${item.name}, ${item.rarity}, caught ${entry.count}. show details` : `undiscovered ${item.category}. show hint`);
    button.addEventListener('click', () => onSelect(item)); grid.append(button);
  }
  const residentCount = catches.filter(item => living(item) && save.collection[item.id]).length;
  const discoveryCount = Object.keys(save.collection).length;
  document.querySelector('#empty-tank').hidden = residentCount > 0;
  document.querySelector('#discovery-total').textContent = `${discoveryCount} / ${catches.length}`;
}

export function showDetails(item, save) {
  const content = document.querySelector('#detail-content'); content.replaceChildren();
  const entry = save.collection[item.id], img = el('img'); img.src = spriteURL(item.id); img.alt = entry ? item.name : 'undiscovered catch silhouette';
  if (!entry) img.style.filter = 'brightness(0) opacity(.22)';
  const heading = el('h2', entry ? item.name : 'a little mystery');heading.id = 'detail-name';
  content.append(img, heading, el('span', entry ? `${item.category} · ${item.rarity} · ${item.value} points` : `undiscovered ${item.category}`, 'detail-rarity'));
  content.append(el('p', entry ? item.description : item.hint || 'keep casting. you never quite know who’s down there.'));
  if (entry) {
    const details = el('dl');
    for (const [label, value] of [['number caught', String(entry.count)], ...(living(item) ? [['largest size', entry.largest ? `${entry.largest.toFixed(1)} cm` : 'not recorded']] : []), ['first caught', entry.firstCaught ? new Date(entry.firstCaught).toLocaleDateString(undefined, { year:'numeric',month:'short',day:'numeric' }).toLowerCase() : 'an earlier visit']]) {
      details.append(el('dt', label),el('dd',value));
    }
    content.append(details,el('span','✦ discovered','first-badge'));
  }
  document.querySelector('#detail-dialog').showModal();
}
