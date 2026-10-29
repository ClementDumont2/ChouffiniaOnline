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
  cafet:{n:"La Cafét' du DIIAGE",s:"Sanctuaire · Café gratuit, bugs interdits d'entrée"},
  // Saison 3 : l'après-diplôme (niveau 100, monstres 100–112 : on y vient pour l'or et le butin, l'XP est plafonnée).
  startup:{n:"L'Open Space de la Startup",s:"Niveau 100+ · On est une famille. Une famille qui ne paie pas les heures sup."},
  coloc:{n:"La Coloc de 9 m²",s:"Niveau 100+ · 1 400 € charges non comprises. Les toilettes sont dans la cuisine."},
  discord:{n:"Le Discord à 4 h du Matin",s:"Niveau 100+ · Quelqu'un a mis @everyone. Personne ne dort."},
  casino:{n:"Le Casino du 18-25",s:"Sanctuaire · La maison gagne toujours. La maison, c'est Maman."},
  machine_cafe:{n:"La Machine à Café",s:"Sanctuaire · Le seul endroit où le management ne vient jamais"},
  palier:{n:"Le Palier de la Coloc",s:"Sanctuaire · Zone neutre : personne n'y fait la vaisselle"},
  salon_afk:{n:"Le Salon AFK",s:"Sanctuaire · Micro coupé, caméra coupée, monstres coupés"}
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
  casino:{x:39.5,y:25.8,r:[34,25,45,32]},
  machine_cafe:{x:179.5,y:14.5,r:[175,12,184,15]},
  palier:{x:179.5,y:25.5,r:[175,24,185,27]},
  salon_afk:{x:179.5,y:44.5,r:[175,43,184,46]},
};
// Une zone = une carte : [x0, y0, x1, y1] en tuiles incluses. Chaque région de la carte du monde a ses propres entités (monstres, PNJ, joueurs visibles) ;
// passer la frontière fait changer de carte. Les zones d'origine en plein champ (plaine, steppe, lac, forêt, Bourg, Sous-Sol, Arène, Cuisine) n'ont pas de haie entre elles :
// les découper ferait changer de carte au milieu d'un pré, elles forment donc une seule carte, « pres ». Toute la carte est couverte (regionAt, map.js).
export const REGIONS={
  pres:[0,0,50,37],sel:[0,38,50,59],marais:[51,0,79,32],datacenter:[51,33,79,59],
  parking:[80,0,119,19],supermarche:[80,20,119,39],pole:[80,40,119,59],
  diiage:[120,0,159,39],convention:[120,40,159,59],
  startup:[160,0,199,19],coloc:[160,20,199,39],discord:[160,40,199,59],
};
// [type, nombre, x0, x1, y0, y1] : mêmes rectangles que SPAWNS, à l'intérieur de chaque zone.
export const NEW_SPAWNS=[
  ['delegue',8,84,116,2,17],['scooter',7,84,116,2,17],['souvenir',6,84,116,2,17],
  ['caddie',8,84,115,24,35],['vigile',6,84,115,24,35],['promo',7,84,115,24,35],
  ['cerfa',8,84,115,44,55],['file',6,84,115,44,55],['conseillerabs',7,84,115,44,55],
  ['otaku',8,124,155,44,55],['cosplayeur',7,124,155,44,55],['isekai',6,124,155,44,55],
  ['bug',8,125,154,7,31],['standup',6,125,154,7,31],['retard',7,125,154,7,31],
  ['stagiaire',8,165,195,3,11],['manager',6,165,195,3,11],['babyfoot',5,165,195,3,11],
  ['vaisselle',7,165,195,28,36],['coloc_fantome',6,165,195,28,36],['proprio',5,165,195,28,36],
  ['notif',8,164,195,47,56],['admin_discord',6,164,195,47,56],['bot_musique',5,164,195,47,56],
  // Un boss de zone par zone (mobs.js), dans un coin de la zone, loin des sanctuaires.
  ['gazon',1,16,23,2,10],['chad',1,17,28,27,35],['zenith',1,40,47,2,14],['modo_supreme',1,36,48,20,34],['lag_ancestral',1,68,77,22,30],['khey_originel',1,20,45,44,56],['serveur_prod',1,60,75,44,56],
  ['proviseur',1,105,116,5,12],['vigile_chef',1,105,115,32,35],['directeur',1,84,96,50,55],['cosplay_ultime',1,140,155,47,52],['heisenbug',1,126,153,8,20],
  ['ceo',1,186,195,3,5],['agent_immo',1,188,195,32,35],['fondateur',1,186,195,54,56],
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
  // Les deux sanctuaires d'origine sans marchand : le Sous-Sol et l'Arène.
  npc('petit_frere',"Le Petit Frère","Revente au marché noir",'Marchand · Revend les affaires de la maison (niveaux 1–5)',3.5,9.4,"Je vends tout ce que j'ai trouvé dans la maison. Les chips sont à Maman, la règle est à moi, le jogging est à toi. Je te le revends quand même. C'est ça, le capitalisme."),
  npc('buvette',"La Buvette de l'Arène","Rafraîchissements",'Marchande · De quoi tenir un débat (chips, Chouffes)',31.5,17.4,"Chips, Chouffes. Rien d'autre. Ici, on débat, on perd, on boit. Dans cet ordre, ou dans un autre, personne n'a jamais gagné de toute façon."),
  // ---- Saison 3 : l'après-diplôme ----
  npc('panneau_startup',"Panneau de la Startup","Valeurs",'Startup · Niveau 100+',177.5,17.6,"NOS VALEURS : Bienveillance. Agilité. Disruption. Baby-foot. Danger : stagiaires non rémunérés, managers bienveillants, baby-foot de la cohésion. Les heures sup sont « un état d'esprit ».",{look:'sign'}),
  npc('barista',"Le Barista de l'Open Space","Machine à café",'Marchand · Équipement de la Startup (niveau 100)',182.5,13.6,"Un flat white ? Un cold brew ? Un café filtre « comme à la maison » ? Tout est gratuit, sauf mes armes. Elles, c'est la startup qui me les a laissées en partant. La startup est partie, pas les armes."),
  npc('panneau_coloc',"Panneau de la Coloc","Règlement intérieur",'Coloc de 9 m² · Niveau 100+',177.5,22.4,"RÈGLEMENT DE LA COLOC : 1. On fait sa vaisselle. 2. On ne mange pas le fromage des autres. 3. On ne parle pas du point 1. Danger : vaisselle sale, colocataire fantôme, propriétaire en visite surprise.",{look:'sign'}),
  npc('coloc_ancien',"Le Plus Ancien Colocataire","Bail depuis 2009",'Marchand · Équipement de la Coloc (niveau 100)',182.5,25.6,"J'étais là avant tout le monde. Avant le propriétaire, je crois. Je vends ce que les anciens colocs ont laissé : des armes, des fringues, une plante morte. La plante n'est pas à vendre, elle fait partie de la caution."),
  npc('panneau_discord',"Panneau du Discord","#règles",'Discord à 4 h du Matin · Niveau 100+',177.5,41.6,"#RÈGLES : pas de spam, pas de @everyone, pas de vraie vie. Danger : notifications @everyone, admins de serveur, bots musique désynchronisés. Quelqu'un est en vocal depuis 2019. Ne le réveillez pas.",{look:'sign'}),
  npc('modo_afk',"Le Modo AFK","Rôle : Marchand",'Marchand · Équipement du Discord (niveau 100)',182.5,44.6,"*est AFK* … *revient* Ah, salut. Tu veux du stuff ? J'ai tout ce que les membres bannis ont laissé. C'est légal. C'est dans les règles. J'ai écrit les règles."),
  // ---- Saison 3 : le Casino (règles dans shared/casino.js, actions 'casino' dans sim.js) ----
  npc('croupier_bj',"La Croupière de Blackjack","Blackjack",'Casino · Blackjack contre la banque (3 pour 2)',36.0,27.8,"Asseyez-vous. La banque tire jusqu'à 17, le blackjack paie 3 pour 2, et vos illusions ne sont pas remboursées. On mise de l'or ou un équipement du sac : perdu, il reste à la maison."),
  npc('croupier_roul',"Le Croupier de la Roulette","Roulette",'Casino · Roulette européenne (0 à 36)',43.0,28.8,"Faites vos jeux. Rouge, noir, pair, impair, manque, passe : la mise double. Un numéro plein : ×36. Le zéro est à la maison. Comme vous, à 30 ans."),
  npc('croupier_pk',"Le Donneur de Poker Chouffin","Poker Chouffin",'Casino · Poker à 5 cartes entre joueurs (2 à 6)',39.0,30.8,"Poker Chouffin : chacun met sa mise au pot, cinq cartes, un seul échange, et la meilleure main ramasse tout, or et équipement. Pas de relance : ici on bluffe avec sa mise, pas avec sa bouche."),
  npc('barman_casino',"Le Barman du Casino","Bar du Casino",'Marchand · De quoi se consoler (chips, Chouffes)',44.9,26.2,"Une Chouffe pour fêter, une Chouffe pour oublier. C'est le même prix. Personne n'a jamais commandé celle pour fêter."),
  npc('fripier',"Le Fripier du Forum","Tenues d'occasion",'Tenues · Changez de look (aucune stat, juste du style)',19.6,21.0,"Tout est vintage. C'est-à-dire usé. Les tenues ne protègent de rien, sauf du ridicule, et encore. Essayez, la cabine est derrière le rideau. Il n'y a pas de rideau."),
  // ---- Lot 3 : entrée de la LAN Party, au Bourg-Forum ----
  npc('orga_lan',"L'Orga de la LAN","Donjon : La LAN Party",'Donjon · La LAN Party · Étape 1 : L\'Installation',17.5,17.8,"Salut ! C'est moi qui organise. Y'a vingt-trois multiprises, onze écrans et personne n'a pensé aux câbles réseau. Tu viens ? Faut juste tout installer avant que quelqu'un dise « bon, on commence ». Niveau 20 minimum : les potes sans tour ne font pas de cadeaux.",{look:'door',dungeon:'lan'}),
];
