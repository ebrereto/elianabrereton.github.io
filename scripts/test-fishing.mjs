import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Load the static catalogue in Node without a network or browser dependency.
globalThis.fetch = async url => ({ ok: true, json: async () => JSON.parse(await readFile(url,'utf8')) });
const { catches, distribution, chooseCatch, totalCaught, discoveries, rodUnlocked, rods, baitUnlocked, baits } = await import('../js/fishing/catches.js');
const { FishingGame } = await import('../js/fishing/game.js');
const { freshSave, normalizeSave, createStore, SAVE_KEY } = await import('../js/fishing/save.js');
const { Renderer } = await import('../js/fishing/renderer.js');

const save=freshSave();
assert.equal(catches.length,24);
assert.equal(new Set(catches.map(item=>item.id)).size,24);
for(const item of catches) for(const key of ['name','description','category','rarity','hint']) assert.equal(item[key],item[key].toLowerCase());
for(const bait of baits) {
  const rows=distribution({...save,bait:bait.id});
  assert.ok(Math.abs(rows.reduce((sum,row)=>sum+row.probability,0)-1)<1e-12);
  assert.ok(rows.every(row=>row.probability>0));
  assert.ok(!rows.some(row=>row.item.id==='pearl-with-a-view'));
}
const categoryChance=(bait,category)=>distribution({...save,bait}).filter(row=>row.item.category===category).reduce((sum,row)=>sum+row.probability,0);
assert.ok(categoryChance('seaweed','junk')<categoryChance('crumbs','junk'));
assert.ok(categoryChance('sparkle','creature')>categoryChance('crumbs','creature'));
const rarityChance=s=>distribution(s).filter(row=>['rare','secret'].includes(row.item.rarity)).reduce((sum,row)=>sum+row.probability,0);
assert.ok(rarityChance({...save,dryStreak:10})>rarityChance(save));
assert.ok(chooseCatch(save,()=>0));assert.ok(chooseCatch(save,()=>.999999));

// A deterministic full cast covers success, both failures, pause, and repeat play.
let changes=[];
const game=new FishingGame(()=>save,state=>changes.push(state),()=>.3);
game.action();assert.equal(game.state,'casting');
game.action();assert.equal(game.state,'casting');
game.update(.8);assert.equal(game.state,'waiting');
game.paused=true;const elapsed=game.elapsed;game.update(100);game.action();assert.equal(game.elapsed,elapsed);assert.equal(game.state,'waiting');
game.paused=false;game.update(3);assert.equal(game.state,'bite');
game.action();assert.equal(game.state,'timing');
assert.ok(game.width>=.2);assert.ok(game.target>0&&game.target+game.width<1);
game.update((game.target+game.width/2)/game.speed);game.action();assert.equal(game.state,'reeling');assert.equal(game.success,true);
game.update(.65);assert.equal(game.state,'caught');
game.action();game.update(.8);game.update(3);game.update(3.5);assert.equal(game.state,'escaped');assert.equal(game.reason,'bite');
game.action();game.update(.8);game.update(3);game.action();game.action();game.update(.65);assert.equal(game.state,'escaped');assert.equal(game.reason,'timing');
assert.ok(changes.includes('caught')&&changes.includes('escaped'));

// Boundary hits are catches; missing by even a little remains an escape.
for(const offset of [0,.0001,-.0001]) {
  const test=new FishingGame(()=>save,()=>{},()=>.3);test.action();test.update(.8);test.update(3);test.action();test.marker=test.target+offset;test.action();assert.equal(test.success,offset>=0);
}
const clean=normalizeSave({ highScore:-30, rod:'ribbon', collection:{ sardine:{count:3,largest:20,firstCaught:'2026-09-14'}, nonsense:{count:2}, anchovy:{count:-10} }, muted:false });
assert.equal(clean.highScore,0);assert.equal(clean.rod,'driftwood');assert.equal(clean.muted,false);assert.equal(totalCaught(clean),3);assert.equal(discoveries(clean),1);assert.equal(baitUnlocked(baits[1],clean),true);
assert.equal(rodUnlocked(rods[1],clean),false);clean.collection.sardine.count=5;assert.equal(rodUnlocked(rods[1],clean),true);
assert.equal(Object.keys(normalizeSave(JSON.parse('{"collection":{"__proto__":{"count":4},"constructor":{"count":4}}}')).collection).length,0);
for(const item of catches.slice(0,10)) clean.collection[item.id]={count:1,largest:10,firstCaught:new Date().toISOString()};
assert.equal(rodUnlocked(rods[2],clean),true);assert.ok(distribution(clean).some(row=>row.item.id==='pearl-with-a-view'));
const memory=new Map();const storage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
let warnings=[];let store=createStore(storage,message=>warnings.push(message));
assert.deepEqual(store.load(),freshSave());assert.equal(store.save(clean),true);assert.deepEqual(store.load(),normalizeSave(clean));
memory.set(SAVE_KEY,'{bad json');assert.deepEqual(store.load(),freshSave());assert.equal(warnings.length,1);
memory.set(SAVE_KEY,JSON.stringify({version:99,collection:{}}));store=createStore(storage);store.load();assert.equal(store.save(clean),false);assert.equal(JSON.parse(memory.get(SAVE_KEY)).version,99);
assert.equal(store.reset(),true);assert.equal(memory.has(SAVE_KEY),false);
const blocked=createStore({getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}});
assert.deepEqual(blocked.load(),freshSave());assert.equal(blocked.save(clean),false);assert.equal(blocked.reset(),false);
// Exercise drawing commands without browser automation. Invalid coordinates or
// missing sprite references fail here; this is not a visual layout test.
let drawCount=0;
const context={
  clearRect(...args){args.forEach(v=>assert.ok(Number.isFinite(v)));},
  fillRect(...args){args.forEach(v=>assert.ok(Number.isFinite(v)));drawCount++;},
  drawImage(image,...args){assert.ok(image);args.forEach(v=>assert.ok(Number.isFinite(v)));},
  save(){},restore(){},translate(...args){args.forEach(v=>assert.ok(Number.isFinite(v)));},scale(){}
};
const canvas={getContext:()=>context};
const renderer=new Renderer(canvas,canvas,{base:{},sprites:Object.fromEntries(catches.map(item=>[item.id,{}]))});
for(const state of ['idle','casting','waiting','bite','timing','reeling','caught','escaped']) for(const reduced of [false,true]) {
  renderer.dock({state,elapsed:.25},clean,3,reduced);
}
renderer.tank(clean,3,false);renderer.tank(clean,3,true);assert.ok(drawCount>100);
console.log('PASS: lowercase catalogue; balanced odds and bait effects; fair rare bonus; complete fishing loop; pause; timing boundaries; unlocks; save round-trip; corrupted and future saves; unavailable storage; reset.');
console.log('PASS: all scene states and aquarium render commands, including reduced motion. Browser visual review remains separate.');
