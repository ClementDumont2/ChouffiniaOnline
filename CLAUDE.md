# Chouffinia Online

MMORPG parodique en pixel art (canvas 2D) où l'on joue un chouffin. Objectif du projet : **un jeu jouable à plusieurs en LAN, avec le minimum de technologie**. Le code de départ est `legacy/chouffinia.html` (version solo, un seul fichier, ~1 600 lignes).

## Principe directeur : au plus simple

- JavaScript **ES modules natifs**, Node ≥ 20. Pas de TypeScript, pas de framework, pas de bundler.
- Une seule dépendance runtime : `ws`. Le serveur HTTP est le module `http` de Node (fichiers statiques).
- Persistance : **un fichier JSON par joueur** dans `saves/`. Pas de base de données.
- Pas de Docker, pas de comptes, pas d'anti-triche. On joue entre potes.
- Si une solution demande une nouvelle dépendance ou une nouvelle couche, proposer d'abord l'alternative sans.

## Architecture cible

```
shared/          code pur, AUCUN accès au DOM, importable par Node ET par le navigateur
  data.js        toutes les tables : ITEMS, MOBS, QUESTS, NPCS, SKILLS, DIFFS, SHOP, ART_POOL, ZONES
  rng.js         mulberry32(seed) — tout aléatoire passe par un rng injecté
  map.js         tuiles (T, SOLID), genOverworld(seed), genDungeon(seed, tier), zoneAt, isSafe
  rules.js       stats(), xpNeed(), statsDeMob(type, niveau), réduction d'armure, cmpInfo()
  sim.js         état du monde + tick(world, dt) + handleAction(world, playerId, action)
  protocol.js    noms et formes des messages réseau (documentés en commentaire)
server/
  index.js       http statique + WebSocket, boucle sim à 20 ticks/s, sauvegardes JSON
client/
  index.html     coquille HTML/CSS (reprise de legacy, sans le script)
  main.js        connexion, boucle de rendu, interpolation
  render.js      caméra, tuiles, entités, plaques de nom, bulles, effets
  sprites.js     drawHuman, drawChouffin, drawMob, drawNpc, drawObj, paintIcon
  hud.js         cadres, barre d'action, minimap, quêtes, chat
  panels.js      sac, personnage, dialogues PNJ, armurerie, menu donjon
  input.js       clavier (e.code : WASD/ZQSD physiques), clic/toucher
saves/           <pseudo>.json (ignoré par git)
legacy/          version solo d'origine, référence de comportement, ne pas modifier
```

## Règles d'architecture

1. **Le serveur fait foi** pour : monstres, combat, dégâts, XP, butin, or, inventaire, équipement, quêtes, achats/ventes, donjons.
2. **Exception volontaire : le déplacement.** Le client calcule sa position et l'envoie ~10 fois/s. Le serveur vérifie seulement la collision et une vitesse max (sinon il renvoie la position corrigée).
3. Le client **n'invente jamais** un résultat de jeu. Il envoie une intention (`skill`, `useItem`, `buy`…) et affiche ce que le serveur renvoie.
4. `shared/` ne touche ni au DOM, ni à `window`, ni à `Math.random`.
5. Les cartes sont **déterministes** : le serveur envoie une graine, le client régénère les tuiles lui-même. On n'envoie jamais de tuiles sur le réseau.
6. Une seule source pour les données : `shared/data.js`. Ne jamais dupliquer une table côté client ou serveur.
7. Tout état « par joueur » vit dans `world.players[id]` (sauvegarde `S` + runtime `P`). Plus aucune variable globale `S`, `P`, `WD`, `mobs`.

## Protocole (JSON sur WebSocket)

Client → serveur : `{t:'join', name}` · `{t:'move', x, y, face}` · `{t:'act', a, ...args}` (a = target, skill, useItem, equip, unequip, buy, sell, sellAll, acceptQuest, completeQuest, enterDungeon, leaveDungeon, openChest, respawn) · `{t:'chat', text}`

Serveur → client : `{t:'welcome', id, seed, save}` · `{t:'snap', world, tick, ents}` (entités du monde du joueur uniquement) · `{t:'self', save}` (état privé, envoyé seulement quand il change) · `{t:'ev', list}` (dégâts flottants, messages de chat, butin, bannières, hauts faits)

## Commandes

- `npm start` : lance le serveur sur `0.0.0.0:3000` et affiche les URL LAN.
- `npm test` : tests `node:test` de `shared/` (aucun navigateur requis).
- Test multi manuel : deux onglets sur `http://localhost:3000`, deux pseudos différents.

## Conventions

- Textes du jeu **en français**, avec le ton actuel : interface sérieuse, contenu rempli de vannes sur les chouffins, les geeks et le 18-25. Ne pas aseptiser les blagues existantes.
- Ne pas redessiner l'interface ni les sprites : on déplace le code de `legacy/`, on ne le réécrit pas.
- Fonctions courtes, noms explicites, commentaires seulement pour le « pourquoi ».
- Après chaque phase : `npm test` vert, test à deux onglets OK, commit.

## Ce qu'on ne fait PAS (pour l'instant)

Prédiction côté client, rollback, delta compression, comptes avec mot de passe, base de données, scaling, mobile natif.

## Saison 2 : règles en plus
- Contenu piloté par les données : classes, zones, monstres, boss, montures, objets et dialogues vivent dans shared/data/*.js (un fichier par domaine : classes.js, zones.js, mobs.js, bosses.js, items.js, mounts.js, dialogues.js, commands.js). Ajouter du contenu = ajouter des données, pas du code spécial.
- Les objets du sac sont des INSTANCES { uid, id, nObj, rarete } et plus de simples identifiants. Les stats se calculent avec shared/rules.js depuis la base + le niveau d'objet + la rareté.
- Droits : un joueur a un champ "droits" (tableau de chaînes) dans saves/<pseudo>.json. Le serveur vérifie toujours hasRight(joueur, droit) ; le client ne fait qu'afficher.
- Niveau max : 100.
- Les commandes de chat sont déclarées dans shared/data/commands.js { nom, alias, args, description, droit? } : le serveur et l'autocomplétion lisent la même table.
- Pas de nouvelle dépendance npm. Le son, s'il y en a, est généré avec la Web Audio API (aucun fichier audio).
