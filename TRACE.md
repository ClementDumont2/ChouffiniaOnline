# TRACE — matrice de traçabilité

Réservé à l'orchestrateur. Statuts : `à faire`, `testée`, `implémentée`, `vérifiée`, `à valider par l'utilisateur`. Critère complet : `CAHIER_DES_CHARGES.md`.


## Lot 1

| ID | Critère (résumé) | Vérification | Test(s) | Fichier(s) de code | Statut |
|---|---|---|---|---|---|
| F01-C1 | Quand j'appuie sur la touche Personnage (défaut `C`), l'onglet Équipement affiche mon chouffin dessiné (mêmes chapeau et classe qu'en jeu… | manuelle | (logique : test/inventaire.test.js) | client/panels.js, client/index.html, client/hud.js | à valider par l'utilisateur |
| F01-C2 | Chaque emplacement occupé montre l'icône de l'objet avec la couleur de sa rareté et son niveau d'objet ; un emplacement vide montre son n… | manuelle | (logique : test/inventaire.test.js) | client/panels.js, client/index.html, client/hud.js | à valider par l'utilisateur |
| F01-C3 | Les stats Attaque, Protection (avec % de réduction), PV max et Caféine max sont visibles sur le même écran que les emplacements, sans cha… | manuelle | (logique : test/inventaire.test.js) | client/panels.js, client/index.html, client/hud.js | à valider par l'utilisateur |
| F01-C4 | Survoler (souris) ou toucher longuement (≥ 500 ms) un emplacement occupé affiche la fiche de l'objet (même contenu que l'infobulle actuel… | manuelle | (logique : test/inventaire.test.js) | client/panels.js, client/index.html, client/hud.js | à valider par l'utilisateur |
| F01-C5 | L'onglet Montures et la liste des stats « fun » (Dignité, Dernière douche…) restent accessibles, avec le même contenu qu'aujourd'hui. | manuelle | (logique : test/inventaire.test.js) | client/panels.js, client/index.html, client/hud.js | à valider par l'utilisateur |
| F01-C6 | À 1280×720, l'écran tient sans défilement horizontal ; les 5 emplacements sont visibles sans défilement vertical. | manuelle | (logique : test/inventaire.test.js) | client/panels.js, client/index.html, client/hud.js | à valider par l'utilisateur |
| F02-C1 | Étant donné un sac contenant des objets de plusieurs emplacements, quand je calcule la liste des candidats pour l'emplacement X, alors el… | auto | test/inventaire.test.js | shared/rules.js | vérifiée |
| F02-C2 | La liste est triée : d'abord les objets équipables à mon niveau, du plus fort gain au plus faible (selon le verdict de comparaison exista… | auto | test/inventaire.test.js | shared/rules.js | vérifiée |
| F02-C3 | Quand je clique sur un emplacement, un volet s'ouvre à côté avec ces candidats ; chaque ligne montre icône, nom (couleur de rareté), nive… | manuelle | (logique : test/inventaire.test.js) | client/panels.js, client/index.html, client/hud.js | à valider par l'utilisateur |
| F02-C4 | Quand je clique sur un candidat équipable, le client envoie `equip` pour cet objet ; après la réponse du serveur, l'emplacement montre le… | auto (sim : equip échange les deux objets) + manuelle (rafraîchissement) | test/inventaire.test.js | shared/rules.js, client/panels.js | à valider par l'utilisateur |
| F02-C5 | Un candidat de niveau requis supérieur au mien est grisé, porte « Niveau N requis », et cliquer dessus n'envoie rien. | manuelle | (logique : test/inventaire.test.js) | client/panels.js, client/index.html, client/hud.js | à valider par l'utilisateur |
| F02-C6 | Le volet d'un emplacement occupé propose « Retirer » ; cliquer envoie `unequip`. Sac plein : le message serveur existant « Sac plein. » s… | auto (sim) + manuelle | test/inventaire.test.js | shared/rules.js, client/panels.js | à valider par l'utilisateur |
| F02-C7 | Aucun candidat : le volet affiche « Aucun objet pour cet emplacement dans votre sac. » | manuelle | (logique : test/inventaire.test.js) | client/panels.js, client/index.html, client/hud.js | à valider par l'utilisateur |
| F02-C8 | `Échap`, un second clic sur le même emplacement ou un clic hors du volet ferme le volet sans rien équiper. | manuelle | (logique : test/inventaire.test.js) | client/panels.js, client/index.html, client/hud.js | à valider par l'utilisateur |
| F03-C1 | Étant donné un sac et un équipement, un emplacement est « améliorable » si et seulement si au moins un candidat équipable à mon niveau a … | auto | test/inventaire.test.js | shared/rules.js | vérifiée |
| F03-C2 | Un emplacement améliorable porte le même marqueur ▲ que les objets du sac aujourd'hui. | manuelle | (logique : test/inventaire.test.js) | client/panels.js, client/index.html, client/hud.js | à valider par l'utilisateur |
| F03-C3 | Le bouton/raccourci Personnage de la barre porte un marqueur ▲ tant qu'au moins un emplacement est améliorable ; il disparaît dès qu'aucu… | manuelle | (logique : test/inventaire.test.js) | client/panels.js, client/index.html, client/hud.js | à valider par l'utilisateur |

## Lot 2

| ID | Critère (résumé) | Vérification | Test(s) | Fichier(s) de code | Statut |
|---|---|---|---|---|---|
| F08-C1 | Une arme peut déclarer une portée (`ARME_RG`). Équipée, elle porte la portée de l'attaque de base (compétence 1 de la classe) à `max(port… | auto | test/armes.test.js | shared/rules.js, shared/sim.js, shared/data/items.js | vérifiée |
| F08-C2 | Une attaque de base qui touche une cible située au-delà de la portée de la compétence 1 de la classe (1,6 case pour Chouffin, Speedrunner… | auto | test/armes.test.js | shared/rules.js, shared/sim.js, shared/data/items.js | vérifiée |
| F08-C3 | Avec une arme de portée `ARME_RG`, un Chouffin touche une cible à 4 cases sans se déplacer ; à 6 cases, il reçoit le message existant « H… | auto | test/armes.test.js | shared/rules.js, shared/sim.js, shared/data/items.js | vérifiée |
| F08-C4 | L'auto-attaque continue tant que la cible est à portée de l'arme, sans approcher davantage. | auto | test/armes.test.js | shared/rules.js, shared/sim.js, shared/data/items.js | vérifiée |
| F08-C5 | La fiche de l'objet et la comparaison (F02) affichent « Portée : N cases » pour une arme à distance. | manuelle | (portée affichée vérifiée en jeu) | client/panels.js, client/render.js | à valider par l'utilisateur |
| F08-C6 | À chaque attaque de base à distance, un projectile visuel part du joueur vers la cible ; il est purement visuel, les dégâts sont appliqué… | manuelle | (portée affichée vérifiée en jeu) | client/panels.js, client/render.js | à valider par l'utilisateur |
| F08-C7 | En duel, la portée et `ARME_DIST_MULT` s'appliquent, cumulés avec le ×0,5 PvP existant. | auto | test/armes.test.js | shared/rules.js, shared/sim.js, shared/data/items.js | vérifiée |
| F08-C8 | Au moins 3 armes à distance existent : « Lance-Pierre à Élastique de Bureau » (niveau 3), « Pistolet à Billes de la Fête Foraine » (nivea… | auto (présence, portée, source) + manuelle (ton) | test/armes.test.js | shared/data/items.js, client/sprites.js | à valider par l'utilisateur |

## Lot 3

| ID | Critère (résumé) | Vérification | Test(s) | Fichier(s) de code | Statut |
|---|---|---|---|---|---|
| F04-C1 | La LAN Party accepte `DG_MAX` = 4 joueurs ; un 5e invité qui accepte n'entre pas et reçoit le message existant « Le donjon est complet (4… | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F04-C2 | Les 6 donjons existants, qui ne déclarent pas d'étapes, se comportent exactement comme avant (boss, coffre de boss) : les tests existants… | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F04-C3 | Un donjon peut déclarer une liste d'étapes ; l'instance commence à l'étape 1. En V1 la LAN Party en déclare une seule. | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F04-C4 | Le niveau requis `LAN_RL` est vérifié à l'entrée et à l'invitation, avec les messages actuels des autres donjons. | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F04-C5 | Chaque arrivée renforce les monstres vivants selon la règle existante (`SCALE_PER_PLAYER`). | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F05-C1 | À l'entrée, l'étape 1 contient `E1_MOBS` monstres des types de l'étape, au niveau `LAN_L`, et aucun boss. | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F05-C2 | Les monstres d'une étape ne réapparaissent pas. | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F05-C3 | Quand le dernier monstre de l'étape meurt, chaque joueur présent dans l'instance reçoit une seule fois la bannière « Étape 1 terminée : L… | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F05-C4 | Un compteur « Monstres restants : N / E1_MOBS » est visible par chaque joueur de l'instance et baisse de 1 à chaque mort. | auto (valeur dans le snapshot) + manuelle (affichage) | test/lan.test.js | shared/sim.js, client/sprites.js, client/hud.js | à valider par l'utilisateur |
| F05-C5 | En V1, une fois l'étape 1 terminée, une sortie apparaît et ramène au point de sortie du donjon (même mécanisme que les donjons actuels). | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F06-C1 | L'étape 1 déclare exactement 2 objets d'équipement distincts ; aucun des deux n'apparaît dans un marchand (`SHOP`, `STOCK`), dans un tira… | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F06-C2 | Quand l'étape 1 se termine, chaque joueur présent reçoit l'un des 2 objets, tiré pour lui seul avec une chance de 50 % chacun, à la raret… | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F06-C3 | Le tirage d'un joueur ne dépend pas de celui des autres : deux joueurs peuvent recevoir le même objet. | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F06-C4 | Chaque joueur présent reçoit aussi `E1_GOLD` po et `E1_XP` XP. | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F06-C5 | Le butin est remis via un coffre personnel d'étape qui apparaît à l'endroit du dernier monstre tué ; ouvrir le coffre met l'objet dans le… | auto + manuelle | test/lan.test.js | shared/sim.js, client/sprites.js, client/hud.js | à valider par l'utilisateur |
| F06-C6 | Sac plein à l'ouverture : l'objet n'est pas perdu, le message « Sac plein. Faites de la place puis rouvrez le coffre. » s'affiche, et le … | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F06-C7 | Un joueur arrivé dans l'instance après la fin de l'étape ne reçoit ni objet, ni or, ni XP de cette étape. | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F06-C8 | Les deux objets sont échangeables (`/echanger`), vendables et fusionnables comme les autres équipements. | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F06-C9 | Chaque objet a un nom, une description dans le ton du jeu et une icône, visibles dans la fiche d'objet. | manuelle | — | client/sprites.js, client/hud.js, client/panels.js | à valider par l'utilisateur |
| F07-C1 | Un PNJ d'entrée « L'Orga de la LAN », au Bourg-Forum (emplacement exact au choix du développeur), apparaît sur la minimap avec la couleur… | auto (présence, `npc.dungeon`) + manuelle | test/lan.test.js | shared/sim.js, client/sprites.js, client/hud.js | à valider par l'utilisateur |
| F07-C2 | L'étape 1 utilise 3 nouveaux types de monstres (Câble Emmêlé, Multiprise Surchargée, Pote Sans Sa Tour), déclarés dans `data/mobs.js` et … | auto (déclarés) + manuelle (rendu) | test/lan.test.js | shared/sim.js, client/sprites.js, client/hud.js | à valider par l'utilisateur |
| F07-C3 | Les 2 objets d'étape 1 sont la « Multiprise Parafoudre » (arme) et le « Tapis de Souris XXL » (torse, porté en cape). | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |
| F07-C4 | Le donjon a tous les textes des autres donjons (desc, astuce, arrivée, sortie, retour, coffre), en français, dans le ton du jeu. | auto (champs non vides) + manuelle (ton) | test/lan.test.js | shared/sim.js, client/sprites.js, client/hud.js | à valider par l'utilisateur |
| F07-C5 | La musique et les effets sonores sont ceux des donjons actuels. | manuelle | — | client/sprites.js, client/hud.js, client/panels.js | à valider par l'utilisateur |
| F07-C6 | `npm run balance` permet à un joueur moyen de niveau `LAN_RL` seul de finir l'étape 1 sans mourir dans plus de 50 % des simulations (*Hyp… | auto | test/lan.test.js | shared/sim.js, shared/map.js, shared/data/*.js | vérifiée |

## Lot 4

| ID | Critère (résumé) | Vérification | Test(s) | Fichier(s) de code | Statut |
|---|---|---|---|---|---|
| F09-C1 | Une action de touche « Carte » existe dans la liste des touches configurables ; sa touche par défaut est le code physique `KeyM` (la virg… | auto | test/activites.test.js | shared/rules.js, shared/sim.js, client/keys.js | vérifiée |
| F09-C2 | La Monture a pour touche par défaut `KeyN` (au lieu de `KeyM`). Aucune autre touche par défaut ne change, et deux actions n'ont jamais la… | auto | test/activites.test.js | shared/rules.js, shared/sim.js, client/keys.js | vérifiée |
| F09-C3 | Appuyer sur la touche Carte ouvre la carte agrandie (la même que le clic sur la minimap) et ferme les autres fenêtres ; appuyer de nouvea… | manuelle | — | client/hud.js, client/input.js, client/panels.js | à valider par l'utilisateur |
| F09-C4 | Sur la carte agrandie du monde, chaque donjon de `DUNGEONS` (les 6 existants et la LAN Party) a un logo à la position de son PNJ d'entrée… | auto (liste des logos = liste des donjons, positions) + manuelle (rendu) | test/activites.test.js | shared/rules.js, shared/sim.js, client/hud.js, client/panels.js | à valider par l'utilisateur |
| F09-C5 | Survoler un logo affiche le nom du donjon et son niveau requis minimal ; le pointeur indique qu'il est cliquable. | manuelle | — | client/hud.js, client/input.js, client/panels.js | à valider par l'utilisateur |
| F09-C6 | Joueur dont les touches sont déjà enregistrées (`chouffinia-touches`) avec la Monture sur `KeyM` : sa configuration est conservée telle q… | auto | test/activites.test.js | shared/rules.js, shared/sim.js, client/keys.js | vérifiée |
| F10-C1 | Cliquer sur un logo ouvre une fiche, la carte restant visible derrière, avec : nom du donjon, sa description (`desc`), son astuce (`astuc… | auto (contenu calculé depuis les données) + manuelle (mise en page) | test/activites.test.js | shared/rules.js, shared/sim.js, client/hud.js, client/panels.js | à valider par l'utilisateur |
| F10-C2 | La fiche liste les difficultés du donjon avec leur nom et leur niveau requis ; celles au-dessus de mon niveau sont grisées avec « Niveau … | auto (liste et présélection) + manuelle | test/activites.test.js | shared/rules.js, shared/sim.js, client/hud.js, client/panels.js | à valider par l'utilisateur |
| F10-C3 | Toutes les informations de la fiche viennent de `shared/data*` : ajouter un donjon dans les données le fait apparaître sur la carte avec … | auto | test/activites.test.js | shared/rules.js, shared/sim.js, client/keys.js | vérifiée |
| F10-C4 | `Échap` ou un clic hors de la fiche la ferme et laisse la carte ouverte. | manuelle | — | client/hud.js, client/input.js, client/panels.js | à valider par l'utilisateur |
| F11-C1 | La fiche a un bouton « Lancer l'activité ». Le cliquer envoie une intention au serveur (donjon + difficulté) ; le serveur fait entrer le … | auto | test/activites.test.js | shared/rules.js, shared/sim.js, client/keys.js | vérifiée |
| F11-C2 | Le lancement est gratuit et possible depuis n'importe quel point de la carte du monde. | auto | test/activites.test.js | shared/rules.js, shared/sim.js, client/keys.js | vérifiée |
| F11-C3 | Le serveur refuse le lancement, avec un message d'erreur, si le joueur est : mort ; en combat (a frappé ou été frappé depuis moins de `CO… | auto (refus serveur) + manuelle (bouton) | test/activites.test.js | shared/rules.js, shared/sim.js, client/hud.js, client/panels.js | à valider par l'utilisateur |
| F11-C4 | Messages de refus exacts : « Impossible en combat. Finissez d'abord votre bagarre. » ; « Vous êtes déjà en donjon. » ; « Niveau N requis.… | auto | test/activites.test.js | shared/rules.js, shared/sim.js, client/keys.js | vérifiée |
| F11-C5 | Après un lancement réussi, la carte et la fiche se ferment, et le joueur reçoit le même message d'arrivée que par le PNJ. Il entre seul ;… | auto + manuelle | test/activites.test.js | shared/rules.js, shared/sim.js, client/hud.js, client/panels.js | à valider par l'utilisateur |
| F11-C6 | En quittant le donjon, le joueur ressort au point `exit` du donjon (comme aujourd'hui), pas à l'endroit d'où il a lancé l'activité. | auto | test/activites.test.js | shared/rules.js, shared/sim.js, client/keys.js | vérifiée |
