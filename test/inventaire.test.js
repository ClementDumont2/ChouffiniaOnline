import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld, addPlayer, handleAction, takeEvents} from '../shared/sim.js';
import {ITEMS, SLOTS} from '../shared/data.js';
import {newItem as ni, newSave, slotCandidates, upgradableSlots, BAG} from '../shared/rules.js';

let n = 0;
const newItem = (...a) => ({uid: "i" + (++n), ...ni(...a)});
const mk = (lvl, inv = [], eq = {}) => ({...newSave('T'), lvl, inv, eq: {...newSave('T').eq, ...eq}});

test('F02-C1 : les candidats d\'un emplacement sont exactement les équipements du sac de cet emplacement', () => {
  const S = mk(20, [newItem('regle'), {id: 'chips', n: 3}, newItem('fedora'), newItem('katana'), newItem('jogging')]);
  assert.deepEqual(slotCandidates(S, 'arme').map(c => c.idx).sort(), [0, 3]);
  assert.deepEqual(slotCandidates(S, 'tete').map(c => c.idx), [2]);
  assert.deepEqual(slotCandidates(S, 'torse'), []);
  const c = slotCandidates(S, 'jambes')[0];
  assert.equal(c.idx, 4); assert.equal(c.q, S.inv[4]); assert.equal(c.ok, true);
  assert.equal(typeof c.net, 'number'); assert.equal(typeof c.better, 'boolean');
});

test('F02-C1 : sac vide ou piles seules → aucun candidat', () => {
  assert.deepEqual(slotCandidates(mk(5, []), 'arme'), []);
  assert.deepEqual(slotCandidates(mk(5, [{id: 'chips', n: 2}]), 'arme'), []);
});

test('F02-C2 : équipables d\'abord, du plus fort gain au plus faible, puis niveau trop élevé ; égalité = ordre du sac', () => {
  const S = mk(5, [newItem('regle'), newItem('grimoire'), newItem('katana'), newItem('sabre'), newItem('regle'), newItem('katana')], {arme: newItem('regle')});
  const r = slotCandidates(S, 'arme');
  assert.equal(r.at(-1).idx, 1); assert.equal(r.at(-1).ok, false);
  const oks = r.filter(c => c.ok), ko = r.filter(c => !c.ok);
  assert.equal(r.slice(0, oks.length).every(c => c.ok), true);
  for (let i = 1; i < oks.length; i++) assert.ok(oks[i - 1].net > oks[i].net || (oks[i - 1].net === oks[i].net && oks[i - 1].idx < oks[i].idx));
  assert.deepEqual(oks.map(c => c.idx), [3, 2, 5, 0, 4]);
  assert.deepEqual(ko.map(c => c.idx), [1]);
});

test('F02-C2 : plusieurs objets de niveau trop élevé restent triés par net puis idx', () => {
  const S = mk(1, [newItem('katana'), newItem('grimoire'), newItem('sabre')]);
  const r = slotCandidates(S, 'arme');
  assert.deepEqual(r.map(c => c.idx), [1, 2, 0]);
  assert.equal(r.every(c => !c.ok), true);
});

test('F02-C4 : equip échange l\'objet porté et celui du sac', () => {
  const w = createWorld({seed: 1}), pl = addPlayer(w, 'p1');
  pl.S.lvl = 10; const vieux = newItem('regle'), neuf = newItem('katana');
  pl.S.eq.arme = vieux; pl.S.inv = [neuf];
  handleAction(w, 'p1', {a: 'equip', idx: 0});
  assert.equal(pl.S.eq.arme, neuf);
  assert.deepEqual(pl.S.inv.map(s => s.uid), [vieux.uid]);
});

test('F02-C4 : equip d\'un objet de niveau trop élevé ne change rien (erreur serveur)', () => {
  const w = createWorld({seed: 1}), pl = addPlayer(w, 'p1');
  pl.S.lvl = 1; const neuf = newItem('grimoire'); pl.S.inv = [neuf]; const vieux = pl.S.eq.arme;
  handleAction(w, 'p1', {a: 'equip', idx: 0});
  assert.equal(pl.S.eq.arme, vieux); assert.equal(pl.S.inv[0], neuf);
});

test('F02-C6 : unequip range l\'objet dans le sac', () => {
  const w = createWorld({seed: 1}), pl = addPlayer(w, 'p1');
  const q = newItem('regle'); pl.S.eq.arme = q; pl.S.inv = [];
  handleAction(w, 'p1', {a: 'unequip', slot: 'arme'});
  assert.equal(pl.S.eq.arme, null); assert.equal(pl.S.inv[0], q);
});

test('F02-C6 : unequip avec sac plein → « Sac plein. » et l\'objet reste équipé', () => {
  const w = createWorld({seed: 1}), pl = addPlayer(w, 'p1');
  const q = newItem('regle'); pl.S.eq.arme = q; pl.S.inv = Array.from({length: BAG}, () => newItem('katana'));
  takeEvents(w, 'p1');
  handleAction(w, 'p1', {a: 'unequip', slot: 'arme'});
  assert.equal(pl.S.eq.arme, q); assert.equal(pl.S.inv.length, BAG);
  assert.ok(JSON.stringify(takeEvents(w, 'p1')).includes('Sac plein.'));
});

test('F03-C1 : emplacement améliorable ssi un candidat équipable a better', () => {
  const S = mk(5, [newItem('katana'), newItem('fedora')], {arme: newItem('regle')});
  assert.deepEqual(upgradableSlots(S), ['tete', 'arme']);
  assert.ok(Object.keys(SLOTS).includes('tete'));
});

test('F03-C1 : un objet meilleur mais de niveau trop élevé ne compte pas', () => {
  const S = mk(1, [newItem('grimoire')], {arme: newItem('regle')});
  assert.ok(ITEMS.grimoire.rl > S.lvl);
  assert.deepEqual(upgradableSlots(S), []);
});

test('F03-C1 : objet moins bon ou identique à celui porté → pas améliorable ; ordre de SLOTS respecté', () => {
  const S = mk(10, [newItem('regle'), newItem('mitaines'), newItem('jogging')], {arme: newItem('katana')});
  assert.deepEqual(upgradableSlots(S), ['mains', 'jambes']);
  const T = mk(10, [newItem('katana')], {arme: newItem('katana')});
  assert.deepEqual(upgradableSlots(T), []);
});
