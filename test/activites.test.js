// Lot 4 : carte au clavier, fiche d'activité, lancement depuis la carte (F09 à F11).
import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld, addPlayer, handleAction, handleChat, takeEvents, tick} from '../shared/sim.js';
import {COMBAT_TP, activityInfo, donjonLogos, dgDiffs, npcById} from '../shared/rules.js';
import {DIFFS, DUNGEONS, ITEMS, MOBS, NPCS} from '../shared/data.js';
import {ACTIONS, DEFAULT_KEYS, mergeBinds} from '../client/keys.js';

const place = (pl, x, y) => { pl.P.x = x; pl.P.y = y; };
const dgOf = (w, p) => w.maps[p.mapId];
const instances = w => Object.keys(w.maps).filter(k => k !== 'over');
const erreurs = (w, id) => takeEvents(w, id).filter(e => e.t === 'err').map(e => e.text);
const messages = (w, id) => takeEvents(w, id).filter(e => e.t === 'msg').map(e => e.text);
function monde(lvl = 100, seed = 7) {
  const w = createWorld({seed}), p = addPlayer(w, 'p1', {name: 'P1'});
  p.S.lvl = lvl; p.S.hp = 1e6; p.P.combat = 99; takeEvents(w, 'p1');
  return {w, p};
}
const launch = (w, id, dg, ti) => handleAction(w, id, {a: 'launch', dg, ti});

// ---- F09 : touches ----
test('F09-C1 une action « Carte » existe dans les touches configurables, par défaut KeyM', () => {
  const a = ACTIONS.find(x => x[0] === 'map');
  assert.ok(a); assert.equal(a[1], 'Carte'); assert.equal(DEFAULT_KEYS.map, 'KeyM');
  assert.equal(mergeBinds(null).map, 'KeyM');
});
test('F09-C2 la Monture passe sur KeyN, aucune autre touche par défaut ne change, aucun doublon', () => {
  assert.equal(DEFAULT_KEYS.mount, 'KeyN');
  const avant = {up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', s1: 'Digit1', s2: 'Digit2', s3: 'Digit3', s4: 'Digit4', s5: 'Digit5', chouffe: 'Digit6', chips: 'Digit7', target: 'Tab', bag: 'KeyI', char: 'KeyC', chat: 'Enter', opts: 'KeyO'};
  for (const k in avant) assert.equal(DEFAULT_KEYS[k], avant[k], k);
  const vals = ACTIONS.map(a => DEFAULT_KEYS[a[0]]);
  assert.ok(vals.every(Boolean)); assert.equal(new Set(vals).size, vals.length);
});
test('F09-C6 config enregistrée avec la Monture sur KeyM : conservée, Carte sans touche', () => {
  const stored = {...DEFAULT_KEYS, mount: 'KeyM'}; delete stored.map;
  const b = mergeBinds(stored);
  assert.equal(b.mount, 'KeyM'); assert.equal(b.map, null);
  for (const k in stored) assert.equal(b[k], stored[k]);
});
test('F09-C6 limite : config sans conflit sur KeyM (ou vide, ou illisible) donne la Carte par défaut ; config complète personnalisée intacte', () => {
  assert.equal(mergeBinds({mount: 'KeyJ'}).map, 'KeyM'); assert.equal(mergeBinds({mount: 'KeyJ'}).mount, 'KeyJ');
  assert.deepEqual(mergeBinds({}), {...DEFAULT_KEYS}); assert.deepEqual(mergeBinds('n’importe quoi'), {...DEFAULT_KEYS});
  const perso = {...DEFAULT_KEYS, map: 'KeyL', bag: 'KeyB'}; assert.deepEqual(mergeBinds(perso), perso);
  const doublon = {...DEFAULT_KEYS, bag: 'KeyC'}; assert.deepEqual(mergeBinds(doublon), {...DEFAULT_KEYS});
  assert.equal(mergeBinds({map: null, mount: 'KeyM'}).map, null);
});

// ---- F09 : logos ----
test('F09-C4 un logo par donjon de DUNGEONS, à la position de son PNJ d\'entrée', () => {
  const logos = donjonLogos();
  assert.deepEqual(logos.map(l => l.id).sort(), Object.keys(DUNGEONS).sort());
  assert.ok(logos.length >= 7 && logos.some(l => l.id === 'lan'));
  for (const l of logos) {
    const n = NPCS.find(x => x.id === DUNGEONS[l.id].npc);
    assert.equal(l.x, n.x); assert.equal(l.y, n.y); assert.equal(l.n, DUNGEONS[l.id].n);
    assert.equal(l.rl, Math.min(...dgDiffs(l.id).map(d => d.rl)));
  }
});

// ---- F10 : fiche ----
test('F10-C1 la fiche contient nom, desc, astuce, boss, monstres et butin calculés depuis les données', () => {
  for (const id of Object.keys(DUNGEONS)) {
    const dg = DUNGEONS[id], f = activityInfo(id, 100);
    assert.equal(f.n, dg.n); assert.equal(f.desc, dg.desc); assert.equal(f.astuce, dg.astuce);
    const ks = dg.etapes ? dg.etapes[0].kinds : dg.kinds;
    assert.deepEqual(f.mobs, ks.map(k => MOBS[k].n));
    assert.ok(f.butin.length >= 1 && f.butin.every(i => ITEMS[i]), id);
  }
  assert.deepEqual(activityInfo('archives', 1).boss, ['Le Grand Archiviste']);
  assert.equal(activityInfo('soutenance', 1).boss.length, 3);
  assert.deepEqual(activityInfo('bac', 1).butin, ['copie_double']);
});
test('F10-C1 LAN Party : « Aucun boss : nettoyez la salle » et les 2 objets d\'étape', () => {
  const f = activityInfo('lan', 20);
  assert.deepEqual(f.boss, ['Aucun boss : nettoyez la salle']);
  assert.deepEqual(f.butin, DUNGEONS.lan.etapes[0].loot); assert.equal(f.butin.length, 2);
});
test('F10-C2 difficultés avec nom et niveau requis, grisées au-dessus de mon niveau, plus haute accessible présélectionnée', () => {
  const f = activityInfo('bac', 19);
  assert.deepEqual(f.diffs.map(d => [d.n, d.rl]), DIFFS.map((d, i) => [d.n, [15, 18, 21, 25][i]]));
  assert.deepEqual(f.diffs.map(d => d.ok), [true, true, false, false]); assert.equal(f.sel, 1);
  assert.equal(activityInfo('bac', 100).sel, 3); assert.equal(activityInfo('bac', 15).sel, 0);
});
test('F10-C2 limite : niveau sous toutes les difficultés → aucune présélection ; LAN Party : une seule difficulté', () => {
  const f = activityInfo('bac', 14); assert.equal(f.sel, -1); assert.ok(f.diffs.every(d => !d.ok));
  const l = activityInfo('lan', 20); assert.equal(l.diffs.length, 1); assert.equal(l.diffs[0].n, 'Installation'); assert.equal(l.sel, 0);
  assert.equal(activityInfo('lan', 19).sel, -1);
});
test('F10-C2 erreur : donjon inconnu → null', () => { assert.equal(activityInfo('nimportequoi', 50), null); });
test('F10-C3 un donjon ajouté aux données apparaît en logo avec sa fiche, sans autre code', () => {
  const pnj = {id: 'porte_test_f10', kind: 'npc', n: 'Porte', tag: 't', ti: 'x', x: 12.5, y: 33.5, hgt: 1, greet: '.'};
  NPCS.push(pnj);
  DUNGEONS.test_f10 = {n: 'Donjon Test', desc: 'd', astuce: 'a', npc: pnj.id, exit: {x: 1, y: 1}, boss: 'archiviste', kinds: ['spam'], unique: {item: 'grimoire', chance: [0, 0, 0, 0]}};
  try {
    const l = donjonLogos().find(x => x.id === 'test_f10');
    assert.ok(l); assert.equal(l.x, 12.5); assert.equal(l.y, 33.5); assert.equal(l.n, 'Donjon Test');
    const f = activityInfo('test_f10', 10); assert.equal(f.n, 'Donjon Test'); assert.deepEqual(f.boss, ['Le Grand Archiviste']); assert.deepEqual(f.butin, ['grimoire']);
  } finally { delete DUNGEONS.test_f10; NPCS.splice(NPCS.indexOf(pnj), 1); }
});

// ---- F11 : lancement ----
test('F11-C1 COMBAT_TP vaut 5', () => { assert.equal(COMBAT_TP, 5); });
test('F11-C1 lancer entre dans une instance identique à l\'entrée par le PNJ (niveau, monstres, sortie)', () => {
  for (const [dg, ti] of [['bac', 2], ['lan', 0], ['archives', 0]]) {
    const A = monde(), B = monde();
    const n = npcById(DUNGEONS[dg].npc); place(A.p, n.x + 1, n.y + .3);
    handleAction(A.w, 'p1', {a: 'enterDungeon', ti, dg});
    launch(B.w, 'p1', dg, ti);
    const DA = dgOf(A.w, A.p), DB = dgOf(B.w, B.p);
    assert.ok(DA && DB && B.p.mapId !== 'over', dg);
    assert.equal(DB.dg, dg); assert.equal(DB.ti, ti); assert.equal(DB.seed, DA.seed);
    assert.deepEqual(DB.mobs.map(m => [m.type, m.l, m.hp, m.x, m.y]), DA.mobs.map(m => [m.type, m.l, m.hp, m.x, m.y]));
    assert.equal(B.p.P.x, A.p.P.x); assert.equal(B.p.P.y, A.p.P.y);
  }
});
test('F11-C1 niveau requis identique à celui du PNJ ; limite : exactement le niveau requis passe', () => {
  const {w, p} = monde(14); launch(w, 'p1', 'bac', 0);
  assert.equal(p.mapId, 'over'); assert.deepEqual(erreurs(w, 'p1'), ['Niveau 15 requis.']);
  p.S.lvl = 15; launch(w, 'p1', 'bac', 0); assert.notEqual(p.mapId, 'over');
});
test('F11-C2 gratuit et possible depuis n\'importe quel point de la carte du monde', () => {
  for (const [x, y] of [[7.5, 8.5], [21.5, 20.4], [100.5, 40.5]]) {
    const {w, p} = monde(); place(p, x, y); const or = p.S.gold; launch(w, 'p1', 'archives', 0);
    assert.notEqual(p.mapId, 'over', `${x},${y}`); assert.equal(p.S.gold, or);
  }
});
test('F11-C3 refus : mort, duel, échange, déjà en donjon (avec message d\'erreur, sans changer de carte)', () => {
  const cas = {mort: p => { p.P.dead = true; }, duel: p => { p.duel = {with: 'x'}; }, echange: p => { p.trade = {}; }};
  for (const [nom, set] of Object.entries(cas)) {
    const {w, p} = monde(); set(p); launch(w, 'p1', 'archives', 0);
    assert.equal(p.mapId, 'over', nom); assert.equal(instances(w).length, 0, nom);
    assert.equal(erreurs(w, 'p1').length, 1, nom);
  }
  const {w, p} = monde(); launch(w, 'p1', 'archives', 0); takeEvents(w, 'p1'); const m = p.mapId;
  launch(w, 'p1', 'bac', 0); assert.equal(p.mapId, m); assert.equal(erreurs(w, 'p1').length, 1);
});
test('F11-C3 refus en combat : frappé ou frappant depuis moins de COMBAT_TP s ; limite à COMBAT_TP passe', () => {
  const {w, p} = monde(); p.P.combat = COMBAT_TP - .01; launch(w, 'p1', 'archives', 0);
  assert.equal(p.mapId, 'over'); assert.equal(erreurs(w, 'p1').length, 1);
  p.P.combat = COMBAT_TP; launch(w, 'p1', 'archives', 0); assert.notEqual(p.mapId, 'over');
});
test('F11-C3 le combat réel (coup reçu) bloque le lancement ensuite, puis le délai le libère', () => {
  const {w, p} = monde(); p.P.combat = 0; tick(w, .05);
  launch(w, 'p1', 'archives', 0); assert.equal(p.mapId, 'over');
  for (let i = 0; i < Math.ceil(COMBAT_TP * 20) + 2; i++) tick(w, .05);
  takeEvents(w, 'p1'); launch(w, 'p1', 'archives', 0); assert.notEqual(p.mapId, 'over');
});
test('F11-C4 messages exacts', () => {
  const {w, p} = monde(); p.P.combat = 1; launch(w, 'p1', 'archives', 0);
  assert.deepEqual(erreurs(w, 'p1'), ['Impossible en combat. Finissez d\'abord votre bagarre.']);
  p.P.combat = 99; launch(w, 'p1', 'archives', 0); takeEvents(w, 'p1'); launch(w, 'p1', 'bac', 0);
  assert.deepEqual(erreurs(w, 'p1'), ['Vous êtes déjà en donjon.']);
  const q = monde(1); launch(q.w, 'p1', 'soutenance', 3); assert.deepEqual(erreurs(q.w, 'p1'), ['Niveau 100 requis.']);
  const m = monde(); m.p.P.dead = true; launch(m.w, 'p1', 'archives', 0); assert.deepEqual(erreurs(m.w, 'p1'), ['Impossible maintenant.']);
  const d = monde(); d.p.duel = {}; launch(d.w, 'p1', 'archives', 0); assert.deepEqual(erreurs(d.w, 'p1'), ['Impossible maintenant.']);
  const t = monde(); t.p.trade = {}; launch(t.w, 'p1', 'archives', 0); assert.deepEqual(erreurs(t.w, 'p1'), ['Impossible maintenant.']);
});
test('F11-C3 ordre des contrôles : mort avant donjon avant combat avant niveau', () => {
  const {w, p} = monde(1); p.P.dead = true; p.P.combat = 0; launch(w, 'p1', 'bac', 0);
  assert.deepEqual(erreurs(w, 'p1'), ['Impossible maintenant.']);
  p.P.dead = false; launch(w, 'p1', 'bac', 0);
  assert.deepEqual(erreurs(w, 'p1'), ['Impossible en combat. Finissez d\'abord votre bagarre.']);
});
test('F11-C5 arrivée : même message qu\'au PNJ, entrée en solo, /inviter ensuite', () => {
  const {w, p} = monde(); const q = addPlayer(w, 'p2', {name: 'P2'}); q.S.lvl = 100; q.P.combat = 99;
  takeEvents(w, 'p1'); launch(w, 'p1', 'bac', 1);
  const ms = messages(w, 'p1'), dg = DUNGEONS.bac;
  assert.ok(ms.some(t => t.includes(`Vous descendez dans ${dg.n} (${DIFFS[1].n}). ${dg.arrivee}`)));
  assert.ok(ms.some(t => t.includes('/inviter')));
  assert.equal(Object.values(w.players).filter(x => x.mapId === p.mapId).length, 1);
  handleChat(w, 'p1', '/inviter P2'); handleChat(w, 'p2', '/accepter');
  assert.equal(q.mapId, p.mapId);
});
test('F11-C5 deux intentions rapides : une seule instance', () => {
  const {w, p} = monde(); launch(w, 'p1', 'archives', 0); launch(w, 'p1', 'archives', 0); launch(w, 'p1', 'bac', 3);
  assert.equal(instances(w).length, 1); assert.equal(dgOf(w, p).dg, 'archives');
});
test('F11-C6 en sortant, le joueur ressort au point exit du donjon, pas d\'où il a lancé', () => {
  for (const id of ['archives', 'bac', 'lan']) {
    const {w, p} = monde(); place(p, 100.5, 40.5); launch(w, 'p1', id, 0); assert.notEqual(p.mapId, 'over');
    handleAction(w, 'p1', {a: 'leaveDungeon'});
    assert.equal(p.mapId, 'over'); assert.equal(p.P.x, DUNGEONS[id].exit.x); assert.equal(p.P.y, DUNGEONS[id].exit.y);
    assert.equal(instances(w).length, 0);
  }
});
test('F11-C1 cas limites : donjon ou difficulté inexistants ignorés sans erreur ni plantage', () => {
  const {w, p} = monde();
  for (const a of [{dg: 'nimportequoi', ti: 0}, {dg: 'archives', ti: 9}, {dg: 'archives', ti: -1}, {dg: 'archives', ti: 'x'}, {dg: 'lan', ti: 1}, {dg: null, ti: null}, {}, {dg: '__proto__', ti: 0}, {dg: 'constructor', ti: 0}])
    handleAction(w, 'p1', {a: 'launch', ...a});
  assert.equal(p.mapId, 'over'); assert.equal(instances(w).length, 0); assert.deepEqual(erreurs(w, 'p1'), []);
});
