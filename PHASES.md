# Plan de dev Chouffinia Online — prompts Claude Code

## Phase 1 — Découper le fichier, sans rien changer au jeu

```
Lis CLAUDE.md puis legacy/chouffinia.html en entier.
Découpe le jeu en modules selon l'arborescence de CLAUDE.md, MAIS en gardant le jeu 100 % solo pour l'instant :
- shared/data.js, shared/rng.js, shared/map.js, shared/rules.js : extraits tels quels, sans DOM.
- client/ : rendu, sprites, HUD, panneaux, input, et la logique de jeu actuelle dans client/solo.js (temporaire).
- genOverworld et genDungeon prennent une graine et un rng en paramètre (plus de Math.random dans shared/).
- server/index.js : pour l'instant juste un serveur statique Node (module http) qui sert client/ et shared/.
- package.json avec "type":"module", npm start, npm test, dépendance ws.
- Quelques tests node:test : xpNeed, stats() avec équipement, genOverworld(seed) déterministe, genDungeon jouable (≥ 6 salles, boss présent).
Critère de fin : npm start, http://localhost:3000, le jeu se joue exactement comme legacy (création perso, quête 1, Bourg-Forum, armurerie avec comparaison, donjon Normal). npm test vert.
Ne réécris pas les dessins ni les textes : déplace le code.
```

## Phase 2 — Isoler la simulation

```
Lis CLAUDE.md. Objectif : sortir toute la logique de jeu de client/solo.js vers shared/sim.js, prête pour plusieurs joueurs.
- world = { tick, maps:{over, ...instances}, players:{[id]:{S, P, mapId}}, mobs par map, objs par map, events:[] }.
- tick(world, dt) : monstres, DoT, régénération, respawn, boss (Coupure du Wi-Fi, Mur de Texte), sorts en cours d'incantation.
- handleAction(world, playerId, action) : toutes les actions listées dans le protocole de CLAUDE.md.
- Les monstres ciblent un JOUEUR par id : aggro sur le joueur le plus proche dans le rayon, puis sur celui qui leur fait le plus de dégâts (table de menace simple). Laisse tomber si la cible meurt, quitte la map ou entre en zone sûre.
- Les résultats visibles (dégâts flottants, messages de chat, butin, bannières, hauts faits) sont poussés dans world.events avec le playerId concerné ; le client se contente de les afficher.
- Le client solo devient : un world local, tick() appelé dans la boucle, et le rendu lit world. Supprime client/solo.js.
- Tests : 2 joueurs dans un même world, l'un tape un monstre → le monstre le cible ; un kill donne XP et progression de quête au bon joueur ; achat refusé sans or ; donjon créé avec la bonne difficulté.
Critère de fin : jeu solo identique à la phase 1, npm test vert, shared/sim.js n'importe rien du client.
```

## Phase 3 — Le serveur et le premier vrai multi

```
Lis CLAUDE.md. Objectif : deux navigateurs jouent dans le même monde.
Serveur (server/index.js) :
- WebSocket (ws) sur le même port que le HTTP. Boucle tick(world) à 20 Hz.
- join {name} : charge saves/<name>.json ou crée un perso neuf ; répond welcome {id, seed, save}.
- move : accepte la position si pas de collision et vitesse ≤ 5 cases/s, sinon renvoie la position corrigée.
- act : passe à handleAction. chat : diffuse à tous.
- Envoie à chaque joueur, à chaque tick : snap des entités de SA map (joueurs, monstres, objets) avec les champs nécessaires au rendu seulement ; self quand sa sauvegarde change ; ev pour ses événements.
- Sauvegarde le joueur toutes les 10 s et à la déconnexion. Retire le joueur du monde à la déconnexion.
Client :
- L'écran de création envoie join. Plus de tick local : le client envoie move ~10 fois/s et ses intentions, rend le dernier snap.
- Les autres joueurs sont dessinés avec drawChouffin (couleur de fedora et équipement visibles), nom en bleu, et interpolés entre deux snaps.
- Si la connexion tombe : message « Connexion perdue », reconnexion automatique toutes les 2 s.
- Désactive les bots simulés et le faux chat (on les réintroduira côté serveur plus tard).
Critère de fin : deux onglets, deux pseudos, chacun voit l'autre bouger, les deux tapent la même Herbe Agressive, elle meurt une fois, le butin va au joueur qui l'a touchée en premier. Rechargement de page = perso récupéré.
```

## Phase 4 — Règles multijoueur propres

```
Lis CLAUDE.md. Objectif : que les règles tiennent à plusieurs.
- Butin et or : au joueur qui a « tagué » le monstre (premier coup). XP : à tous les joueurs qui l'ont frappé et sont à moins de 15 cases, répartie à parts égales.
- Progression de quête : pour chaque joueur qui a frappé le monstre et a la quête active.
- Mort et réapparition par joueur. Zone sûre par joueur. Les dialogues PNJ restent côté client mais chaque bouton envoie une action validée par le serveur (achat, vente, équipement, quêtes).
- Commandes de chat : /qui (liste des joueurs connectés avec niveau et zone), /mp <pseudo> <message>, /danse, /mlady, /khey (diffusées aux autres).
- Afficher les joueurs connectés sur la minimap (point blanc pour soi, bleu pour les autres).
Critère de fin : à deux, on fait la quête 1 en même temps sans conflit ; l'un peut acheter chez Bernard pendant que l'autre se fait taper dehors ; /qui liste les deux.
```

## Phase 5 — Groupes et donjons à plusieurs

```
Lis CLAUDE.md. Objectif : faire les Archives Oubliées en groupe.
- Groupe : /inviter <pseudo>, /accepter, /quitter. Max 4. Cadres de vie des membres du groupe sous le cadre du joueur.
- Le Gardien des Archives crée UNE instance par groupe (graine envoyée aux membres). Tous les membres présents au Bourg-Forum y entrent. Seul le chef de groupe peut lancer.
- Instance détruite quand plus personne n'est dedans. Les monstres du donjon scalent : PV ×(1 + 0,6 × (joueurs − 1)).
- Coffre de fin : chaque membre l'ouvre une fois et reçoit son propre butin.
Critère de fin : deux onglets en groupe entrent dans les Archives en Normal, tuent le Grand Archiviste ensemble, chacun récupère son butin, puis les deux remontent au Bourg-Forum.
```

## Phase 6 — Jouer en LAN

```
Lis CLAUDE.md. Objectif : mes potes rejoignent depuis leur PC.
- Le serveur écoute sur 0.0.0.0 et affiche au démarrage toutes les URL LAN (os.networkInterfaces), ex. http://192.168.1.42:3000.
- Variable PORT optionnelle.
- README.md court : prérequis (Node 20+), npm install, npm start, autoriser Node dans le pare-feu Windows, comment rejoindre, et la piste Tailscale pour jouer hors LAN.
- Pseudo déjà connecté = refus avec message clair.
Critère de fin : un deuxième PC du réseau rejoint et joue.
```

## Phase 7 — Finitions (optionnel, dans l'ordre de valeur)

```
Lis CLAUDE.md. Fais, dans cet ordre :
1. Échange entre joueurs : /echanger <pseudo>, fenêtre à deux colonnes, double validation.
2. Classement /top (niveau, Archives terminées, Chouffes bues).
```

---

## Si ça part en vrille

- Claude a modifié trop de choses d'un coup : `git diff --stat`, puis « Annule tout ce qui sort du périmètre de la phase X ».
- Un bug réseau : « Ajoute un log côté serveur de chaque message reçu et envoyé pour le joueur X, reproduis, puis corrige. »
- Comportement différent de l'original : « Compare avec legacy/chouffinia.html et aligne-toi dessus. »