import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld, addPlayer, tick, handleAction, handleChat, takeEvents, movePlayer} from '../shared/sim.js';
import {genOverworld, zoneAt, canStand, isSolid} from '../shared/map.js';
import {bossUpcoming, stats, statsDeMob, xpNeed} from '../shared/rules.js';
import {ART_POOLS, DUNGEONS, ITEMS, MOBS, NPCS, QUESTS, SPAWNS, ZONES, DIFFS} from '../shared/data.js';
import {BOSSES} from '../shared/data/bosses.js';

const npc = id => NPCS.find(n => n.id === id);
const place = (pl, x, y) => { pl.P.x = x; pl.P.y = y; };
const run = (w, s) => { for (let i = 0; i < Math.round(s * 20); i++) tick(w, .05); };
const NOUVELLES = {parking: ['delegue', 'scooter', 'souvenir'], supermarche: ['caddie', 'vigile', 'promo'], pole: ['cerfa', 'file', 'conseillerabs']};

test('la carte fait 120 colonnes, la partie d\'origine est inchangée et les trois zones existent', () => {
  const map = genOverworld(20111);
  assert.equal(map.w, 120);
  assert.deepEqual([zoneAt(map, 90, 10), zoneAt(map, 90, 30), zoneAt(map, 90, 50)], ['parking', 'supermarche', 'pole']);
  for (const z of ['parking', 'supermarche', 'pole']) assert.ok(ZONES[z].n && ZONES[z].s);
  // Empreinte des 64 premières colonnes, relevée avant le Lot 8 : seule la route vers le parking (x ≥ 64, y 12–13) a changé dans l'ancienne carte.
  let h = 0;
  for (let y = 0; y < 60; y++) for (let x = 0; x < 64; x++) h = (h * 31 + map.t[y * map.w + x]) >>> 0;
  assert.equal(h, 1471958823);
});

test('chaque zone est accessible à pied depuis le point d\'arrivée, jusqu\'à ses PNJ et à l\'entrée du donjon', () => {
  const map = genOverworld(20111), W = map.w, H = map.h, step = .5;
  // Parcours en largeur sur une grille de cases où un joueur peut se tenir (le joueur a un rayon : on teste le centre de la case).
  const ok = (x, y) => canStand(map, x + .5, y + .5);
  const seen = new Uint8Array(W * H), q = [[7, 8]];
  seen[8 * W + 7] = 1;
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || seen[ny * W + nx] || !ok(nx, ny)) continue;
      seen[ny * W + nx] = 1; q.push([nx, ny]);
    }
  }
  const atteint = n => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen[Math.floor(n.y + dy) * W + Math.floor(n.x + dx)]);
  for (const id of ['panneau_parking', 'cpe', 'porte_bac', 'panneau_supermarche', 'caissiere', 'porte_reserve', 'panneau_pole', 'mystique', 'porte_labyrinthe'])
    assert.ok(atteint(npc(id)), `PNJ ${id} inaccessible`);
  for (const dg of ['bac', 'reserve', 'labyrinthe']) assert.ok(seen[Math.floor(DUNGEONS[dg].exit.y) * W + Math.floor(DUNGEONS[dg].exit.x)], `sortie de ${dg} inaccessible`);
  assert.ok(!isSolid(map, 99.5, 21.5) && !isSolid(map, 99.5, 39.5), 'les portes entre zones sont ouvertes');
});

test('9 monstres, 3 par zone, au niveau annoncé ; ils apparaissent dans leur zone et loin des PNJ', () => {
  const w = createWorld({seed: 1}), map = w.maps.over;
  const bornes = {parking: [15, 25], supermarche: [25, 40], pole: [40, 55]};
  for (const [z, types] of Object.entries(NOUVELLES)) {
    for (const t of types) {
      assert.ok(MOBS[t].l >= bornes[z][0] && MOBS[t].l <= bornes[z][1], `${t} niveau ${MOBS[t].l}`);
      const ms = map.mobs.filter(m => m.type === t);
      assert.ok(ms.length >= 6, t);
      assert.ok(ms.every(m => zoneAt(map, m.x, m.y) === z), `${t} hors de sa zone`);
      assert.ok(ms.every(m => NPCS.every(n => Math.hypot(n.x - m.x, n.y - m.y) >= 3.5)), `${t} trop près d'un PNJ`);
    }
  }
  assert.ok(SPAWNS.length > 10);
});

test('chaque PNJ de quête a une chaîne de 2 à 3 quêtes qui se suit, avec récompense d\'équipement', () => {
  const idx = QUESTS.findIndex(q => q.g === 'cpe');
  for (const [g, n] of [['cpe', 3], ['caissiere', 3], ['mystique', 3]]) {
    const chaine = QUESTS.filter(q => q.g === g);
    assert.ok(chaine.length >= 2 && chaine.length <= 3 && chaine.length === n, g);
    assert.ok(chaine.every(q => ITEMS[q.item].t === 'eq' && ITEMS[q.item].rl >= 15), g);
    assert.ok(chaine.every((q, i) => i === 0 || q.rl >= chaine[i - 1].rl), 'niveaux croissants');
    assert.ok(chaine.at(-1).dg === 0 && DUNGEONS[chaine.at(-1).dgn], 'la chaîne finit par le donjon de la zone');
  }
  assert.ok(idx > QUESTS.findIndex(q => q.fin), 'les nouvelles quêtes suivent la campagne d\'origine');
});

test('quêtes en chaîne : tuer, rendre, la suivante s\'ouvre', () => {
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'}), i0 = QUESTS.findIndex(q => q.g === 'cpe');
  p.S.q = {i: i0, st: 'avail', n: 0}; p.S.lvl = 15;
  place(p, npc('cpe').x + 1, npc('cpe').y + .3);
  handleAction(w, 'p1', {a: 'acceptQuest'});
  assert.equal(p.S.q.st, 'active');
  const map = w.maps.over;
  for (let k = 0; k < QUESTS[i0].k; k++) {
    const m = map.mobs.find(x => x.type === 'delegue' && x.alive);
    m.hp = 1; place(p, m.x - 1, m.y); p.P.cd = {}; p.S.hp = 1e6;
    handleAction(w, 'p1', {a: 'target', id: m.id}); handleAction(w, 'p1', {a: 'skill', i: 0});
  }
  assert.equal(p.S.q.st, 'ready');
  place(p, npc('cpe').x + 1, npc('cpe').y + .3);
  handleAction(w, 'p1', {a: 'completeQuest'});
  assert.equal(p.S.q.i, i0 + 1);
  assert.ok(p.S.inv.some(s => s.id === 'regle_fer'));
});

// ---- donjons à thème ----
function donjon(dgId, ti = 0, seed = 7) {
  const w = createWorld({seed}), p = addPlayer(w, 'p1', {name: 'P1'}), dg = DUNGEONS[dgId];
  p.S.lvl = 60; p.S.hp = 1e6; p.P.combat = -1e9;
  place(p, npc(dg.npc).x + 1, npc(dg.npc).y + .3);
  handleAction(w, 'p1', {a: 'enterDungeon', ti, dg: dgId});
  const D = w.maps[p.mapId], boss = D.mobs.find(m => m.d.boss);
  if (boss) { place(p, boss.x - 1.2, boss.y); boss.st = 'chase'; boss.target = 'p1'; boss.threat = {p1: 1}; }
  return {w, p, D, boss, dg};
}

test('chaque donjon à thème : entrée par son PNJ, niveaux de la zone, boss propre, monstres de la zone', () => {
  const attendu = {bac: ['correcteur', [15, 18, 21, 25]], reserve: ['gerant', [25, 29, 34, 40]], labyrinthe: ['guichet', [40, 45, 50, 55]]};
  for (const [id, [boss, niveaux]] of Object.entries(attendu)) {
    for (let ti = 0; ti < 4; ti++) {
      const {D, p} = donjon(id, ti);
      assert.equal(D.dg, id); assert.equal(D.ti, ti);
      assert.ok(D.mobs.some(m => m.type === boss), `${id}/${ti} : boss`);
      const triviaux = D.mobs.filter(m => !m.d.boss && !m.summoned);
      assert.ok(triviaux.every(m => DUNGEONS[id].kinds.includes(m.type) && m.l === niveaux[ti]), `${id}/${ti} : monstres`);
      assert.equal(DIFFS.length, 4); assert.ok(p.mapId !== 'over');
    }
  }
  // Mauvaise porte : on n'entre pas.
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'});
  p.S.lvl = 60; place(p, npc('cpe').x + 1, npc('cpe').y);
  handleAction(w, 'p1', {a: 'enterDungeon', ti: 0, dg: 'bac'});
  assert.equal(p.mapId, 'over');
  p.S.lvl = 10; place(p, npc('porte_bac').x + 1, npc('porte_bac').y + .3);
  handleAction(w, 'p1', {a: 'enterDungeon', ti: 0, dg: 'bac'});
  assert.equal(p.mapId, 'over', 'niveau 15 requis');
});

test('boss vaincu : coffre de thème (artéfacts du donjon, objet unique), XP de fin, sortie dans la zone', () => {
  for (const id of ['bac', 'reserve', 'labyrinthe']) {
    const {w, p, D, boss, dg} = donjon(id, 3, 11);
    boss.hp = 1; p.P.cd = {}; w.rnd = () => 0; // tout tombe : l'objet unique aussi
    const xp = p.S.xp, lvl = p.S.lvl;
    handleAction(w, 'p1', {a: 'target', id: boss.id}); handleAction(w, 'p1', {a: 'skill', i: 0});
    assert.equal(D.done, true, id);
    assert.ok(takeEvents(w, 'p1').some(e => e.t === 'banner' && e.title === dg.fini));
    const chest = D.objs.find(o => o.type === 'chest');
    assert.equal(chest.n, dg.coffre);
    place(p, chest.x, chest.y + 1);
    handleAction(w, 'p1', {a: 'openChest', id: chest.id});
    const pool = Object.values(ART_POOLS[id]).flat();
    const arts = p.S.inv.filter(s => ITEMS[s.id].t === 'art');
    assert.ok(arts.length > 0 && arts.every(s => pool.includes(s.id)), `${id} : artéfacts du thème`);
    assert.ok(p.S.inv.some(s => s.id === dg.unique.item), `${id} : objet unique`);
    handleAction(w, 'p1', {a: 'leaveDungeon'});
    assert.equal(p.mapId, 'over');
    assert.ok(Math.hypot(p.P.x - dg.exit.x, p.P.y - dg.exit.y) < .1, 'ressort devant la porte');
    assert.equal(zoneAt(w.maps.over, p.P.x, p.P.y), zoneAt(w.maps.over, npc(dg.npc).x, npc(dg.npc).y));
    assert.ok(p.S.xp > xp || p.S.lvl > lvl);
  }
});

test('quête de donjon : terminer le bon donjon la valide, pas celui des Archives', () => {
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'}), i = QUESTS.findIndex(q => q.dgn === 'bac');
  p.S.q = {i, st: 'active', n: 0}; p.S.lvl = 60; p.S.hp = 1e6; p.P.combat = -1e9;
  place(p, npc('gardien').x + 1, npc('gardien').y + .3);
  handleAction(w, 'p1', {a: 'enterDungeon', ti: 0});
  let D = w.maps[p.mapId], boss = D.mobs.find(m => m.d.boss);
  place(p, boss.x - 1, boss.y); boss.hp = 1; handleAction(w, 'p1', {a: 'target', id: boss.id}); handleAction(w, 'p1', {a: 'skill', i: 0});
  assert.equal(p.S.q.st, 'active', 'les Archives ne comptent pas pour le Bac');
  const x = donjon('bac', 0, 3);
  x.p.S.q = {i, st: 'active', n: 0}; x.boss.hp = 1; x.p.P.cd = {};
  handleAction(x.w, 'p1', {a: 'target', id: x.boss.id}); handleAction(x.w, 'p1', {a: 'skill', i: 0});
  assert.equal(x.p.S.q.st, 'ready');
});

// ---- boss : mécaniques propres ----
test('Correcteur de Philo : copies au sol (cercles sous les joueurs, note sur 20), absentes hors cercle', () => {
  const {w, p, D, boss} = donjon('bac', 0);
  D.mobs = [boss];
  const b = addPlayer(w, 'p2', {name: 'P2'}); b.mapId = D.id; b.S.hp = 1e6; b.P.combat = -1e9;
  boss.b.cd.sujet = 999; boss.b.cd.copies = 0;
  place(p, boss.x - 2, boss.y); place(b, boss.x - 2, boss.y + 2);
  tick(w, .05);
  assert.equal(boss.castK, 'spots'); assert.ok(boss.spots.length === 3);
  place(b, boss.x + 7, boss.y + 5); // part loin de tout cercle posé sous p1
  boss.spots = [{x: p.P.x, y: p.P.y}, {x: p.P.x, y: p.P.y}, {x: p.P.x, y: p.P.y}];
  takeEvents(w, 'p1');
  const hp = [p.S.hp, b.S.hp];
  run(w, 2.8);
  assert.ok(p.S.hp < hp[0], 'p1 est resté dans le cercle');
  assert.equal(b.S.hp, hp[1]);
  assert.ok(takeEvents(w, 'p1').some(e => e.t === 'float' && /^Note : \d\/20$/.test(e.txt)), 'note sur 20 en texte flottant');
});

test('Gérant de 21 h 59 : à 22 h 00 (3 min) le groupe est éjecté, le donjon détruit, le boss repart à zéro', () => {
  const {w, p, D, boss, dg} = donjon('reserve', 0);
  const id = D.id;
  boss.b.cd.annonce = 999;
  assert.ok(bossUpcoming(boss).some(a => a.n === '22 h 00' && a.t === 180));
  run(w, 179); assert.equal(p.mapId, id);
  run(w, 2);
  assert.equal(p.mapId, 'over');
  assert.equal(w.maps[id], undefined, 'instance détruite');
  assert.ok(Math.hypot(p.P.x - dg.exit.x, p.P.y - dg.exit.y) < .1);
});

test('Guichet Fermé : « Revenez demain » renvoie à l\'entrée du donjon sauf s\'il est interrompu (étourdissement ou dégâts)', () => {
  const lance = () => { const x = donjon('labyrinthe', 0); x.D.mobs = [x.boss]; x.boss.b.cd.tampon = 999; x.boss.b.cd.revenez = 0; tick(x.w, .05); assert.equal(x.boss.castK, 'recall'); return x; };
  // 1. personne n'interrompt : tout le monde se retrouve à l'entrée
  let x = lance(); run(x.w, 5.2);
  assert.ok(Math.hypot(x.p.P.x - x.D.sx, x.p.P.y - x.D.sy) < .1, 'renvoyé à l\'entrée');
  // 2. gros dégâts (≥ 5 % des PV max) pendant l'incantation
  x = lance(); x.w.rnd = () => .5;
  const avant = x.p.P.x;
  x.boss.hp = x.boss.mhp; x.p.S.lvl = 100; x.p.P.cd = {};
  x.boss.castDmg = x.boss.mhp * .06 - 1; // presque au seuil
  handleAction(x.w, 'p1', {a: 'target', id: x.boss.id}); handleAction(x.w, 'p1', {a: 'skill', i: 0});
  assert.equal(x.boss.cast, 0, 'interrompu par les dégâts');
  run(x.w, 5.2); assert.ok(Math.abs(x.p.P.x - avant) < 3, 'pas renvoyé');
  // 3. étourdissement (« En fait… »)
  x = lance(); x.p.S.lvl = 10; x.p.P.cd = {}; x.p.S.caf = 99;
  handleAction(x.w, 'p1', {a: 'target', id: x.boss.id}); handleAction(x.w, 'p1', {a: 'skill', i: 1});
  assert.equal(x.boss.cast, 0, 'interrompu par l\'étourdissement');
});

test('chaque boss suit la progression par difficulté (Normal → Sans Douche)', () => {
  for (const id of ['correcteur', 'gerant', 'guichet']) {
    const mins = BOSSES[id].abilities.map(a => a.diffMin);
    assert.ok(mins.includes(0) && mins.includes(1) && mins.includes(2) && mins.includes(3), id);
  }
  const noms = (dg, ti) => bossUpcoming(donjon(dg, ti).boss).map(a => a.n);
  assert.ok(noms('bac', 0).includes('Copies à Corriger') && !noms('bac', 0).includes('Barème en Chaîne'));
  assert.ok(noms('bac', 2).includes('Barème en Chaîne') && noms('bac', 3).includes('Fin de l\'Épreuve') && noms('bac', 3).includes('Sonnerie'));
  assert.ok(noms('reserve', 1).includes('Promos −70 %') && !noms('reserve', 1).includes('Étiquettes Rouges') && noms('reserve', 2).includes('Étiquettes Rouges'));
  assert.ok(noms('labyrinthe', 0).includes('Revenez Demain'));
});

test('la fin de campagne suit la dernière quête d\'origine (fin), pas la dernière du tableau', () => {
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'}), i = QUESTS.findIndex(q => q.fin);
  assert.ok(i >= 0 && i < QUESTS.length - 1);
  p.S.q = {i, st: 'ready', n: 1}; place(p, npc(QUESTS[i].g).x + 1, npc(QUESTS[i].g).y + .3);
  takeEvents(w, 'p1');
  handleAction(w, 'p1', {a: 'completeQuest'});
  assert.ok(takeEvents(w, 'p1').some(e => e.t === 'campaignEnd'));
  assert.equal(p.S.q.i, i + 1, 'la quête du Parking s\'ouvre ensuite');
});
