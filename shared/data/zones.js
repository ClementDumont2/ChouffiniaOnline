// Les trois zones du Lot 8, à l'est du Marais du Lag (x ≥ 80) : Parking → Supermarché → Pôle Emploi, reliés par la route de la porte sud.
// Les monstres sont dans mobs.js, les quêtes dans quests.js, les donjons dans dungeons.js.
export const NEW_ZONES={
  parking:{n:"Le Parking du Lycée",s:"Niveaux 15–25 · Les places réservées le sont toujours pour quelqu'un d'autre"},
  supermarche:{n:"Le Supermarché à 21 h 58",s:"Niveaux 25–40 · Fermeture dans deux minutes. Depuis 2011."},
  pole:{n:"Le Pôle Emploi Mystique",s:"Niveaux 40–55 · Votre conseiller est absent. Votre avenir aussi."},
  convention:{n:"La Convention Manga/Anime",s:"Niveaux 55–75 · Tout est en édition limitée. Le stock est illimité."},
  diiage:{n:"Le DIIAGE",s:"Niveaux 75–100 · Rendu à minuit. Il est minuit. Il est toujours minuit."},
  preau:{n:"Le Préau du Lycée",s:"Sanctuaire · On y attend la sonnerie depuis 2012"},
  accueil:{n:"L'Accueil du Supermarché",s:"Sanctuaire · Les monstres n'ont pas la carte de fidélité"},
  attente:{n:"La Salle d'Attente",s:"Sanctuaire · Même les monstres doivent prendre un ticket"},
  vestiaire:{n:"Le Vestiaire Cosplay",s:"Sanctuaire · Interdit aux photographes et aux monstres"},
  cafet:{n:"La Cafét' du DIIAGE",s:"Sanctuaire · Café gratuit, bugs interdits d'entrée"}
};
// Sanctuaires : aucun monstre n'y entre, et /tp relie ceux que le joueur a découverts. x, y : point d'arrivée de /tp.
// r : [x0, y0, x1, y1] en tuiles incluses, lu par zoneAt ; base et bourg gardent leur découpage d'origine (map.js). L'Arène est un sanctuaire sans téléportation.
export const SAFE={
  base:{x:7.5,y:8.5},bourg:{x:21.5,y:20.4},
  preau:{x:85.5,y:11.6,r:[80,8,91,12]},
  // Arrivée sur la rangée 23 : les caddies (aléatoires) n'apparaissent qu'à partir de la rangée 24.
  accueil:{x:99.5,y:23.6,r:[93,23,106,25]},
  attente:{x:99.5,y:45.5,r:[92,43,107,46]},
  vestiaire:{x:124.5,y:50.5,r:[123,47,132,52]},
  cafet:{x:139.5,y:31.5,r:[133,29,146,33]},
};
// [type, nombre, x0, x1, y0, y1] : mêmes rectangles que SPAWNS, à l'intérieur de chaque zone.
export const NEW_SPAWNS=[
  ['delegue',8,84,116,2,17],['scooter',7,84,116,2,17],['souvenir',6,84,116,2,17],
  ['caddie',8,84,115,24,35],['vigile',6,84,115,24,35],['promo',7,84,115,24,35],
  ['cerfa',8,84,115,44,55],['file',6,84,115,44,55],['conseillerabs',7,84,115,44,55],
  ['otaku',8,124,155,44,55],['cosplayeur',7,124,155,44,55],['isekai',6,124,155,44,55],
  ['bug',8,125,154,7,31],['standup',6,125,154,7,31],['retard',7,125,154,7,31],
  // Un boss de zone par zone (mobs.js), dans un coin de la zone, loin des sanctuaires.
  ['gazon',1,16,23,2,10],['chad',1,17,28,27,35],['zenith',1,40,47,2,14],['modo_supreme',1,36,48,20,34],['lag_ancestral',1,68,77,22,30],['khey_originel',1,20,45,44,56],['serveur_prod',1,60,75,44,56],
  ['proviseur',1,105,116,5,12],['vigile_chef',1,105,115,32,35],['directeur',1,84,96,50,55],['cosplay_ultime',1,140,155,47,52],['heisenbug',1,126,153,8,20],
];
const npc=(id,n,tag,ti,x,y,greet,extra={})=>({id,kind:'npc',n,tag,ti,x,y,hgt:1.2,greet,lines:[],...extra});
export const NEW_NPCS=[
  npc('panneau_parking',"Panneau du Parking",'Bienvenue','Parking du Lycée · Niveaux 15–25',82.6,10.2,"PARKING DU LYCÉE. Stationnement interdit aux élèves, aux profs, et à tous ceux qui ont un avis sur le stationnement. Danger : ex-délégués de classe, scooters débridés, souvenirs gênants.",{look:'sign'}),
  npc('cpe',"Le CPE Éternel","Vie scolaire",'Vie scolaire · Il est là depuis la 6e',87.5,10.2,"Ah, un élève. Tu n'es pas inscrit ? Tu es inscrit depuis 2008, ça se voit à ton carnet. Je suis le CPE. Je l'ai toujours été. Je serai CPE quand le lycée sera une ruine, et il l'est déjà."),
  npc('porte_bac',"Le Surveillant du Bac","Donjon : Le Bac de 2012",'Surveillant · Vous conduit à la salle d\'examen du Bac de 2012',90.5,10.4,"Vous êtes en retard. Tout le monde est en retard : l'épreuve a commencé en 2012. Suivez-moi, la salle d'examen est au bout du couloir. Calculatrice interdite. Ou autorisée. Personne n'a jamais su.",{dungeon:'bac'}),
  npc('panneau_supermarche',"Panneau du Supermarché","Horaires",'Supermarché · Niveaux 25–40',97.5,24.6,"SUPERMARCHÉ. Ouvert de 8 h à 21 h 58. Fermeture à 22 h 00 précises, sauf si vous avez un caddie dans les mains, auquel cas jamais. Pas d'animaux, pas de panique.",{look:'sign'}),
  npc('caissiere',"La Caissière de la Caisse 12","Caisse 12",'Caisse 12 · La seule ouverte',92.5,35.4,"Caisse 12. C'est la seule d'ouverte. Il y a vingt-trois caisses. Je ne sais pas non plus. Vous avez la carte ? Vous voulez un sac ? Vous voulez que je vous parle de ma vie ? Non ? Très bien."),
  npc('porte_reserve',"Porte « Réservé au Personnel »","Donjon : La Réserve",'Donjon · La Réserve · 4 difficultés',114.6,29.4,"« RÉSERVÉ AU PERSONNEL ». Elle est entrouverte. Derrière, des palettes, des cartons, et un gérant qui regarde l'horloge. Il est 21 h 58. Il sera toujours 21 h 58.",{look:'door',dungeon:'reserve'}),
  npc('panneau_pole',"Panneau du Pôle Emploi","Accueil",'Pôle Emploi Mystique · Niveaux 40–55',97.5,44.8,"VEUILLEZ PRENDRE UN TICKET. Votre numéro : 4 812. Numéro en cours : 3. Temps d'attente estimé : le destin. Les formulaires Cerfa sont vivants : ne leur tournez pas le dos.",{look:'sign'}),
  npc('mystique',"Le Conseiller Mystique","Avenir professionnel",'Voyant · Prédit votre avenir professionnel',99.2,52.2,"Je vois... je vois... un bureau. Des écrans. Un ticket. Oui, c'est bien ça : votre avenir professionnel est une file d'attente. Je ne me trompe jamais. Je ne me suis jamais trompé. Je n'ai jamais rien prédit qui se soit réalisé, mais je ne me trompe jamais."),
  npc('porte_labyrinthe',"Guichet d'Accueil","Donjon : Le Labyrinthe Administratif",'Donjon · Le Labyrinthe Administratif · 4 difficultés',112.6,51.4,"Guichet d'Accueil. Derrière : un labyrinthe de couloirs, de cases à cocher et de pièces justificatives. On y entre facilement. On en ressort avec un formulaire, un jour.",{look:'door',dungeon:'labyrinthe'}),
  // ---- Lot 9 ----
  npc('panneau_convention',"Panneau de la Convention","Programme",'Convention Manga/Anime · Niveaux 55–75',125.6,48.6,"CONVENTION MANGA/ANIME. Dédicaces, ventes exclusives, cosplays « possédés ». Un conseil : ne dites jamais « c'est juste un dessin ». Danger : otaku collectionneurs, cosplayeurs possédés, fans d'isekai.",{look:'sign'}),
  npc('otaku',"L'Otaku Ancestral","Boutique & quêtes",'Figurines-artéfacts · Il a tout vu, tout lu, tout acheté',131.5,50.4,"Approche, jeune chouffin. Je suis là depuis la première convention, avant même que le mot existe. J'ai vu naître des franchises, mourir des licences, et revivre des reboots. Je vends des figurines. Elles ne sont pas à vendre. Elles le sont toutes."),
  npc('porte_dedicaces',"Salle des Dédicaces","Donjon : La Salle des Dédicaces",'Donjon · La Salle des Dédicaces · 4 difficultés',152.5,50.4,"La Salle des Dédicaces. Une file de six heures, une table, un Mangaka qui signe depuis hier. Il vous regardera, il sourira, et il vous dessinera en super-déformé. Ce sera la dernière chose que vous verrez.",{look:'door',dungeon:'dedicaces'}),
  npc('panneau_diiage',"Panneau du DIIAGE","Accueil",'DIIAGE · Niveaux 75–100',137.5,32.4,"DIIAGE. Rendu à minuit. Pas de rendu après minuit. Il est minuit. Danger : bugs en prod, dailies de 45 minutes, étudiants en retard de rendu. Le café est gratuit, les nuits blanches aussi.",{look:'sign'}),
  npc('responsable',"Le Responsable Pédagogique","Cursus & quêtes",'Responsable · Ses mails commencent par « Je me permets de relancer »',142.5,30.4,"Bonjour. Je me permets de relancer. Vous avez reçu mon mail ? Non, celui d'avant. Je suis le Responsable Pédagogique : mon rôle est de vous accompagner jusqu'au diplôme. Mon vrai rôle est de vous relancer."),
  npc('porte_soutenance',"Salle de Soutenance","Donjon : La Soutenance",'Donjon · La Soutenance · 4 difficultés',139.5,7.6,"La Salle de Soutenance. Trois membres du jury, un projecteur qui ne s'allume pas, et vingt minutes de présentation qui en dureront quarante. Respirez. Ne respirez pas trop fort. Ils entendent tout.",{look:'door',dungeon:'soutenance'}),
  // ---- Lot 10 : marchands des sanctuaires (stock dans items.js, au niveau de leur zone) ----
  npc('cantine',"La Dame de la Cantine","Cantine",'Marchande · Équipement du Parking (niveaux 15–25)',84.5,8.8,"C'est frites le vendredi. On est mardi. Tu veux un gilet ? J'ai des gilets. Personne ne sait pourquoi la cantine vend des gilets, mais ils partent mieux que le hachis."),
  npc('chef_rayon',"Le Chef de Rayon","Rayon Bonnes Affaires",'Marchand · Équipement du Supermarché (niveaux 25–40)',103.5,23.6,"Tout est en promo. Rien n'est moins cher. C'est ça, le génie du commerce. Je vous fais un prix, et ce prix, c'est celui de l'étiquette."),
  npc('sauvette',"Le Vendeur à la Sauvette","Ventes non déclarées",'Marchand · Équipement du Pôle Emploi (niveaux 40–55)',104.5,44.6,"Psst. Vous attendez depuis combien de temps ? Trois ans ? J'ai ce qu'il vous faut. Pas un emploi, non. Un tampon. C'est presque pareil."),
  npc('goodies',"La Vendeuse de Goodies","Stand de goodies",'Marchande · Équipement de la Convention (niveaux 55–75)',127.5,51.8,"Tout est officiel. Sauf ce qui ne l'est pas. Les perruques sont certifiées résistantes au feu, aux larmes et aux critiques de fans."),
  npc('bde',"Le Président du BDE","Bureau des Étudiants",'Marchand · Équipement du DIIAGE (niveaux 75–100)',135.5,30.4,"Salut ! Le BDE vend des sweats, des badges et des jeans de rendu. Les bénéfices financent la soirée d'intégration de 2019, qui n'a toujours pas eu lieu."),
];
