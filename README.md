# Chouffinia Online

MMORPG parodique en pixel art où l'on joue un chouffin. Se joue à plusieurs sur un réseau local, dans un navigateur.

## Lancer le serveur

Prérequis : [Node.js](https://nodejs.org) **20 ou plus**.

```bash
npm install
npm start
```

Le serveur affiche les adresses à utiliser, par exemple :

```
Chouffinia Online est lancé.
  Sur cette machine : http://localhost:3000
  Sur le réseau local (à donner à tes potes) :
    http://192.168.1.42:3000
```

Un autre port : `PORT=4000 npm start` (Windows PowerShell : `$env:PORT=4000; npm start`).

## Pare-feu Windows

Au premier lancement, Windows demande d'autoriser Node.js : coche **Réseaux privés** et valide. Si la fenêtre a disparu ou si les autres PC n'arrivent pas à se connecter : Pare-feu Windows Defender → « Autoriser une application » → Node.js, réseaux privés. À défaut, créer une règle entrante TCP pour le port 3000.

## Pare-feu Linux
Lancer la commande `sudo ufw allow 3000` avec le port de l'application (ici 3000)

## Rejoindre une partie

1. Être sur le même réseau (même box, même Wi-Fi).
2. Ouvrir l'adresse `http://192.168.x.x:3000` affichée par le serveur dans un navigateur.
3. Choisir un pseudo et entrer dans le monde.

Le pseudo est unique : s'il est déjà connecté, le serveur refuse avec un message. Le personnage est sauvegardé dans `saves/<pseudo>.json` ; se reconnecter avec le même pseudo le retrouve. Il n'y a pas de mot de passe : on joue entre potes.

Dans le jeu, `/aide` liste les commandes (`/qui`, `/mp`, `/inviter`, `/accepter`, `/quitter`…).

## Jouer hors du réseau local

Le plus simple est [Tailscale](https://tailscale.com) : installer Tailscale sur la machine du serveur et sur celle de chaque ami (même compte ou machines partagées), puis ouvrir `http://<adresse Tailscale du serveur>:3000` (adresse en `100.x.y.z`, visible dans l'appli Tailscale). Aucune redirection de port sur la box.

## Développer

- `npm test` : tests de la simulation, du protocole et du serveur.
- Deux onglets sur `http://localhost:3000` avec deux pseudos différents pour tester le multijoueur.
