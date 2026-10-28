# PROGRESS — mémoire de session

Réservé à l'orchestrateur.

## État courant
- Lot 1 (F01–F03) : terminé, 157 tests verts relancés par l'orchestrateur, Haiku OK, vérifié en jeu (volet, équipement, ▲, Échap, 1280×720). Manuelles à valider par l'utilisateur.
- Lot 2 (F08) : terminé, 175 tests verts relancés, Haiku OK, vérifié en jeu (tir à 4,3 cases sans déplacement, « Portée : 5 cases » affichée). Projectile non observable dans le navigateur intégré (animation en pause quand le panneau est masqué) : à valider par l'utilisateur.
- Lot 3 (F04–F07) : terminé, 205 tests verts relancés, Haiku OK (réserves levées : input.js/render.js viennent du lot 2 ; F07-C5 musique = manuelle). Vérification en jeu reportée après le lot 4 (on réapparaît toujours au Sous-Sol : « Lancer l'activité » servira à entrer dans la LAN Party).
- Lot 4 (F09–F11) : terminé, 229 tests verts relancés, Haiku OK (render.js vient du lot 2). Vérifié en jeu avec un personnage niveau 20 : touche M (virgule AZERTY) → carte, logos des donjons, clic logo LAN → fiche complète, « Lancer l'activité » → téléporté dans la LAN Party, compteur 12/12 ; mort → compteur conservé (10/12) ; sortie → point exit (18.5, 18.9).
- **Phase 7 : compte rendu fait, en attente des tests de l'utilisateur.** Rien n'est commité.
- Non vérifié en jeu : fin d'étape, coffre et butin (couverts par test/lan.test.js), projectile.
- Base : `npm test` vert avant le lot 1 (146 tests, 0 échec), le 2026-10-09. Après le lot 4 : 229.
- Base : `npm test` vert avant le lot 1 (146 tests, 0 échec), le 2026-10-09.

## Décisions
- Pas d'agents nommés dans `.claude/agents/` : agents génériques avec modèle forcé (Sonnet pour développer, Haiku pour la passe mécanique).
- Un Sonnet par lot écrit d'abord les tests depuis les critères, puis le code (demande de l'utilisateur : un Sonnet par lot), au lieu d'un testeur séparé.
- Pas de skill de stack créé : `CLAUDE.md` + skills projet `ajouter-contenu` et `verifier-en-jeu` en tiennent lieu.
- **Aucun commit** : l'utilisateur teste lui-même. Il est absent (repas) et a demandé d'enchaîner en improvisant : **pas de pause après le lot 1**, les lots 1→4 s'enchaînent ; les exigences `manuelle` restent `à valider par l'utilisateur`.
- Contrat lot 1 : `slotCandidates(S, slot)` et `upgradableSlots(S)` dans `shared/rules.js` (voir brief).

## Improvisations à revoir avec l'utilisateur
Décisions prises sans lui pendant le développement (à valider ou corriger) :
- (lot 1) Le Haiku fait la passe mécanique + relecture factuelle ; le jugement final reste à l'orchestrateur.
- (lot 1) Disposition : Tête, Torse, Mains à gauche du chouffin ; Jambes, Arme à droite ; stats sous le personnage dans le même panneau (défilement vertical pour les stats « fun »). Le panneau s'élargit à 720 px quand le volet est ouvert.
- (lot 1) Défaut connu, non corrigé : l'infobulle de survol d'un emplacement s'affiche par-dessus le volet qui vient de s'ouvrir (elle disparaît quand la souris quitte l'emplacement). À trancher : masquer l'infobulle quand le volet est ouvert ?
- (lot 2) Armes à distance (portée 5) : Lance-Pierre à Élastique de Bureau (rl 3, inhabituel, +5 Att, 55 po chez Bernard) ; Pistolet à Billes de la Fête Foraine (rl 15, rare, +28 Att +15 PV, chez la Dame de la Cantine, Parking) ; Nerf Modifié en Garage (rl 40, rare, +68 Att +50 PV, chez le Vendeur à la Sauvette, Pôle Emploi). Stats ≈ 15–20 % sous les armes de mêlée voisines.
- (lot 2) Projectile : bille jaune pâle avec traînée, 0,22 s, visible par tous les joueurs de la carte, seulement quand le tir dépasse la portée de la classe (pas au contact ; jamais pour le Rôliste sous 5 cases).
- (lot 2) Le personnage qui approche une cible s'arrête à portée − 0,4 case avec une arme à distance.
- (lot 2) Défaut connu, non corrigé : la comparaison « mêlée vs distance » ne parle pas de la portée perdue (remplacer le Lance-Pierre par la Règle affiche juste « −2 Att, Moins bien »), et le verdict ignore la portée. L'infobulle de la compétence 1 dans la barre affiche toujours la portée de la classe.
- (lot 3) PNJ « L'Orga de la LAN » au Bourg-Forum (17.5, 17.8), look porte ; sortie en (18.5, 18.9).
- (lot 3) Monstres niveau 20 : Câble Emmêlé (PV ×1,2, Att ×0,7, lent), Multiprise Surchargée (PV ×0,8, Att ×1,3), Pote Sans Sa Tour (×1). Butin courant : chips, poignée de main, chouffe.
- (lot 3) Objets d'étape 1 (épiques, niv. 20) : Multiprise Parafoudre (arme mêlée, +52 Att +30 PV) ; Tapis de Souris XXL (torse, cape bleu nuit à liseré rouge, +4 Att +40 Prot +90 PV). Revente 1 100 po.
- (lot 3) L'or (400) et l'XP (1 500) de fin d'étape sont donnés immédiatement ; seul l'objet est dans le coffre. Le menu d'entrée affiche « Donjon instancié · Étape 1 sur 3 », une difficulté « Installation » et le butin à la place des artéfacts. En quittant avec un coffre non ouvert, un avertissement s'affiche.
- (lot 3) Textes : desc « Une salle des fêtes, trois étages de multiprises et quelqu'un qui a dit "j'apporte juste mon écran"… » ; arrivée « Ça sent la poussière chaude, le Red Bull tiède et la multiprise de trop. » ; retour « …Quelqu'un a laissé son écran sur votre canapé. » ; astuce qui dit que « les câbles se défont en tapant dessus » (blague, aucune mécanique derrière : à garder ou reformuler ?).
- (lot 3) Limite connue : le test d'équilibrage (30/30 réussites) téléporte le joueur au contact des monstres, il est donc optimiste. Le compteur du HUD est recalculé côté client à partir des monstres visibles (priv.etape est dans le snapshot mais net.js, hors périmètre, ne le recopie pas).
- (lot 3) **Risque d'équilibrage observé en jeu** : un Chouffin niveau 20 (Sabre et Armure EVA épiques niv. 20 : 380 PV, 59 Att, −36 % dégâts) qui n'utilise que l'attaque de base meurt après 2 monstres sur 12 : les monstres ont 296–444 PV (6 à 8 coups chacun) et tapent ~25 par coup, en groupe. À rejouer par un humain avec ses compétences avant de baisser les stats (Q4).
- (lot 4) Logo : disque rose (#ff4fd8) cerclé de noir avec une porte voûtée et une fente dorée ; zone de clic 2,6 cases. Fiche : panneau à droite (360 px max), boutons de difficulté au style existant, bouton « Lancer l'activité » pleine largeur.
- (lot 4) Le client grise le bouton pour : mort, échange, déjà en donjon, niveau trop bas. En combat ou en duel, le client ne le sait pas (absent du protocole) : le bouton reste actif et le serveur refuse avec son message.
- (lot 4) Un joueur mort peut maintenant envoyer `launch` (pour recevoir « Impossible maintenant. ») : une ligne ajoutée à l'exception des morts dans handleAction.
- (lot 4) Config de touches enregistrée avec un doublon : toutes les touches reviennent aux défauts. Échap ferme d'abord la fiche, puis la carte. Clic sur la minimap avec la fiche ouverte : ferme la fiche seulement.
- (lot 4) Les Archives affichent le Grimoire comme butin notable (c'est leur objet légendaire de coffre).
- (lot 2) Limite connue : le d20 du Rôliste ne subit pas le malus de distance (sans effet tant qu'aucune arme ne dépasse 5 cases).

## Blocages
- Aucun.

## Évolutions de périmètre
- Aucune depuis la validation du CDC V1.3.
