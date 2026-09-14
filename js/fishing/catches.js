const url = new URL('../../assets/fishing/catches.json', import.meta.url);
export const catches = await fetch(url).then(response => {
  if (!response.ok) throw new Error('The catch collection could not load. Please refresh.');
  return response.json();
});
export const byId = Object.fromEntries(catches.map(item => [item.id, item]));
export const spriteURL = id => new URL(`../../assets/fishing/${id}.svg`, import.meta.url).href;
export const living = item => item.category === 'fish' || item.category === 'creature';

export const rods = [
  { id: 'driftwood', name: 'driftwood rod', description: 'a trusty little stick. yours from the start.', threshold: 0, kind: 'catches', width: 0, speed: 1 },
  { id: 'sea-glass', name: 'sea glass rod', description: 'a wider target. a little room to breathe.', threshold: 5, kind: 'catches', width: .07, speed: 1 },
  { id: 'ribbon', name: 'ribbon rod', description: 'a slower marker. take your time.', threshold: 10, kind: 'discoveries', width: 0, speed: .78 }
];
export const baits = [
  { id: 'crumbs', name: 'plain crumbs', description: 'a little of everything.', threshold: 0 },
  { id: 'seaweed', name: 'seaweed bites', description: 'more swimming friends, less junk.', threshold: 3 },
  { id: 'sparkle', name: 'sparkle crumbs', description: 'more magical creatures and treasure.', threshold: 8 }
];
export const totalCaught = save => Object.values(save.collection).reduce((sum, entry) => sum + entry.count, 0);
export const discoveries = save => Object.keys(save.collection).length;
export const rodUnlocked = (rod, save) => (rod.kind === 'discoveries' ? discoveries(save) : totalCaught(save)) >= rod.threshold;
export const baitUnlocked = (bait, save) => totalCaught(save) >= bait.threshold;

// Normalize individual weights so a rarity's population does not distort its share.
export function distribution(save) {
  const available = catches.filter(item => item.id !== 'pearl-with-a-view' || discoveries(save) >= 8);
  const tiers = { common: 55, uncommon: 27, rare: 13, secret: 5 };
  if (save.dryStreak >= 10) { tiers.common -= 8; tiers.rare += 4; tiers.secret += 4; }
  const counts = {};
  available.forEach(item => { counts[item.rarity] = (counts[item.rarity] || 0) + 1; });
  const rows = available.map(item => {
    let weight = tiers[item.rarity] / counts[item.rarity];
    if (save.bait === 'seaweed') weight *= living(item) ? 1.6 : item.category === 'junk' ? .45 : 1;
    if (save.bait === 'sparkle') weight *= item.category === 'creature' || item.category === 'treasure' ? 1.9 : 1;
    return { item, weight };
  });
  const total = rows.reduce((sum, row) => sum + row.weight, 0);
  return rows.map(row => ({ item: row.item, probability: row.weight / total }));
}
export function chooseCatch(save, random = Math.random) {
  const rows = distribution(save);
  let roll = random();
  for (const row of rows) { roll -= row.probability; if (roll < 0) return row.item; }
  return rows.at(-1).item;
}
export function catchSize(item, random = Math.random) {
  if (!living(item)) return null;
  const ranges = { sardine: [8, 22], anchovy: [6, 16], 'sand-goby': [3, 10], flounder: [12, 38], mackerel: [18, 43], clownfish: [4, 12], pufferfish: [8, 25], seahorse: [5, 18], moonfish: [25, 70], 'flying-fish': [12, 32] };
  const [min, max] = ranges[item.id] || [4, 28];
  return Math.round((min + random() * (max - min)) * 10) / 10;
}
