import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld, addPlayer, removePlayer, tick, handleAction, handleChat, movePlayer, takeEvents} from '../shared/sim.js';
import {zoneAt, isSafe} from '../shared/map.js';
import {stats} from '../shared/rules.js';

const place = (pl, x, y) => { pl.P.x = x; pl.P.y = y; };
const run = (w, s) => { for (let i = 0; i < s * 20; i++) tick(w, .05); };
const msgs = (w, id) => takeEvents(w, id).filter(e => e.t === 'msg').map(e => e.text);
const ARENE = [33, 16];

// Deux joueurs niveau 10 face à face dans l'Arène.
function arene() {
  const w = createWorld({seed: 1}), a = addPlayer(w, 'a', {name: 'Alice'}), b = addPlayer(w, 'b', {name: 'Bob'});
  for (const p of [a, b]) { p.S.lvl = 10; p.S.hp = stats(p.S).maxhp; }
  place(a, ARENE[0], ARENE[1]); place(b, ARENE[0] + 1, ARENE[1]);
  w.rnd = () => .5;
  return {w, a, b};
}
function duel() {
  const x = arene();
  handleChat(x.w, 'a', '/duel bob'); handleChat(x.w, 'b', '/accepter');
  return x;
}
const frappe = (w, id, cible) => { const p = w.players[id]; p.P.cd = {}; handleAction(w, id, {a: 'target', id: cible}); handleAction(w, id, {a: 'skill', i: 0}); };

test('l\'Arène existe : zone sûre pour les monstres, aucun monstre n\'y apparaît', () => {
  const w = createWorld({seed: 1}), map = w.maps.over;
  assert.equal(zoneAt(map, 33, 16), 'arene');
  assert.equal(isSafe(map, 33, 16), true);
  assert.ok(!map.mobs.some(m => zoneAt(map, m.hx, m.hy) === 'arene'));
});

test('/duel : refusé hors arène, invitation puis acceptation, compte à rebours de 3 s sans dégâts', () => {
  const {w, a, b} = arene();
  place(b, 20, 20);
  handleChat(w, 'a', '/duel bob');
  assert.match(msgs(w, 'a').pop(), /doivent être dans l'Arène/);
  place(b, ARENE[0] + 1, ARENE[1]);
  takeEvents(w, 'b');
  handleChat(w, 'a', '/duel bob');
  assert.ok(takeEvents(w, 'b').some(e => e.t === 'duelInvite' && e.from === 'Alice' && e.ttl === 30));
  handleAction(w, 'b', {a: 'duelReply', ok: true});
  assert.equal(a.duel.phase, 'count');
  const hp = b.S.hp;
  frappe(w, 'a', 'b');
  assert.equal(b.S.hp, hp, 'pas de dégâts pendant le compte à rebours');
  run(w, 1.5);
  const texts = takeEvents(w, 'a').filter(e => e.t === 'count').map(e => e.text);
  assert.deepEqual(texts.slice(0, 2), ['3', '2']);
  run(w, 2);
  assert.equal(a.duel.phase, 'fight');
  assert.ok(takeEvents(w, 'a').some(e => e.t === 'count' && e.text === 'DÉBATTEZ !'));
});

test('/duel : refus, et invitation expirée', () => {
  const {w, a, b} = arene();
  handleChat(w, 'a', '/duel bob');
  handleAction(w, 'b', {a: 'duelReply', ok: false});
  assert.equal(a.duel, null);
  assert.match(msgs(w, 'a').pop(), /refuse le duel/);
  handleChat(w, 'a', '/duel bob'); run(w, 31);
  handleChat(w, 'b', '/accepter');
  assert.equal(a.duel, null);
});

test('en combat : dégâts réduits de 50 %, fin à 1 PV, les deux soignés, victoire/défaite comptées', () => {
  const {w, a, b} = duel();
  run(w, 3.2);
  const atk = stats(a.S).atk, hp = b.S.hp;
  frappe(w, 'a', 'b');
  const d = hp - b.S.hp;
  assert.ok(d >= Math.round(atk * .85 * .5) && d <= Math.round(atk * 1.15 * .5), `${d} pour atk ${atk}`);
  b.S.hp = 5; a.S.hp = 50;
  run(w, 1.5);
  frappe(w, 'a', 'b');
  assert.equal(a.duel, null); assert.equal(b.duel, null);
  assert.equal(b.S.hp, stats(b.S).maxhp, 'perdant soigné'); assert.equal(a.S.hp, stats(a.S).maxhp, 'gagnant soigné');
  assert.deepEqual([a.S.duelWins, a.S.duelLosses, b.S.duelWins, b.S.duelLosses].map(x => x || 0), [1, 0, 0, 1]);
  assert.equal(b.S.concede, 'Alice');
  assert.equal(b.P.dead, false);
});

test('sortir de l\'arène ou se déconnecter = abandon', () => {
  let {w, a, b} = duel();
  run(w, 3.2);
  place(a, 20, 20); run(w, .1);
  assert.equal(b.S.duelWins, 1); assert.equal(a.S.concede, 'Bob');
  ({w, a, b} = duel());
  run(w, 3.2);
  const S = removePlayer(w, 'a');
  assert.equal(S.duelLosses, 1); assert.equal(S.concede, 'Bob');
  assert.equal(b.S.duelWins, 1); assert.equal(b.duel, null);
});

test('le perdant ne peut écrire que « tu as raison » (casse et accents ignorés), puis le serveur annonce le résultat', () => {
  const {w, a, b} = duel();
  run(w, 3.2); b.S.hp = 2; frappe(w, 'a', 'b');
  takeEvents(w, 'a'); takeEvents(w, 'b');
  handleChat(w, 'b', 'salut tout le monde');
  assert.deepEqual(takeEvents(w, 'a').filter(e => e.t === 'chat'), [], 'rien dans le Général');
  assert.equal(msgs(w, 'b').pop(), 'Vous avez perdu un débat. Écrivez « tu as raison ».');
  handleChat(w, 'b', '/qui');
  assert.ok(!msgs(w, 'b').some(t => /perdu un débat/.test(t)), 'les commandes restent permises');
  handleChat(w, 'b', 'tu as raison !');
  assert.equal(b.S.concede, 'Alice', 'phrase inexacte : toujours muselé');
  takeEvents(w, 'a');
  handleChat(w, 'b', 'Tu As Raisón');
  const evs = takeEvents(w, 'a');
  assert.ok(evs.some(e => e.t === 'chat' && e.who === 'Bob' && e.text === 'Tu As Raisón'), 'le message part normalement');
  assert.ok(evs.some(e => e.t === 'msg' && /Bob a perdu le débat contre Alice/.test(e.text)));
  assert.equal(b.S.concede, null);
  handleChat(w, 'b', 'ok');
  assert.ok(takeEvents(w, 'a').some(e => e.t === 'chat' && e.text === 'ok'));
});

test('statistiques de duel dans /top, et pas de monture dans l\'arène', () => {
  const {w, a, b} = arene();
  a.S.duelWins = 3; a.S.duelLosses = 1;
  takeEvents(w, 'a'); handleChat(w, 'a', '/top');
  assert.match(msgs(w, 'a').pop(), /^Top Duels : 1\. Alice \(3V\/1D\)/);
  a.S.mounts = ['chaise']; a.S.mount = 'chaise';
  handleAction(w, 'a', {a: 'mount'});
  assert.equal(a.P.cast, null, 'refusé dans l\'arène');
  a.P.mount = 'chaise'; run(w, .1);
  assert.equal(a.P.mount, null, 'descend en entrant');
  assert.ok(b);
});
