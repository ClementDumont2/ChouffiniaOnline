# Découpage en lots — Inventaire, armes à distance, LAN Party & carte des activités

> Statut : **V1.3, validé**. Référence : `CAHIER_DES_CHARGES.md`.

| Lot | Contenu | Features | Statut |
|---|---|---|---|
| 1 | Inventaire façon Destiny | F01, F02, F03 | Développé, à tester par l'utilisateur |
| 2 | Armes à distance | F08 | Développé, à tester par l'utilisateur |
| 3 | LAN Party — étape 1 | F04, F05, F06, F07 | Développé, à tester par l'utilisateur |
| 4 | Carte des activités | F09, F10, F11 | Développé, à tester par l'utilisateur |
| 5 | LAN Party — étapes 2 et 3 | à rédiger | Hors périmètre |

## Lot 1 — Inventaire façon Destiny

- **Features :** F01 (écran à emplacements), F02 (choix par emplacement), F03 (marqueurs d'amélioration).
- **Pourquoi d'abord :** indépendant du reste, et c'est lui qui rend le butin des lots 2 et 3 agréable à utiliser.
- **Valeur seule :** livrable et jouable tel quel avec le butin actuel des 6 donjons.
- **Risques :** place à l'écran à 1280×720 (F01-C6) ; volet qui travaille sur un index de sac périmé (F02, cas limites).
- **Definition of Ready :** remplie (Q6, Q10 validées).

## Lot 2 — Armes à distance

- **Features :** F08.
- **Dépend de :** rien techniquement ; vient après le lot 1 pour que la portée s'affiche dans la comparaison (F08-C5).
- **Valeur seule :** un nouveau style de jeu pour toutes les classes, avec 3 armes à obtenir.
- **Risques :** l'auto-attaque et l'approche automatique (`approach`) supposent la portée de la compétence ; équilibrage du malus en duel ; ne pas casser le Rôliste (portée 5 déjà).
- **Definition of Ready :** remplie (Q11–Q13 validées) ; sources d'obtention des 3 armes choisies pendant le lot.

## Lot 3 — LAN Party, étape 1

- **Features :** F04 (étapes, 4 joueurs max), F05 (fin d'étape au nettoyage), F06 (butin exclusif), F07 (contenu).
- **Dépend de :** rien techniquement ; vient après les lots 1 et 2 pour profiter de l'inventaire.
- **Valeur seule :** un donjon court et rejouable jusqu'à 4, avec 2 objets à collectionner.
- **Risques :** le moteur actuel suppose un boss et un coffre de boss (F05/F06 doivent marcher sans boss) ; équilibrage (Q4) ; garder le format d'étapes assez générique pour le lot 5 sans le coder maintenant.
- **Definition of Ready :** remplie (Q14 : non) ; le reste est validé (Q1–Q3, Q5, Q7–Q9) ; les textes de jeu sont rédigés pendant le lot et relus par l'utilisateur.

## Lot 4 — Carte des activités

- **Features :** F09 (touche Carte + logos), F10 (fiche d'activité), F11 (lancer l'activité).
- **Dépend de :** lot 3 pour le logo et la fiche de la LAN Party (les 6 autres donjons fonctionnent sans).
- **Valeur seule :** accès direct à tous les donjons depuis la carte, à la Destiny.
- **Risques :** changement de la touche Monture pour les joueurs existants (F09-C6) ; la téléportation contourne la marche jusqu'au PNJ, donc les conditions de refus (F11-C3) doivent être côté serveur.
- **Definition of Ready :** remplie (Q15–Q19 validées).

## Lot 5 — LAN Party, étapes 2 et 3 (à rédiger)

Passage entre étapes, contenu et butin des étapes 2 et 3, éventuellement boss final, 4 difficultés, quête et haut fait. À rédiger après la validation du lot 3.
