// Saison 3 : le Casino (blackjack, roulette, poker Chouffin entre joueurs), mises en or ou en équipement.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld, addPlayer, removePlayer, handleAction, tick} from '../shared/sim.js';
import {NPCS} from '../shared/data.js';
import {newItem, withUid} from '../shared/rules.js';
import {bestRank, bjValue, cmpRank, pokerRank, roulPays} from '../shared/casino.js';
import {isSafe, zoneAt} from '../shared/map.js';

const npc = id => NPCS.find(n => n.id === id);
// Carte : valeur (0 = 2 … 12 = As) + 13 × couleur.
const c = (r, s = 0) => r + 13 * s;
function joueur(w, id, near, gold = 1000) {
  const p = addPlayer(w, id, {name: id}), n = npc(near);
  p.P.x = n.x; p.P.y = n.y + 1; p.S.gold = gold; p.S.lvl = 50;
  return p;
}
const act = (w, id, a) => handleAction(w, id, {a: 'casino', ...a});

test('règles : valeur au blackjack, gains de la roulette, ordre des mains de poker', () => {
  assert.equal(bjValue([c(12), c(9)]), 21);
  assert.equal(bjValue([c(12), c(12), c(8)]), 12, 'deux As : 11 + 1');
  assert.equal(bjValue([c(8), c(9), c(0)]), 22);
  assert.deepEqual([roulPays('rouge', 1), roulPays('noir', 1), roulPays('pair', 0), roulPays(17, 17), roulPays(17, 18), roulPays('passe', 19)], [2, 0, 0, 36, 0, 2]);
  const mains = [
    [c(0), c(5, 1), c(7, 2), c(9, 3), c(11)],             // hauteur
    [c(3), c(3, 1), c(7, 2), c(9, 3), c(11)],             // paire
    [c(3), c(3, 1), c(7, 2), c(7, 3), c(11)],             // double paire
    [c(3), c(3, 1), c(3, 2), c(9, 3), c(11)],             // brelan
    [c(12), c(0, 1), c(1, 2), c(2, 3), c(3)],             // quinte As-2-3-4-5
    [c(4), c(5, 1), c(6, 2), c(7, 3), c(8)],              // quinte au 10
    [c(0), c(4), c(7), c(9), c(11)],                      // couleur
    [c(3), c(3, 1), c(3, 2), c(9, 3), c(9)],              // full
    [c(3), c(3, 1), c(3, 2), c(3, 3), c(11)],             // carré
    [c(4, 2), c(5, 2), c(6, 2), c(7, 2), c(8, 2)],        // quinte flush
  ];
  for (let i = 1; i < mains.length; i++) assert.ok(cmpRank(pokerRank(mains[i]), pokerRank(mains[i - 1])) > 0, `main ${i}`);
  assert.ok(cmpRank(pokerRank([c(3), c(3, 1), c(7, 2), c(9, 3), c(12)]), pokerRank([c(3, 2), c(3, 3), c(7), c(9, 1), c(11)])) > 0, 'départage au kicker');
  // 7 cartes : la couleur cachée parmi 2 + 5 est trouvée.
  assert.equal(bestRank([c(0, 1), c(4, 1), c(7, 1), c(9, 1), c(11, 1), c(2, 2), c(3, 3)])[0], 5);
});

test('le Casino est un sanctuaire du monde avec ses croupiers', () => {
  const map = createWorld({seed: 1}).maps.over;
  for (const id of ['croupier_bj', 'croupier_roul', 'croupier_pk', 'barman_casino']) {
    const n = npc(id);
    assert.equal(zoneAt(map, n.x, n.y), 'casino', id);
    assert.ok(isSafe(map, n.x, n.y));
  }
});

test('blackjack : la mise part, le gain revient selon le résultat ; un équipement perdu reste à la maison', () => {
  for (let s = 1; s <= 40; s++) {
    const w = createWorld({seed: s}), p = joueur(w, 'p', 'croupier_bj');
    act(w, 'p', {g: 'bj', op: 'deal', gold: 100});
    if (!p.bj.done) act(w, 'p', {g: 'bj', op: 'stand'});
    assert.ok(p.bj.done);
    assert.equal(p.S.gold - 1000, p.bj.net);
    assert.ok([-100, 0, 100, 150].includes(p.bj.net), `gain ${p.bj.net}`);
  }
  const w = createWorld({seed: 3}), p = joueur(w, 'p', 'croupier_bj');
  p.S.inv.push(withUid(p.S, newItem('katana')));
  const uid = p.S.inv.at(-1).uid;
  act(w, 'p', {g: 'bj', op: 'deal', uid});
  assert.ok(!p.S.inv.some(q => q.uid === uid), "l'objet misé quitte le sac");
  act(w, 'p', {g: 'bj', op: 'deal', gold: 10});
  if (!p.bj.done) act(w, 'p', {g: 'bj', op: 'stand'});
  assert.equal(p.S.inv.some(q => q.id === 'katana'), p.bj.mult >= 1);
  // Loin de la table, ou mise impossible : rien ne bouge.
  const w2 = createWorld({seed: 1}), q = joueur(w2, 'q', 'gerard');
  act(w2, 'q', {g: 'bj', op: 'deal', gold: 100});
  act(w2, 'q', {g: 'bj', op: 'deal', gold: 2000});
  assert.equal(q.S.gold, 1000);
});

test('roulette : chance simple ×2, numéro plein ×36, zéro perdant', () => {
  const w = createWorld({seed: 1}), p = joueur(w, 'p', 'croupier_roul');
  w.rnd = () => 17.5 / 37; // la bille tombe sur le 17 (noir, impair, manque)
  act(w, 'p', {g: 'roul', bet: 'impair', gold: 100});
  assert.equal(p.S.gold, 1100);
  act(w, 'p', {g: 'roul', bet: 17, gold: 10});
  assert.equal(p.S.gold, 1100 + 350);
  act(w, 'p', {g: 'roul', bet: 'rouge', gold: 50});
  assert.equal(p.S.gold, 1400);
  act(w, 'p', {g: 'roul', bet: 'triche', gold: 50});
  act(w, 'p', {g: 'roul', bet: 'noir', gold: 1e9});
  assert.equal(p.S.gold, 1400, 'pari inconnu ou mise trop grosse : refusés');
});

test('poker hold\'em : deux cartes, cinq au tableau, tours de parole ; le pot (or, relances, équipement) va à la meilleure main', () => {
  const w = createWorld({seed: 5}), a = joueur(w, 'a', 'croupier_pk'), b = joueur(w, 'b', 'croupier_pk'), c3 = joueur(w, 'c', 'croupier_pk');
  b.S.inv.push(withUid(b.S, newItem('sabre')));
  act(w, 'a', {g: 'pk', op: 'sit', gold: 200});
  act(w, 'b', {g: 'pk', op: 'sit', uid: b.S.inv.at(-1).uid});
  act(w, 'c', {g: 'pk', op: 'sit', gold: 300});
  act(w, 'c', {g: 'pk', op: 'leave'});
  assert.equal(c3.S.gold, 1000, 'mise rendue avant la donne');
  act(w, 'a', {g: 'pk', op: 'start'});
  assert.deepEqual([w.poker.phase, w.poker.seats.map(s => s.hand.length)], ['pre', [2, 2]]);
  const hands = Object.fromEntries(w.poker.seats.map(s => [s.id, s.hand]));
  act(w, 'b', {g: 'pk', op: 'call'});
  assert.equal(w.poker.phase, 'pre', 'pas son tour : ignoré');
  act(w, 'a', {g: 'pk', op: 'raise', gold: 50});
  act(w, 'b', {g: 'pk', op: 'call'});
  assert.deepEqual([w.poker.phase, w.poker.board.length, b.S.gold], ['flop', 3, 950]);
  for (const street of ['turn', 'river']) { act(w, 'a', {g: 'pk', op: 'call'}); act(w, 'b', {g: 'pk', op: 'call'}); assert.equal(w.poker.phase, street); }
  const board = [...w.poker.board];
  act(w, 'a', {g: 'pk', op: 'call'}); act(w, 'b', {g: 'pk', op: 'call'});
  assert.equal(w.poker.phase, 'wait', 'abattage après la rivière');
  const d = cmpRank(bestRank([...hands.a, ...board]), bestRank([...hands.b, ...board])), aWins = d > 0, bWins = d < 0;
  assert.equal(a.S.gold + b.S.gold, 1700 + 300, "l'or est conservé");
  assert.equal(a.S.gold, 750 + (aWins ? 300 : !bWins ? 150 : 0));
  assert.equal(a.S.inv.some(q => q.id === 'sabre'), aWins);
  assert.equal(b.S.inv.some(q => q.id === 'sabre'), !aWins);
  // Relance puis couché : le relanceur ramasse sans montrer ; temps écoulé avec quelque chose à suivre = couché.
  const g0 = a.S.gold + b.S.gold;
  act(w, 'a', {g: 'pk', op: 'sit', gold: 100}); act(w, 'b', {g: 'pk', op: 'sit', gold: 100});
  act(w, 'b', {g: 'pk', op: 'start'});
  act(w, 'a', {g: 'pk', op: 'raise', gold: 1e9});
  assert.equal(w.poker.cur, 0, 'relance au-delà de son or : refusée');
  act(w, 'a', {g: 'pk', op: 'raise', gold: 40});
  for (let i = 0; i < 20 * 21; i++) tick(w, .05);
  assert.equal(w.poker.phase, 'wait');
  assert.equal(a.S.gold + b.S.gold, g0);
  assert.equal(b.S.gold, g0 - a.S.gold);
  assert.ok(a.S.gold > b.S.gold, 'b, absent, se couche face à la relance');
  // Déconnexion en attente : la mise revient dans la sauvegarde.
  act(w, 'a', {g: 'pk', op: 'sit', gold: 100});
  assert.equal(removePlayer(w, 'a').gold, a.S.gold);
  assert.equal(w.poker.seats.length, 0);
});
