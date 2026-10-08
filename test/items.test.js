import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld, addPlayer, handleAction, handleChat} from '../shared/sim.js';
import {ITEMS, RARITY_MULT, NPCS} from '../shared/data.js';
import {newItem, itemStats, normalizeSave, stats} from '../shared/rules.js';

const eqIds = Object.keys(ITEMS).filter(id => ITEMS[id].t === 'eq');

test('un objet à nObj = rl et à sa rareté d\'origine garde exactement ses stats d\'avant (aucun gain ni perte à la migration)', () => {
  for (const id of eqIds) {
    const it = ITEMS[id];
    assert.deepEqual(itemStats(newItem(id)), {atk: it.atk || 0, hp: it.hp || 0, arm: it.arm || 0}, id);
  }
});

test('stats = base × (1 + nObj/10) × rareté, pour chaque rareté', () => {
  const katana = ITEMS.katana; // atk 6, rl 3, Rare
  const ref = (nObj, r) => Math.round(katana.atk * ((1 + nObj / 10) * RARITY_MULT[r]) / ((1 + katana.rl / 10) * RARITY_MULT.rare));
  for (const r of Object.keys(RARITY_MULT)) for (const n of [1, 3, 13, 50]) assert.equal(itemStats(newItem('katana', n, r)).atk, ref(n, r), `${r} niv.${n}`);
  assert.ok(itemStats(newItem('katana', 3, 'leg')).atk > itemStats(newItem('katana', 3, 'epic')).atk);
});

test('migration : identifiants → instances (nObj = rl, rareté d\'origine), piles intactes, idempotente', () => {
  const vieux = {name: 'Vieux', lvl: 5, inv: [{id: 'katana', n: 1}, {id: 'chips', n: 3}, {id: 'fantome', n: 1}, {id: 'katana', n: 1}], eq: {arme: 'regle', tete: 'inexistant'}};
  const S = normalizeSave(vieux);
  assert.deepEqual(S.inv.filter(s => !s.uid), [{id: 'chips', n: 3}]);
  const katanas = S.inv.filter(s => s.id === 'katana');
  assert.equal(katanas.length, 2);
  assert.deepEqual(katanas.map(({id, nObj, rarete}) => ({id, nObj, rarete})), Array(2).fill({id: 'katana', nObj: 3, rarete: 'rare'}));
  assert.notEqual(katanas[0].uid, katanas[1].uid);
  assert.deepEqual({id: S.eq.arme.id, nObj: S.eq.arme.nObj, rarete: S.eq.arme.rarete}, {id: 'regle', nObj: 1, rarete: 'common'});
  assert.equal(S.eq.tete, null);
  assert.deepEqual(normalizeSave(S), S, 'idempotente');
  // Les stats d'un joueur migré sont celles d'avant : niveau 5 + Règle (3 atk).
  assert.equal(stats(S).atk, 4 + 2 * 4 + 3);
  // Un uid déjà attribué n'est jamais réutilisé pour un nouvel objet.
  const S2 = normalizeSave({...S, inv: [...S.inv, 'tshirt']});
  assert.equal(new Set(S2.inv.filter(s => s.uid).map(s => s.uid)).size, S2.inv.filter(s => s.uid).length);
});

test('le butin d\'équipement prend le niveau du monstre, la boutique et les quêtes le niveau requis', () => {
  const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'}), m = w.maps.over.mobs.find(x => x.type === 'herbe');
  w.rnd = () => 0; // tout le butin tombe
  m.l = 6; m.hp = 1; p.P.x = m.x - 1; p.P.y = m.y;
  handleAction(w, 'p1', {a: 'target', id: m.id}); handleAction(w, 'p1', {a: 'skill', i: 0});
  const mit = p.S.inv.find(s => s.id === 'mitaines');
  assert.ok(mit, 'les mitaines sont tombées');
  assert.deepEqual([mit.nObj, mit.rarete], [6, 'unc']);
  const b = NPCS.find(n => n.id === 'bernard');
  p.P.x = b.x + 1; p.P.y = b.y + .3; p.S.gold = 500; p.S.lvl = 3;
  handleAction(w, 'p1', {a: 'buy', id: 'katana', n: 1});
  const k = Object.values(p.S.eq).find(q => q && q.id === 'katana') || p.S.inv.find(s => s.id === 'katana');
  assert.deepEqual([k.nObj, k.rarete], [ITEMS.katana.rl, 'rare']);
});

test('échange : un équipement s\'offre par uid et garde son niveau d\'objet et sa rareté chez le destinataire', () => {
  const w = createWorld({seed: 1}), a = addPlayer(w, 'a', {name: 'Alice'}), b = addPlayer(w, 'b', {name: 'Bob'});
  a.S.inv.push({uid: 'i50', ...newItem('katana', 9, 'epic')}, {uid: 'i51', ...newItem('katana', 3, 'rare')});
  handleChat(w, 'a', '/echanger bob'); handleChat(w, 'b', '/accepter');
  handleAction(w, 'a', {a: 'tradeOffer', items: [{uid: 'i50'}, {uid: 'inconnu'}], gold: 0});
  assert.deepEqual(a.trade.items.map(x => x.uid), ['i50']);
  handleAction(w, 'a', {a: 'tradeOk'}); handleAction(w, 'b', {a: 'tradeOk'});
  assert.deepEqual(a.S.inv.filter(s => s.id === 'katana').map(s => s.uid), ['i51']);
  const got = b.S.inv.find(s => s.id === 'katana');
  assert.deepEqual([got.nObj, got.rarete], [9, 'epic']);
  assert.ok(got.uid && got.uid !== 'i50', 'nouvel uid chez le destinataire');
});
