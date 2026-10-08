---
name: ajouter-contenu
description: Procédure pour ajouter du contenu à Chouffinia Online (zone, monstre, PNJ, marchand, quête, donjon, boss, objet, monture, classe, compétence, commande de chat) en respectant « tout par les données ». À utiliser dès qu'on ajoute ou modifie du contenu de jeu.
---

# Ajouter du contenu

Règle : on ajoute des **données** dans `shared/data/*.js`. Le format de chaque table est écrit en commentaire en tête du fichier : le relire avant d'écrire. Textes en français, ton parodique (chouffins, geeks, 18-25).

## Où mettre quoi

| Contenu | Fichier(s) | Code à toucher en plus |
|---|---|---|
| Monstre | `data/mobs.js` (`NEW_MOBS`) + apparition dans `data/zones.js` (`NEW_SPAWNS`) | sprite dans `client/sprites.js` (`drawMob`) si nouveau look |
| PNJ simple | `data/zones.js` (`NEW_NPCS`, helper `npc(...)`) ou `NPCS` dans `data.js` | aucun ; répliques dans `data/dialogues.js` |
| Panneau | PNJ avec `look:'sign'` | aucun |
| Marchand | PNJ + entrée `STOCK.<idPnj>` dans `data/items.js` | bouton d'achat dans `showNpc` (`client/panels.js`) |
| Donjon | `data/dungeons.js` + PNJ d'entrée avec `dungeon:'<id>'` + boss dans `MOBS`/`BOSSES` | aucun (le test « chaque donjon a un PNJ d'entrée » vérifie le lien) |
| Capacité de boss | `data/bosses.js`, en réutilisant un `type` existant | moteur `bossTick` (sim.js) seulement pour un type nouveau |
| Objet | `data/items.js` (`ITEMS`, et `SHOP`/`STOCK` s'il est vendu) | icône dans `sprites.js` (`paintIcon`) si nouvelle |
| Quête | `data/quests.js` (`NEW_QUESTS`, chaîne unique) | aucun |
| Monture | `data/mounts.js` (`seller` = id du PNJ) | aucun |
| Classe | `data/classes.js` | comportement de chaque compétence nouvelle dans sim.js (`SELF`, `ALLY`, `useSkill`) |
| Commande de chat | `data/commands.js` | handler dans `RUN` (sim.js) ; `droit:'x'` la rend invisible sans le droit |
| Zone | `data/zones.js` (`NEW_ZONES`, `NEW_SPAWNS`) | **obligatoire** : tuiles dans `genOverworld` et découpage dans `zoneAt` (`shared/map.js`) |

## Pièges

- `NPCS[0]` est le Vieux Sage (sim.js s'en sert) : ajouter les PNJ à la fin.
- Un PNJ doit être sur une case praticable et à < 3,5 cases (`NEAR`) du joueur pour qu'on puisse lui parler ; vérifier avec `isSolid`/`canStand` sur `genOverworld(20111)`.
- Un nouveau champ de sauvegarde : valeur par défaut dans `newSave` **et** validation dans `normalizeSave` (rules.js).
- Une nouvelle action ou un nouvel événement réseau : les documenter dans l'en-tête de `shared/protocol.js`.
- Jamais de `Math.random` dans `shared/` : utiliser `w.rnd` / `w.r` (rngTools).

## Vérifier

1. `npm test` vert ; ajouter un test dans `test/` si une règle est nouvelle (voir `test/zones.test.js` pour un donjon complet).
2. Vérifier en jeu (skill `verifier-en-jeu`).
