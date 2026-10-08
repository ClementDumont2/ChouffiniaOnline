import test from 'node:test';
import assert from 'node:assert/strict';
import {xpNeed, stats, newItem} from '../shared/rules.js';
import {genOverworld, genDungeon, isSolid} from '../shared/map.js';
import {DIFFS} from '../shared/data.js';

const equip = ids => Object.fromEntries(Object.entries(ids).map(([slot, id]) => [slot, newItem(id)]));
const joueur = (lvl, eq = {}) => ({lvl, eq: {tete: null, torse: null, mains: null, jambes: null, arme: null, ...equip(eq)}});

test('xpNeed suit la courbe du legacy', () => {
  assert.equal(xpNeed(1), 40);
  assert.equal(xpNeed(2), 100);
  assert.equal(xpNeed(5), 40 + 45 * 4 + 15 * 16);
});

test('stats() sans équipement', () => {
  assert.deepEqual(stats(joueur(1)), {atk: 4, maxhp: 60, maxcaf: 50, arm: 0, red: 0, spd: 1});
  assert.equal(stats(joueur(3)).atk, 8);
  assert.equal(stats(joueur(3)).maxhp, 90);
});

test('stats() additionne l\'équipement et applique la réduction d\'armure', () => {
  const st = stats(joueur(1, {arme: 'katana', tete: 'fedora'}));
  assert.equal(st.atk, 4 + 6 + 3);
  assert.equal(st.maxhp, 60 + 10);
  assert.equal(st.arm, 2);
  assert.equal(st.red, 2 / 47);
});

test('stats() : Pompette augmente l\'attaque de 15 %', () => {
  assert.equal(stats(joueur(1, {arme: 'katana'}), 5).atk, Math.round(10 * 1.15));
});

test('genOverworld(seed) est déterministe', () => {
  const a = genOverworld(20111), b = genOverworld(20111), c = genOverworld(7);
  assert.deepEqual(a.t, b.t);
  assert.notDeepEqual(a.t, c.t);
});

function accessibles(map, x, y) {
  const seen = new Set(), pile = [[Math.floor(x), Math.floor(y)]];
  while (pile.length) {
    const [cx, cy] = pile.pop(), k = cy * map.w + cx;
    if (seen.has(k) || isSolid(map, cx, cy)) continue;
    seen.add(k);
    pile.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  return seen;
}

test('genDungeon est jouable : 6 salles minimum, boss atteignable depuis l\'entrée', () => {
  for (let ti = 0; ti < DIFFS.length; ti++) {
    for (const seed of [1, 2, 3, 42, 999]) {
      const D = genDungeon(seed, ti);
      assert.ok(D, `donjon ${ti} graine ${seed}`);
      assert.ok(D.rooms.length >= 6);
      const boss = D.spawns.filter(s => s.type === 'archiviste');
      assert.equal(boss.length, 1);
      assert.equal(boss[0].l, DIFFS[ti].L + 1);
      const libre = accessibles(D, D.sx, D.sy);
      for (const s of D.spawns) assert.ok(libre.has(Math.floor(s.y) * D.w + Math.floor(s.x)), `${s.type} injoignable`);
    }
  }
});

test('genDungeon est déterministe', () => {
  assert.deepEqual(genDungeon(5, 1), genDungeon(5, 1));
});

test('suggest : commandes par préfixe/alias, pseudos pour les arguments joueur', async () => {
  const {suggest} = await import('../shared/commands.js');
  const pl = {S: {droits: []}}, fills = (t, online) => suggest(t, pl, online).map(s => s.fill);
  assert.deepEqual(fills('/q'), ['/qui', '/quitter']);
  assert.deepEqual(fills('/wh'), ['/qui'], 'alias /who');
  assert.deepEqual(fills('/mp a', ['Alice', 'Bob', 'Alain']), ['/mp Alice ', '/mp Alain ']);
  assert.deepEqual(fills('/echanger B', ['Bob']), ['/echanger Bob']);
  assert.deepEqual(fills('/mp bob sal', ['Bob']), [], 'le texte libre n\'est pas complété');
  assert.deepEqual(fills('bonjour'), []);
});

test('xpNeed : identique à l\'ancienne courbe jusqu\'au niveau 15, strictement croissante et sans à-coup jusqu\'à 100', async () => {
  const {MAXLVL} = await import('../shared/data.js');
  const {baseStats} = await import('../shared/rules.js');
  assert.equal(MAXLVL, 100);
  assert.deepEqual([1, 5, 10, 15].map(xpNeed), [40, 460, 1660, 3610]);
  for (let l = 1; l < MAXLVL - 1; l++) {
    assert.ok(xpNeed(l + 1) > xpNeed(l), `niveau ${l}`);
    if (l >= 15) assert.ok(xpNeed(l + 1) / xpNeed(l) < 1.14, `à-coup au niveau ${l}`);
  }
  // Les stats de base ne reculent jamais et gardent la courbe d'origine jusqu'au niveau 15.
  assert.deepEqual(baseStats(15), {atk: 4 + 2 * 14, hp: 60 + 15 * 14, caf: 50 + 8 * 14});
  for (let l = 1; l < MAXLVL; l++) for (const k of ['atk', 'hp', 'caf']) assert.ok(baseStats(l + 1)[k] > baseStats(l)[k], `${k} niveau ${l}`);
});
