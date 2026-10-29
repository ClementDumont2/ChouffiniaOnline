# Chouffinia Online

MMORPG parodique en pixel art (canvas 2D) où l'on joue un chouffin. Objectif du projet : **un jeu jouable à plusieurs en LAN, avec le minimum de technologie**. Le code de départ est `legacy/chouffinia.html` (version solo, un seul fichier, ~1 600 lignes), gardé comme référence de comportement.

## Principe directeur : au plus simple

- JavaScript **ES modules natifs**, Node ≥ 20. Pas de TypeScript, pas de framework, pas de bundler.
- Une seule dépendance runtime : `ws`. Le serveur HTTP est le module `http` de Node (fichiers statiques).
- Persistance : **un fichier JSON par joueur** dans `saves/`. Pas de base de données.
- Pas de Docker, pas de comptes, pas d'anti-triche. On joue entre potes.
- Si une solution demande une nouvelle dépendance ou une nouvelle couche, proposer d'abord l'alternative sans.

## Commandes

| Commande | Effet |
|---|---|
| `npm start` | serveur sur `0.0.0.0:3000` (autre port : `PORT=4000`), affiche les URL LAN |
| `npm test` | tests `node:test` de `test/` (sim, protocole, serveur réel sur un port libre) ; aucun navigateur |
| `node --test --test-name-pattern="guilde" test/sim.test.js` | un seul test |
| `npm run balance [-- --zones \| --ideal]` | simule un joueur moyen par niveau/zone (réglage de `xpNeed`, stats, butin) |
| `npm run reset-loot [-- --dry]` | vide sacs et équipements de `saves/` (copie dans `saves-backup/`) ; **serveur arrêté** |

Test multi manuel : deux onglets sur `http://localhost:3000`, deux pseudos différents.

## Arborescence

```
shared/            code pur, AUCUN accès au DOM ni à Math.random, importé par Node ET par le navigateur
  data.js          tables de base + agrégation des fichiers data/ (ZONES, MOBS, SPAWNS, QUESTS, NPCS, DIFFS, ACH, BOTS, HATS, MAXLVL…)
  data/            un fichier par domaine (voir « Données ») : classes, zones, mobs, bosses, items, mounts, dialogues, commands, dungeons, quests
  rng.js           mulberry32(seed), rngTools(rnd) → {rr, ri, pick}
  map.js           tuiles (T, SOLID), genOverworld(seed), genDungeon(seed, ti, opts), zoneAt, isSafe, zoneLabels, canStand/moveEnt
  rules.js         stats(), xpNeed(), statsDeMob(), objets (newItem, itemStats, fuse), newSave/normalizeSave, hasRight, cmpInfo
  sim.js           état du monde : createWorld, addPlayer/removePlayer, movePlayer, tick, handleAction, handleChat, takeEvents
  protocol.js      formes des messages (doc en tête de fichier), snapshotFor, cleanName/cleanHat/cleanCls
  commands.js      findCommand, canUse, suggest (autocomplétion) sur la table data/commands.js
server/index.js    http statique (client/ et shared/ seulement), WebSocket, boucle 20 ticks/s, sauvegardes, w.saves()
client/
  index.html       coquille HTML + tout le CSS (reprise de legacy)
  main.js          démarrage, écran de création, boucle d'image, aiguillage des événements serveur (hooks.event)
  net.js           connexion WebSocket, reconnexion, fusion des snapshots + interpolation
  state.js         état client : world, me, S (sauvegarde), P (runtime), WD (carte courante), send/sendMove/sendChat
  render.js        caméra, tuiles (paintWorld + minimap), entités, plaques de nom, bulles, particules
  sprites.js       drawChouffin, drawMob, drawNpc, drawObj, icônes d'objets
  hud.js           cadres joueur/cible/équipe, barre d'action, minimap + carte agrandie, quêtes, chat
  panels.js        sac, personnage, dialogues PNJ, armurerie, fusion, classes, menu donjon, échange, options, Tableau d'Honneur
  input.js         clavier/souris/toucher, déplacement local, ciblage, interaction PNJ
  keys.js          touches configurables (e.code), libellés selon la disposition du clavier
  chatcmd.js       autocomplétion des commandes de chat
  sound.js         Web Audio : musique procédurale, effets, roulettes de la chaise
  util.js          $, esc, rr/ri/pick (Math.random côté client uniquement)
test/              *.test.js (node:test)
scripts/           balance.js, reset-loot.js
saves/             <pseudo>.json
legacy/            version solo d'origine, ne pas modifier
```

## Règles d'architecture

1. **Le serveur fait foi** pour : monstres, combat, dégâts, XP, butin, or, inventaire, équipement, quêtes, achats/ventes, donjons, guildes.
2. **Exception volontaire : le déplacement.** Le client calcule sa position et l'envoie ~10 fois/s. Le serveur vérifie seulement la collision (`canStand`) et une vitesse max (`MAX_SPEED × moveSpeed + SLACK`) ; sinon il renvoie un `tp` à l'ancienne position.
3. Le client **n'invente jamais** un résultat de jeu. Il envoie une intention (`skill`, `useItem`, `buy`…) et affiche ce que le serveur renvoie.
4. `shared/` ne touche ni au DOM, ni à `window`, ni à `Math.random` (un test vérifie que sim.js n'importe rien de `client/`).
5. Les cartes sont **déterministes** : le serveur envoie une graine, le client régénère les tuiles. On n'envoie jamais de tuiles sur le réseau.
6. Une seule source pour les données : `shared/data.js` + `shared/data/*.js`. Ne jamais dupliquer une table côté client ou serveur.
7. Tout état « par joueur » vit dans `world.players[id]` = `{id, S, P, mapId, duel, trade?}` : `S` = sauvegarde (persistée), `P` = runtime (position, cible, recharges, buffs…). Aucune variable globale de joueur.
8. Tout résultat visible sort par `world.events` (`ev(w, to, {...})`) ; le serveur les distribue par joueur avec `takeEvents`. Un `{t:'self'}` déclenche l'envoi de la sauvegarde à jour.

## Protocole (JSON sur WebSocket)

La référence est l'en-tête de `shared/protocol.js` ; résumé :

- Client → serveur : `{t:'join', name, hat, cls}` · `{t:'move', x, y, face}` · `{t:'act', a, ...}` · `{t:'chat', text}`
- `a` ∈ target, talk, skill, useItem, equip, unequip, drop, buy, sell, sellAll, acceptQuest, completeQuest, enterDungeon, leaveDungeon, openChest, respawn, mount, selectMount, buyMount, changeClass, fuse, tradeOffer, tradeOk, tradeCancel, duelReply
- Serveur → client : `welcome {id, seed, save}` · `refused {msg}` · `self {save}` (avant `ev` et `snap`) · `ev {list}` · `snap {world, tick, ents}` (20×/s, entités de la carte du joueur ; l'entrée du joueur porte `priv` : hp, caf, cd, cast, target, auto, `crew` = autres joueurs du même donjon)
- Événements `ev` : msg (cls sys/loot/guild/yell…), chat (`ch` = canal, absent = Général), emote, err, toast, banner, float, burst, puff, lvlup, ach, died, respawned, tp, stop, approach, chest, campaignEnd, trade, duelInvite, count, online, announce, board.
- Texte des `msg` : mini-balisage `**gras**`, `[[id_objet]]`, `[[id:rareté:nObj]]`, `[[up]]`.

## Serveur

- Boucle `tick(world, 0.05)` toutes les 50 ms ; par joueur : `self` si demandé, puis `ev`, puis `snap`.
- Sauvegarde de tous les connectés toutes les 10 s et à la déconnexion (écriture `.tmp` puis renommage). Un fichier illisible est copié en `.corrupt`.
- Le champ `droits` est relu depuis le disque à chaque sauvegarde : on l'édite à la main dans `saves/<pseudo>.json` (ex. `"droits":["annonce"]`).
- `world.saves()` (fourni par le serveur) renvoie toutes les sauvegardes, hors-ligne compris : classements, unicité des noms de guilde.
- Pseudo unique parmi les connectés (refus clair sinon). Ping toutes les 15 s pour purger les connexions mortes. `maxPayload` 4 Ko.
- Les bots et le faux chat de la version solo sont coupés (`createWorld({bots:false})`).

## Systèmes de jeu (où regarder)

- **Monde** : carte 160×60. Sanctuaires (pas de monstres) : `base` (Sous-Sol de Maman, spawn 7.5, 8.5), `bourg` (Bourg-Forum, marchands, retour de donjon 21.5, 20.4), `arene` (duels), puis un par zone de l'est : `preau` (Parking, Surveillant → donjon du Bac), `accueil`, `attente`, `vestiaire`, `cafet` — rectangles et points d'arrivée dans `SAFE` (data/zones.js), chacun avec un marchand d'équipement de sa zone (`STOCK`, prix `buyPrice` = `buy` ou 3 × `price`). Zones par niveau : plaine 1–2 → … → datacenter 10, puis parking 15–25, supermarché 25–40, pôle 40–55, convention 55–75, diiage 75–100. Découpage dans `zoneAt` (map.js).
- **Sanctuaires / voyage** : entrer dans un sanctuaire le débloque (`S.tp`) ; `/tp <lieu ou joueur>` téléporte vers un sanctuaire débloqué ou à côté d'un joueur de la carte du monde, au départ d'un sanctuaire seulement. Chaque sanctuaire a un marchand (Petit Frère au sous-sol, Buvette à l'arène).
- **Sac** : 24 places (`BAG`), `canHold` (rules.js) décide côté serveur et grise les achats côté client.
- **Fenêtres** : une seule ouverte à la fois (`closeAll`, panels.js), carte agrandie comprise.
- **Chat** : l'onglet Général ne montre que les classes `gen`, `guild`, `wsp`, `join` (arrivées), `ann` (/annonce), `hf` (hauts faits, diffusés à tous) et `cmd` (réponses aux commandes du joueur, reclassées dans `runCommand`) ; tout le reste (`sys`, `loot`, `cb`, cris de boss `yell`…) est dans Tout. Filtre en CSS (`#log[data-f]`, index.html).
- **Déplacement au clic** : bloqué plus de 0,35 s, le client calcule un A* (`findPath`) vers la destination avant d'abandonner.
- **Boss de zone** : un par zone du monde (données dans mobs.js `bossZone`, capacités `bossMonde` dans bosses.js, apparition dans `NEW_SPAWNS`) ; `look` = sprite du monstre de zone repris et agrandi.
- **IA** : poursuite en ligne droite, A* (`findPath`, map.js) dès qu'un mur bloque ; les monstres ne traversent jamais un sanctuaire.
- **Fin** : seule la quête finale (niveau 100, `fin:true`) déclenche `campaignEnd`.
- **Combat** : compétences par classe (`SKILL_DEFS`, comportement dans `sim.js` : objets `SELF`, `ALLY`, `useSkill`). XP partagée entre ceux qui ont frappé à ≤ 15 cases ; or et butin au premier frappeur.
- **Classes** : chouffin, roliste, speedrunner, modo (`data/classes.js`), changement au Conseiller d'Orientation (50 po × niveau).
- **Objets** : piles `{id, n}` (consommables, artéfacts) ou instances d'équipement `{uid, id, nObj, rarete}` ; stats = base × (1 + nObj/10) × rareté. Sac de 24. Fusion chez la Fanfiqueuse.
- **Quêtes** : une chaîne unique `QUESTS` ; `S.q = {i, st: avail|active|ready, n}`. Objectif tuer `k` × `m`, ou finir le donjon `dgn` en difficulté ≥ `dg`.
- **Donjons** : instances. On entre **seul** via le PNJ d'entrée (`npc.dungeon`), puis `/inviter <pseudo>` fait venir un ami (4 max, niveau requis vérifié) ; chaque arrivée renforce les monstres vivants (PV × 1 + 0,6 × (joueurs − 1)). 4 difficultés (`DIFFS`), boss pilotés par `data/bosses.js` (moteur `bossTick`), coffre personnel, instance détruite quand vide.
- **Guildes** : `S.guilde` (nom, ≤ 32 caractères, unique sur toutes les sauvegardes). `/guilde <nom>`, `/recruter`, `/accepter`, `/quitter`, `/g <texte>`. Pas de chef. Affichée `<Guilde>` sous le pseudo.
- **Invitations** : `w.invites[destId] = {from, exp, kind: guild|dungeon|trade|duel}`, 60 s ; `/accepter` les tranche toutes.
- **Échange / duel** : `/echanger`, `/duel` (dans l'arène, dégâts ×0,5 ; le perdant doit écrire « tu as raison »).
- **Montures** : `data/mounts.js` (chaise, trottinette chez Kévin ; une monture à 10 victoires contre Maman).
- **Classements** : `/top` et le **Tableau d'Honneur** (PNJ `tableau` près du spawn, `board:true`) partagent `tops(w)`.
- **Droits** : `hasRight(pl, droit)` côté serveur ; commande `droit:'annonce'` invisible sans le droit.
- **Carte** : minimap (clic = carte agrandie, noms de zones, légende, infobulle des PNJ). Couleurs : marchand (vendeurs de `STOCK` et `MOUNTS`), donjon (`npc.dungeon`), quête, panneau (`look:'sign'`).
- **Son** : `client/sound.js`, tout en Web Audio. Valse de taverne (oum-pa-pa, accordéon) sur la carte du monde, même partition en mineur et plus lente en donjon. Effets déclenchés dans `main.js` depuis les événements (couleur des `float` → coup, soin, critique, coup reçu). Réglages par appareil : son, musique, volume.
- **Stockage navigateur** (`localStorage`, confort seulement) : `chouffinia-son`, `chouffinia-touches`, `chouffinia-dernier-pseudo`.

## Données (`shared/data/`)

Ajouter du contenu = ajouter des données, pas du code spécial. Le format de chaque table est documenté en tête de son fichier.

| Fichier | Contenu |
|---|---|
| `classes.js` | `SKILL_DEFS`, `CLASSES`, `DEFAULT_CLASS`, `CLASS_COST` |
| `zones.js` | `NEW_ZONES` (nom + sous-titre), `NEW_SPAWNS` `[type, nombre, x0, x1, y0, y1]`, `NEW_NPCS` |
| `mobs.js` | `NEW_MOBS` (stats par la formule `statsDeMob` au niveau) |
| `bosses.js` | `BOSSES` (capacités typées : aoe, chain, summon, rage, shrink, enrage, spots, eject, recall, adds, gauge, raid), `AFFIXES` |
| `items.js` | `ITEMS`, `SLOTS`, `RN`, `SHOP`, `STOCK` (vendeur → objets), `ART_POOL(S)`, `RARITY_MULT` |
| `dungeons.js` | `DUNGEONS` : npc d'entrée, exit, boss, kinds, diffs, unique, textes |
| `quests.js` | `NEW_QUESTS` ajoutées à la suite de la campagne |
| `mounts.js` | `MOUNTS`, `MAMAN_KILLS` |
| `dialogues.js` | `LIGNES_PNJ` (répliques par PNJ) |
| `commands.js` | `COMMANDS` `{nom, alias, args, description, droit?}` : dispatch serveur (`RUN` dans sim.js) + autocomplétion |

PNJ : `{id, kind:'npc', n, tag, ti, x, y, hgt, greet, look?, dungeon?, board?}`. Les boutons d'un PNJ marchand/service sont dans `showNpc` (panels.js), indexés par `n.id`.

Exceptions au « tout par les données » : une nouvelle **zone** demande aussi de modifier `genOverworld` et `zoneAt` (map.js) ; une nouvelle **compétence** demande son comportement dans sim.js ; un nouveau **type** de capacité de boss demande le moteur `bossTick`.

## Sauvegarde (`saves/<pseudo>.json`)

Forme donnée par `newSave` et réparée par `normalizeSave` (rules.js) : name, hat, cls, lvl (≤ 100), xp, gold, hp, caf, inv, eq, q, ach, compteurs (kills, deaths, chouffes, dg, duelWins…), mounts, mount, concede, guilde, tp (sanctuaires débloqués), titre?, droits?. Tout champ ajouté doit avoir sa valeur par défaut dans `newSave` et sa validation dans `normalizeSave`.

## Conventions

- Textes du jeu **en français**, avec le ton actuel : interface sérieuse, contenu rempli de vannes sur les chouffins, les geeks et le 18-25. Ne pas aseptiser les blagues existantes.
- Ne pas redessiner l'interface ni les sprites : on déplace le code de `legacy/`, on ne le réécrit pas.
- Style du code : compact (lignes longues, peu d'espaces), comme l'existant. Fonctions courtes, noms explicites, commentaires seulement pour le « pourquoi ».
- Nouvelle commande de chat : une entrée dans `data/commands.js` + un handler dans `RUN` (sim.js). Nouvelle action : un `case` dans `handleAction` + la liste en tête de `protocol.js`. Nouvel événement : `ev(...)` côté sim, un `case` dans `hooks.event` (main.js), la liste de `protocol.js`.
- Tests : pour toute logique non triviale, un test dans `test/` (sim directe avec `createWorld`/`addPlayer`/`handleChat`, ou serveur réel dans `server.test.js`).
- Après chaque phase : `npm test` vert, test à deux onglets OK, commit.

## Ce qu'on ne fait PAS (pour l'instant)

Prédiction côté client, rollback, delta compression, comptes avec mot de passe, base de données, scaling, mobile natif.

## Saison 2 : règles en plus

- Contenu piloté par les données : classes, zones, monstres, boss, montures, objets et dialogues vivent dans `shared/data/*.js` (un fichier par domaine).
- Les objets du sac sont des INSTANCES `{ uid, id, nObj, rarete }` et plus de simples identifiants. Les stats se calculent avec `shared/rules.js` depuis la base + le niveau d'objet + la rareté.
- Droits : un joueur a un champ `droits` (tableau de chaînes) dans `saves/<pseudo>.json`. Le serveur vérifie toujours `hasRight(joueur, droit)` ; le client ne fait qu'afficher.
- Niveau max : 100.
- Les commandes de chat sont déclarées dans `shared/data/commands.js` : le serveur et l'autocomplétion lisent la même table.
- Pas de nouvelle dépendance npm. Le son est généré avec la Web Audio API (aucun fichier audio).

## Hébergement

- LAN : `npm start`, ouvrir le port 3000 dans le pare-feu (voir README). Hors LAN : Tailscale.
- Sur une VM publique : il n'y a **aucun mot de passe** (le pseudo suffit à reprendre une sauvegarde) ; restreindre le port 3000 aux IP connues.
- Trafic : un snapshot de la carte du monde fait ~64 Ko, ×20/s, soit ~4,6 Go/h par joueur sans compression (~0,3 Go/h avec `perMessageDeflate` de `ws`, non activé à ce jour).

## Pièges connus

- `saves/` est **suivi par git** (pas dans `.gitignore`) : ne pas committer les sauvegardes de test, supprimer celles qu'on crée.
- `NPCS[0]` doit rester le Vieux Sage (sim.js l'utilise pour l'accueil) : ajouter les PNJ en fin de liste.
- Sous Windows, de gros heredocs passés à l'outil Bash ont échoué : écrire le script dans un fichier puis l'exécuter.
- `npm test` a déjà renvoyé un code d'erreur avec « fail 0 » : relancer avant de chercher un bug.

## Pour Claude (`.claude/`)

- `settings.json` : commandes autorisées sans confirmation (tests, git en lecture).
- `launch.json` : configuration `chouffinia` pour l'aperçu dans le navigateur intégré.
- `skills/ajouter-contenu` : où mettre chaque type de contenu et quel code toucher en plus.
- `skills/verifier-en-jeu` : lancer, jouer, vérifier, nettoyer.
