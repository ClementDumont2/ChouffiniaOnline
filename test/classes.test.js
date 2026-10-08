import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld, addPlayer, tick, handleAction, movePlayer, takeEvents} from '../shared/sim.js';
import {stats, skillsOf} from '../shared/rules.js';
import {CLASSES} from '../shared/data/classes.js';
import {NPCS} from '../shared/data.js';

const place = (pl, x, y) => { pl.P.x = x; pl.P.y = y; };
const herbe = w => w.maps.over.mobs.find(m => m.type === 'herbe');
const skill = (w, id, i) => handleAction(w, id, {a: 'skill', i});
const errs = (w, id) => takeEvents(w, id).filter(e => e.t === 'err').map(e => e.text);
const run = (w, secs) => { for (let i = 0; i < secs * 20; i++) tick(w, .05); };

// Un joueur de la classe voulue, niveau 5 (toutes les compétences), à 1 case d'une Herbe à gros PV.
function monde(cls, lvl = 5) {
  const w = createWorld({seed: 1}), m = herbe(w);
  const p = addPlayer(w, 'p1', {name: 'P1', cls});
  p.S.lvl = lvl; p.S.hp = stats(p.S).maxhp; p.S.caf = 99;
  place(p, m.x - 1, m.y);
  m.hp = m.mhp = 100000;
  return {w, p, m};
}
const allie = (w, id, name, p, dx = 1, cls) => { const a = addPlayer(w, id, {name, cls}); place(a, p.P.x, p.P.y + dx); return a; };
const dmg = (m, f) => { const h = m.hp; f(); return h - m.hp; };

test('chaque classe a 5 compétences avec Canette Tiède en 4e, et les stats suivent les modificateurs', () => {
  for (const [id, c] of Object.entries(CLASSES)) {
    assert.equal(c.skills.length, 5, id);
    assert.equal(c.skills[3], 'canette', id);
  }
  const base = {lvl: 10, eq: {}};
  assert.equal(stats({...base, cls: 'modo'}).maxhp, Math.round(stats(base).maxhp * 1.3));
  assert.equal(stats({...base, cls: 'speedrunner'}).spd, 1.25);
  assert.equal(stats({...base, cls: 'inconnue'}).spd, 1, 'classe inconnue = Chouffin');
  assert.equal(stats({lvl: 10, eq: {torse: 'carton'}, cls: 'modo'}).arm, Math.round(stats({lvl: 10, eq: {torse: 'carton'}}).arm * 1.2));
});

test('Rôliste — Lancer de d20 : 60 à 140 % de l\'Attaque, ×2 et message sur un 20 naturel', () => {
  const {w, p, m} = monde('roliste'), atk = stats(p.S).atk;
  handleAction(w, 'p1', {a: 'target', id: m.id});
  let min = Infinity, max = 0;
  w.rnd = () => .5;
  for (let i = 0; i < 60; i++) { p.P.cd = {}; const d = dmg(m, () => skill(w, 'p1', 0)); min = Math.min(min, d); max = Math.max(max, d); }
  assert.ok(min >= Math.round(atk * .6) && max <= Math.round(atk * 1.4), `${min}..${max} pour atk ${atk}`);
  takeEvents(w, 'p1'); w.rnd = () => .01; p.P.cd = {};
  const d = dmg(m, () => skill(w, 'p1', 0));
  assert.ok(d >= Math.round(atk * 1.2), 'dégâts doublés');
  assert.ok(takeEvents(w, 'p1').some(e => e.t === 'float' && e.txt === '20 NATUREL !'));
});

test('Rôliste — Relance de dés soigne 220 % de l\'Attaque : l\'allié ciblé, sinon soi-même', () => {
  const {w, p} = monde('roliste'), b = allie(w, 'p2', 'P2', p), heal = Math.round(stats(p.S).atk * 2.2);
  b.S.hp = 1; p.S.hp = 1;
  skill(w, 'p1', 1);
  assert.equal(p.S.hp, 1 + heal, 'soi-même sans cible');
  assert.equal(b.S.hp, 1);
  p.P.cd = {}; handleAction(w, 'p1', {a: 'target', id: 'p2'});
  skill(w, 'p1', 1);
  assert.equal(b.S.hp, 1 + heal);
  b.P.dead = true; b.S.hp = 0; p.P.cd = {}; errs(w, 'p1');
  skill(w, 'p1', 1);
  assert.match(errs(w, 'p1')[0], /Joker MJ/);
  assert.equal(b.S.hp, 0);
});

test('Rôliste — Fiche de Perso : soin sur la durée (6 ticks) pour les alliés à 4 cases seulement', () => {
  const {w, p} = monde('roliste'), near = allie(w, 'p2', 'P2', p, 2), far = allie(w, 'p3', 'P3', p, 6);
  // Dans le Bourg-Forum (zone sûre) : aucun monstre ne vient fausser les PV des alliés.
  place(p, 13, 17); place(near, 15, 17); place(far, 19, 17);
  near.S.hp = far.S.hp = 1;
  skill(w, 'p1', 2);
  run(w, 7);
  const per = Math.round(stats(p.S).atk * .25);
  // La régénération naturelle est la même pour les deux ; seule la Fiche explique l'écart.
  const ecart = near.S.hp - far.S.hp;
  assert.ok(ecart >= 5 * per && ecart <= 6 * per, `écart ${ecart}, par tick ${per}`);
});

test('Rôliste — Joker MJ ne ressuscite qu\'un allié mort et à portée, avec 40 % de PV', () => {
  const {w, p} = monde('roliste'), b = allie(w, 'p2', 'P2', p, 2);
  skill(w, 'p1', 4);
  assert.match(errs(w, 'p1')[0], /Aucun allié mort/, 'allié vivant : refusé');
  b.P.dead = true; b.S.hp = 0; place(b, p.P.x, p.P.y + 9);
  skill(w, 'p1', 4);
  assert.match(errs(w, 'p1')[0], /Aucun allié mort/, 'trop loin : refusé');
  assert.equal(b.P.dead, true);
  assert.equal(p.P.cd.joker || 0, 0, 'rien de débité');
  place(b, p.P.x, p.P.y + 2);
  skill(w, 'p1', 4);
  assert.equal(b.P.dead, false);
  assert.equal(b.S.hp, Math.round(stats(b.S).maxhp * .4));
  assert.ok(takeEvents(w, 'p2').some(e => e.t === 'respawned'));
  assert.equal(p.P.cd.joker, 120);
});

test('Speedrunner — +25 % de vitesse validée par le serveur (un Chouffin est corrigé au même déplacement)', () => {
  const w = createWorld({seed: 1}), sr = addPlayer(w, 'a', {name: 'A', cls: 'speedrunner'}), ch = addPlayer(w, 'b', {name: 'B'});
  for (const p of [sr, ch]) { place(p, 8, 8.5); p.P.mt = w.time - 1; }
  assert.equal(movePlayer(w, 'a', 8 + 6.8, 8.5, 1), true);
  assert.equal(movePlayer(w, 'b', 8 + 6.8, 8.5, 1), false);
});

test('Speedrunner — Frame Perfect : 70 % de l\'Attaque, recharge 0,8 s', () => {
  const {w, p, m} = monde('speedrunner'), atk = stats(p.S).atk;
  handleAction(w, 'p1', {a: 'target', id: m.id}); w.rnd = () => .5;
  const d = dmg(m, () => skill(w, 'p1', 0));
  assert.ok(d >= Math.round(atk * .7 * .85) && d <= Math.round(atk * .7 * 1.15), `${d} pour atk ${atk}`);
  assert.equal(p.P.cd.frame, .8);
});

test('Speedrunner — Skip de Cinématique : derrière la cible, et le coup suivant (seulement) est critique', () => {
  const {w, p, m} = monde('speedrunner'), atk = stats(p.S).atk;
  m.face = 1; place(p, m.x + 2, m.y);
  handleAction(w, 'p1', {a: 'target', id: m.id}); w.rnd = () => .5;
  skill(w, 'p1', 1);
  assert.ok(p.P.x < m.x, 'le monstre regarde à droite : on atterrit à sa gauche');
  const maxNormal = Math.round(atk * .7 * 1.15);
  p.P.cd = {};
  assert.ok(dmg(m, () => skill(w, 'p1', 0)) > maxNormal, 'critique');
  p.P.cd = {};
  assert.ok(dmg(m, () => skill(w, 'p1', 0)) <= maxNormal, 'plus de critique ensuite');
});

test('Speedrunner — Any% accélère les recharges de 40 %, Glitch rend invulnérable 2 s, WR à chaque kill', () => {
  const {w, p, m} = monde('speedrunner');
  skill(w, 'p1', 2);
  p.P.cd.frame = 2; p.P.cd.skipcine = 2;
  run(w, 1);
  assert.ok(p.P.cd.frame < .7 && p.P.cd.frame > .5, `cd ${p.P.cd.frame}`);
  // Glitch : un coup de 10 ne passe pas pendant 2 s, puis repasse.
  m.st = 'chase'; m.target = 'p1'; m.atk = [10, 10]; place(p, m.x - .5, m.y);
  const coup = () => { m.acd = 0; const h = p.S.hp; tick(w, .05); return h - p.S.hp; };
  skill(w, 'p1', 4);
  assert.equal(coup(), 0);
  run(w, 2.2);
  assert.equal(coup(), 10);
  takeEvents(w, 'p1'); m.hp = 1; m.st = 'idle'; p.P.cd = {};
  handleAction(w, 'p1', {a: 'target', id: m.id}); skill(w, 'p1', 0);
  assert.ok(takeEvents(w, 'p1').some(e => e.t === 'float' && e.txt === 'WR !'));
  assert.equal(p.P.sayT > 0 && p.P.say, 'WR !');
});

test('Modo — Avertissement : 100 % de l\'Attaque et menace triplée', () => {
  const {w, p, m} = monde('modo');
  handleAction(w, 'p1', {a: 'target', id: m.id}); w.rnd = () => .5;
  const d = dmg(m, () => skill(w, 'p1', 0));
  assert.equal(m.threat.p1, d * 3);
});

test('Modo — Ban Temporaire : étourdit à 3 cases (3 s), ralentit les boss, ignore les plus loin', () => {
  const {w, p, m} = monde('modo'), maman = w.maps.over.mobs.find(x => x.type === 'maman');
  const loin = w.maps.over.mobs.find(x => x.type === 'herbe' && x !== m);
  maman.x = p.P.x + 2; maman.y = p.P.y; loin.x = p.P.x + 5; loin.y = p.P.y;
  skill(w, 'p1', 1);
  assert.equal(m.stun, 3);
  assert.equal(maman.stun, 0); assert.equal(maman.slow, 3);
  assert.equal(loin.stun, 0);
});

test('Modo — Verrouiller le Topic : les ennemis à 8 cases ciblent le Modo malgré la menace des autres, 6 s', () => {
  const {w, p, m} = monde('modo'), b = allie(w, 'p2', 'P2', p, 1);
  m.st = 'chase'; m.target = 'p2'; m.threat = {p2: 1000};
  tick(w, .05);
  assert.equal(m.target, 'p2');
  skill(w, 'p1', 2);
  tick(w, .05);
  assert.equal(m.target, 'p1');
  run(w, 6.5);
  assert.equal(m.target, 'p2', 'la provocation expire');
  assert.ok(b);
});

test('Modo — Règlement Épinglé : −50 % de dégâts subis pendant 5 s', () => {
  const {w, p, m} = monde('modo');
  m.st = 'chase'; m.target = 'p1'; m.atk = [10, 10]; place(p, m.x - .5, m.y);
  const coup = () => { m.acd = 0; const h = p.S.hp; tick(w, .05); return h - p.S.hp; };
  assert.equal(coup(), 10);
  skill(w, 'p1', 4);
  assert.equal(coup(), 5);
  run(w, 5.2);
  assert.equal(coup(), 10);
});

test('Conseiller d\'Orientation : change de classe pour 50 po × niveau, en gardant niveau et équipement', () => {
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'}), c = NPCS.find(n => n.id === 'conseiller');
  p.S.lvl = 4; p.S.eq.arme = 'katana'; p.S.gold = 250;
  handleAction(w, 'p1', {a: 'changeClass', cls: 'modo'});
  assert.equal(p.S.cls, 'chouffin', 'trop loin du Conseiller');
  place(p, c.x + 1, c.y + .3);
  handleAction(w, 'p1', {a: 'changeClass', cls: 'modo'});
  assert.equal(p.S.cls, 'modo'); assert.equal(p.S.gold, 50);
  assert.equal(p.S.lvl, 4); assert.equal(p.S.eq.arme, 'katana');
  assert.deepEqual(skillsOf(p.S).map(s => s.id), CLASSES.modo.skills);
  handleAction(w, 'p1', {a: 'changeClass', cls: 'roliste'});
  assert.equal(p.S.cls, 'modo', 'pas assez d\'or');
  handleAction(w, 'p1', {a: 'changeClass', cls: 'nimportequoi'});
  assert.equal(p.S.cls, 'modo');
});
