import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld, addPlayer, tick, handleAction, movePlayer, takeEvents} from '../shared/sim.js';
import {moveSpeed} from '../shared/rules.js';
import {MOUNTS} from '../shared/data/mounts.js';
import {NPCS} from '../shared/data.js';

const place = (pl, x, y) => { pl.P.x = x; pl.P.y = y; };
const run = (w, s) => { for (let i = 0; i < s * 20; i++) tick(w, .05); };
const errs = (w, id) => takeEvents(w, id).filter(e => e.t === 'err').map(e => e.text);
const kevin = NPCS.find(n => n.id === 'kevin');

function acheteur(lvl = 10, gold = 400) {
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'});
  p.S.lvl = lvl; p.S.gold = gold;
  place(p, kevin.x + 1, kevin.y + .3);
  return {w, p};
}
const monte = (w, p, id) => { p.S.mounts = [id]; p.S.mount = id; handleAction(w, 'p1', {a: 'mount'}); run(w, 1.1); };

test('Kévin vend la Chaise (niv. 10, 400 po) ; refusé si trop loin, trop bas, trop pauvre ou déjà possédée', () => {
  const {w, p} = acheteur(9, 400);
  handleAction(w, 'p1', {a: 'buyMount', id: 'chaise'});
  assert.deepEqual(p.S.mounts, [], 'niveau 9');
  p.S.lvl = 10; p.S.gold = 399;
  handleAction(w, 'p1', {a: 'buyMount', id: 'chaise'});
  assert.deepEqual(p.S.mounts, [], '399 po');
  p.S.gold = 900;
  place(p, 5, 5);
  handleAction(w, 'p1', {a: 'buyMount', id: 'chaise'});
  assert.deepEqual(p.S.mounts, [], 'trop loin de Kévin');
  place(p, kevin.x + 1, kevin.y + .3);
  handleAction(w, 'p1', {a: 'buyMount', id: 'chaise'});
  assert.deepEqual(p.S.mounts, ['chaise']); assert.equal(p.S.gold, 500); assert.equal(p.S.mount, 'chaise');
  handleAction(w, 'p1', {a: 'buyMount', id: 'chaise'});
  assert.equal(p.S.gold, 500, 'pas deux fois');
  handleAction(w, 'p1', {a: 'buyMount', id: 'maman'});
  assert.deepEqual(p.S.mounts, ['chaise'], 'Maman n\'est pas à vendre');
});

test('monter demande 1 s immobile ; bouger annule ; la vitesse monte de 30 / 50 / 80 %', () => {
  const {w, p} = acheteur();
  p.S.mounts = ['chaise']; p.S.mount = 'chaise';
  handleAction(w, 'p1', {a: 'mount'});
  assert.equal(p.P.cast.id, 'mount');
  run(w, .5);
  assert.equal(p.P.mount, null);
  movePlayer(w, 'p1', p.P.x + .01, p.P.y, 1);
  assert.equal(p.P.cast, null, 'bouger interrompt');
  run(w, 1.2);
  assert.equal(p.P.mount, null);
  handleAction(w, 'p1', {a: 'mount'}); run(w, 1.1);
  assert.equal(p.P.mount, 'chaise');
  assert.equal(moveSpeed(p.S, p.P), 1.3);
  for (const [id, v] of [['trottinette', 1.5], ['maman', 1.8]]) assert.equal(moveSpeed(p.S, {mount: id}), v);
  // La validation serveur suit : 7,2 cases en 1 s passent en selle, pas à pied.
  place(p, 8, 8.5); p.P.mt = w.time - 1;
  assert.equal(movePlayer(w, 'p1', 8 + 7.2, 8.5, 1), true);
  place(p, 8, 8.5); p.P.mount = null; p.P.mt = w.time - 1;
  assert.equal(movePlayer(w, 'p1', 8 + 7.2, 8.5, 1), false);
});

test('on descend en attaquant, en prenant un coup, en entrant en donjon ; et on peut redescendre à la touche', () => {
  const {w, p} = acheteur(10);
  const m = w.maps.over.mobs.find(x => x.type === 'herbe');
  place(p, m.x - 1, m.y);
  monte(w, p, 'chaise');
  handleAction(w, 'p1', {a: 'target', id: m.id});
  handleAction(w, 'p1', {a: 'skill', i: 0});
  assert.equal(p.P.mount, null, 'attaque');
  monte(w, p, 'chaise');
  m.st = 'chase'; m.target = 'p1'; m.atk = [3, 3]; m.acd = 0; place(p, m.x - .5, m.y);
  tick(w, .05);
  assert.equal(p.P.mount, null, 'dégâts');
  place(p, 8, 8.5); p.P.cast = null; m.st = 'idle';
  monte(w, p, 'chaise');
  handleAction(w, 'p1', {a: 'mount'});
  assert.equal(p.P.mount, null, 'touche monture');
  monte(w, p, 'chaise');
  place(p, NPCS.find(n => n.id === 'gardien').x + 1, NPCS.find(n => n.id === 'gardien').y + .3);
  p.S.lvl = 10;
  handleAction(w, 'p1', {a: 'enterDungeon', ti: 0});
  assert.notEqual(p.mapId, 'over');
  assert.equal(p.P.mount, null, 'donjon');
  takeEvents(w, 'p1');
  handleAction(w, 'p1', {a: 'mount'});
  assert.match(errs(w, 'p1')[0], /interdites/);
  assert.equal(p.P.cast, null);
});

test('Maman : monture après 10 victoires, phrases toutes les 8 à 12 s (au moins 12 répliques)', () => {
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'}), maman = w.maps.over.mobs.find(m => m.type === 'maman');
  place(p, maman.x - 1, maman.y);
  for (let i = 1; i <= 10; i++) {
    maman.alive = true; maman.hp = 1; maman.dieT = 0; maman.target = null;
    p.P.cd = {}; handleAction(w, 'p1', {a: 'target', id: maman.id}); handleAction(w, 'p1', {a: 'skill', i: 0});
    assert.equal(maman.alive, false);
    assert.equal(p.S.mounts.includes('maman'), i === 10, `après ${i} victoire(s)`);
  }
  assert.equal(p.S.mount, 'maman');
  assert.ok(MOUNTS.maman.lines.length >= 12);
  place(p, 8, 8.5); p.P.cast = null;
  handleAction(w, 'p1', {a: 'mount'}); run(w, 1.1);
  assert.equal(p.P.mount, 'maman');
  const dites = []; let avant = 0;
  for (let i = 0; i < 20 * 60; i++) { tick(w, .05); if (p.P.sayT > avant) dites.push(p.P.say); avant = p.P.sayT; }
  assert.ok(dites.length >= 4 && dites.length <= 8, `${dites.length} répliques en 60 s`);
  assert.ok(dites.every(l => MOUNTS.maman.lines.includes(l)));
});

test('les sauvegardes sans monture sont migrées, et la monture choisie doit être possédée', async () => {
  const {normalizeSave} = await import('../shared/rules.js');
  assert.deepEqual([normalizeSave({name: 'A', lvl: 3}).mounts, normalizeSave({name: 'A'}).mount], [[], null]);
  const s = normalizeSave({name: 'A', mounts: ['chaise', 'fantome'], mount: 'trottinette'});
  assert.deepEqual(s.mounts, ['chaise']); assert.equal(s.mount, 'chaise');
});
