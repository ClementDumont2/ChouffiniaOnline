---
name: verifier-en-jeu
description: Lancer Chouffinia Online dans le navigateur intégré et vérifier un changement en jeu (interface, carte, PNJ, son, multijoueur), puis nettoyer. À utiliser après toute modification visible côté client.
---

# Vérifier en jeu

1. Lancer le serveur avec l'outil d'aperçu : configuration `chouffinia` de `.claude/launch.json` (`npm start`, port 3000). Ne pas lancer `npm start` dans un shell.
2. Écran de création : remplir le champ « Nom du personnage » avec un pseudo de test (ex. `TestCarte`), puis « Entrer dans le monde » (ou « Continuer : <pseudo> » si le navigateur s'en souvient).
3. On apparaît dans le Sous-Sol de Maman (7.5, 8.5). Le Tableau d'Honneur est juste à droite, le Bourg-Forum au sud-est.
4. Interagir :
   - parler à un PNJ : cliquer dessus ; s'il est à plus de 1,7 case, le joueur s'approche, recliquer une fois arrivé ;
   - chat / commandes : cliquer le champ en bas à gauche (`#chatin`), taper, Entrée ;
   - carte agrandie : clic sur `#mini` ;
   - le module d'un fichier client est accessible depuis la page avec `await import('/client/xxx.js')` (même instance que le jeu), utile pour sonder `sound.js` ou `keys.js`.
5. Multijoueur : deux onglets, deux pseudos ; ou s'appuyer sur `test/server.test.js`, qui pilote de vrais clients WebSocket.
6. Son : on ne peut pas l'écouter. Pour vérifier que l'audio tourne, compter les appels à `BaseAudioContext.prototype.createOscillator` après un clic dans la page (le navigateur exige un geste avant de jouer).

## Nettoyer

- Arrêter le serveur d'aperçu (`preview_stop`) et fermer l'onglet (sinon il tente de se reconnecter en boucle).
- Supprimer la sauvegarde de test créée : `saves/<pseudo en minuscules>.json`. Ne jamais toucher aux autres fichiers de `saves/`.
- Les erreurs « WebSocket connection failed » dans la console après un redémarrage du serveur sont normales (reconnexion).
