# Chouffinia Online — Inventaire, armes à distance, LAN Party & carte des activités

> Statut : **V1.3, validée**. Tout ce qui est marqué *Hypothèse* est une proposition, pas une décision.
> Le cadre technique (stack, architecture, conventions) est celui de `CLAUDE.md` et n'est pas répété ici.

## 1. Vision

Changer d'équipement passe aujourd'hui par deux fenêtres qui ne s'ouvrent pas ensemble (Sac, Personnage) et un double-clic dans le sac : c'est pénible dès qu'on a du butin à trier. Ce lot donne aux joueurs un écran Personnage « à la Destiny » où l'on choisit son équipement emplacement par emplacement, des armes à distance, puis le premier donjon **à étapes** du jeu, jouable jusqu'à 4, dont chaque étape a son propre butin exclusif. La valeur : un butin qui donne envie de refaire le donjon, et un inventaire qui permet d'en profiter sans friction.

## 2. Périmètre

**Dans le périmètre :**
- Écran Personnage refondu : personnage au centre, emplacements autour, choix d'un objet par emplacement avec comparaison, équipement en un clic.
- Armes à distance : une arme peut allonger la portée de l'attaque de base, avec des dégâts réduits à distance.
- Donjon « La LAN Party », conçu en 3 étapes, dont **seule l'étape 1 est livrée** ici.
- Limite de 4 joueurs, comme les autres donjons.
- Carte des activités : touche virgule (AZERTY) pour la grande carte, logo de chaque donjon, fiche du donjon et bouton « Lancer l'activité » qui y téléporte.
- Fin d'étape quand tous les monstres de l'étape sont morts, puis butin exclusif d'étape : 2 objets propres à l'étape, chaque joueur en reçoit un.

**Hors périmètre :**
- Étapes 2 et 3 et passage d'une étape à l'autre → lot 5.
- Glisser-déposer, tri et filtres du sac, agrandissement du sac, coffre de banque → à rediscuter (pas de lot visé).
- Quête de campagne liée au donjon, haut fait, entrée au Tableau d'Honneur → lot 5 ou plus tard.
- Modification des 6 donjons existants (ils gardent un seul niveau et leur coffre de boss).

## 3. Contraintes et stack

- Celles de `CLAUDE.md` : ES modules, Node ≥ 20, `ws` seule dépendance, serveur qui fait foi, contenu dans `shared/data/*.js`, aucun asset externe.
- Tests : `node:test` (`npm test`). Toute logique de choix/tri d'équipement doit être testable sans navigateur (donc vivre dans `shared/`).
- Pas de nouvelle action réseau si les actions existantes `equip {idx}` / `unequip {slot}` suffisent.
- Compatibilité : les sauvegardes existantes de `saves/` se chargent sans perte ; tout nouveau champ de sauvegarde a sa valeur par défaut dans `newSave` et sa validation dans `normalizeSave`.
- Interface : utilisable à la souris et au toucher, lisible sur un écran de 1280×720 sans défilement horizontal.

## 4. Paramètres et valeurs de référence

Seule source de ces valeurs. Les valeurs marquées *H* sont des hypothèses.

| Constante (proposée) | Valeur | Unité | Rôle |
|---|---|---|---|
| `DG_MAX` | 4 | joueurs | Joueurs simultanés max dans une instance (existant, inchangé) |
| `LAN_ETAPES` | 3 (1 livrée) | étapes | Nombre d'étapes prévu |
| `LAN_L` | 20 | niveau | Niveau des monstres de l'étape 1 |
| `LAN_RL` | 20 | niveau | Niveau requis pour entrer ou être invité |
| `E1_MOBS` *H* | 12 | monstres | Monstres de l'étape 1 (à 1 joueur) |
| `E1_GOLD` *H* | 400 | po | Or donné à chaque joueur en fin d'étape 1 |
| `E1_XP` *H* | 1500 | XP | XP bonus donnée à chaque joueur en fin d'étape 1 |
| `E1_RARETE` *H* | epic | rareté | Rareté des 2 objets d'étape 1 |
| `E1_NOBJ` | 20 | niveau d'objet | Niveau d'objet des objets d'étape 1 (= `LAN_L`) |
| `SCALE_PER_PLAYER` | 0,6 | × PV | Renfort des monstres par joueur en plus (règle existante, inchangée) |
| `ARME_RG` | 5 | cases | Portée de l'attaque de base avec une arme à distance |
| `ARME_DIST_MULT` | 0,8 | × dégâts | Dégâts d'une attaque de base au-delà de la portée de la classe |
| `COMBAT_TP` *H* | 5 | s | Délai sans frapper ni être frappé avant de pouvoir lancer une activité |
| `BAG` | 24 | emplacements | Taille du sac (existant, inchangé) |

## 5. Features

### F01 — Écran Personnage à emplacements

**Objectif :** voir d'un coup d'œil tout son équipement et ses stats, disposés autour de son personnage.
**User story :** En tant que joueur, je veux un écran où mon chouffin est au centre et mes 5 emplacements autour, afin de savoir ce que je porte sans lire une liste.
**Dépendances :** aucune
**Priorité :** Indispensable
**Critères d'acceptation :**
| ID | Critère (mesurable) | Vérification |
|---|---|---|
| F01-C1 | Quand j'appuie sur la touche Personnage (défaut `C`), l'onglet Équipement affiche mon chouffin dessiné (mêmes chapeau et classe qu'en jeu) au centre et les 5 emplacements Tête, Torse, Mains, Jambes, Arme autour de lui. | manuelle |
| F01-C2 | Chaque emplacement occupé montre l'icône de l'objet avec la couleur de sa rareté et son niveau d'objet ; un emplacement vide montre son nom (« Tête »…) et « Vide ». | manuelle |
| F01-C3 | Les stats Attaque, Protection (avec % de réduction), PV max et Caféine max sont visibles sur le même écran que les emplacements, sans changer d'onglet. | manuelle |
| F01-C4 | Survoler (souris) ou toucher longuement (≥ 500 ms) un emplacement occupé affiche la fiche de l'objet (même contenu que l'infobulle actuelle). | manuelle |
| F01-C5 | L'onglet Montures et la liste des stats « fun » (Dignité, Dernière douche…) restent accessibles, avec le même contenu qu'aujourd'hui. | manuelle |
| F01-C6 | À 1280×720, l'écran tient sans défilement horizontal ; les 5 emplacements sont visibles sans défilement vertical. | manuelle |

**Cas limites et erreurs :** personnage sans aucun équipement → 5 emplacements « Vide », stats de base affichées.
**Hors périmètre :** nouveaux sprites, animation du personnage, prévisualisation 3D/rotation.
**Notes pour l'implémentation :** réutiliser `drawChouffin` (sprites.js) et `iconCanvas` ; ne pas redessiner le style des panneaux (CLAUDE.md).

### F02 — Choisir un objet pour un emplacement

**Objectif :** changer une pièce d'équipement en deux clics depuis l'écran Personnage.
**User story :** En tant que joueur, je veux cliquer sur un emplacement et voir les objets de mon sac qui vont dedans, comparés à ce que je porte, afin d'équiper le meilleur sans fouiller le sac.
**Dépendances :** F01
**Priorité :** Indispensable
**Critères d'acceptation :**
| ID | Critère (mesurable) | Vérification |
|---|---|---|
| F02-C1 | Étant donné un sac contenant des objets de plusieurs emplacements, quand je calcule la liste des candidats pour l'emplacement X, alors elle contient exactement les objets d'équipement du sac dont l'emplacement est X, et aucun autre. | auto |
| F02-C2 | La liste est triée : d'abord les objets équipables à mon niveau, du plus fort gain au plus faible (selon le verdict de comparaison existant `cmpInfo`), puis les objets de niveau requis trop élevé. À égalité, l'ordre est stable (ordre du sac). | auto |
| F02-C3 | Quand je clique sur un emplacement, un volet s'ouvre à côté avec ces candidats ; chaque ligne montre icône, nom (couleur de rareté), niveau d'objet et l'écart de stats ▲/▼ face à l'objet porté. | manuelle |
| F02-C4 | Quand je clique sur un candidat équipable, le client envoie `equip` pour cet objet ; après la réponse du serveur, l'emplacement montre le nouvel objet, l'ancien est dans le sac, et le volet se met à jour, sans fermer l'écran. | auto (sim : equip échange les deux objets) + manuelle (rafraîchissement) |
| F02-C5 | Un candidat de niveau requis supérieur au mien est grisé, porte « Niveau N requis », et cliquer dessus n'envoie rien. | manuelle |
| F02-C6 | Le volet d'un emplacement occupé propose « Retirer » ; cliquer envoie `unequip`. Sac plein : le message serveur existant « Sac plein. » s'affiche et l'objet reste équipé. | auto (sim) + manuelle |
| F02-C7 | Aucun candidat : le volet affiche « Aucun objet pour cet emplacement dans votre sac. » | manuelle |
| F02-C8 | `Échap`, un second clic sur le même emplacement ou un clic hors du volet ferme le volet sans rien équiper. | manuelle |

**Cas limites et erreurs :** le sac change pendant que le volet est ouvert (butin, échange) → le volet se recalcule à la réception de la sauvegarde (`self`) et n'envoie jamais un index périmé ; l'objet cliqué a disparu → rien n'est envoyé.
**Hors périmètre :** équiper depuis le volet un objet du coffre de banque (n'existe pas), comparaison de deux objets du sac entre eux.
**Notes pour l'implémentation :** la fonction « candidats pour un emplacement, triés » va dans `shared/rules.js` à côté de `cmpInfo` pour être testée par `node:test`. L'action `equip {idx}` existe déjà : on retrouve l'index au moment du clic à partir de l'`uid`.

### F03 — Signaler les améliorations disponibles

**Objectif :** savoir sans chercher qu'un meilleur objet attend dans le sac.
**User story :** En tant que joueur qui revient d'un donjon, je veux voir quels emplacements ont une amélioration dans mon sac, afin de m'équiper tout de suite.
**Dépendances :** F01, F02
**Priorité :** Important
**Critères d'acceptation :**
| ID | Critère (mesurable) | Vérification |
|---|---|---|
| F03-C1 | Étant donné un sac et un équipement, un emplacement est « améliorable » si et seulement si au moins un candidat équipable à mon niveau a le verdict « meilleur » de `cmpInfo`. | auto |
| F03-C2 | Un emplacement améliorable porte le même marqueur ▲ que les objets du sac aujourd'hui. | manuelle |
| F03-C3 | Le bouton/raccourci Personnage de la barre porte un marqueur ▲ tant qu'au moins un emplacement est améliorable ; il disparaît dès qu'aucun ne l'est. | manuelle |

**Cas limites et erreurs :** un objet meilleur mais de niveau trop élevé ne déclenche pas de marqueur.
**Hors périmètre :** équipement automatique du meilleur objet.

### F04 — Donjon à étapes

**Objectif :** pouvoir déclarer dans les données un donjon composé de plusieurs étapes.
**User story :** En tant que concepteur de contenu, je veux décrire les étapes d'un donjon dans `data/dungeons.js`, afin d'ajouter les étapes 2 et 3 plus tard sans écrire de code.
**Dépendances :** aucune
**Priorité :** Indispensable
**Critères d'acceptation :**
| ID | Critère (mesurable) | Vérification |
|---|---|---|
| F04-C1 | La LAN Party accepte `DG_MAX` = 4 joueurs ; un 5e invité qui accepte n'entre pas et reçoit le message existant « Le donjon est complet (4 joueurs maximum). » | auto |
| F04-C2 | Les 6 donjons existants, qui ne déclarent pas d'étapes, se comportent exactement comme avant (boss, coffre de boss) : les tests existants restent verts. | auto |
| F04-C3 | Un donjon peut déclarer une liste d'étapes ; l'instance commence à l'étape 1. En V1 la LAN Party en déclare une seule. | auto |
| F04-C4 | Le niveau requis `LAN_RL` est vérifié à l'entrée et à l'invitation, avec les messages actuels des autres donjons. | auto |
| F04-C5 | Chaque arrivée renforce les monstres vivants selon la règle existante (`SCALE_PER_PLAYER`). | auto |

**Cas limites et erreurs :** un joueur quitte puis est réinvité → il compte de nouveau dans la limite ; instance vide → détruite (règle existante).
**Hors périmètre :** passage à l'étape suivante (lot 5).
**Notes pour l'implémentation :** le format reste dans `shared/data/dungeons.js` (documenté en tête de fichier) ; ajouter des étapes 2 et 3 plus tard doit être un ajout de données, pas de code.

### F05 — Étape 1 : nettoyer la salle

**Objectif :** une étape finie se reconnaît sans ambiguïté : tous ses monstres sont morts.
**User story :** En tant que groupe, je veux savoir combien de monstres il reste et que l'étape se termine au dernier, afin de savoir où on en est.
**Dépendances :** F04
**Priorité :** Indispensable
**Critères d'acceptation :**
| ID | Critère (mesurable) | Vérification |
|---|---|---|
| F05-C1 | À l'entrée, l'étape 1 contient `E1_MOBS` monstres des types de l'étape, au niveau `LAN_L`, et aucun boss. | auto |
| F05-C2 | Les monstres d'une étape ne réapparaissent pas. | auto |
| F05-C3 | Quand le dernier monstre de l'étape meurt, chaque joueur présent dans l'instance reçoit une seule fois la bannière « Étape 1 terminée : L'Installation » et l'étape passe à l'état terminé. | auto |
| F05-C4 | Un compteur « Monstres restants : N / E1_MOBS » est visible par chaque joueur de l'instance et baisse de 1 à chaque mort. | auto (valeur dans le snapshot) + manuelle (affichage) |
| F05-C5 | En V1, une fois l'étape 1 terminée, une sortie apparaît et ramène au point de sortie du donjon (même mécanisme que les donjons actuels). | auto |

**Cas limites et erreurs :** deux monstres meurent dans le même tick → la fin d'étape n'est déclenchée qu'une fois ; tous les joueurs meurent → comportement de mort actuel des donjons, l'étape n'est pas réinitialisée.
**Hors périmètre :** chrono, score, classement de vitesse.

### F06 — Butin exclusif d'étape

**Objectif :** chaque étape a deux objets qu'on ne trouve nulle part ailleurs ; chaque joueur en repart avec un.
**User story :** En tant que joueur, je veux un objet propre à l'étape quand on la termine, afin d'avoir une raison de la refaire pour obtenir l'autre.
**Dépendances :** F05 ; F01–F02 pour en profiter
**Priorité :** Indispensable
**Critères d'acceptation :**
| ID | Critère (mesurable) | Vérification |
|---|---|---|
| F06-C1 | L'étape 1 déclare exactement 2 objets d'équipement distincts ; aucun des deux n'apparaît dans un marchand (`SHOP`, `STOCK`), dans un tirage d'artéfacts, dans un autre donjon ou dans le butin des monstres du monde. | auto |
| F06-C2 | Quand l'étape 1 se termine, chaque joueur présent reçoit l'un des 2 objets, tiré pour lui seul avec une chance de 50 % chacun, à la rareté `E1_RARETE` et au niveau d'objet `E1_NOBJ`. Sur 1 000 tirages simulés, chaque objet sort entre 450 et 550 fois. | auto |
| F06-C3 | Le tirage d'un joueur ne dépend pas de celui des autres : deux joueurs peuvent recevoir le même objet. | auto |
| F06-C4 | Chaque joueur présent reçoit aussi `E1_GOLD` po et `E1_XP` XP. | auto |
| F06-C5 | Le butin est remis via un coffre personnel d'étape qui apparaît à l'endroit du dernier monstre tué ; ouvrir le coffre met l'objet dans le sac et affiche le message de butin habituel avec le lien de l'objet. | auto + manuelle |
| F06-C6 | Sac plein à l'ouverture : l'objet n'est pas perdu, le message « Sac plein. Faites de la place puis rouvrez le coffre. » s'affiche, et le coffre reste ouvrable par ce joueur tant qu'il est dans l'instance. | auto |
| F06-C7 | Un joueur arrivé dans l'instance après la fin de l'étape ne reçoit ni objet, ni or, ni XP de cette étape. | auto |
| F06-C8 | Les deux objets sont échangeables (`/echanger`), vendables et fusionnables comme les autres équipements. | auto |
| F06-C9 | Chaque objet a un nom, une description dans le ton du jeu et une icône, visibles dans la fiche d'objet. | manuelle |

**Cas limites et erreurs :** joueur sorti ou déconnecté avant d'ouvrir le coffre → le butin non ouvert est perdu (Q5) ; refaire le donjon redonne un tirage à chaque fin d'étape.
**Hors périmètre :** choix de l'objet par le joueur, butin « unique à vie ».

### F07 — Contenu de la LAN Party (étape 1)

**Objectif :** remplir le donjon : par qui on y entre, quels monstres on y combat, quels textes on y lit.

F04 à F06 sont les **règles** (étapes, fin d'étape, butin), valables pour n'importe quel donjon à étapes. F07 est le **contenu** propre à la LAN Party, écrit dans les fichiers de données : sans lui, les règles existent mais aucun donjon ne les utilise.
**User story :** En tant que joueur, je veux trouver la LAN Party sur la carte et y rire autant que dans le reste du jeu.
**Dépendances :** F04, F05, F06
**Priorité :** Indispensable
**Critères d'acceptation :**
| ID | Critère (mesurable) | Vérification |
|---|---|---|
| F07-C1 | Un PNJ d'entrée « L'Orga de la LAN », au Bourg-Forum (emplacement exact au choix du développeur), apparaît sur la minimap avec la couleur « donjon » et ouvre le menu d'entrée. Il est ajouté en fin de `NPCS`. | auto (présence, `npc.dungeon`) + manuelle |
| F07-C2 | L'étape 1 utilise 3 nouveaux types de monstres (Câble Emmêlé, Multiprise Surchargée, Pote Sans Sa Tour), déclarés dans `data/mobs.js` et dessinés avec les primitives existantes de `sprites.js`. | auto (déclarés) + manuelle (rendu) |
| F07-C3 | Les 2 objets d'étape 1 sont la « Multiprise Parafoudre » (arme) et le « Tapis de Souris XXL » (torse, porté en cape). | auto |
| F07-C4 | Le donjon a tous les textes des autres donjons (desc, astuce, arrivée, sortie, retour, coffre), en français, dans le ton du jeu. | auto (champs non vides) + manuelle (ton) |
| F07-C5 | La musique et les effets sonores sont ceux des donjons actuels. | manuelle |
| F07-C6 | `npm run balance` permet à un joueur moyen de niveau `LAN_RL` seul de finir l'étape 1 sans mourir dans plus de 50 % des simulations (*Hypothèse* : critère d'équilibrage, voir Q4). | auto |

**Hors périmètre :** nouveaux décors de tuiles (on réutilise `genDungeon`), nouvelle musique.

### F08 — Armes à distance

**Objectif :** attaquer de loin avec une arme équipée, en échange de dégâts plus faibles.
**User story :** En tant que joueur, je veux équiper une arme à distance afin de frapper un ennemi sans aller au contact, quitte à faire moins mal.
**Dépendances :** aucune (F02 pour la comparer facilement)
**Priorité :** Important
**Critères d'acceptation :**
| ID | Critère (mesurable) | Vérification |
|---|---|---|
| F08-C1 | Une arme peut déclarer une portée (`ARME_RG`). Équipée, elle porte la portée de l'attaque de base (compétence 1 de la classe) à `max(portée de la compétence 1, ARME_RG)`. Les compétences 2 à 5 gardent leur portée. Toutes les classes peuvent l'équiper. | auto |
| F08-C2 | Une attaque de base qui touche une cible située au-delà de la portée de la compétence 1 de la classe (1,6 case pour Chouffin, Speedrunner ; 1,8 pour Modo ; 5 pour Rôliste) inflige `ARME_DIST_MULT` des dégâts normaux ; en deçà, les dégâts sont normaux. | auto |
| F08-C3 | Avec une arme de portée `ARME_RG`, un Chouffin touche une cible à 4 cases sans se déplacer ; à 6 cases, il reçoit le message existant « Hors de portée. Rapprochez-vous (physiquement, ce n'est pas social). » ou, en attaque de base, s'approche comme aujourd'hui. | auto |
| F08-C4 | L'auto-attaque continue tant que la cible est à portée de l'arme, sans approcher davantage. | auto |
| F08-C5 | La fiche de l'objet et la comparaison (F02) affichent « Portée : N cases » pour une arme à distance. | manuelle |
| F08-C6 | À chaque attaque de base à distance, un projectile visuel part du joueur vers la cible ; il est purement visuel, les dégâts sont appliqués par le serveur au moment du coup. | manuelle |
| F08-C7 | En duel, la portée et `ARME_DIST_MULT` s'appliquent, cumulés avec le ×0,5 PvP existant. | auto |
| F08-C8 | Au moins 3 armes à distance existent : « Lance-Pierre à Élastique de Bureau » (niveau 3), « Pistolet à Billes de la Fête Foraine » (niveau 15), « Nerf Modifié en Garage » (niveau 40), chacune avec une description dans le ton du jeu et au moins une source d'obtention (marchand ou butin). | auto (présence, portée, source) + manuelle (ton) |

**Cas limites et erreurs :** retirer l'arme pendant une auto-attaque → la portée redevient celle de la classe et le personnage s'approche ; le Rôliste ne gagne rien sous 5 cases et ne subit aucun malus sous 5 cases (Q12).
**Hors périmètre :** munitions, temps de vol réel du projectile, ligne de vue (les murs n'arrêtent pas les tirs, comme le d20 aujourd'hui).
**Notes pour l'implémentation :** la portée est un champ de l'arme dans `data/items.js` (format documenté en tête du fichier) ; la règle de portée/malus vit côté serveur (sim.js), l'affichage du projectile côté client à partir d'un événement existant ou nouveau (alors listé dans `protocol.js`).

### F09 — Carte agrandie au clavier, avec les donjons

**Objectif :** ouvrir la grande carte d'une touche et y repérer chaque donjon à son logo.
**User story :** En tant que joueur, je veux ouvrir la carte avec la touche virgule et voir où sont les donjons, afin de choisir une activité sans traverser le monde à pied pour la trouver.
**Dépendances :** aucune (F07 pour le logo de la LAN Party)
**Priorité :** Important
**Critères d'acceptation :**
| ID | Critère (mesurable) | Vérification |
|---|---|---|
| F09-C1 | Une action de touche « Carte » existe dans la liste des touches configurables ; sa touche par défaut est le code physique `KeyM` (la virgule en AZERTY, libellée « , » sur un clavier AZERTY). | auto |
| F09-C2 | La Monture a pour touche par défaut `KeyN` (au lieu de `KeyM`). Aucune autre touche par défaut ne change, et deux actions n'ont jamais la même touche par défaut. | auto |
| F09-C3 | Appuyer sur la touche Carte ouvre la carte agrandie (la même que le clic sur la minimap) et ferme les autres fenêtres ; appuyer de nouveau, ou sur `Échap`, la ferme. La touche est ignorée quand le chat a le focus. | manuelle |
| F09-C4 | Sur la carte agrandie du monde, chaque donjon de `DUNGEONS` (les 6 existants et la LAN Party) a un logo à la position de son PNJ d'entrée, à la place du point rose actuel ; sur la minimap, le point rose reste. | auto (liste des logos = liste des donjons, positions) + manuelle (rendu) |
| F09-C5 | Survoler un logo affiche le nom du donjon et son niveau requis minimal ; le pointeur indique qu'il est cliquable. | manuelle |
| F09-C6 | Joueur dont les touches sont déjà enregistrées (`chouffinia-touches`) avec la Monture sur `KeyM` : sa configuration est conservée telle quelle, la Monture reste sur `KeyM`, la Carte n'a pas de touche (affichée « — » dans Options) jusqu'à ce qu'il en choisisse une. | auto |

**Cas limites et erreurs :** en donjon, la touche Carte ouvre la carte agrandie du donjon, sans logos.
**Hors périmètre :** zoom et déplacement dans la carte, logos pour les marchands ou les quêtes.
**Notes pour l'implémentation :** les logos sont dessinés avec les primitives canvas existantes (aucune image externe) ; un logo commun à tous les donjons suffit en V1.

### F10 — Fiche d'activité

**Objectif :** savoir en un clic ce qu'un donjon propose avant d'y aller.
**User story :** En tant que joueur, je veux cliquer sur le logo d'un donjon et voir sa fiche, afin de décider si j'y vais et à quelle difficulté.
**Dépendances :** F09
**Priorité :** Important
**Critères d'acceptation :**
| ID | Critère (mesurable) | Vérification |
|---|---|---|
| F10-C1 | Cliquer sur un logo ouvre une fiche, la carte restant visible derrière, avec : nom du donjon, sa description (`desc`), son astuce (`astuce`), le nom du boss (ou « Aucun boss : nettoyez la salle » pour la LAN Party), les noms des types de monstres, et le butin notable (objet légendaire unique du donjon, ou les 2 objets d'étape de la LAN Party) avec leurs liens d'objet. | auto (contenu calculé depuis les données) + manuelle (mise en page) |
| F10-C2 | La fiche liste les difficultés du donjon avec leur nom et leur niveau requis ; celles au-dessus de mon niveau sont grisées avec « Niveau N requis ». La plus haute difficulté accessible est présélectionnée. | auto (liste et présélection) + manuelle |
| F10-C3 | Toutes les informations de la fiche viennent de `shared/data*` : ajouter un donjon dans les données le fait apparaître sur la carte avec sa fiche sans autre code. | auto |
| F10-C4 | `Échap` ou un clic hors de la fiche la ferme et laisse la carte ouverte. | manuelle |

**Cas limites et erreurs :** niveau inférieur à toutes les difficultés → aucune présélection, bouton de lancement désactivé (F11-C3).
**Hors périmètre :** progression personnelle sur le donjon (nombre de fois fini, objets déjà obtenus).

### F11 — Lancer l'activité

**Objectif :** entrer dans un donjon depuis la carte, sans marcher jusqu'à son entrée.
**User story :** En tant que joueur, je veux appuyer sur « Lancer l'activité » dans la fiche, afin d'être téléporté directement dans le donjon à la difficulté choisie.
**Dépendances :** F10
**Priorité :** Important
**Critères d'acceptation :**
| ID | Critère (mesurable) | Vérification |
|---|---|---|
| F11-C1 | La fiche a un bouton « Lancer l'activité ». Le cliquer envoie une intention au serveur (donjon + difficulté) ; le serveur fait entrer le joueur dans une nouvelle instance exactement comme l'entrée par le PNJ (même niveau requis, mêmes monstres, même sortie `exit`). | auto |
| F11-C2 | Le lancement est gratuit et possible depuis n'importe quel point de la carte du monde. | auto |
| F11-C3 | Le serveur refuse le lancement, avec un message d'erreur, si le joueur est : mort ; en combat (a frappé ou été frappé depuis moins de `COMBAT_TP` s) ; en duel ; en échange ; déjà en donjon ; de niveau inférieur au niveau requis de la difficulté. Le bouton est désactivé côté client dans ces cas, avec la raison affichée. | auto (refus serveur) + manuelle (bouton) |
| F11-C4 | Messages de refus exacts : « Impossible en combat. Finissez d'abord votre bagarre. » ; « Vous êtes déjà en donjon. » ; « Niveau N requis. » ; mort, duel, échange : messages existants équivalents ou « Impossible maintenant. » | auto |
| F11-C5 | Après un lancement réussi, la carte et la fiche se ferment, et le joueur reçoit le même message d'arrivée que par le PNJ. Il entre seul ; `/inviter` fonctionne ensuite comme aujourd'hui. | auto + manuelle |
| F11-C6 | En quittant le donjon, le joueur ressort au point `exit` du donjon (comme aujourd'hui), pas à l'endroit d'où il a lancé l'activité. | auto |

**Cas limites et erreurs :** intention avec un donjon ou une difficulté inexistants → ignorée sans planter le serveur ; deux clics rapides → une seule instance créée.
**Hors périmètre :** téléportation de groupe, file d'attente / recherche de groupe, coût du lancement.
**Notes pour l'implémentation :** nouvelle action → un `case` dans `handleAction` et la liste en tête de `protocol.js` ; réutiliser la fonction d'entrée en donjon existante.

## 6. Definition of Done

Pour chaque lot :
- [ ] Tous les critères `auto` du lot sont couverts par un test dans `test/`, et `npm test` est vert (relancé une fois si le code de sortie est faux avec « fail 0 »).
- [ ] Tous les critères `manuelle` sont validés par l'utilisateur, à deux onglets sur `http://localhost:3000` avec deux pseudos.
- [ ] Une sauvegarde existante de `saves/` se charge sans erreur ni perte.
- [ ] Les formats de données nouveaux ou modifiés sont documentés en tête de leur fichier, et `CLAUDE.md` est à jour (systèmes de jeu, protocole si changé).
- [ ] Aucune nouvelle dépendance npm ; aucune sauvegarde de test committée.
- [ ] Un commit par lot sur `dev`.

## 7. Hypothèses et questions ouvertes

| # | Sujet | Hypothèse / question | Réponse par défaut | Décision |
|---|---|---|---|---|
| Q1 | Thème | Nom « La LAN Party », étape 1 « L'Installation », étapes 2-3 « Le Tournoi » et « La Nuit Blanche ». | Accepté | Validé |
| Q2 | Niveau | Niveau unique 20, entre le Bac de 2012 (15) et la Réserve (25). | 20 | Validé |
| Q3 | Difficultés | Une seule difficulté en V1 ; les 4 difficultés au lot 5. | Une seule | Validé |
| Q4 | Équilibrage | `E1_MOBS` = 12, or 400, XP 1500, rareté épique : à confirmer avec `npm run balance`. | Valeurs du §4 | Ajustées pendant le lot 3 |
| Q5 | Coffre non ouvert | Si un joueur sort ou se déconnecte sans ouvrir son coffre d'étape, le butin est perdu. | Perdu | Validé |
| Q6 | Sac + Personnage | Le Sac reste un panneau séparé ; pas de sac affiché à côté de l'écran Personnage en V1. | Non en V1 | Validé |
| Q7 | Les 2 objets | « Multiprise Parafoudre » (arme) et « Tapis de Souris XXL » (torse). | Accepté | Validé |
| Q8 | Accès | Entrée seul puis `/inviter`, comme aujourd'hui. | Comme aujourd'hui | Validé |
| Q9 | Limite de joueurs | 3 joueurs proposés au départ. | 3 | 4 joueurs, comme les autres donjons |
| Q10 | Niveau des objets (F02/F03) | Objet dont le niveau requis dépasse celui du joueur : affiché grisé en bas de liste avec « Niveau N requis » (F02-C2, C5), jamais signalé ▲ (F03-C1). Variante : ne pas l'afficher du tout. | Grisé en bas | Grisé en bas (validé) |
| Q11 | Armes à distance : valeurs | Portée 5 cases, dégâts à 80 % au-delà de la portée de la classe. | Accepté | Validé |
| Q12 | Armes à distance : classes | Toutes les classes ; le malus ne s'applique qu'au-delà de la portée normale de la classe. | Accepté | Validé |
| Q13 | Armes à distance : placement | Lot à part, juste après le lot 1 (inventaire). | Accepté | Validé |
| Q14 | LAN Party : arme à distance ? | La « Multiprise Parafoudre » (arme d'étape 1) pourrait devenir une arme à distance. | Non, reste au corps à corps | Non (défaut validé) |
| Q15 | Logo des donjons | Logo à la position de l'entrée de chaque donjon sur la carte agrandie, tous les donjons. | Accepté | Validé |
| Q16 | Touche Carte | Virgule AZERTY (code `KeyM`) ; la Monture passe sur `KeyN`. | Accepté | Validé |
| Q17 | Conditions de lancement | Partout sur la carte du monde, gratuit, hors combat/mort/duel/échange/donjon ; entrée seul puis `/inviter`. | Accepté | Validé |
| Q18 | Placement | Lot 4, après la LAN Party ; les étapes 2-3 passent en lot 5. | Accepté | Validé |
| Q19 | Délai de combat | `COMBAT_TP` = 5 s. | 5 s | Validé |

## 8. Journal des modifications

| Date | Modification | Features touchées | Décidé par |
|---|---|---|---|
| 2026-10-09 | Brouillon V1 | F01–F07 | Claude (à valider) |
| 2026-10-09 | Limite à 4 joueurs (F04 réécrite), F07 explicitée, objets fixés (F07-C3), Q1–Q3 et Q5–Q8 validées | F04, F07 | Utilisateur |
| 2026-10-09 | Ajout de F08 (armes à distance) en lot 2 ; la LAN Party passe en lot 3, ses étapes 2-3 en lot 5 ; Q10–Q13 validées | F02, F03, F08 | Utilisateur |
| 2026-10-09 | Ajout de F09–F11 (carte des activités) en lot 4 ; étapes 2-3 de la LAN Party en lot 5 ; Monture déplacée sur `KeyN` | F09, F10, F11 | Utilisateur |
