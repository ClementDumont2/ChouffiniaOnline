import http from 'node:http';
import {copyFileSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {extname, join, normalize, sep} from 'node:path';
import {networkInterfaces} from 'node:os';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {WebSocketServer} from 'ws';
import {addPlayer, createWorld, handleAction, handleChat, movePlayer, removePlayer, takeEvents, tick} from '../shared/sim.js';
import {cleanCls, cleanHat, cleanName, snapshotFor} from '../shared/protocol.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'};

// Seuls client/ et shared/ sont exposés : saves/, server/ et node_modules/ ne doivent jamais sortir.
const PUBLIC = ['client', 'shared'];

function resolvePath(urlPath) {
  const rel = urlPath === '/' ? '/client/index.html' : urlPath;
  const file = normalize(join(ROOT, decodeURIComponent(rel)));
  return PUBLIC.some(d => file.startsWith(join(ROOT, d) + sep)) ? file : null;
}

const DT = .05, SAVE_EVERY = 10_000, HEARTBEAT = 15_000;

// Adresses à donner aux autres PC du réseau (IPv4 non loopback ; Node < 18.4 renvoie family en nombre).
export function lanUrls(port, interfaces = networkInterfaces()) {
  return Object.values(interfaces).flat().filter(i => i && (i.family === 'IPv4' || i.family === 4) && !i.internal).map(i => `http://${i.address}:${port}`);
}

export async function startServer({port = PORT, savesDir = join(ROOT, 'saves'), seed = 20111, heartbeat: beat = HEARTBEAT} = {}) {
  mkdirSync(savesDir, {recursive: true});
  // Les faux joueurs et le faux chat du solo sont coupés : il y a maintenant de vrais joueurs.
  const world = createWorld({seed, bots: false});
  const conns = new Map();
  let nextId = 1;

  const saveFile = name => join(savesDir, name.toLowerCase() + '.json');
  // Un fichier absent = nouveau joueur. Un fichier illisible aussi, mais on en garde une copie : la prochaine sauvegarde écraserait ce qui reste.
  const loadSave = name => {
    try { return JSON.parse(readFileSync(saveFile(name), 'utf8')); }
    catch (e) { if (e.code !== 'ENOENT') try { copyFileSync(saveFile(name), saveFile(name) + '.corrupt'); } catch {} return null; }
  };
  // Les droits s'éditent à la main dans le fichier : on garde ceux du disque, la mémoire ne fait que les avoir lus à la connexion.
  function savePlayer(name, state) {
    const tmp = saveFile(name) + '.tmp';
    const S = {...state}, disk = loadSave(name);
    if (disk && Array.isArray(disk.droits)) S.droits = disk.droits; else delete S.droits;
    writeFileSync(tmp, JSON.stringify(S));
    renameSync(tmp, saveFile(name));
  }
  const saveAll = () => { for (const c of conns.values()) savePlayer(c.name, world.players[c.id].S); };
  // ponytail: relit tous les fichiers à chaque /top ; un cache si la liste dépasse quelques centaines de joueurs.
  world.saves = () => {
    const all = new Map();
    for (const f of readdirSync(savesDir)) if (f.endsWith('.json')) { const S = loadSave(f.slice(0, -5)); if (S && S.name) all.set(f.toLowerCase(), S); }
    // L'état en mémoire est plus récent que le disque (sauvegarde toutes les 10 s).
    for (const c of conns.values()) all.set(c.name.toLowerCase() + '.json', world.players[c.id].S);
    return [...all.values()];
  };
  const send = (ws, msg) => { if (ws.readyState === 1) ws.send(JSON.stringify(msg)); };

  const server = http.createServer(async (req, res) => {
    try {
      const file = resolvePath(new URL(req.url, 'http://x').pathname);
      if (!file) { res.writeHead(404).end('Introuvable'); return; }
      const body = await readFile(file);
      res.writeHead(200, {'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache'}).end(body);
    } catch {
      res.writeHead(404).end('Introuvable');
    }
  });
  const wss = new WebSocketServer({server, maxPayload: 4096});

  function onMessage(c, m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'join') {
      if (c.id) return;
      const name = cleanName(m.name);
      // La sauvegarde est indexée par pseudo (sans casse) : deux connexions sous le même pseudo s'écraseraient.
      if ([...conns.values()].some(o => o.name.toLowerCase() === name.toLowerCase())) {
        send(c.ws, {t: 'refused', msg: `Le pseudo « ${name} » est déjà connecté. Choisis-en un autre (si c'est toi qui rechargeais la page, réessaie dans quelques secondes).`});
        c.ws.close();
        return;
      }
      const save = loadSave(name);
      c.id = 'p' + nextId++; c.name = name;
      addPlayer(world, c.id, {save, name, hat: cleanHat(m.hat), cls: cleanCls(m.cls)});
      conns.set(c.id, c);
      send(c.ws, {t: 'welcome', id: c.id, seed: world.seed, save: world.players[c.id].S});
      return;
    }
    if (!c.id) return;
    if (m.t === 'move') movePlayer(world, c.id, m.x, m.y, m.face);
    else if (m.t === 'act' && typeof m.a === 'string') handleAction(world, c.id, m);
    else if (m.t === 'chat' && typeof m.text === 'string') handleChat(world, c.id, m.text);
  }

  wss.on('connection', ws => {
    const c = {ws, id: null, name: null};
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('message', data => {
      try { onMessage(c, JSON.parse(data)); } catch (e) { console.error('message invalide :', e.message); }
    });
    ws.on('close', () => {
      if (!c.id) return;
      // removePlayer règle un éventuel duel abandonné : on sauvegarde l'état d'après (défaite, « tu as raison » à écrire).
      const S = removePlayer(world, c.id);
      if (S) savePlayer(c.name, S);
      conns.delete(c.id);
      takeEvents(world, c.id);
    });
  });

  const loop = setInterval(() => {
    try {
      tick(world, DT);
      for (const [id, c] of conns) {
        const evs = takeEvents(world, id), list = evs.filter(e => e.t !== 'self');
        // Le client reçoit l'état privé avant les événements : ils lisent la sauvegarde à jour (ex. nombre de morts).
        if (evs.length > list.length) send(c.ws, {t: 'self', save: world.players[id].S});
        if (list.length) send(c.ws, {t: 'ev', list});
        send(c.ws, snapshotFor(world, id));
      }
    } catch (e) { console.error('erreur de boucle :', e); }
  }, DT * 1000);
  const saver = setInterval(saveAll, SAVE_EVERY);
  // Un PC qui perd le Wi-Fi ne ferme jamais sa connexion : sans ce ping, son pseudo resterait bloqué comme « déjà connecté ».
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) { if (!ws.isAlive) { ws.terminate(); continue; } ws.isAlive = false; ws.ping(); }
  }, beat);

  await new Promise(resolve => server.listen(port, '0.0.0.0', resolve));
  const close = () => {
    clearInterval(loop); clearInterval(saver); clearInterval(heartbeat); saveAll();
    for (const c of wss.clients) c.terminate();
    return new Promise(resolve => server.close(resolve));
  };
  return {world, port: server.address().port, close};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const {port, close} = await startServer();
  const urls = lanUrls(port);
  console.log('Chouffinia Online est lancé.');
  console.log(`  Sur cette machine : http://localhost:${port}`);
  if (urls.length) console.log(`  Sur le réseau local (à donner à tes potes) :\n${urls.map(u => '    ' + u).join('\n')}`);
  else console.log('  Aucune carte réseau détectée : seul localhost fonctionne.');
  process.on('SIGINT', async () => { await close(); process.exit(0); });
}
