import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld, addPlayer, tick, handleAction, takeEvents} from '../shared/sim.js';
import {bossUpcoming, statsDeMob, stats} from '../shared/rules.js';
import {genDungeon} from '../shared/map.js';
import {NPCS} from '../shared/data.js';
import {AFFIXES, BOSSES} from '../shared/data/bosses.js';

const gardien = NPCS.find(n => n.id === 'gardien');
const run = (w, s) => { for (let i = 0; i < Math.round(s * 20); i++) tick(w, .05); };
const place = (pl, x, y) => { pl.P.x = x; pl.P.y = y; };

// Un joueur entre en donjon à la difficulté ti ; d'autres peuvent être ajoutés dans la même instance.
function donjon(ti, seed = 5, joueurs = 1) {
  const w = createWorld({seed}), ps = [];
  for (let i = 1; i <= joueurs; i++) { const p = addPlayer(w, 'p' + i, {name: 'P' + i}); p.S.lvl = 20; p.S.hp = stats(p.S).maxhp * 50; ps.push(p); }
  place(ps[0], gardien.x + 1, gardien.y + .3);
  handleAction(w, 'p1', {a: 'enterDungeon', ti});
  const D = w.maps[ps[0].mapId], boss = D.mobs.find(m => m.type === 'archiviste');
  // combat très négatif : ni régénération ni plafonnement des PV, pour mesurer les dégâts exacts sans que personne ne meure.
  ps.forEach((p, i) => { p.mapId = D.id; p.S.hp = 1e6; p.P.combat = -1e9; place(p, boss.x - 1.2 - i * .3, boss.y); });
  boss.st = 'chase'; boss.target = 'p1'; boss.threat = {p1: 1};
  return {w, ps, D, boss};
}
const noms = boss => bossUpcoming(boss).map(a => a.n);

test('chaque capacité n\'existe qu\'à partir de sa difficulté', () => {
  const att = [
    ['Mur de Texte'],
    ['Mur de Texte', 'Nécroposteurs', 'Nécroposteurs'],
    ['Mur de Texte', 'Nécroposteurs', 'Nécroposteurs', 'Citation en Chaîne'],
    ['Mur de Texte', 'Nécroposteurs', 'Nécroposteurs', 'Citation en Chaîne', 'Topic Verrouillé', 'Enrage'],
  ];
  att.forEach((liste, ti) => assert.deepEqual(noms(donjon(ti).boss), liste, DIFFS_NOM(ti)));
});
const DIFFS_NOM = ti => ['Normal', 'Héroïque', 'Mythique', 'Sans Douche'][ti];

test('invocations de Nécroposteurs à 66 % et 33 % de PV (Héroïque et plus), jamais en Normal', () => {
  const count = boss => boss.b.summons.length;
  const n = donjon(0);
  n.boss.hp = n.boss.mhp * .2; run(n.w, 1);
  assert.equal(count(n.boss), 0);
  const {w, boss, D} = donjon(1);
  boss.hp = boss.mhp * .7; run(w, 1); assert.equal(count(boss), 0, 'pas encore sous 66 %');
  boss.hp = boss.mhp * .6; run(w, 1); assert.equal(count(boss), 2);
  boss.hp = boss.mhp * .5; run(w, 1); assert.equal(count(boss), 2, 'une seule fois par seuil');
  boss.hp = boss.mhp * .3; run(w, 1); assert.equal(count(boss), 4);
  const necros = D.mobs.filter(m => m.summoned);
  assert.ok(necros.length === 4 && necros.every(m => m.type === 'necro' && m.st === 'chase'));
  assert.ok(necros.every(m => m.xp === 0 && m.g[1] === 0), 'sans récompense');
});

test('Citation en Chaîne : rebondit sur les joueurs proches du marqué, épargne ceux qui s\'écartent', () => {
  const {w, ps, boss, D} = donjon(2, 5, 3);
  D.mobs = [boss]; // seul le boss : aucun autre monstre ne vient blesser le joueur écarté
  const [a, b, c] = ps;
  place(a, boss.x - 2, boss.y); place(b, boss.x - 2, boss.y + 2); place(c, boss.x + 6, boss.y);
  boss.b.cd.mur = 99; boss.b.cd.chaine = 0;
  tick(w, .05);
  assert.equal(boss.castK, 'chain');
  boss.mark = 'p1';
  const hp = ps.map(p => p.S.hp);
  run(w, 2.5);
  assert.ok(a.S.hp < hp[0] && b.S.hp < hp[1], 'le marqué et son voisin (2 cases) sont touchés');
  assert.equal(c.S.hp, hp[2], 'celui qui s\'est écarté (8 cases) est épargné');
  assert.ok(hp[0] - a.S.hp < hp[1] - b.S.hp, 'le rebond tape plus fort (+25 %)');
});

test('Topic Verrouillé (Sans Douche) : la zone rétrécit, ceux qui restent dehors souffrent ; absent en Mythique', () => {
  assert.equal(donjon(2).boss.zone, null);
  const m = donjon(2); m.boss.hp = m.boss.mhp * .2; run(m.w, 1); assert.equal(m.boss.zone, null);
  const {w, ps, boss, D} = donjon(3, 5, 2);
  D.mobs = [boss];
  Object.assign(boss.b.done, {'necros0.66': 1, 'necros0.33': 1});
  boss.hp = boss.mhp * .29; tick(w, .05);
  assert.ok(boss.zone && boss.zone.r === 7);
  // Le boss poursuit le joueur hors zone (menace) : celui qui reste au centre n'est jamais au contact.
  const [dehors, dedans] = ps;
  place(dedans, boss.hx - 1, boss.hy); place(dehors, boss.hx + 6, boss.hy);
  boss.b.cd.mur = 999; boss.b.cd.chaine = 999;
  run(w, 26);
  assert.equal(boss.zone.r, 2.6);
  const hpD = dedans.S.hp, hpO = dehors.S.hp;
  run(w, 3);
  assert.equal(dedans.S.hp, hpD, 'dans la zone : rien');
  assert.ok(dehors.S.hp < hpO, 'hors zone : dégâts à chaque seconde');
});

test('enrage après 4 minutes (Sans Douche seulement) : dégâts × 2,5', () => {
  for (const [ti, enrage] of [[2, false], [3, true]]) {
    const {w, ps, boss} = donjon(ti);
    boss.b.cd.mur = 999; boss.b.cd.chaine = 999; boss.atk = [100, 100];
    place(ps[0], boss.x - .5, boss.y);
    const frappe = () => { boss.acd = 0; const h = ps[0].S.hp; tick(w, .05); return h - ps[0].S.hp; };
    const avant = frappe();
    boss.b.t = 239.99; tick(w, .1);
    assert.equal(!!boss.hard, enrage, DIFFS_NOM(ti));
    const apres = frappe();
    assert.equal(apres, enrage ? Math.round(avant * 2.5) : avant);
  }
});

test('donjons plus durs : PV ×1,3 et dégâts ×1,2 à partir d\'Héroïque, packs plus gros', () => {
  for (const ti of [0, 1, 3]) {
    const {D} = donjon(ti);
    const normaux = D.mobs.filter(m => !m.elite && m.type !== 'archiviste' && !m.summoned);
    const m = normaux[0], base = statsDeMob(m.type, m.l), k = ti >= 1;
    assert.equal(m.mhp, Math.round(base.hp * (k ? 1.3 : 1)), `PV ${DIFFS_NOM(ti)}`);
    assert.deepEqual(m.atk, base.atk.map(a => Math.round(a * (k ? 1.2 : 1))), `dégâts ${DIFFS_NOM(ti)}`);
  }
  const moy = ti => { let t = 0; for (let s = 1; s <= 12; s++) t += genDungeon(s, ti).spawns.length; return t / 12; };
  assert.ok(moy(1) > moy(0) && moy(2) > moy(1) && moy(3) > moy(2), 'plus de monstres à chaque difficulté');
});

test('patrouilles dès Héroïque : le monstre suit le couloir qui relie deux salles', () => {
  const avec = ti => { let n = 0; for (let s = 1; s <= 30; s++) n += genDungeon(s, ti).spawns.filter(sp => sp.patrol).length; return n; };
  assert.equal(avec(0), 0);
  assert.ok(avec(1) > 0, 'quelques patrouilles en Héroïque');
  for (let s = 1; s <= 30; s++) {
    const D = genDungeon(s, 3), sp = D.spawns.find(x => x.patrol);
    if (!sp) continue;
    const {w, ps, D: inst} = donjon(3, s);
    const m = inst.mobs.find(x => x.patrol);
    if (!m) continue;
    ps[0].mapId = 'over'; // plus personne dans le donjon : les monstres ne s'y battent pas, mais continuent leur ronde
    place(ps[0], 8, 8.5);
    const x0 = m.x, y0 = m.y;
    inst.mobs.forEach(o => { o.st = o.st === 'chase' ? 'idle' : o.st; });
    for (let i = 0; i < 20 * 8; i++) tick(w, .05);
    assert.ok(Math.hypot(m.x - x0, m.y - y0) > 1, 'le patrouilleur a bougé');
    return;
  }
  assert.fail('aucune patrouille trouvée sur 30 graines');
});

// Un monstre ordinaire du donjon, collé au joueur et ciblé.
function cible(ti = 2) {
  const x = donjon(ti), m = x.D.mobs.find(o => !o.elite && o.type !== 'archiviste');
  x.w.rnd = () => .5;
  place(x.ps[0], m.x - 1, m.y); m.st = 'idle'; m.target = null;
  x.boss.st = 'idle';
  handleAction(x.w, 'p1', {a: 'target', id: m.id});
  const frappe = i => { x.ps[0].P.cd = {}; x.ps[0].S.caf = 99; handleAction(x.w, 'p1', {a: 'skill', i}); };
  return {...x, m, frappe};
}

test('élites avec affixe en Mythique et Sans Douche seulement, PV ×1,5 en plus', () => {
  const elites = ti => { const l = []; for (let s = 1; s <= 12; s++) l.push(...donjon(ti, s).D.mobs.filter(m => m.elite)); return l; };
  assert.equal(elites(0).length + elites(1).length, 0);
  const e2 = elites(2), e3 = elites(3);
  assert.ok(e2.length > 0 && e3.length > e2.length / 2);
  for (const m of [...e2, ...e3]) {
    assert.ok(m.affix in AFFIXES);
    const base = statsDeMob(m.type, m.l).hp;
    assert.equal(m.mhp, Math.round(base * 1.3 * 1.5), 'PV Héroïque+ × élite');
  }
  assert.ok(new Set([...e2, ...e3].map(m => m.affix)).size === 3, 'les trois affixes apparaissent');
});

test('« Modéré » : immunisé aux étourdissements', () => {
  const a = cible(), b = cible();
  a.m.affix = 'modere'; a.m.hp = a.m.mhp = 1e5; b.m.hp = b.m.mhp = 1e5;
  a.frappe(1); b.frappe(1);
  assert.equal(a.m.stun, 0);
  assert.equal(b.m.stun, 2.5);
});

test('« Épinglé » : un bouclier absorbe les dégâts avant les PV', () => {
  const {m, frappe} = cible();
  m.hp = m.mhp = 1e5; m.shield = m.mshield = 1000;
  frappe(0);
  assert.equal(m.hp, 1e5, 'tout est absorbé'); assert.ok(m.shield < 1000);
  m.shield = 3; frappe(0);
  assert.equal(m.shield, 0);
  assert.ok(m.hp < 1e5, 'le surplus passe');
});

test('« Nécroposté » : revient une fois à 30 % de PV, sans récompense la première fois', () => {
  const {m, frappe, ps} = cible();
  m.affix = 'necroposte'; m.hp = 1;
  const xp = ps[0].S.xp;
  frappe(0);
  assert.equal(m.alive, true);
  assert.equal(m.hp, Math.round(m.mhp * .3));
  assert.equal(ps[0].S.xp, xp, 'pas d\'XP à la première mort');
  m.hp = 1; frappe(0);
  assert.equal(m.alive, false);
  assert.ok(ps[0].S.xp > xp);
});

test('Maman suit le même moteur : Cousins à 66 % dès Héroïque (normale : rien)', () => {
  for (const [diff, attendu] of [[0, 0], [1, 2]]) {
    const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {name: 'P1'}), maman = w.maps.over.mobs.find(m => m.type === 'maman');
    p.S.hp = 1e6; p.P.combat = -1e9; place(p, maman.x - 1, maman.y);
    maman.diff = diff; maman.st = 'chase'; maman.target = 'p1'; maman.threat = {p1: 1}; maman.hp = maman.mhp * .6;
    run(w, 1);
    assert.equal(maman.b.summons.length, attendu);
    for (const id of maman.b.summons) assert.equal(w.maps.over.mobs.find(m => m.id === id).type, 'normie');
  }
  assert.deepEqual(BOSSES.maman.abilities.map(a => a.diffMin), BOSSES.archiviste.abilities.map(a => a.diffMin), 'même progression par difficulté');
});

test('à la mort du boss, ses invocations disparaissent ; si le groupe fuit, le boss repart à zéro', () => {
  const {w, boss, D} = donjon(1);
  boss.hp = boss.mhp * .6; run(w, 1);
  const inv = D.mobs.filter(m => m.summoned);
  assert.equal(inv.length, 2);
  boss.hp = 1; place(w.players.p1, boss.x - 1, boss.y);
  handleAction(w, 'p1', {a: 'target', id: boss.id}); w.players.p1.P.cd = {}; handleAction(w, 'p1', {a: 'skill', i: 0});
  assert.equal(boss.alive, false);
  assert.ok(inv.every(m => !m.alive), 'invocations mortes avec le boss');
  run(w, 2);
  assert.equal(D.mobs.filter(m => m.summoned).length, 0, 'et retirées de la carte');
  // Reset : plus personne dans le donjon → le boss revient, ses compteurs et phases sont remis à zéro.
  const y = donjon(3); y.boss.hp = y.boss.mhp * .2; run(y.w, 1);
  assert.ok(y.boss.zone && y.boss.b.summons.length === 4);
  y.w.players.p1.P.dead = true; run(y.w, 4);
  assert.equal(y.boss.zone, null); assert.equal(y.boss.b.summons.length, 0); assert.deepEqual(y.boss.b.done, {});
});
