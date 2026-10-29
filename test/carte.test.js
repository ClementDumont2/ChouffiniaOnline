// Lot 10 : sanctuaires et /tp, marchands de zone, boss de zone, poursuite A*.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld, addPlayer, tick, handleAction, handleChat, takeEvents, movePlayer} from '../shared/sim.js';
import {T, canStand, findPath, isSafe, regionAt, zoneAt} from '../shared/map.js';
import {snapshotFor} from '../shared/protocol.js';
import {normalizeSave} from '../shared/rules.js';
import {ITEMS, MOBS, NPCS, STOCK} from '../shared/data.js';
import {BOSSES} from '../shared/data/bosses.js';
import {REGIONS, SAFE} from '../shared/data/zones.js';

const npc = id => NPCS.find(n => n.id === id);
const place = (pl, x, y) => { pl.P.x = x; pl.P.y = y; };
const run = (w, s) => { for (let i = 0; i < Math.round(s * 20); i++) tick(w, .05); };

test('A* contourne un mur, évite les cases interdites et abandonne une cible enfermée', () => {
  // 7×5, mur vertical en x = 3 sauf en y = 4.
  const map = {id: 't', w: 7, h: 5, t: new Uint8Array(35), oob: T.WALL};
  for (let y = 0; y < 4; y++) map.t[y * 7 + 3] = T.WALL;
  const p = findPath(map, 1.5, 1.5, 5.5, 1.5);
  assert.deepEqual(p.at(-1), {x: 5.5, y: 1.5});
  assert.ok(p.some(q => q.y === 4.5), 'passe par le trou');
  assert.ok(p.every(q => !(q.x === 3.5 && q.y < 4)), 'jamais dans le mur');
  assert.equal(findPath(map, 1.5, 1.5, 5.5, 1.5, (x, y) => y > 4), null, 'le trou est interdit');
});

test('un monstre bloqué derrière un mur rejoint sa cible par A*', () => {
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'}), map = w.maps.over;
  // Monstre et joueur séparés par une rangée de baies du Datacenter (ouverture la plus proche : x = 60) ; en ligne droite, il resterait collé aux baies.
  const m = map.mobs.find(x => x.type === 'herbe');
  Object.assign(m, {x: 57.5, y: 35.5, hx: 57.5, hy: 35.5, st: 'chase', target: 'p1', threat: {p1: 1}});
  map.mobs = [m]; p.S.lvl = 30; place(p, 57.5, 37.5);
  assert.ok(canStand(map, 57.5, 35.5) && canStand(map, 57.5, 37.5));
  run(w, 10);
  assert.ok(m.y > 36.5 && Math.hypot(m.x - 57.5, m.y - 37.5) < 1.5, `le monstre a contourné les baies (${m.x.toFixed(1)}, ${m.y.toFixed(1)})`);
});

test('chaque sanctuaire : point d\'arrivée praticable, dans sa zone, sans monstre ; marchand et PNJ dedans', () => {
  const w = createWorld({seed: 1}), map = w.maps.over;
  for (const [z, s] of Object.entries(SAFE)) {
    assert.ok(canStand(map, s.x, s.y), `${z} : arrivée praticable`);
    assert.equal(zoneAt(map, s.x, s.y), z);
    assert.ok(isSafe(map, s.x, s.y));
  }
  assert.ok(map.mobs.every(m => !isSafe(map, m.x, m.y)), 'aucun monstre dans un sanctuaire');
  for (const [id, z] of [['porte_bac', 'preau'], ['cantine', 'preau'], ['chef_rayon', 'accueil'], ['sauvette', 'attente'], ['goodies', 'vestiaire'], ['bde', 'cafet']]) {
    const n = npc(id);
    assert.equal(zoneAt(map, n.x, n.y), z, id);
    assert.ok(canStand(map, n.x, n.y), `${id} praticable`);
  }
  assert.equal(npc('porte_bac').dungeon, 'bac');
});

test('/tp : sanctuaire découvert en y entrant, voyage seulement depuis un sanctuaire', () => {
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'});
  assert.deepEqual(p.S.tp, ['base', 'bourg']);
  handleChat(w, 'p1', '/tp preau');
  assert.ok(takeEvents(w, 'p1').some(e => e.t === 'err' && /Ni sanctuaire découvert/.test(e.text)));
  // Entrée à pied dans le préau.
  place(p, 79.5, 12.5); p.P.mt = -99;
  assert.ok(movePlayer(w, 'p1', 80.5, 12.5));
  assert.deepEqual(p.S.tp, ['base', 'bourg', 'preau']);
  assert.ok(takeEvents(w, 'p1').some(e => e.t === 'toast' && e.kicker === 'Sanctuaire découvert'));
  // Hors sanctuaire : refusé.
  place(p, 100.5, 10.5);
  handleChat(w, 'p1', '/tp bourg');
  assert.ok(takeEvents(w, 'p1').some(e => e.t === 'err' && /depuis un sanctuaire/.test(e.text)));
  assert.equal(p.P.x, 100.5);
  // Depuis le préau : vers le Bourg, puis retour.
  place(p, SAFE.preau.x, SAFE.preau.y);
  handleChat(w, 'p1', '/tp bourg');
  assert.deepEqual([p.P.x, p.P.y], [SAFE.bourg.x, SAFE.bourg.y]);
  handleChat(w, 'p1', '/tp preau');
  assert.deepEqual([p.P.x, p.P.y], [SAFE.preau.x, SAFE.preau.y]);
  assert.deepEqual(normalizeSave({tp: ['preau', 'nimporte', 3, 'preau']}).tp, ['base', 'bourg', 'preau']);
});

test('marchands des sanctuaires : équipement au niveau de leur zone, achat chez celui d\'à côté', () => {
  const bornes = {cantine: [15, 25], chef_rayon: [25, 40], sauvette: [40, 55], goodies: [55, 75], bde: [75, 100]};
  for (const [id, [a, b]] of Object.entries(bornes)) {
    const eq = STOCK[id].filter(i => ITEMS[i].t === 'eq');
    assert.ok(eq.length >= 2, id);
    assert.ok(eq.every(i => ITEMS[i].rl >= a && ITEMS[i].rl <= b && ITEMS[i].r !== 'leg'), id);
  }
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'}), c = npc('cantine');
  p.S.gold = 5000; p.S.lvl = 15; place(p, c.x + 1, c.y + .3);
  handleAction(w, 'p1', {a: 'buy', id: 'chips', n: 1});
  assert.equal(p.S.gold, 4995, 'les chips se vendent aussi loin de Gérard');
  handleAction(w, 'p1', {a: 'buy', id: 'gilet', n: 1});
  assert.equal(p.S.gold, 4995 - ITEMS.gilet.price * 3);
  assert.equal(p.S.eq.torse.id, 'gilet', 'un achat meilleur s\'équipe tout seul');
  place(p, 7.5, 8.5);
  handleAction(w, 'p1', {a: 'buy', id: 'gilet', n: 1});
  assert.equal(p.S.gold, 4995 - ITEMS.gilet.price * 3, 'trop loin : rien');
});

test('un boss de zone par zone de la carte du monde, à son niveau, avec ses capacités', () => {
  const w = createWorld({seed: 1}), map = w.maps.over;
  const zones = {plaine: [1, 3], steppe: [2, 4], lac: [3, 5], foret: [4, 7], marais: [6, 8], sel: [8, 10], datacenter: [10, 12],
    parking: [15, 26], supermarche: [25, 41], pole: [40, 56], convention: [55, 76], diiage: [75, 100],
    startup: [100, 112], coloc: [100, 112], discord: [100, 112]};
  const boss = map.mobs.filter(m => m.d.boss && m.type !== 'maman');
  assert.deepEqual(boss.map(m => zoneAt(map, m.x, m.y)).sort(), Object.keys(zones).sort());
  for (const m of boss) {
    const [a, b] = zones[zoneAt(map, m.x, m.y)];
    assert.ok(m.l >= a && m.l <= b && BOSSES[m.type] && MOBS[m.d.look], m.type);
  }
  // Le Modo Suprême se bat : colère, renforts, coup de zone, sans erreur.
  const p = addPlayer(w, 'p1', {name: 'P1'}), m = boss.find(x => x.type === 'modo_supreme');
  p.S.lvl = 30; p.S.hp = 1e9; place(p, m.x + 1, m.y);
  handleAction(w, 'p1', {a: 'target', id: m.id});
  m.hp = Math.round(m.mhp * .3); handleAction(w, 'p1', {a: 'skill', i: 0});
  run(w, 8);
  assert.ok(m.enr && m.b.summons.length === 2, 'colère et renforts');
  m.hp = 1; p.P.cd = {}; handleAction(w, 'p1', {a: 'skill', i: 0});
  assert.ok(!m.alive && p.S.inv.some(s => s.id === 'chouffe'));
});

test('chaque sanctuaire a un marchand', () => {
  const map = createWorld({seed: 1}).maps.over;
  const vendeurs = NPCS.filter(n => STOCK[n.id]).map(n => zoneAt(map, n.x, n.y));
  for (const z of [...Object.keys(SAFE), 'arene']) assert.ok(vendeurs.includes(z), z);
});

test('sac plein : achat refusé sans débit, sauf sur une pile déjà présente', () => {
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'}), c = npc('cantine');
  p.S.gold = 5000; p.S.lvl = 20; place(p, c.x + 1, c.y + .3);
  p.S.inv = [{id: 'chips', n: 1}, ...Array.from({length: 23}, (_, i) => ({uid: 'x' + i, id: 'regle', nObj: 1, rarete: 'common'}))];
  for (const id of ['gilet', 'chouffe']) handleAction(w, 'p1', {a: 'buy', id, n: 1});
  assert.equal(p.S.gold, 5000);
  assert.ok(takeEvents(w, 'p1').some(e => e.t === 'err' && /Sac plein/.test(e.text)));
  handleAction(w, 'p1', {a: 'buy', id: 'chips', n: 1});
  assert.deepEqual([p.S.gold, p.S.inv[0].n, p.S.inv.length], [4995, 2, 24]);
});

test('/tp <joueur> : à côté d\'un joueur de la carte du monde, pas dans un donjon', () => {
  const w = createWorld({seed: 1}), a = addPlayer(w, 'a', {name: 'Alice'}), b = addPlayer(w, 'b', {name: 'Bob'});
  place(b, 100.5, 10.5);
  handleChat(w, 'a', '/tp bob');
  assert.deepEqual([a.P.x, a.P.y], [100.5, 10.5]);
  assert.ok(takeEvents(w, 'b').some(e => /se téléporte à côté de vous/.test(e.text || '')));
  place(a, SAFE.bourg.x, SAFE.bourg.y); b.mapId = 'dg9';
  handleChat(w, 'a', '/tp Bob');
  assert.ok(takeEvents(w, 'a').some(e => e.t === 'err' && /donjon/.test(e.text)));
  handleChat(w, 'a', '/tp personne');
  assert.ok(takeEvents(w, 'a').some(e => e.t === 'err' && /Ni sanctuaire/.test(e.text)));
});

test('un boss de zone ne crie qu\'aux joueurs à portée de voix', () => {
  const w = createWorld({seed: 1}), map = w.maps.over, m = map.mobs.find(x => x.type === 'modo_supreme');
  const pres = addPlayer(w, 'p', {name: 'Pres'}), loin = addPlayer(w, 'l', {name: 'Loin'});
  pres.S.lvl = 30; pres.S.hp = 1e9; place(pres, m.x + 1, m.y);
  handleAction(w, 'p', {a: 'target', id: m.id}); handleAction(w, 'p', {a: 'skill', i: 0});
  run(w, 8);
  const cris = id => takeEvents(w, id).filter(e => e.cls === 'yell').length;
  assert.ok(cris('p') > 0);
  assert.equal(cris('l'), 0);
});

test('chat Général : arrivées, hauts faits et réponses de commande ont leur classe ; le reste reste « sys »', () => {
  const w = createWorld({seed: 1}), a = addPlayer(w, 'a', {name: 'Alice'});
  takeEvents(w, 'a');
  const b = addPlayer(w, 'b', {name: 'Bob'});
  assert.ok(takeEvents(w, 'a').some(e => e.cls === 'join' && /Bob/.test(e.text)));
  handleChat(w, 'b', '/khey'); takeEvents(w, 'b');
  handleChat(w, 'b', '/qui');
  const rep = takeEvents(w, 'b').filter(e => e.t === 'msg');
  assert.ok(rep.length && rep.every(e => e.cls === 'cmd'), 'réponse de /qui');
  handleChat(w, 'b', '/nimporte');
  assert.equal(takeEvents(w, 'b').find(e => e.t === 'msg').cls, 'cmd');
  // Haut fait de Bob : Alice le voit passer.
  b.S.ach = {}; handleAction(w, 'b', {a: 'target', id: null});
  place(b, npc('tavernier').x + 1, npc('tavernier').y); handleAction(w, 'b', {a: 'talk', id: 'tavernier'});
  assert.ok(takeEvents(w, 'a').some(e => e.cls === 'hf' && /Bob/.test(e.text)));
});

test('une zone = une carte : snapshot, ciblage et poursuite restent dans la région du joueur', () => {
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'}), map = w.maps.over;
  // Toute la carte du monde est découpée, sans trou ni chevauchement.
  for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) assert.equal(Object.values(REGIONS).filter(r => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3]).length, 1, `case ${x},${y}`);
  place(p, 81.5, 12.5);
  const mobs = snapshotFor(w, 'p1').ents.filter(e => e.kind === 'mob');
  assert.ok(mobs.length && mobs.every(e => regionAt(map, e.x, e.y) === 'parking'), 'seuls les monstres du Parking sont envoyés');
  const m = map.mobs.find(x => x.type === 'herbe');
  Object.assign(m, {x: 78.5, y: 12.5, hx: 78.5, hy: 12.5});
  handleAction(w, 'p1', {a: 'target', id: m.id});
  assert.equal(p.P.target, null, 'pas de cible à travers la frontière');
  run(w, 2);
  assert.equal(m.st, 'idle', 'le monstre du Marais ne poursuit pas un joueur du Parking');
});
