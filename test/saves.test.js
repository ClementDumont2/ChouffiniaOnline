import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createWorld, addPlayer, tick, handleAction, handleChat} from '../shared/sim.js';
import {snapshotFor} from '../shared/protocol.js';
import {newItem, newSave, normalizeSave, resetLoot, stats} from '../shared/rules.js';
import {MAXLVL} from '../shared/data.js';
import {resetDir} from '../scripts/reset-loot.js';

const riche = () => ({
  name: 'Vétéran', hat: '#6d2230', cls: 'modo', lvl: 42, xp: 1234, gold: 98765, hp: 99999, caf: 20,
  inv: [{id: 'chips', n: 40}, {uid: 'i7', ...newItem('katana', 9, 'epic')}, {id: 'art_wifi', n: 2}],
  eq: {arme: {uid: 'i3', ...newItem('ethernet')}, tete: {uid: 'i4', ...newItem('fedora')}, torse: null, mains: null, jambes: null},
  nextUid: 12, q: {i: 5, st: 'active', n: 2}, ach: {first: 1, boss: 1}, kills: 800, deaths: 3, chouffes: 55, dg: 4,
  mounts: ['chaise', 'trottinette'], mount: 'trottinette', duelWins: 6, duelLosses: 2, titre: 'Diplômé (enfin)', droits: ['annonce'],
});

test('resetLoot : sac et équipement remis au kit de départ, tout le reste conservé', () => {
  const avant = riche(), S = resetLoot(avant);
  assert.deepEqual(S.inv, newSave().inv);
  assert.deepEqual(S.eq, newSave().eq);
  assert.equal(S.nextUid, 0);
  for (const k of ['name', 'hat', 'cls', 'lvl', 'xp', 'gold', 'kills', 'deaths', 'chouffes', 'dg', 'duelWins', 'duelLosses', 'titre', 'mounts', 'mount', 'q', 'ach', 'droits'])
    assert.deepEqual(S[k], avant[k], k);
  assert.ok(S.hp <= stats(S).maxhp, 'PV ramenés au maximum sans équipement');
  assert.deepEqual(resetLoot(S), S, 'idempotent');
  assert.deepEqual(normalizeSave(S), S, 'déjà à la structure actuelle');
  const sans = riche(); delete sans.droits;
  assert.equal('droits' in resetLoot(sans), false, 'pas de droits inventés');
});

test('resetLoot adapte une très vieille sauvegarde à la structure actuelle (champs récents, identifiants d\'objets)', () => {
  const vieux = {name: 'Ancien', hat: '#1d1b22', lvl: 13, xp: 5, gold: 3000, hp: 340, caf: 100, inv: [{id: 'katana', n: 1}], eq: {arme: 'regle'}, q: {i: 3, st: 'avail', n: 0}, ach: {}};
  const S = resetLoot(vieux);
  assert.equal(S.lvl, 13); assert.equal(S.gold, 3000);
  assert.equal(S.cls, 'chouffin'); assert.deepEqual(S.mounts, []); assert.equal(S.duelWins, 0); assert.equal(S.eq.arme, null);
});

test('les sauvegardes abîmées ne font jamais planter le chargement', () => {
  const sacs = [null, undefined, 'texte', 42, [], [1, 2], {},
    {lvl: 'abc', gold: null, hp: 'x', caf: NaN, inv: 'x', eq: 5, q: {i: -3, st: 'zz', n: 'a'}, ach: [], mounts: 'x', droits: 'tous'},
    {lvl: 1e9, xp: -5, gold: -100, name: 42, hat: 'rouge', cls: {}, inv: [null, 3, {id: 'nope'}, {id: 'chips', n: -5}, {id: 'chips', n: 1e12}, {id: 'katana'}, 'regle', {uid: 'zz', id: 'chips'}], eq: {arme: 'nimporte', tete: {id: 'fedora', uid: 7}, bidule: 1}},
    {inv: Array.from({length: 80}, () => ({id: 'chips', n: 1}))},
    {q: {i: 9999}, mount: 'fantome', mounts: ['fantome', 'chaise', 7]}];
  for (const sv of sacs) {
    const S = normalizeSave(sv);
    assert.ok(Number.isInteger(S.lvl) && S.lvl >= 1 && S.lvl <= MAXLVL, JSON.stringify(sv));
    assert.ok(Number.isInteger(S.gold) && S.gold >= 0 && Number.isInteger(S.xp) && S.xp >= 0);
    assert.ok(Number.isFinite(S.hp) && Number.isFinite(S.caf) && typeof S.name === 'string' && S.name.length > 0);
    assert.ok(Array.isArray(S.inv) && S.inv.length <= 24 && S.inv.every(s => s.uid ? typeof s.uid === 'string' && s.nObj >= 1 : s.n >= 1 && s.n <= 9999));
    assert.ok(S.q.i >= 0 && ['avail', 'active', 'ready'].includes(S.q.st) && Number.isInteger(S.q.n));
    assert.ok(Array.isArray(S.mounts) && Array.isArray(S.droits) && (S.mount === null || S.mounts.includes(S.mount)));
    assert.deepEqual(normalizeSave(S), S, 'stable');
    // et le monde l'accepte : on joue un peu, on demande un snapshot, on parle.
    const w = createWorld({seed: 1}), p = addPlayer(w, 'p1', {save: sv});
    for (let i = 0; i < 40; i++) tick(w, .05);
    handleChat(w, 'p1', '/qui'); handleAction(w, 'p1', {a: 'skill', i: 0});
    assert.ok(snapshotFor(w, 'p1').ents.length > 0 && p.S.hp > 0);
  }
});

test('toutes les sauvegardes du dépôt (saves/) se chargent et se jouent', () => {
  const dir = new URL('../saves/', import.meta.url).pathname;
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir).filter(f => f.endsWith('.json'))) {
    let sv; try { sv = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch { continue; }
    const S = normalizeSave(sv);
    assert.deepEqual(normalizeSave(S), S, f);
    const w = createWorld({seed: 1}); addPlayer(w, 'p1', {save: sv});
    for (let i = 0; i < 20; i++) tick(w, .05);
    assert.ok(snapshotFor(w, 'p1').ents.some(e => e.id === 'p1'), f);
  }
});

test('reset-loot sur un dossier : copie d\'origine, fichiers remis au kit, fichier illisible intact, --dry n\'écrit rien', () => {
  const dir = mkdtempSync(join(tmpdir(), 'chouffinia-reset-')), backupDir = join(dir, 'sauvegarde');
  writeFileSync(join(dir, 'vet.json'), JSON.stringify(riche()));
  writeFileSync(join(dir, 'casse.json'), '{pas du json');
  const avant = readFileSync(join(dir, 'vet.json'), 'utf8');
  const sim = resetDir(dir, {dry: true, backupDir});
  assert.equal(readFileSync(join(dir, 'vet.json'), 'utf8'), avant, '--dry n\'écrit rien');
  assert.equal(existsSync(backupDir), false);
  assert.equal(sim.find(r => r.f === 'vet.json').avant, 5);
  const rap = resetDir(dir, {backupDir});
  const apres = JSON.parse(readFileSync(join(dir, 'vet.json'), 'utf8'));
  assert.equal(apres.lvl, 42); assert.equal(apres.gold, 98765); assert.equal(apres.inv.length, 2); assert.equal(Object.values(apres.eq).filter(Boolean).length, 0);
  assert.equal(readFileSync(join(backupDir, 'vet.json'), 'utf8'), avant, 'copie d\'origine intacte');
  assert.equal(readFileSync(join(dir, 'casse.json'), 'utf8'), '{pas du json');
  assert.match(rap.find(r => r.f === 'casse.json').ignore, /illisible/);
  assert.equal(existsSync(join(backupDir, 'casse.json')), false);
});
