import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld, addPlayer, tick, handleAction, handleChat, takeEvents} from '../shared/sim.js';
import {stats, newItem, baseRange, ARME_RG, ARME_DIST_MULT} from '../shared/rules.js';
import {rngTools} from '../shared/rng.js';
import {ITEMS, STOCK, SHOP, NPCS} from '../shared/data.js';
import {NEW_NPCS} from '../shared/data/zones.js';
import {CLASSES, SKILL_DEFS} from '../shared/data/classes.js';

const ARMES = {lance_pierre: 3, pistolet_billes: 15, nerf_garage: 40};
const place = (pl, x, y) => { pl.P.x = x; pl.P.y = y; };
const herbe = w => w.maps.over.mobs.find(m => m.type === 'herbe');
const run = (w, secs) => { for (let i = 0; i < secs * 20; i++) tick(w, .05); };
const rg0 = cls => SKILL_DEFS[CLASSES[cls].skills[0]].rg;
// Chouffin (ou autre classe) niveau 50, mob immobile à très gros PV, à d cases à gauche ; dégâts déterministes (jet = 100 %, jamais de critique).
function monde(cls = 'chouffin', arme = null, d = 1) {
  const w = createWorld({seed: 1}), m = herbe(w), p = addPlayer(w, 'p1', {name: 'P1', cls});
  p.S.lvl = 50; p.S.hp = stats(p.S).maxhp; p.S.caf = 99;
  if (arme) p.S.eq.arme = newItem(arme);
  place(p, m.x - d, m.y);
  m.hp = m.mhp = 1e6; m.stun = 1e6;
  w.rnd = () => .5; w.r = rngTools(() => .5);
  return {w, p, m};
}
const coup = (w, id, m, i = 0) => { const p = w.players[id]; p.P.cd = {}; handleAction(w, id, {a: 'target', id: m.id}); const h = m.hp; handleAction(w, id, {a: 'skill', i}); return h - m.hp; };
const evs = (w, id) => takeEvents(w, id);
// Coups portés (le serveur régénère les monstres hors combat : on compte les messages de combat plutôt que les PV).
const coups = (w, id) => evs(w, id).filter(e => e.t === 'msg' && e.cls === 'cb' && /^Votre .* inflige/.test(e.text)).length;

test('F08-C1 les armes à distance déclarent une portée (> portée du Chouffin), et ARME_RG vaut 5', () => {
  assert.equal(ARME_RG, 5);
  for (const id of Object.keys(ARMES)) assert.ok(ITEMS[id].rg > 1.6, id);
  assert.equal(ITEMS.lance_pierre.rg, ARME_RG);
});

test('F08-C1 baseRange : max(portée de la compétence 1, portée de l\'arme), pour toutes les classes', () => {
  for (const cls of Object.keys(CLASSES)) {
    const S = {cls, lvl: 50, eq: {}};
    assert.equal(baseRange(S), rg0(cls), `${cls} sans arme`);
    S.eq.arme = newItem('pistolet_billes');
    assert.equal(baseRange(S), Math.max(rg0(cls), ITEMS.pistolet_billes.rg), `${cls} avec arme`);
    S.eq.arme = newItem('katana');
    assert.equal(baseRange(S), rg0(cls), `${cls} avec arme de mêlée`);
  }
  assert.equal(baseRange({cls: 'inconnue', lvl: 1, eq: {}}), rg0('chouffin'), 'classe inconnue = Chouffin');
});

test('F08-C1 les compétences 2 à 5 gardent leur portée : « En fait... » (4,5) refuse à 4,8 cases malgré l\'arme', () => {
  const {w, p, m} = monde('chouffin', 'lance_pierre', 4.8);
  p.S.lvl = 50;
  assert.equal(coup(w, 'p1', m, 1), 0);
  assert.ok(evs(w, 'p1').some(e => e.t === 'err' && /Hors de portée/.test(e.text)));
  place(p, m.x - 4, m.y);
  assert.ok(coup(w, 'p1', m, 1) > 0, 'à 4 cases, dans la portée de la compétence 2');
});

test('F08-C2 au-delà de la portée de la compétence 1 : ARME_DIST_MULT des dégâts ; en deçà : dégâts normaux (toutes classes)', () => {
  assert.equal(ARME_DIST_MULT, .8);
  for (const cls of ['chouffin', 'speedrunner', 'modo']) {
    const {w, p, m} = monde(cls, 'pistolet_billes', .5), r = rg0(cls);
    const normal = coup(w, 'p1', m);
    assert.ok(normal > 0, cls);
    place(p, m.x - (r - .1), m.y);
    assert.equal(coup(w, 'p1', m), normal, `${cls} juste en deçà de ${r}`);
    place(p, m.x - (r + .3), m.y);
    assert.ok(Math.abs(coup(w, 'p1', m) - normal * ARME_DIST_MULT) <= 1, `${cls} au-delà de ${r}`);
  }
});

test('F08-C2 Rôliste : aucun malus sous 5 cases, même avec une arme à distance', () => {
  const {w, p, m} = monde('roliste', 'pistolet_billes', .5), atk = stats(p.S).atk;
  for (const d of [.5, 4.5, 4.9]) { place(p, m.x - d, m.y); assert.equal(coup(w, 'p1', m), atk, `à ${d} cases`); }
  assert.ok(!evs(w, 'p1').some(e => e.t === 'proj'), 'pas de projectile sous 5 cases');
});

test('F08-C3 arme de portée 5 : un Chouffin touche à 4 cases sans bouger', () => {
  const {w, p, m} = monde('chouffin', 'lance_pierre', 4);
  const x = p.P.x;
  assert.ok(coup(w, 'p1', m) > 0);
  assert.equal(p.P.x, x);
  assert.ok(!evs(w, 'p1').some(e => e.t === 'approach'));
});

test('F08-C3 à 6 cases : attaque de base = événement approach (comme aujourd\'hui), pas de dégât', () => {
  const {w, p, m} = monde('chouffin', 'lance_pierre', 6);
  evs(w, 'p1');
  assert.equal(coup(w, 'p1', m), 0);
  const e = evs(w, 'p1');
  assert.ok(e.some(x => x.t === 'approach' && x.id === m.id));
  assert.ok(!e.some(x => x.t === 'err'));
});

test('F08-C3 sans arme, la portée reste celle de la classe (4 cases = approach)', () => {
  const {w, m} = monde('chouffin', null, 4);
  evs(w, 'p1');
  assert.equal(coup(w, 'p1', m), 0);
  assert.ok(evs(w, 'p1').some(x => x.t === 'approach'));
});

test('F08-C4 l\'auto-attaque continue à 4 cases avec l\'arme, sans approcher', () => {
  const {w, p, m} = monde('chouffin', 'lance_pierre', 4);
  handleAction(w, 'p1', {a: 'target', id: m.id}); p.P.auto = true; p.P.cd = {};
  const x = p.P.x;
  evs(w, 'p1'); run(w, 5);
  assert.ok(coups(w, 'p1') >= 3, 'des coups sont partis tout seuls');
  assert.equal(p.P.x, x);
});

test('F08-C4 sans arme, aucune auto-attaque à 4 cases', () => {
  const {w, p, m} = monde('chouffin', null, 4);
  handleAction(w, 'p1', {a: 'target', id: m.id}); p.P.auto = true; p.P.cd = {};
  evs(w, 'p1'); run(w, 3);
  assert.equal(coups(w, 'p1'), 0);
});

test('F08-C4 cas limite : retirer l\'arme pendant une auto-attaque, la portée redevient celle de la classe', () => {
  const {w, p, m} = monde('chouffin', 'lance_pierre', 4);
  handleAction(w, 'p1', {a: 'target', id: m.id}); p.P.auto = true; p.P.cd = {};
  evs(w, 'p1'); run(w, 3);
  assert.ok(coups(w, 'p1') >= 2);
  handleAction(w, 'p1', {a: 'unequip', slot: 'arme'});
  if (p.S.eq.arme) delete p.S.eq.arme; // filet : le nom du champ de l'action peut varier
  assert.equal(baseRange(p.S), 1.6);
  evs(w, 'p1'); run(w, 3);
  assert.equal(coups(w, 'p1'), 0, 'plus aucun coup à 4 cases');
});

test('F08-C7 duel : la portée et ARME_DIST_MULT se cumulent avec le ×0,5 PvP', () => {
  const w = createWorld({seed: 1}), a = addPlayer(w, 'a', {name: 'Alice'}), b = addPlayer(w, 'b', {name: 'Bob'});
  for (const p of [a, b]) { p.S.lvl = 10; p.S.hp = stats(p.S).maxhp; }
  a.S.eq.arme = newItem('lance_pierre');
  place(a, 33, 16); place(b, 37, 16);
  w.rnd = () => .5; w.r = rngTools(() => .5);
  handleChat(w, 'a', '/duel bob'); handleChat(w, 'b', '/accepter');
  run(w, 3.5);
  assert.equal(a.duel.phase, 'fight');
  const atk = stats(a.S).atk, hp = b.S.hp, red = stats(b.S).red;
  a.P.cd = {}; handleAction(w, 'a', {a: 'target', id: 'b'}); handleAction(w, 'a', {a: 'skill', i: 0});
  assert.equal(hp - b.S.hp, Math.max(1, Math.round(atk * ARME_DIST_MULT * .5 * (1 - red))), 'touché à 4 cases');
  place(b, 33 + 7, 16); b.S.hp = hp; a.P.cd = {};
  handleAction(w, 'a', {a: 'skill', i: 0});
  assert.equal(b.S.hp, hp, 'hors de portée à 7 cases');
});

test('F08-C7 duel : au contact, seul le ×0,5 PvP s\'applique', () => {
  const w = createWorld({seed: 1}), a = addPlayer(w, 'a', {name: 'Alice'}), b = addPlayer(w, 'b', {name: 'Bob'});
  for (const p of [a, b]) { p.S.lvl = 10; p.S.hp = stats(p.S).maxhp; }
  a.S.eq.arme = newItem('lance_pierre');
  place(a, 33, 16); place(b, 34, 16);
  w.rnd = () => .5; w.r = rngTools(() => .5);
  handleChat(w, 'a', '/duel bob'); handleChat(w, 'b', '/accepter');
  run(w, 3.5);
  const atk = stats(a.S).atk, hp = b.S.hp, red = stats(b.S).red;
  a.P.cd = {}; handleAction(w, 'a', {a: 'target', id: 'b'}); handleAction(w, 'a', {a: 'skill', i: 0});
  assert.equal(hp - b.S.hp, Math.max(1, Math.round(atk * .5 * (1 - red))));
});

test('F08-C6 un projectile (événement proj) part à chaque attaque de base à distance, vu par les autres joueurs de la carte, pas au contact', () => {
  const {w, p, m} = monde('chouffin', 'lance_pierre', 4);
  const o = addPlayer(w, 'o', {name: 'Obs'}); place(o, p.P.x, p.P.y + 1);
  evs(w, 'p1'); evs(w, 'o');
  coup(w, 'p1', m);
  for (const id of ['p1', 'o']) {
    const pr = evs(w, id).filter(e => e.t === 'proj');
    assert.equal(pr.length, 1, id);
    assert.deepEqual([pr[0].x, pr[0].y, pr[0].tx, pr[0].ty], [p.P.x, pr[0].y, m.x, pr[0].ty]);
  }
  place(p, m.x - 1, m.y); evs(w, 'p1');
  coup(w, 'p1', m);
  assert.ok(!evs(w, 'p1').some(e => e.t === 'proj'), 'au contact : pas de projectile');
});

test('F08-C8 les 3 armes existent (slot arme, niveaux demandés, noms, descriptions) et ont une source', () => {
  const noms = {lance_pierre: 'Lance-Pierre à Élastique de Bureau', pistolet_billes: 'Pistolet à Billes de la Fête Foraine', nerf_garage: 'Nerf Modifié en Garage'};
  for (const [id, rl] of Object.entries(ARMES)) {
    const it = ITEMS[id];
    assert.ok(it, id);
    assert.equal(it.t, 'eq'); assert.equal(it.s, 'arme'); assert.equal(it.rl, rl); assert.equal(it.n, noms[id]);
    assert.ok(it.d && it.d.length > 15 && it.d.length < 200, id);
    assert.ok(it.rg > 1.6, id);
    assert.ok(it.atk > 0, id);
  }
});

test('F08-C8 sources : Bernard (niv. 3), marchand du Parking 15–25 (niv. 15), marchand du Pôle 40–55 (niv. 40)', () => {
  assert.ok(SHOP.armes.includes('lance_pierre'));
  assert.ok(STOCK.bernard.includes('lance_pierre'));
  assert.ok(STOCK.cantine.includes('pistolet_billes'));
  assert.ok(STOCK.sauvette.includes('nerf_garage'));
  const pnj = id => [...NPCS, ...NEW_NPCS].find(n => n.id === id);
  assert.match(pnj('cantine').ti, /15–25/);
  assert.match(pnj('sauvette').ti, /40–55/);
});

test('F08-C8 stats modérées : un peu plus faibles que l\'arme voisine de même niveau', () => {
  const pairs = [['lance_pierre', 'katana'], ['pistolet_billes', 'regle_fer'], ['nerf_garage', 'tampon']];
  for (const [a, b] of pairs) assert.ok(ITEMS[a].atk < ITEMS[b].atk, `${a} < ${b}`);
});

test('F08-C8 acheter une arme à distance chez Bernard et l\'équiper met la portée à 5', () => {
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'});
  p.S.gold = 9999; p.S.lvl = 5;
  const n = NPCS.find(x => x.id === 'bernard');
  place(p, n.x, n.y);
  handleAction(w, 'p1', {a: 'buy', id: 'lance_pierre', n: 1});
  const q = p.S.inv.find(x => x.id === 'lance_pierre');
  assert.ok(q || (p.S.eq.arme && p.S.eq.arme.id === 'lance_pierre'), 'achat réussi');
  if (q) handleAction(w, 'p1', {a: 'equip', idx: p.S.inv.indexOf(q)});
  assert.equal(p.S.eq.arme && p.S.eq.arme.id, 'lance_pierre');
  assert.equal(baseRange(p.S), ARME_RG);
});
