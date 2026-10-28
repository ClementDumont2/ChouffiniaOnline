// Lot 3 : La LAN Party, donjon à étapes (F04 à F07). Constantes du cahier des charges, section 4.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorld, addPlayer, tick, handleAction, handleChat, takeEvents} from '../shared/sim.js';
import {genOverworld, zoneAt, canStand, isSolid} from '../shared/map.js';
import {snapshotFor} from '../shared/protocol.js';
import {fuse, newItem, withUid, stats, itemStats, baseRange} from '../shared/rules.js';
import {DUNGEONS, ITEMS, MOBS, NPCS, SHOP, STOCK, ART_POOL, ART_POOLS} from '../shared/data.js';
import {joueurMoyen} from '../scripts/balance.js';

const LAN_L = 20, LAN_RL = 20, E1_MOBS = 12, E1_GOLD = 400, E1_XP = 1500, E1_RARETE = 'epic', E1_NOBJ = 20, DG_MAX = 4;
const LAN = DUNGEONS.lan, E1 = LAN && LAN.etapes && LAN.etapes[0];
const npc = id => NPCS.find(n => n.id === id);
const place = (pl, x, y) => { pl.P.x = x; pl.P.y = y; };
const run = (w, s) => { for (let i = 0; i < Math.round(s * 20); i++) tick(w, .05); };
const evs = (w, id) => takeEvents(w, id);
const textes = list => list.filter(e => e.t === 'msg').map(e => e.text);

// Un monde, des joueurs niveau 20 increvables ; le premier entre seul par le PNJ, les autres sont invités.
function lan(n = 1, seed = 7) {
  const w = createWorld({seed}), ps = [];
  for (let i = 1; i <= n; i++) { const p = addPlayer(w, 'p' + i, {name: 'P' + i}); p.S.lvl = LAN_RL; p.S.hp = 1e6; p.P.combat = -1e9; ps.push(p); }
  place(ps[0], npc(LAN.npc).x + 1, npc(LAN.npc).y + .3);
  handleAction(w, 'p1', {a: 'enterDungeon', ti: 0, dg: 'lan'});
  for (const p of ps.slice(1)) { handleChat(w, 'p1', `/inviter ${p.S.name}`); handleChat(w, p.id, '/accepter'); }
  return {w, ps, p: ps[0], D: w.maps[ps[0].mapId]};
}
const vivants = D => D.mobs.filter(m => m.alive);
function tue(w, p, m) { m.hp = 1; m.st = 'idle'; place(p, m.x - 1, m.y); p.P.cd = {}; handleAction(w, p.id, {a: 'target', id: m.id}); handleAction(w, p.id, {a: 'skill', i: 0}); }
// Tue tout sauf le dernier, directement (sans passer par la mort normale), puis le dernier par une vraie attaque.
function finir(w, p, D) {
  const l = vivants(D); for (const m of l.slice(0, -1)) { m.alive = false; m.hp = 0; }
  const dernier = l[l.length - 1]; tue(w, p, dernier); return dernier;
}
const coffre = D => D.objs.find(o => o.type === 'chest');
const dernierObj = p => p.S.inv[p.S.inv.length - 1];

// ---- F04 : donjon à étapes ----
test('F04-C3 un donjon déclare des étapes en données ; l\'instance commence à l\'étape 1 (une seule étape en V1)', () => {
  assert.ok(Array.isArray(LAN.etapes) && LAN.etapes.length === 1);
  for (const k of ['n', 'mobs', 'kinds', 'loot', 'rarete', 'nObj', 'gold', 'xp']) assert.ok(E1[k] != null, k);
  assert.equal(LAN.boss, null);
  assert.equal(LAN.diffs.length, 1); assert.equal(LAN.diffs[0].L, LAN_L); assert.equal(LAN.diffs[0].rl, LAN_RL);
  const {D} = lan();
  assert.equal(D.dg, 'lan'); assert.equal(D.etape.i, 0); assert.equal(D.etape.fin, false);
});

test('F04-C3 le format des étapes est documenté en tête de shared/data/dungeons.js', () => {
  const src = readFileSync(new URL('../shared/data/dungeons.js', import.meta.url), 'utf8').split('export const')[0];
  assert.match(src, /etapes/); assert.match(src, /loot/);
});

test('F04-C2 un donjon sans étapes (Archives) garde boss et coffre de boss, sans état d\'étape', () => {
  const w = createWorld({seed: 3}), p = addPlayer(w, 'p1', {name: 'P1'});
  p.S.lvl = 10; p.S.hp = 1e6; p.P.combat = -1e9;
  place(p, npc('gardien').x + 1, npc('gardien').y + .3);
  handleAction(w, 'p1', {a: 'enterDungeon', ti: 0});
  const D = w.maps[p.mapId], boss = D.mobs.find(m => m.d.boss);
  assert.ok(boss); assert.equal(D.etape, undefined);
  for (const m of D.mobs) if (m !== boss) { m.alive = false; m.hp = 0; }
  tue(w, p, boss);
  assert.equal(D.done, true); assert.ok(coffre(D)); assert.equal(coffre(D).butin, undefined);
  for (const id of Object.keys(DUNGEONS)) if (id !== 'lan') assert.equal(DUNGEONS[id].etapes, undefined, id);
});

test('F04-C1 la LAN Party accepte 4 joueurs ; le 5e est refusé avec le message de donjon complet', () => {
  const {w, ps} = lan(3);
  const e = addPlayer(w, 'p5', {name: 'P5'}), f = addPlayer(w, 'p6', {name: 'P6'}); e.S.lvl = f.S.lvl = LAN_RL;
  handleChat(w, 'p1', '/inviter P5'); handleChat(w, 'p1', '/inviter P6'); // 3 présents : les deux invitations partent
  evs(w, 'p5'); evs(w, 'p6');
  handleChat(w, 'p5', '/accepter');
  assert.equal(w.maps[ps[0].mapId].mobs.length, E1_MOBS); assert.equal(e.mapId, ps[0].mapId, 'le 4e entre');
  handleChat(w, 'p6', '/accepter');
  assert.equal(f.mapId, 'over', 'le 5e n\'entre pas');
  assert.ok(textes(evs(w, 'p6')).some(t => /Le donjon est complet/.test(t)));
  handleChat(w, 'p1', '/inviter P6');
  assert.ok(textes(evs(w, 'p1')).includes(`Le donjon est complet (${DG_MAX} joueurs maximum).`));
});

test('F04-C1 un joueur qui quitte puis est réinvité compte de nouveau dans la limite', () => {
  const {w, ps} = lan(4);
  handleAction(w, 'p4', {a: 'leaveDungeon'});
  assert.equal(ps[3].mapId, 'over');
  handleChat(w, 'p1', '/inviter P4'); handleChat(w, 'p4', '/accepter');
  assert.equal(ps[3].mapId, ps[0].mapId);
  const e = addPlayer(w, 'p5', {name: 'P5'}); e.S.lvl = LAN_RL;
  handleChat(w, 'p1', '/inviter P5');
  assert.ok(textes(evs(w, 'p1')).includes(`Le donjon est complet (${DG_MAX} joueurs maximum).`));
});

test('F04-C4 le niveau LAN_RL est exigé à l\'entrée et à l\'invitation', () => {
  const w = createWorld({seed: 4}), p = addPlayer(w, 'p1', {name: 'P1'}), q = addPlayer(w, 'p2', {name: 'P2'});
  p.S.lvl = LAN_RL - 1; place(p, npc(LAN.npc).x + 1, npc(LAN.npc).y + .3);
  handleAction(w, 'p1', {a: 'enterDungeon', ti: 0, dg: 'lan'});
  assert.equal(p.mapId, 'over');
  assert.ok(evs(w, 'p1').some(e => e.t === 'err' && new RegExp(`Niveau ${LAN_RL} requis`).test(e.text || e.msg || '')));
  p.S.lvl = LAN_RL; handleAction(w, 'p1', {a: 'enterDungeon', ti: 0, dg: 'lan'});
  assert.notEqual(p.mapId, 'over');
  q.S.lvl = LAN_RL - 1; handleChat(w, 'p1', '/inviter P2'); evs(w, 'p2'); handleChat(w, 'p2', '/accepter');
  assert.equal(q.mapId, 'over');
  assert.ok(textes(evs(w, 'p2')).some(t => new RegExp(`Niveau ${LAN_RL} requis`).test(t)));
  q.S.lvl = LAN_RL; handleChat(w, 'p1', '/inviter P2'); handleChat(w, 'p2', '/accepter');
  assert.equal(q.mapId, p.mapId);
});

test('F04-C5 chaque arrivée renforce les monstres vivants de 0,6 × PV par joueur en plus', () => {
  const {w, D} = lan(1);
  const m = D.mobs[0], pv1 = m.mhp, mort = D.mobs[1]; mort.alive = false;
  for (const n of [2, 3]) {
    const p = addPlayer(w, 'p' + n, {name: 'P' + n}); p.S.lvl = LAN_RL;
    handleChat(w, 'p1', `/inviter P${n}`); handleChat(w, 'p' + n, '/accepter');
    assert.ok(Math.abs(m.mhp - pv1 * (1 + .6 * (n - 1))) <= 1.5, `${n} joueurs : ${m.mhp}`); // arrondi à chaque arrivée, comme la règle existante
  }
});

// ---- F05 : étape 1 ----
test('F05-C1 l\'étape 1 contient E1_MOBS monstres des types de l\'étape, niveau LAN_L, sans boss', () => {
  const {D} = lan();
  assert.equal(D.mobs.length, E1_MOBS);
  assert.ok(D.mobs.every(m => E1.kinds.includes(m.type) && m.l === LAN_L && !m.d.boss && m.alive));
  assert.deepEqual([...E1.kinds].sort(), ['cable', 'multiprise', 'pote']);
  assert.equal(E1.mobs, E1_MOBS);
});

test('F05-C2 les monstres de l\'étape ne réapparaissent pas', () => {
  const {w, p, D} = lan();
  tue(w, p, D.mobs[0]);
  assert.equal(vivants(D).length, E1_MOBS - 1);
  p.P.hp = 1e9; place(p, D.sx, D.sy);
  run(w, 120);
  assert.equal(vivants(D).length, E1_MOBS - 1); assert.equal(D.mobs.length, E1_MOBS);
});

test('F05-C3 au dernier monstre : une seule bannière « Étape 1 terminée : L\'Installation » par joueur, étape terminée', () => {
  const {w, ps, p, D} = lan(2);
  evs(w, 'p1'); evs(w, 'p2');
  const l = vivants(D); for (const m of l.slice(0, -1)) { m.alive = false; m.hp = 0; }
  assert.equal(D.etape.fin, false);
  tue(w, p, l[l.length - 1]);
  run(w, 2);
  for (const id of ['p1', 'p2']) {
    const b = evs(w, id).filter(e => e.t === 'banner' && e.title === 'Étape 1 terminée : L\'Installation');
    assert.equal(b.length, 1, id);
  }
  assert.equal(D.etape.fin, true);
  // Frapper de nouveau un mort ne redéclenche rien.
  handleAction(w, 'p1', {a: 'target', id: l[0].id}); run(w, 1);
  assert.equal(evs(w, 'p1').filter(e => e.t === 'banner' && /Étape 1/.test(e.title)).length, 0);
});

test('F05-C3 deux monstres tués dans le même tick : fin déclenchée une seule fois', () => {
  const {w, p, D} = lan();
  evs(w, 'p1');
  const l = vivants(D); for (const m of l.slice(0, -2)) { m.alive = false; m.hp = 0; }
  const [a, b] = l.slice(-2); a.hp = 1; b.hp = 1; place(p, a.x - 1, a.y); b.x = a.x; b.y = a.y; b.st = a.st = 'idle';
  p.P.cd = {}; handleAction(w, 'p1', {a: 'target', id: a.id}); handleAction(w, 'p1', {a: 'skill', i: 0});
  handleAction(w, 'p1', {a: 'target', id: b.id}); p.P.cd = {}; handleAction(w, 'p1', {a: 'skill', i: 0}); // sans tick entre les deux
  assert.equal(vivants(D).length, 0);
  assert.equal(evs(w, 'p1').filter(e => e.t === 'banner' && /Étape 1 terminée/.test(e.title)).length, 1);
  assert.equal(D.objs.filter(o => o.type === 'chest').length, 1);
});

test('F05-C4 le compteur « Monstres restants » est dans le snapshot de chaque joueur de l\'instance et baisse de 1 par mort', () => {
  const {w, ps, p, D} = lan(2);
  for (const id of ['p1', 'p2']) {
    const priv = snapshotFor(w, id).ents.find(e => e.id === id).priv;
    assert.deepEqual([priv.etape.restants, priv.etape.total, priv.etape.fin], [E1_MOBS, E1_MOBS, false]);
  }
  for (let i = 1; i <= 3; i++) {
    tue(w, p, vivants(D)[0]);
    for (const id of ['p1', 'p2']) assert.equal(snapshotFor(w, id).ents.find(e => e.id === id).priv.etape.restants, E1_MOBS - i);
  }
  // Hors donjon, pas de compteur ; un donjon sans étapes non plus.
  handleAction(w, 'p2', {a: 'leaveDungeon'});
  assert.ok(!snapshotFor(w, 'p2').ents.find(e => e.id === 'p2').priv.etape);
});

test('F05-C4 le HUD affiche « Monstres restants : N / total » (code client)', () => {
  const hud = readFileSync(new URL('../client/hud.js', import.meta.url), 'utf8');
  assert.match(hud, /Monstres restants/);
});

test('F05-C5 l\'étape terminée fait apparaître une sortie qui ramène au point de sortie du donjon', () => {
  const {w, p, D} = lan();
  assert.ok(!D.objs.some(o => o.type === 'portal' && o.exit));
  const dernier = finir(w, p, D);
  const sortie = D.objs.find(o => o.type === 'portal' && o.exit);
  assert.ok(sortie); assert.ok(Math.hypot(sortie.x - dernier.x, sortie.y - dernier.y) < 3);
  assert.ok(snapshotFor(w, 'p1').ents.some(e => e.type === 'portal' && e.exit));
  handleAction(w, 'p1', {a: 'leaveDungeon'});
  assert.equal(p.mapId, 'over'); assert.ok(Math.hypot(p.P.x - LAN.exit.x, p.P.y - LAN.exit.y) < .1);
  assert.equal(zoneAt(w.maps.over, p.P.x, p.P.y), 'bourg');
});

test('F05-C5 la mort du joueur ne réinitialise pas l\'étape (comportement de mort des donjons conservé)', () => {
  const {w, p, D} = lan();
  for (let i = 0; i < 3; i++) tue(w, p, vivants(D)[0]);
  p.S.hp = 0; p.P.hp = 0;
  const m = vivants(D)[0]; place(p, m.x - .5, m.y); m.st = 'chase'; m.target = 'p1'; m.threat = {p1: 1}; p.S.hp = 1;
  run(w, 10);
  assert.equal(p.P.dead, true);
  handleAction(w, 'p1', {a: 'respawn'});
  assert.equal(vivants(D).length, E1_MOBS - 3); assert.equal(D.etape.fin, false); assert.equal(D.mobs.length, E1_MOBS);
});

// ---- F06 : butin exclusif ----
test('F06-C1 l\'étape 1 déclare exactement 2 équipements distincts, absents de tout autre butin', () => {
  assert.equal(E1.loot.length, 2); assert.notEqual(E1.loot[0], E1.loot[1]);
  for (const id of E1.loot) {
    assert.equal(ITEMS[id].t, 'eq');
    const ailleurs = JSON.stringify({SHOP, STOCK, ART_POOL, ART_POOLS, mobs: Object.values(MOBS).map(m => m.loot), uniques: Object.values(DUNGEONS).map(d => d.unique)});
    assert.ok(!ailleurs.includes(`"${id}"`), `${id} trouvé ailleurs`);
  }
  const dropsDeLan = JSON.stringify(E1.kinds.map(k => MOBS[k].loot));
  for (const id of E1.loot) assert.ok(!dropsDeLan.includes(id));
});

test('F06-C2 chaque joueur présent tire l\'un des 2 objets (50 %), rareté epic et niveau d\'objet 20 : 450 à 550 sur 1000 tirages', () => {
  const {w, p} = lan(1, 11), n = {}; let D = w.maps[p.mapId];
  for (let i = 0; i < 1000; i++) {
    if (i) { place(p, npc(LAN.npc).x + 1, npc(LAN.npc).y + .3); handleAction(w, 'p1', {a: 'enterDungeon', ti: 0, dg: 'lan'}); D = w.maps[p.mapId]; }
    p.S.inv = []; finir(w, p, D);
    place(p, coffre(D).x, coffre(D).y + 1); handleAction(w, 'p1', {a: 'openChest', id: coffre(D).id});
    const q = dernierObj(p); assert.ok(E1.loot.includes(q.id)); assert.equal(q.rarete, E1_RARETE); assert.equal(q.nObj, E1_NOBJ);
    n[q.id] = (n[q.id] || 0) + 1;
    handleAction(w, 'p1', {a: 'leaveDungeon'});
  }
  for (const id of E1.loot) assert.ok(n[id] >= 450 && n[id] <= 550, `${id} : ${n[id]}`);
});

test('F06-C3 les tirages des joueurs sont indépendants : deux joueurs peuvent recevoir le même objet', () => {
  const {w, ps, p} = lan(2, 5); let D = w.maps[p.mapId], mem = 0, diff = 0;
  for (let i = 0; i < 60; i++) {
    if (i) { for (const q of ps) { q.mapId === 'over' || handleAction(w, q.id, {a: 'leaveDungeon'}); } place(p, npc(LAN.npc).x + 1, npc(LAN.npc).y + .3); handleAction(w, 'p1', {a: 'enterDungeon', ti: 0, dg: 'lan'}); handleChat(w, 'p1', '/inviter P2'); handleChat(w, 'p2', '/accepter'); D = w.maps[p.mapId]; }
    for (const q of ps) q.S.inv = [];
    finir(w, p, D);
    for (const q of ps) { place(q, coffre(D).x, coffre(D).y + 1); handleAction(w, q.id, {a: 'openChest', id: coffre(D).id}); }
    const [x, y] = ps.map(q => q.S.inv.find(s => E1.loot.includes(s.id)).id); if (x === y) mem++; else diff++;
  }
  assert.ok(mem > 5 && diff > 5, `mêmes ${mem}, différents ${diff}`);
});

test('F06-C4 chaque joueur présent reçoit E1_GOLD po et E1_XP XP à la fin de l\'étape', () => {
  const {w, ps, p, D} = lan(2);
  const or = ps.map(q => q.S.gold); evs(w, 'p1'); evs(w, 'p2');
  finir(w, p, D);
  const g1 = ps[0].S.gold - or[0], g2 = ps[1].S.gold - or[1];
  assert.ok(g1 >= E1_GOLD && g1 <= E1_GOLD + 2 * LAN_L, `or p1 ${g1}`);
  assert.equal(g2, E1_GOLD);
  for (const id of ['p1', 'p2']) assert.ok(textes(evs(w, id)).some(t => new RegExp(`${E1_XP} points d'expérience`).test(t)), id);
});

test('F06-C5 le butin est dans un coffre personnel à l\'endroit du dernier monstre ; l\'ouvrir met l\'objet au sac avec son lien', () => {
  const {w, ps, p, D} = lan(2);
  const dernier = finir(w, p, D), c = coffre(D);
  assert.equal(D.objs.filter(o => o.type === 'chest').length, 1);
  assert.equal(c.x, dernier.x); assert.equal(c.y, dernier.y); assert.equal(c.n, LAN.coffre);
  evs(w, 'p1');
  place(p, c.x, c.y + 1); handleAction(w, 'p1', {a: 'openChest', id: c.id});
  const q = dernierObj(p); assert.ok(E1.loot.includes(q.id));
  assert.ok(textes(evs(w, 'p1')).some(t => /Vous recevez le butin/.test(t) && t.includes(q.id)));
  assert.equal(snapshotFor(w, 'p1').ents.find(e => e.id === c.id).opened, true);
  assert.equal(snapshotFor(w, 'p2').ents.find(e => e.id === c.id).opened, false, 'personnel');
  handleAction(w, 'p1', {a: 'openChest', id: c.id});
  assert.equal(p.S.inv.filter(s => E1.loot.includes(s.id)).length, 1, 'une seule fois');
  place(ps[1], c.x, c.y + 1); handleAction(w, 'p2', {a: 'openChest', id: c.id});
  assert.ok(ps[1].S.inv.some(s => E1.loot.includes(s.id)), 'le second joueur a le sien');
});

test('F06-C6 sac plein : message exact, objet pas perdu, coffre rouvrable une fois de la place faite', () => {
  const {w, p, D} = lan();
  p.S.inv = Array.from({length: 24}, (_, i) => withUid(p.S, newItem('regle', 1, 'common')));
  finir(w, p, D); const c = coffre(D);
  evs(w, 'p1'); place(p, c.x, c.y + 1); handleAction(w, 'p1', {a: 'openChest', id: c.id});
  assert.ok(textes(evs(w, 'p1')).includes('Sac plein. Faites de la place puis rouvrez le coffre.'));
  assert.equal(p.S.inv.length, 24); assert.ok(!p.S.inv.some(s => E1.loot.includes(s.id)));
  p.S.inv.pop(); handleAction(w, 'p1', {a: 'openChest', id: c.id});
  assert.ok(p.S.inv.some(s => E1.loot.includes(s.id)), 'rouvert avec de la place');
});

test('F06-C7 arrivé après la fin de l\'étape : ni objet, ni or, ni XP', () => {
  const {w, p, D} = lan(1);
  finir(w, p, D);
  const t = addPlayer(w, 'p2', {name: 'P2'}); t.S.lvl = LAN_RL; const or = t.S.gold, xp = t.S.xp;
  handleChat(w, 'p1', '/inviter P2'); handleChat(w, 'p2', '/accepter');
  assert.equal(t.mapId, p.mapId, 'peut rejoindre');
  assert.equal(t.S.gold, or); assert.equal(t.S.xp, xp);
  const c = coffre(D); place(t, c.x, c.y + 1); handleAction(w, 'p2', {a: 'openChest', id: c.id});
  assert.ok(!t.S.inv.some(s => E1.loot.includes(s.id)));
  assert.ok(!textes(evs(w, 'p2')).some(x => /points d'expérience/.test(x)));
});

test('F06-C6 coffre non ouvert à la sortie : butin perdu', () => {
  const {w, ps, p, D} = lan(2);
  finir(w, p, D);
  handleAction(w, 'p1', {a: 'leaveDungeon'});
  assert.ok(!p.S.inv.some(s => E1.loot.includes(s.id)));
  const c = coffre(D); place(ps[1], c.x, c.y + 1); handleAction(w, 'p2', {a: 'openChest', id: c.id});
  handleAction(w, 'p1', {a: 'openChest', id: c.id});
  assert.ok(!p.S.inv.some(s => E1.loot.includes(s.id)), 'p1 ne peut plus rien ouvrir');
});

test('F06-C8 les deux objets se vendent, s\'échangent et se fusionnent comme les autres équipements', () => {
  const w = createWorld({seed: 9}), a = addPlayer(w, 'a', {name: 'Alice'}), b = addPlayer(w, 'b', {name: 'Bob'});
  const mk = id => withUid(a.S, newItem(id, E1_NOBJ, E1_RARETE));
  a.S.inv = [mk(E1.loot[0]), mk(E1.loot[0]), mk(E1.loot[1])];
  // Vente
  place(a, npc('gerard').x + 1, npc('gerard').y); const or = a.S.gold;
  handleAction(w, 'a', {a: 'sell', idx: 2}); assert.ok(a.S.gold > or); assert.equal(a.S.inv.length, 2);
  // Fusion
  const f = fuse(a.S.inv[0], a.S.inv[1]); assert.equal(f.rarete, 'leg'); assert.equal(f.nObj, E1_NOBJ + 2);
  place(a, npc('fanfiqueuse').x + 1, npc('fanfiqueuse').y); a.S.gold = 1e6;
  handleAction(w, 'a', {a: 'fuse', x: a.S.inv[0].uid, y: a.S.inv[1].uid});
  assert.equal(a.S.inv.length, 1); assert.equal(a.S.inv[0].rarete, 'leg');
  // Échange
  handleChat(w, 'a', '/echanger bob'); handleChat(w, 'b', '/accepter');
  handleAction(w, 'a', {a: 'tradeOffer', items: [{uid: a.S.inv[0].uid}], gold: 0}); handleAction(w, 'b', {a: 'tradeOffer', items: [], gold: 0});
  handleAction(w, 'a', {a: 'tradeOk'}); handleAction(w, 'b', {a: 'tradeOk'});
  assert.equal(a.S.inv.length, 0); assert.ok(b.S.inv.some(s => E1.loot.includes(s.id)));
});

// ---- F07 : contenu ----
test('F07-C1 « L\'Orga de la LAN » : dernier PNJ, dans le Bourg-Forum, sur une case praticable et accessible, avec npc.dungeon', () => {
  const n = NPCS[NPCS.length - 1];
  assert.equal(NPCS[0].id, NPCS.find(x => x.n.includes('Sage')).id);
  assert.equal(n.dungeon, 'lan'); assert.equal(n.id, LAN.npc); assert.match(n.n, /Orga de la LAN/);
  const map = genOverworld(20111);
  assert.equal(zoneAt(map, n.x, n.y), 'bourg'); assert.ok(canStand(map, n.x, n.y)); assert.ok(!isSolid(map, Math.floor(n.x), Math.floor(n.y)));
  // Joignable à pied depuis l'entrée du Bourg.
  const W = map.w, seen = new Set(), q = [[21, 20]]; seen.add(20 * W + 21);
  while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= map.h || seen.has(ny * W + nx) || !canStand(map, nx + .5, ny + .5)) continue; seen.add(ny * W + nx); q.push([nx, ny]); } }
  assert.ok([[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(Math.floor(n.y + dy) * W + Math.floor(n.x + dx))));
  for (const o of NPCS) if (o !== n) assert.ok(Math.hypot(o.x - n.x, o.y - n.y) > 1.2, `trop près de ${o.id}`);
  assert.ok(Math.hypot(LAN.exit.x - n.x, LAN.exit.y - n.y) < 6); assert.ok(canStand(map, LAN.exit.x, LAN.exit.y));
});

test('F07-C2 les 3 nouveaux monstres sont déclarés, niveau 20, dessinés dans sprites.js', () => {
  for (const [id, nom] of [['cable', 'Câble Emmêlé'], ['multiprise', 'Multiprise Surchargée'], ['pote', 'Pote Sans Sa Tour']]) {
    assert.equal(MOBS[id].n, nom); assert.ok(MOBS[id].lines.length >= 3); assert.ok(MOBS[id].v);
    assert.ok(!MOBS[id].boss);
  }
  const spr = readFileSync(new URL('../client/sprites.js', import.meta.url), 'utf8');
  for (const id of ['cable', 'multiprise', 'pote']) assert.ok(spr.includes(`m.type==='${id}'`), id);
});

test('F07-C3 les 2 objets : Multiprise Parafoudre (arme, corps à corps) et Tapis de Souris XXL (torse, cape)', () => {
  const [a, t] = [ITEMS.multiprise_parafoudre, ITEMS.tapis_xxl];
  assert.equal(a.n, 'Multiprise Parafoudre'); assert.equal(a.s, 'arme'); assert.equal(a.rg, undefined); assert.equal(a.t, 'eq');
  assert.equal(t.n, 'Tapis de Souris XXL'); assert.equal(t.s, 'torse'); assert.equal(t.t, 'eq');
  assert.deepEqual([...E1.loot].sort(), ['multiprise_parafoudre', 'tapis_xxl']);
  assert.ok(a.d.length > 20 && t.d.length > 20);
  assert.equal(baseRange({cls: 'chouffin', eq: {arme: newItem('multiprise_parafoudre', 20, 'epic')}}), baseRange({cls: 'chouffin', eq: {}}));
  const spr = readFileSync(new URL('../client/sprites.js', import.meta.url), 'utf8');
  assert.ok(spr.includes('tapis_xxl') && spr.includes('multiprise_parafoudre'));
  for (const id of ['multiprise_parafoudre', 'tapis_xxl']) assert.ok(Object.values(itemStats(newItem(id, 20, 'epic'))).some(v => v > 0));
});

test('F07-C4 le donjon a tous les textes des autres donjons, non vides', () => {
  for (const k of ['n', 'desc', 'astuce', 'court', 'fini', 'sortie', 'coffre', 'retour', 'arrivee'])
    assert.ok(typeof LAN[k] === 'string' && LAN[k].trim().length > 3, `texte « ${k} » manquant`);
  for (const k of ['desc', 'astuce', 'arrivee', 'sortie', 'retour', 'coffre']) assert.ok(LAN[k].length > 10, k);
});

test('F07-C4 le menu d\'entrée ne propose que la difficulté unique de la LAN (code client)', () => {
  const p = readFileSync(new URL('../client/panels.js', import.meta.url), 'utf8');
  assert.match(p, /etapes/);
});

test('F07-C6 un joueur moyen niveau 20 seul finit l\'étape 1 sans mourir dans plus de 50 % des simulations', () => {
  let ok = 0; const N = 20;
  for (let s = 0; s < N; s++) {
    const w = createWorld({seed: 100 + s}), {S} = joueurMoyen(LAN_RL), st = stats(S);
    S.hp = st.maxhp; S.caf = st.maxcaf; S.name = 'Moy';
    const p = addPlayer(w, 'p1', {save: S}); p.P.combat = -1e9;
    place(p, npc(LAN.npc).x + 1, npc(LAN.npc).y + .3);
    handleAction(w, 'p1', {a: 'enterDungeon', ti: 0, dg: 'lan'});
    const D = w.maps[p.mapId];
    for (let t = 0; t < 20 * 900 && !p.P.dead && !D.etape.fin; t++) {
      if (t % 10 === 0) {
        const cur = D.mobs.find(m => m.id === p.P.target && m.alive);
        if (!cur) { const c = vivants(D).sort((a, b) => Math.hypot(a.x - p.P.x, a.y - p.P.y) - Math.hypot(b.x - p.P.x, b.y - p.P.y))[0]; if (c) { place(p, c.x - 1.2, c.y); handleAction(w, 'p1', {a: 'target', id: c.id, auto: true}); } }
        if (p.S.hp < .45 * stats(p.S).maxhp) handleAction(w, 'p1', {a: 'skill', i: 3});
      }
      tick(w, .05);
    }
    if (!p.P.dead && D.etape.fin) ok++;
  }
  assert.ok(ok / N > .5, `${ok}/${N} réussites`);
});
