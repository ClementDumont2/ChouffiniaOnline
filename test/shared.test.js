import test from 'node:test';
import assert from 'node:assert/strict';
import {xpNeed, stats} from '../shared/rules.js';
import {genOverworld, genDungeon, isSolid} from '../shared/map.js';
import {DIFFS} from '../shared/data.js';

const joueur = (lvl, eq = {}) => ({lvl, eq: {tete: null, torse: null, mains: null, jambes: null, arme: null, ...eq}});

test('xpNeed suit la courbe du legacy', () => {
  assert.equal(xpNeed(1), 40);
  assert.equal(xpNeed(2), 100);
  assert.equal(xpNeed(5), 40 + 45 * 4 + 15 * 16);
});

test('stats() sans équipement', () => {
  assert.deepEqual(stats(joueur(1)), {atk: 4, maxhp: 60, maxcaf: 50, arm: 0, red: 0});
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
