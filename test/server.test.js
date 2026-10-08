import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, existsSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import WebSocket from 'ws';
import {startServer, lanUrls} from '../server/index.js';
import {snapshotFor, cleanName} from '../shared/protocol.js';
import {NPCS} from '../shared/data.js';

async function setup() {
  const savesDir = mkdtempSync(join(tmpdir(), 'chouffinia-'));
  const srv = await startServer({port: 0, savesDir});
  const clients = [];
  async function client(name) {
    const ws = new WebSocket(`ws://localhost:${srv.port}`), msgs = [], waiters = [];
    ws.on('message', d => { const m = JSON.parse(d); msgs.push(m); for (const w of [...waiters]) if (w.pred(m)) { waiters.splice(waiters.indexOf(w), 1); w.res(m); } });
    await new Promise(r => ws.on('open', r));
    const c = {ws, msgs, send: m => ws.send(JSON.stringify(m)),
      next: (pred, ms = 2000) => new Promise((res, rej) => { const old = msgs.find(pred); if (old) return res(old); const t = setTimeout(() => rej(new Error('timeout')), ms); waiters.push({pred, res: m => { clearTimeout(t); res(m); }}); }),
      fresh: pred => { msgs.length = 0; return c.next(pred); }};
    clients.push(c);
    c.send({t: 'join', name});
    c.welcome = await c.next(m => m.t === 'welcome');
    return c;
  }
  const stop = async () => { for (const c of clients) c.ws.terminate(); await srv.close(); };
  return {srv, savesDir, client, stop};
}

test('join : welcome avec id, graine et sauvegarde ; le pseudo est assaini', async () => {
  const {client, stop} = await setup();
  try {
    const a = await client('../../etc/passwd');
    assert.equal(a.welcome.save.name, cleanName('../../etc/passwd'));
    assert.match(a.welcome.save.name, /^[\p{L}\p{N}_-]+$/u);
    assert.equal(a.welcome.seed, 20111);
    assert.equal(a.welcome.save.lvl, 1);
  } finally { await stop(); }
});

test('deux joueurs se voient bouger, et un déplacement dans un mur est corrigé', async () => {
  const {client, stop} = await setup();
  try {
    const a = await client('alice'), b = await client('bob');
    const ida = a.welcome.id;
    a.send({t: 'move', x: 8, y: 8.5, face: 1});
    const snap = await b.fresh(m => m.t === 'snap' && m.ents.some(e => e.id === ida && e.x === 8));
    assert.equal(snap.ents.find(e => e.id === ida).kind, 'player');
    assert.equal(snap.ents.filter(e => e.kind === 'player').length, 2);
    a.msgs.length = 0;
    a.send({t: 'move', x: 1.2, y: 1.2, face: 1});
    const ev = await a.next(m => m.t === 'ev' && m.list.some(e => e.t === 'tp'));
    assert.deepEqual(ev.list.find(e => e.t === 'tp'), {to: ida, t: 'tp', x: 8, y: 8.5});
    a.msgs.length = 0;
    a.send({t: 'move', x: 20, y: 8.5, face: 1});
    await a.next(m => m.t === 'ev' && m.list.some(e => e.t === 'tp'));
  } finally { await stop(); }
});

test('la même herbe meurt une fois ; l\'or va au premier frappeur, l\'XP est partagée', async () => {
  const {srv, client, stop} = await setup();
  try {
    const a = await client('alice'), b = await client('bob');
    const m = srv.world.maps.over.mobs.find(x => x.type === 'herbe');
    const pa = srv.world.players[a.welcome.id], pb = srv.world.players[b.welcome.id];
    pa.P.x = m.x - 1; pa.P.y = m.y; pb.P.x = m.x - 1.2; pb.P.y = m.y;
    a.send({t: 'act', a: 'target', id: m.id, auto: true});
    a.send({t: 'act', a: 'skill', i: 0});
    await a.next(m2 => m2.t === 'ev' && m2.list.some(e => e.t === 'msg' && /inflige/.test(e.text)));
    assert.equal(m.tag, pa.id);
    m.hp = 1;
    b.send({t: 'act', a: 'skill', i: 0});
    await b.next(m2 => m2.t === 'self' && m2.save.kills === 1);
    assert.equal(m.alive, false);
    assert.equal(pb.S.kills, 1);
    assert.equal(pa.S.kills, 1, 'alice a frappé aussi : elle compte le kill');
    assert.equal(pa.S.xp, pb.S.xp, 'XP à parts égales');
    assert.ok(pa.S.gold > 5, 'alice a le butin');
    assert.equal(pb.S.gold, 5, 'bob n\'a pas l\'or');
  } finally { await stop(); }
});

test('le chat est diffusé, la sauvegarde est écrite à la déconnexion et rechargée au join', async () => {
  const {srv, savesDir, client, stop} = await setup();
  try {
    const a = await client('alice'), b = await client('bob');
    a.send({t: 'chat', text: 'salut les kheys'});
    const ev = await b.next(m => m.t === 'ev' && m.list.some(e => e.t === 'chat' && e.text === 'salut les kheys'));
    assert.equal(ev.list.find(e => e.t === 'chat').who, 'alice');
    const pa = srv.world.players[a.welcome.id];
    const g = NPCS.find(n => n.id === 'gerard');
    pa.P.x = g.x + 1; pa.P.y = g.y; pa.S.gold = 77;
    a.ws.close();
    await b.fresh(m => m.t === 'snap' && m.ents.filter(e => e.kind === 'player').length === 1);
    assert.equal(Object.keys(srv.world.players).length, 1);
    assert.ok(existsSync(join(savesDir, 'alice.json')));
    assert.equal(JSON.parse(readFileSync(join(savesDir, 'alice.json'), 'utf8')).gold, 77);
    const a2 = await client('alice');
    assert.equal(a2.welcome.save.gold, 77);
  } finally { await stop(); }
});

test('un snapshot ne contient que les entités de la carte du joueur, avec les champs de rendu', async () => {
  const {srv, client, stop} = await setup();
  try {
    const a = await client('alice');
    const snap = await a.next(m => m.t === 'snap');
    assert.equal(snap.world.id, 'over');
    assert.ok(snap.ents.some(e => e.kind === 'mob'));
    const me = snap.ents.find(e => e.id === a.welcome.id);
    assert.ok(me.priv && 'hp' in me.priv && 'cd' in me.priv);
    assert.equal(me.S, undefined);
    assert.equal(snap.ents.find(e => e.kind === 'mob').threat, undefined);
    const pa = srv.world.players[a.welcome.id], g = NPCS.find(n => n.id === 'gardien');
    pa.S.lvl = 4; pa.P.x = g.x + 1; pa.P.y = g.y + .3;
    a.send({t: 'act', a: 'enterDungeon', ti: 0});
    const s2 = await a.fresh(m => m.t === 'snap' && m.world.id !== 'over');
    assert.equal(s2.world.ti, 0);
    assert.ok(s2.world.seed > 0);
    assert.ok(s2.ents.every(e => e.kind !== 'mob' || e.l >= 4));
    assert.ok(s2.ents.some(e => e.kind === 'obj' && e.type === 'portal'));
  } finally { await stop(); }
});

test('messages invalides ignorés sans faire tomber le serveur', async () => {
  const {client, stop} = await setup();
  try {
    const a = await client('alice');
    a.ws.send('pas du json');
    a.send({t: 'act', a: 42});
    a.send({t: 'move', x: 'abc', y: null});
    a.send({t: 'act', a: 'buy', id: {x: 1}, n: 'zz'});
    a.send({t: 'join', name: 'autre'});
    await a.fresh(m => m.t === 'snap');
  } finally { await stop(); }
});

test('snapshotFor est une fonction pure du monde', async () => {
  const {srv, client, stop} = await setup();
  try {
    const a = await client('alice');
    const s1 = JSON.stringify(snapshotFor(srv.world, a.welcome.id)), s2 = JSON.stringify(snapshotFor(srv.world, a.welcome.id));
    assert.equal(s1, s2);
  } finally { await stop(); }
});

test('deux clients en groupe : Archives en Normal, boss tué ensemble, butin pour chacun, retour au Bourg-Forum', async () => {
  const {srv, client, stop} = await setup();
  try {
    const a = await client('alice'), b = await client('bob');
    const pa = srv.world.players[a.welcome.id], pb = srv.world.players[b.welcome.id], g = NPCS.find(n => n.id === 'gardien');
    a.send({t: 'chat', text: '/inviter bob'});
    await b.next(m => m.t === 'ev' && m.list.some(e => /vous invite/.test(e.text)));
    b.send({t: 'chat', text: '/accepter'});
    const snapB = await b.fresh(m => m.t === 'snap' && m.ents.find(e => e.id === b.welcome.id).priv.group);
    assert.equal(snapB.ents.find(e => e.id === b.welcome.id).priv.group.members[0].n, 'alice');
    for (const p of [pa, pb]) { p.S.lvl = 4; p.P.x = g.x + 1; p.P.y = g.y + .3; }
    a.send({t: 'act', a: 'enterDungeon', ti: 0});
    const [sa, sb] = [await a.fresh(m => m.t === 'snap' && m.world.id !== 'over'), await b.fresh(m => m.t === 'snap' && m.world.id !== 'over')];
    assert.equal(sa.world.seed, sb.world.seed, 'même instance, même graine');
    const D = srv.world.maps[pa.mapId], boss = D.mobs.find(m => m.type === 'archiviste');
    for (const [p, c] of [[pa, a], [pb, b]]) { p.P.x = boss.x - 1; p.P.y = boss.y; p.S.hp = 9999; c.send({t: 'act', a: 'target', id: boss.id, auto: true}); c.send({t: 'act', a: 'skill', i: 0}); }
    await a.next(m => m.t === 'self' && m.save.xp >= 0 && boss.hitters.length === 2);
    boss.hp = 1; pa.P.cd.tip = 0;
    a.send({t: 'act', a: 'skill', i: 0});
    await b.next(m => m.t === 'ev' && m.list.some(e => /Archives terminées/.test(e.text || e.title || '')));
    const chest = D.objs.find(o => o.type === 'chest');
    for (const [p, c] of [[pa, a], [pb, b]]) { p.P.x = chest.x; p.P.y = chest.y + 1; c.send({t: 'act', a: 'openChest', id: chest.id}); }
    const ca = await a.next(m => m.t === 'ev' && m.list.some(e => e.t === 'chest')), cb = await b.next(m => m.t === 'ev' && m.list.some(e => e.t === 'chest'));
    assert.ok(ca.list.find(e => e.t === 'chest').got.length > 0 && cb.list.find(e => e.t === 'chest').got.length > 0);
    a.send({t: 'act', a: 'leaveDungeon'}); b.send({t: 'act', a: 'leaveDungeon'});
    await a.fresh(m => m.t === 'snap' && m.world.id === 'over');
    await b.fresh(m => m.t === 'snap' && m.world.id === 'over');
    assert.equal(pa.mapId, 'over'); assert.equal(pb.mapId, 'over');
    assert.equal(Object.keys(srv.world.maps).length, 1);
  } finally { await stop(); }
});

test('pseudo déjà connecté : refus clair (sans casse), puis accepté une fois libéré', async () => {
  const {srv, client, stop} = await setup();
  try {
    const a = await client('Alice');
    const ws = new WebSocket(`ws://localhost:${srv.port}`), msgs = [];
    ws.on('message', d => msgs.push(JSON.parse(d)));
    await new Promise(r => ws.on('open', r));
    ws.send(JSON.stringify({t: 'join', name: 'aLiCe'}));
    await new Promise(r => ws.on('close', r));
    assert.equal(msgs.length, 1);
    assert.equal(msgs[0].t, 'refused');
    assert.match(msgs[0].msg, /déjà connecté/);
    assert.equal(Object.keys(srv.world.players).length, 1, 'le refusé n\'entre pas dans le monde');
    a.ws.close();
    await new Promise(r => setTimeout(r, 150));
    const a2 = await client('aLiCe');
    assert.equal(a2.welcome.t, 'welcome');
  } finally { await stop(); }
});

test('lanUrls ne garde que les IPv4 non internes', () => {
  const fake = {lo: [{family: 'IPv4', address: '127.0.0.1', internal: true}], eth0: [{family: 'IPv4', address: '192.168.1.42', internal: false}, {family: 'IPv6', address: 'fe80::1', internal: false}], wifi: [{family: 4, address: '10.0.0.7', internal: false}]};
  assert.deepEqual(lanUrls(3000, fake), ['http://192.168.1.42:3000', 'http://10.0.0.7:3000']);
  assert.deepEqual(lanUrls(3000, {}), []);
});

test('le serveur écoute sur toutes les interfaces : joignable par l\'adresse LAN', async () => {
  const {srv, stop} = await setup();
  try {
    const urls = lanUrls(srv.port);
    if (!urls.length) return;
    const res = await fetch(urls[0]);
    assert.equal(res.status, 200);
    assert.match(await res.text(), /Chouffinia/);
    const ws = new WebSocket(urls[0].replace('http', 'ws'));
    await new Promise((r, j) => { ws.on('open', r); ws.on('error', j); });
    ws.terminate();
  } finally { await stop(); }
});

test('heartbeat : une connexion qui ne répond plus aux pings est purgée et son pseudo libéré', async () => {
  const savesDir = mkdtempSync(join(tmpdir(), 'chouffinia-'));
  const srv = await startServer({port: 0, savesDir, heartbeat: 60});
  try {
    const ws = new WebSocket(`ws://localhost:${srv.port}`, {autoPong: false});
    await new Promise(r => ws.on('open', r));
    ws.send(JSON.stringify({t: 'join', name: 'zombie'}));
    await new Promise(r => ws.on('message', function f(d) { if (JSON.parse(d).t === 'welcome') { ws.off('message', f); r(); } }));
    assert.equal(Object.keys(srv.world.players).length, 1);
    await new Promise(r => setTimeout(r, 400));
    assert.equal(Object.keys(srv.world.players).length, 0, 'le zombie a été retiré');
  } finally { await srv.close(); }
});

test('/top lit aussi les sauvegardes des joueurs hors-ligne', async () => {
  const {client, savesDir, stop} = await setup();
  try {
    writeFileSync(join(savesDir, 'fantome.json'), JSON.stringify({name: 'Fantome', lvl: 42, xp: 0, dg: 3, chouffes: 9}));
    const a = await client('alice');
    a.send({t: 'chat', text: '/top'});
    const ev = await a.next(m => m.t === 'ev' && m.list.some(e => /Top Niveau/.test(e.text || '')));
    assert.match(ev.list.find(e => /Top Niveau/.test(e.text || '')).text, /1\. Fantome \(42\) · 2\. alice \(1\)/i);
  } finally { await stop(); }
});
