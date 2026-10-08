import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorld, addPlayer, removePlayer, tick, handleAction, handleChat, takeEvents} from '../shared/sim.js';
import {snapshotFor} from '../shared/protocol.js';
import {statsDeMob, newSave} from '../shared/rules.js';
import {BOT_LINES, DIFFS, ITEMS, NPCS} from '../shared/data.js';

const npc = id => NPCS.find(n => n.id === id);
const place = (pl, x, y) => { pl.P.x = x; pl.P.y = y; };
const aupres = (pl, id) => place(pl, npc(id).x + 1, npc(id).y + .3);
const herbe = w => w.maps.over.mobs.find(m => m.type === 'herbe');

function duo() {
  const w = createWorld({seed: 1});
  const p1 = addPlayer(w, 'p1'), p2 = addPlayer(w, 'p2');
  return {w, p1, p2};
}

test('sim.js n\'importe rien du client', () => {
  assert.doesNotMatch(readFileSync(new URL('../shared/sim.js', import.meta.url), 'utf8'), /from\s+['"][^'"]*client/);
});

test('deux joueurs : celui qui tape un monstre en devient la cible, même si l\'autre est plus près', () => {
  const {w, p1, p2} = duo(), m = herbe(w);
  place(p2, m.x - .5, m.y);
  place(p1, m.x - 1.2, m.y);
  handleAction(w, 'p1', {a: 'target', id: m.id, auto: true});
  handleAction(w, 'p1', {a: 'skill', i: 0});
  assert.equal(m.st, 'chase');
  assert.equal(m.target, 'p1');
  for (let i = 0; i < 20; i++) tick(w, .05);
  assert.equal(m.target, 'p1');
});

test('un monstre lâche sa cible quand elle meurt et en reprend une autre', () => {
  const {w, p1, p2} = duo(), m = herbe(w);
  place(p1, m.x - 1, m.y); place(p2, m.x + 1, m.y);
  handleAction(w, 'p1', {a: 'skill', i: 0});
  assert.equal(m.target, 'p1');
  p1.P.dead = true;
  tick(w, .05);
  assert.equal(m.target, 'p2');
  p2.P.dead = true;
  tick(w, .05);
  assert.equal(m.st, 'ret');
});

test('un kill donne XP et progression de quête au bon joueur seulement', () => {
  const {w, p1, p2} = duo(), m = herbe(w);
  aupres(p1, 'sage'); aupres(p2, 'sage');
  handleAction(w, 'p1', {a: 'acceptQuest'});
  handleAction(w, 'p2', {a: 'acceptQuest'});
  place(p1, m.x - 1, m.y); place(p2, m.x - 6, m.y);
  m.hp = 1;
  handleAction(w, 'p1', {a: 'skill', i: 0});
  assert.equal(m.alive, false);
  assert.equal(p1.S.xp, m.xp);
  assert.equal(p1.S.q.n, 1);
  assert.equal(p2.S.xp, 0);
  assert.equal(p2.S.q.n, 0);
  assert.ok(takeEvents(w, 'p1').some(e => e.t === 'msg' && /Vous gagnez/.test(e.text)));
  assert.ok(!takeEvents(w, 'p2').some(e => e.t === 'msg' && /Vous gagnez/.test(e.text)));
});

test('achat refusé sans or, accepté avec', () => {
  const {w, p1} = duo();
  aupres(p1, 'gerard'); p1.S.gold = 4;
  handleAction(w, 'p1', {a: 'buy', id: 'chips', n: 1});
  assert.equal(p1.S.gold, 4);
  assert.equal(p1.S.inv.find(s => s.id === 'chips').n, 3);
  assert.ok(takeEvents(w, 'p1').some(e => e.t === 'err' && /Pas assez d'or/.test(e.text)));
  p1.S.gold = 5;
  handleAction(w, 'p1', {a: 'buy', id: 'chips', n: 1});
  assert.equal(p1.S.gold, 0);
  assert.equal(p1.S.inv.find(s => s.id === 'chips').n, 4);
});

test('achat refusé loin du marchand', () => {
  const {w, p1} = duo();
  p1.S.gold = 100;
  handleAction(w, 'p1', {a: 'buy', id: 'chips', n: 1});
  assert.equal(p1.S.gold, 100);
});

test('donjon créé avec la bonne difficulté, et détruit quand le dernier joueur le quitte', () => {
  const {w, p1, p2} = duo();
  p1.S.lvl = 7; aupres(p1, 'gardien'); aupres(p2, 'gardien');
  handleAction(w, 'p1', {a: 'enterDungeon', ti: 1});
  const D = w.maps[p1.mapId];
  assert.notEqual(p1.mapId, 'over');
  assert.equal(p2.mapId, 'over');
  assert.equal(D.ti, 1);
  assert.ok(D.mobs.filter(m => !m.d.boss).every(m => m.l === DIFFS[1].L));
  assert.equal(D.mobs.filter(m => m.d.boss).length, 1);
  handleAction(w, 'p1', {a: 'leaveDungeon'});
  assert.equal(p1.mapId, 'over');
  assert.equal(w.maps[D.id], undefined);
});

test('niveau insuffisant : pas de donjon', () => {
  const {w, p1} = duo();
  aupres(p1, 'gardien');
  handleAction(w, 'p1', {a: 'enterDungeon', ti: 1});
  assert.equal(p1.mapId, 'over');
  assert.ok(takeEvents(w, 'p1').some(e => e.t === 'err' && /Niveau 7 requis/.test(e.text)));
});

test('un joueur mort ne peut rien faire sauf réapparaître', () => {
  const {w, p1} = duo();
  p1.P.dead = true; p1.S.hp = 0;
  handleAction(w, 'p1', {a: 'useItem', id: 'chips'});
  assert.equal(p1.S.inv.find(s => s.id === 'chips').n, 3);
  handleAction(w, 'p1', {a: 'respawn'});
  assert.equal(p1.P.dead, false);
  assert.ok(p1.S.hp > 0);
});

test('le chat est diffusé à tous les joueurs', () => {
  const {w} = duo();
  handleChat(w, 'p1', 'en fait salut');
  const e1 = takeEvents(w, 'p1').find(e => e.t === 'chat'), e2 = takeEvents(w, 'p2').find(e => e.t === 'chat');
  assert.equal(e1.me, true);
  assert.equal(e2.me, false);
  assert.equal(e2.text, 'en fait salut');
});

test('même graine, même monde', () => {
  const a = createWorld({seed: 3}), b = createWorld({seed: 3});
  assert.deepEqual(a.maps.over.mobs.map(m => [m.type, m.x, m.y]), b.maps.over.mobs.map(m => [m.type, m.x, m.y]));
});

test('l\'AoE du boss touche tous les joueurs dans la zone et prévient ceux qui l\'ont esquivée', () => {
  const {w, p1, p2} = duo(), maman = w.maps.over.mobs.find(m => m.type === 'maman'), A = maman.d.aoe;
  place(p1, maman.x, maman.y + 1); place(p2, maman.x, maman.y + A.r + 2);
  p1.S.hp = p2.S.hp = 9999;
  maman.st = 'chase'; maman.target = 'p1'; maman.threat = {p1: 1, p2: 1}; maman.bt = 0;
  for (let i = 0; i < 80 && !(maman.cast <= 0 && maman.bt > 7); i++) tick(w, .05);
  const m1 = takeEvents(w, 'p1').filter(e => e.t === 'msg').map(e => e.text), m2 = takeEvents(w, 'p2').filter(e => e.t === 'msg').map(e => e.text);
  assert.ok(m1.some(t => t.includes(A.hit)), 'p1 touché');
  assert.ok(m2.some(t => t === A.dodge), 'p2 a esquivé');
  assert.ok(!m2.some(t => t.includes(A.hit)));
});

test('un kill par dégâts sur la durée revient au joueur qui a posé le DoT', () => {
  const {w, p1, p2} = duo(), m = herbe(w);
  p1.S.lvl = 3; place(p1, m.x - 1, m.y); place(p2, m.x - 5, m.y);
  handleAction(w, 'p1', {a: 'target', id: m.id});
  handleAction(w, 'p1', {a: 'skill', i: 2});
  assert.equal(m.dots.length, 1);
  m.hp = 1;
  for (let i = 0; i < 25 && m.alive; i++) tick(w, .05);
  assert.equal(m.alive, false);
  assert.ok(p1.S.xp > 0 || p1.S.lvl > 3);
  assert.equal(p2.S.xp, 0);
});

function frappe(w, id, m) { handleAction(w, id, {a: 'target', id: m.id}); handleAction(w, id, {a: 'skill', i: 0}); }
const msgs = (w, id) => takeEvents(w, id).filter(e => e.t === 'msg').map(e => e.text);

test('XP partagée à parts égales entre ceux qui ont frappé à moins de 15 cases ; or et butin au premier frappeur', () => {
  const {w, p1, p2} = duo(), p3 = addPlayer(w, 'p3'), m = herbe(w);
  place(p1, m.x - 1, m.y); place(p2, m.x - 1.2, m.y); place(p3, m.x - 8, m.y);
  frappe(w, 'p1', m);
  m.threat.p3 = 1; m.hitters.push('p3');
  place(p3, m.x - 20, m.y);
  m.hp = 1;
  p1.P.cd.tip = 0; p2.P.cd.tip = 0;
  frappe(w, 'p2', m);
  assert.equal(m.alive, false);
  const share = Math.round(m.xp / 2);
  assert.equal(p1.S.xp, share);
  assert.equal(p2.S.xp, share);
  assert.equal(p3.S.xp, 0, 'trop loin');
  assert.ok(p1.S.gold > 5, 'p1 a tagué');
  assert.equal(p2.S.gold, 5);
  assert.equal(p3.S.gold, 5);
});

test('quête 1 à deux en même temps : chacun progresse, sans conflit', () => {
  const {w, p1, p2} = duo();
  aupres(p1, 'sage'); aupres(p2, 'sage');
  handleAction(w, 'p1', {a: 'acceptQuest'}); handleAction(w, 'p2', {a: 'acceptQuest'});
  for (let i = 0; i < 5; i++) {
    const m = w.maps.over.mobs.filter(x => x.type === 'herbe' && x.alive)[0];
    place(p1, m.x - 1, m.y); place(p2, m.x - 1.2, m.y);
    p1.P.cd.tip = 0; p2.P.cd.tip = 0;
    frappe(w, 'p1', m); m.hp = 1; frappe(w, 'p2', m);
    assert.equal(m.alive, false);
  }
  for (const p of [p1, p2]) { assert.equal(p.S.q.st, 'ready'); assert.equal(p.S.q.n, 5); }
  aupres(p1, 'sage'); aupres(p2, 'sage');
  handleAction(w, 'p1', {a: 'completeQuest'}); handleAction(w, 'p2', {a: 'completeQuest'});
  assert.equal(p1.S.q.i, 1); assert.equal(p2.S.q.i, 1);
  assert.equal(p1.S.eq.tete, 'fedora'); assert.equal(p2.S.eq.tete, 'fedora');
});

test('l\'un achète chez Bernard pendant que l\'autre se fait taper dehors', () => {
  const {w, p1, p2} = duo(), m = herbe(w);
  aupres(p1, 'bernard'); p1.S.gold = 100;
  place(p2, m.x - .8, m.y);
  handleAction(w, 'p2', {a: 'target', id: m.id});
  handleAction(w, 'p2', {a: 'skill', i: 0});
  const hp2 = p2.S.hp;
  for (let i = 0; i < 80; i++) tick(w, .05);
  assert.ok(p2.S.hp < hp2, 'p2 est frappé');
  assert.equal(p1.S.hp, 60, 'p1 est en zone sûre, rien ne le touche');
  handleAction(w, 'p1', {a: 'buy', id: 'regle', n: 1});
  assert.equal(p1.S.gold, 80);
  assert.equal(p1.S.eq.arme, 'regle');
  assert.equal(m.target, 'p2');
});

test('la zone sûre est évaluée par joueur : le monstre ignore celui qui s\'y trouve', () => {
  const {w, p1, p2} = duo(), m = herbe(w);
  aupres(p1, 'bernard');
  place(p2, m.x - .8, m.y);
  m.st = 'chase'; m.target = 'p1'; m.threat = {p1: 99};
  tick(w, .05);
  assert.notEqual(m.target, 'p1');
  assert.equal(m.target, 'p2');
});

test('la mort et la réapparition sont individuelles', () => {
  const {w, p1, p2} = duo(), m = herbe(w);
  place(p1, m.x - .7, m.y); place(p2, m.x - 4, m.y);
  p1.S.hp = 1; p1.P.combat = 0;
  handleAction(w, 'p1', {a: 'skill', i: 0});
  for (let i = 0; i < 100 && !p1.P.dead; i++) tick(w, .05);
  assert.equal(p1.P.dead, true);
  assert.equal(p2.P.dead, false);
  handleAction(w, 'p2', {a: 'respawn'});
  assert.equal(p1.P.dead, true, 'le respawn de p2 ne ressuscite pas p1');
  handleAction(w, 'p1', {a: 'respawn'});
  assert.equal(p1.P.dead, false);
  assert.deepEqual([p1.P.x, p1.P.y], [7.5, 8.5]);
});

test('/qui liste tous les joueurs avec niveau et zone', () => {
  const {w, p2} = duo();
  p2.S.lvl = 7; aupres(p2, 'gardien');
  takeEvents(w, 'p1');
  handleChat(w, 'p1', '/qui');
  const [t] = msgs(w, 'p1');
  assert.match(t, /Joueurs connectés \(2\)/);
  assert.match(t, /Sire_Chouffin \(niv\. 1, Le Sous-Sol de Maman\)/);
  assert.match(t, /niv\. 7, Bourg-Forum/);
});

test('/mp : chuchotement privé, écho à l\'expéditeur, erreurs claires', () => {
  const w = createWorld({seed: 1}), a = addPlayer(w, 'a', {name: 'Alice'}), b = addPlayer(w, 'b', {name: 'Bob'}), c = addPlayer(w, 'c', {name: 'Carl'});
  takeEvents(w, 'a'); takeEvents(w, 'b'); takeEvents(w, 'c');
  handleChat(w, 'a', '/mp bob par pitié le khey');
  assert.deepEqual(takeEvents(w, 'b').filter(e => e.t === 'msg'), [{to: 'b', t: 'msg', cls: 'wsp', text: '[Alice] vous chuchote : par pitié le khey'}]);
  assert.match(msgs(w, 'a')[0], /Vous chuchotez à \[Bob\] : par pitié le khey/);
  assert.deepEqual(msgs(w, 'c'), [], 'Carl n\'entend rien');
  handleChat(w, 'a', '/mp Zorg salut');
  assert.match(msgs(w, 'a')[0], /Personne ne s'appelle Zorg/);
  handleChat(w, 'a', '/mp Bob');
  assert.match(msgs(w, 'a')[0], /Usage/);
  assert.ok(a && b && c);
});

test('/danse, /mlady et /khey sont diffusés aux autres joueurs', () => {
  const {w} = duo();
  for (const cmd of ['/danse', '/mlady', '/khey']) {
    takeEvents(w, 'p1'); takeEvents(w, 'p2');
    handleChat(w, 'p1', cmd);
    assert.ok(takeEvents(w, 'p2').some(e => (e.t === 'emote' || e.t === 'chat') && e.who === 'Sire_Chouffin'), cmd);
  }
});

function groupe(w, ...ids) {
  for (const id of ids.slice(1)) { handleChat(w, ids[0], `/inviter ${w.players[id].S.name}`); handleChat(w, id, '/accepter'); }
}
const trio = () => {
  const w = createWorld({seed: 2}), p = ['a', 'b', 'c', 'd', 'e'].map(id => addPlayer(w, id, {name: id.toUpperCase()}));
  return {w, a: p[0], b: p[1], c: p[2], d: p[3], e: p[4]};
};
const bossOf = D => D.mobs.find(m => m.type === 'archiviste');

test('groupe : /inviter, /accepter, chef, 4 joueurs maximum', () => {
  const {w, a, b, c, d, e} = trio();
  groupe(w, 'a', 'b', 'c', 'd');
  assert.equal(a.group, b.group);
  assert.equal(w.groups[a.group].leader, 'a');
  assert.deepEqual(w.groups[a.group].members, ['a', 'b', 'c', 'd']);
  takeEvents(w, 'a');
  handleChat(w, 'a', '/inviter E');
  assert.match(msgs(w, 'a')[0], /complet/);
  assert.equal(e.group, null);
  assert.ok(c && d);
});

test('groupe : seul le chef invite, invitation expirée ou absente refusée, pas de double groupe', () => {
  const {w, a, b} = trio();
  groupe(w, 'a', 'b');
  takeEvents(w, 'b'); takeEvents(w, 'c');
  handleChat(w, 'b', '/inviter C');
  assert.match(msgs(w, 'b')[0], /Seul le chef/);
  handleChat(w, 'c', '/accepter');
  assert.match(msgs(w, 'c')[0], /Personne ne vous a invité/);
  handleChat(w, 'a', '/inviter C');
  tick(w, 61);
  takeEvents(w, 'c');
  handleChat(w, 'c', '/accepter');
  assert.match(msgs(w, 'c')[0], /Personne ne vous a invité/);
  handleChat(w, 'c', '/inviter A');
  assert.ok(a && b);
});

test('groupe : le chef qui part passe la main, le dernier membre dissout le groupe, la déconnexion aussi', () => {
  const {w, a, b} = trio();
  groupe(w, 'a', 'b', 'c');
  handleChat(w, 'a', '/quitter');
  assert.equal(a.group, null);
  assert.equal(w.groups[b.group].leader, 'b');
  removePlayer(w, 'c');
  assert.equal(b.group, null);
  assert.deepEqual(w.groups, {});
});

test('Archives en groupe : une seule instance, seul le chef lance, PV ×(1 + 0,6 × (joueurs − 1))', () => {
  const {w, a, b, c} = trio();
  groupe(w, 'a', 'b');
  for (const p of [a, b, c]) { p.S.lvl = 4; aupres(p, 'gardien'); }
  handleAction(w, 'b', {a: 'enterDungeon', ti: 0});
  assert.equal(b.mapId, 'over');
  assert.ok(takeEvents(w, 'b').some(e => e.t === 'err' && /chef de groupe/.test(e.text)));
  handleAction(w, 'a', {a: 'enterDungeon', ti: 0});
  assert.notEqual(a.mapId, 'over');
  assert.equal(a.mapId, b.mapId);
  assert.equal(c.mapId, 'over', 'hors groupe : reste dehors');
  const D = w.maps[a.mapId];
  assert.equal(D.seed > 0, true);
  assert.equal(D.mobs.length, D.spawns.length);
  D.mobs.forEach((m, i) => assert.equal(m.mhp, Math.round(statsDeMob(D.spawns[i].type, D.spawns[i].l).hp * 1.6)));
  assert.equal(Object.values(w.maps).filter(m => m.id !== 'over').length, 1);
  handleAction(w, 'c', {a: 'enterDungeon', ti: 0});
  assert.notEqual(w.maps[c.mapId].id, D.id, 'le solo a sa propre instance');
});

test('Archives en groupe : un membre absent du Bourg-Forum ou trop bas ne descend pas', () => {
  const {w, a, b, c} = trio();
  groupe(w, 'a', 'b', 'c');
  for (const p of [a, b, c]) { p.S.lvl = 4; aupres(p, 'gardien'); }
  place(b, 7.5, 8.5);
  c.S.lvl = 3;
  handleAction(w, 'a', {a: 'enterDungeon', ti: 0});
  assert.notEqual(a.mapId, 'over');
  assert.equal(b.mapId, 'over');
  assert.equal(c.mapId, 'over');
  assert.ok(msgs(w, 'c').some(t => /Niveau 4 requis/.test(t)));
  const D = w.maps[a.mapId];
  assert.equal(D.mobs[0].mhp, statsDeMob(D.spawns[0].type, D.spawns[0].l).hp, 'seul : pas de bonus');
});

test('Archives en groupe : boss tué ensemble, chaque membre ouvre son coffre une fois, puis tous remontent', () => {
  const {w, a, b} = trio();
  groupe(w, 'a', 'b');
  for (const p of [a, b]) { p.S.lvl = 4; aupres(p, 'gardien'); }
  handleAction(w, 'a', {a: 'enterDungeon', ti: 0});
  const D = w.maps[a.mapId], boss = bossOf(D);
  for (const p of [a, b]) { place(p, boss.x - 1, boss.y); p.S.hp = 9999; }
  frappe(w, 'a', boss); frappe(w, 'b', boss);
  boss.hp = 1; a.P.cd.tip = 0; frappe(w, 'a', boss);
  assert.equal(boss.alive, false);
  assert.equal(D.done, true);
  const chest = D.objs.find(o => o.type === 'chest');
  assert.ok(a.S.dg === 1 && b.S.dg === 1);
  const arts = p => p.S.inv.filter(s => ITEMS[s.id].t === 'art').length;
  for (const p of [a, b]) { place(p, chest.x, chest.y + 1); handleAction(w, p.id, {a: 'openChest', id: chest.id}); }
  assert.ok(arts(a) > 0 && arts(b) > 0, 'butin personnel');
  const goldA = a.S.gold;
  takeEvents(w, 'a');
  handleAction(w, 'a', {a: 'openChest', id: chest.id});
  assert.equal(a.S.gold, goldA, 'une seule ouverture par membre');
  assert.ok(takeEvents(w, 'a').some(e => e.t === 'err' && /vide/.test(e.text)));
  assert.deepEqual(chest.openedBy, ['a', 'b']);
  handleAction(w, 'a', {a: 'leaveDungeon'});
  assert.equal(a.mapId, 'over');
  assert.ok(w.maps[D.id], 'b est encore dedans');
  handleAction(w, 'b', {a: 'leaveDungeon'});
  assert.equal(b.mapId, 'over');
  assert.equal(w.maps[D.id], undefined, 'détruite quand plus personne');
  assert.deepEqual([a.P.x, a.P.y], [21.5, 20.4]);
});

test('le snapshot décrit le groupe aux membres et l\'état du coffre par joueur', () => {
  const {w, a, b} = trio();
  groupe(w, 'a', 'b');
  b.S.lvl = 3;
  const mine = snapshotFor(w, 'a').ents.find(e => e.id === 'a').priv.group;
  assert.equal(mine.leader, 'a');
  assert.deepEqual(mine.members.map(m => [m.id, m.n, m.lvl, m.mhp]), [['b', 'B', 3, 90]]);
  assert.equal(snapshotFor(w, 'c').ents.find(e => e.id === 'c').priv.group, null);
  assert.ok(a);
});

function echange() {
  const w = createWorld({seed: 1}), a = addPlayer(w, 'a', {name: 'Alice'}), b = addPlayer(w, 'b', {name: 'Bob'});
  handleChat(w, 'a', '/echanger bob');
  handleChat(w, 'b', '/accepter');
  return {w, a, b};
}
const lastTrade = (w, id) => takeEvents(w, id).filter(e => e.t === 'trade').pop();

test('/echanger + /accepter ouvre la fenêtre chez les deux ; /accepter sans proposition ne fait rien', () => {
  const {w, a, b} = echange();
  assert.ok(a.trade && b.trade);
  assert.equal(lastTrade(w, 'a').with, 'Bob');
  assert.equal(lastTrade(w, 'b').with, 'Alice');
  handleChat(w, 'a', '/accepter');
  assert.match(msgs(w, 'a').pop(), /Personne ne vous a invité/);
});

test('échange : les deux valident → objets et or changent de mains', () => {
  const {w, a, b} = echange();
  a.S.gold = 50;
  handleAction(w, 'a', {a: 'tradeOffer', items: [{id: 'chips', n: 2}], gold: 30});
  handleAction(w, 'b', {a: 'tradeOffer', items: [{id: 'chouffe', n: 1}], gold: 0});
  handleAction(w, 'a', {a: 'tradeOk'});
  assert.ok(a.trade, 'une seule validation ne suffit pas');
  handleAction(w, 'b', {a: 'tradeOk'});
  assert.equal(a.trade, null);
  assert.equal(b.trade, null);
  const n = (p, id) => p.S.inv.filter(s => s.id === id).reduce((t, s) => t + s.n, 0);
  assert.deepEqual([n(a, 'chips'), n(a, 'chouffe'), a.S.gold], [1, 2, 20]);
  assert.deepEqual([n(b, 'chips'), n(b, 'chouffe'), b.S.gold], [5, 0, 35]);
  assert.ok(takeEvents(w, 'a').some(e => e.t === 'trade' && e.end));
});

test('échange : modifier son offre annule la validation de l\'autre', () => {
  const {w, a, b} = echange();
  handleAction(w, 'b', {a: 'tradeOk'});
  assert.equal(b.trade.ok, true);
  handleAction(w, 'a', {a: 'tradeOffer', items: [{id: 'chips', n: 1}], gold: 0});
  assert.equal(b.trade.ok, false);
  handleAction(w, 'a', {a: 'tradeOk'});
  assert.ok(a.trade && b.trade, 'b doit revalider');
});

test('échange : offre qu\'on ne possède pas refusée ; sac plein = rien ne bouge', () => {
  const {w, a, b} = echange();
  takeEvents(w, 'a');
  handleAction(w, 'a', {a: 'tradeOffer', items: [{id: 'chips', n: 99}], gold: 0});
  assert.deepEqual(a.trade.items, []);
  assert.ok(takeEvents(w, 'a').some(e => e.t === 'err' && /ne possédez pas/.test(e.text)));
  b.S.inv = Array.from({length: 24}, () => ({id: 'epee_rouillee', n: 1}));
  handleAction(w, 'a', {a: 'tradeOffer', items: [{id: 'chips', n: 1}], gold: 0});
  handleAction(w, 'a', {a: 'tradeOk'}); handleAction(w, 'b', {a: 'tradeOk'});
  assert.equal(a.trade, null);
  assert.equal(a.S.inv.find(s => s.id === 'chips').n, 3, 'rollback');
  assert.equal(b.S.inv.length, 24);
});

test('échange : annulation, mort et déconnexion ferment la fenêtre des deux côtés', () => {
  for (const fin of [w => handleAction(w, 'a', {a: 'tradeCancel'}), w => removePlayer(w, 'a')]) {
    const {w, b} = echange();
    fin(w);
    assert.equal(b.trade, null);
    assert.ok(takeEvents(w, 'b').some(e => e.t === 'trade' && e.end));
  }
});

test('/top : trois classements, triés, hors-ligne compris via w.saves()', () => {
  const w = createWorld({seed: 1}), a = addPlayer(w, 'a', {name: 'Alice'});
  const S = (name, lvl, dg, chouffes) => ({name, lvl, xp: 0, dg, chouffes});
  w.saves = () => [S('Zed', 12, 0, 1), S('Yan', 30, 5, 0), a.S, S('Xia', 30, 9, 40)];
  a.S.lvl = 7; a.S.chouffes = 3;
  takeEvents(w, 'a');
  handleChat(w, 'a', '/top');
  const [niv, dg, chouffes] = msgs(w, 'a');
  assert.match(niv, /^Top Niveau : 1\. (Yan|Xia) \(30\) · 2\. (Yan|Xia) \(30\) · 3\. Zed \(12\) · 4\. Alice \(7\)$/);
  assert.match(dg, /^Top Archives terminées : 1\. Xia \(9\) · 2\. Yan \(5\)/);
  assert.match(chouffes, /^Top Chouffes bues : 1\. Xia \(40\) · 2\. Alice \(3\) · 3\. Zed \(1\)/);
});

test('les trois nouvelles répliques existent chez les bots et chez des PNJ, et un PNJ les dit', () => {
  const lignes = ['Alexandre Astier est un génie', 'Le seranno est très salé', 'Qu\'est ce que tu veux qu\'il te fasse le minotaure'];
  for (const l of lignes) {
    assert.ok(BOT_LINES.includes(l), 'bots : ' + l);
    assert.ok(NPCS.some(n => n.lines.includes(l)), 'PNJ : ' + l);
  }
  const w = createWorld({seed: 1});
  addPlayer(w, 'p1');
  const dits = new Set();
  for (let i = 0; i < 20 * 70; i++) { tick(w, .05); for (const n of w.maps.over.npcs) if (n.sayT > 0) dits.add(n.say); }
  assert.ok([...dits].some(t => lignes.includes(t)), 'au moins une réplique prononcée en 70 s');
});

test('/annonce : bannière chez tous avec le droit ; sans le droit, « Commande inconnue » même à la main', () => {
  const w = createWorld({seed: 1}), a = addPlayer(w, 'a', {name: 'Alice', save: {...newSave('Alice'), droits: ['annonce']}}), b = addPlayer(w, 'b', {name: 'Bob'});
  takeEvents(w, 'a'); takeEvents(w, 'b');
  handleChat(w, 'b', '/annonce Free Palestine du Sous-Sol');
  assert.match(msgs(w, 'b')[0], /Commande inconnue : \/annonce/);
  assert.ok(!takeEvents(w, 'a').some(e => e.t === 'announce'));
  handleChat(w, 'a', '/annonce Maintenance dans 5 minutes');
  for (const id of ['a', 'b']) {
    const evs = takeEvents(w, id);
    assert.deepEqual(evs.find(e => e.t === 'announce'), {to: id, t: 'announce', who: 'Alice', text: 'Maintenance dans 5 minutes'});
    assert.ok(evs.some(e => e.t === 'msg' && /\[Annonce\] Alice : Maintenance/.test(e.text)), 'ligne de chat');
  }
  handleChat(w, 'a', '/aide'); handleChat(w, 'b', '/aide');
  assert.match(msgs(w, 'a')[0], /\/annonce/);
  assert.doesNotMatch(msgs(w, 'b')[0], /annonce/);
  assert.ok(a && b);
});
