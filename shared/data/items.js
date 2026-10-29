// Arme à distance : champ optionnel `rg` (portée en cases) sur un objet de slot 'arme'. Équipée, elle porte la portée de l'attaque de base à max(portée de la compétence 1 de la classe, rg) ;
// au-delà de la portée de la classe, l'attaque de base inflige ARME_DIST_MULT des dégâts. Règle de portée : baseRange(S) dans shared/rules.js.
export const ARME_RG=5,ARME_DIST_MULT=.8;
// Équipement : les stats écrites ici sont celles d'un objet de niveau d'objet (nObj) = rl et de sa rareté d'origine r.
// shared/rules.js les met à l'échelle pour toute autre instance : × (1 + nObj/10) × multiplicateur de rareté.
export const RARITY_MULT={common:1,unc:1.1,rare:1.25,epic:1.45,leg:1.7};
export const ITEMS={
  chips:{n:"Chips au Fromage Orange",t:'use',r:'common',pct:.25,buy:5,price:1,d:"Rend 25 % des PV. Laisse une trace orange sur la manette. Pour toujours."},
  chouffe:{n:"Chouffe",t:'use',r:'unc',pct:.55,drunk:12,buy:12,price:4,d:"Bière belge. Rend 55 % des PV et rend Pompette 12 s (+15 % d'Attaque, marche approximative). Le chouffin et la chouffe : une histoire de famille."},
  poignee:{n:"Poignée de Main Moite",t:'junk',r:'poor',price:3,d:"Personne ne l'a jamais acceptée. Se revend chez Gérard."},
  regle:{n:"Règle en Plastique Aiguisée",t:'eq',s:'arme',r:'common',atk:3,rl:1,buy:20,price:8,d:"30 cm de pure menace. Graduée, pour mesurer l'étendue de votre échec."},
  katana:{n:"Katana de Supermarché",t:'eq',s:'arme',r:'rare',atk:6,rl:3,buy:70,price:25,d:"Acier plié mille fois. Le carton de l'emballage aussi."},
  clavier:{n:"Clavier Mécanique RGB",t:'eq',s:'arme',r:'epic',atk:10,hp:15,rl:4,price:70,d:"16,8 millions de couleurs. Les voisins entendent chaque frappe."},
  sabre:{n:"Sabre Laser en Mousse",t:'eq',s:'arme',r:'rare',atk:9,rl:5,buy:160,price:60,d:"Fait « vvvoum » quand vous le dites vous-même. Vous le dites tout le temps."},
  resine:{n:"Épée Bâtarde en Résine",t:'eq',s:'arme',r:'epic',atk:13,rl:7,buy:340,price:120,d:"Achetée en convention. Certifiée « fidèle au lore » par personne."},
  lance_pierre:{n:"Lance-Pierre à Élastique de Bureau",t:'eq',s:'arme',r:'unc',atk:5,rl:3,rg:ARME_RG,buy:55,price:18,d:"Élastique volé à la compta, gomme de classe en munition. Vous visez le proviseur. Vous touchez le ficus."},
  ethernet:{n:"Câble Ethernet de Maman",t:'eq',s:'arme',r:'leg',atk:18,hp:40,rl:7,price:400,d:"15 mètres. Le seul lien qui vous rattache encore au monde."},
  flamme:{n:"Lance-Flammes à Opinions",t:'eq',s:'arme',r:'epic',atk:17,rl:9,buy:650,price:230,d:"Brûle tout débat constructif dans un rayon de trois mètres."},
  grimoire:{n:"Grimoire des Topics Épinglés",t:'eq',s:'arme',r:'leg',atk:23,hp:30,rl:10,price:900,d:"Contient tous les règlements jamais lus. Pèse 14 kg. Frappe fort."},
  fedora:{n:"Fedora en Feutre Usé",t:'eq',s:'tete',r:'rare',atk:3,hp:10,arm:2,rl:1,price:20,d:"Porté chaque jour depuis 2011. Ne passe pas en machine. Ne passe pas les portes non plus."},
  bandeau:{n:"Bandeau de Ninja (Cosplay)",t:'eq',s:'tete',r:'unc',atk:2,hp:5,arm:1,rl:1,price:8,d:"Vous n'avez jamais fini la série. Vous la défendez quand même."},
  casque:{n:"Casque Gamer à Oreilles de Chat",t:'eq',s:'tete',r:'unc',arm:5,hp:10,rl:4,buy:120,price:45,d:"Les oreilles s'allument. Votre vie sociale, non."},
  heaume:{n:"Heaume de Réalité Virtuelle",t:'eq',s:'tete',r:'epic',arm:12,hp:25,rl:10,price:250,d:"Le seul endroit où vous voyez un paysage."},
  tshirt:{n:"T-shirt « Je ne sors pas »",t:'eq',s:'torse',r:'unc',hp:15,atk:1,arm:2,rl:1,price:10,d:"Acheté en convention. Lavé une fois, par erreur."},
  sweat:{n:"Sweat à Capuche Taché",t:'eq',s:'torse',r:'common',arm:3,hp:5,rl:1,buy:18,price:6,d:"La tache date de 2019. Elle fait partie de la famille."},
  trench:{n:"Trench-coat Noir",t:'eq',s:'torse',r:'rare',hp:30,arm:6,rl:2,price:25,d:"Il fait 31 °C. Vous le portez quand même. C'est une question d'identité."},
  carton:{n:"Armure en Carton (Cosplay)",t:'eq',s:'torse',r:'rare',arm:10,hp:20,rl:6,buy:260,price:90,d:"Imperméable jusqu'à la première goutte de pluie."},
  eva:{n:"Armure en Mousse EVA",t:'eq',s:'torse',r:'epic',arm:16,hp:35,rl:9,buy:580,price:200,d:"200 heures de découpe. Zéro photo de vous dedans."},
  mitaines:{n:"Mitaines Sans Doigts",t:'eq',s:'mains',r:'unc',atk:2,arm:1,rl:1,price:8,d:"Pour taper « en fait » à 140 mots par minute."},
  gants:{n:"Gants de Gamer Renforcés",t:'eq',s:'mains',r:'unc',atk:1,arm:4,rl:3,buy:75,price:28,d:"Rembourrage anti-rage-quit. Testés sur 400 manettes."},
  jogging:{n:"Jogging Éternel",t:'eq',s:'jambes',r:'common',arm:3,rl:1,buy:18,price:6,d:"Pour toutes les occasions. Surtout aucune."},
  pantoufles:{n:"Pantoufles de Combat",t:'eq',s:'jambes',r:'unc',arm:6,hp:10,rl:4,buy:95,price:35,d:"Semelles antidérapantes. N'ont jamais quitté le sous-sol."},
  jambieres:{n:"Pantalon Cargo à 14 Poches",t:'eq',s:'jambes',r:'rare',arm:10,hp:15,rl:7,price:110,d:"Une poche par snack. Une poche par artéfact."},
  art_cle:{n:"Clé USB de 128 Mo",t:'art',r:'common',price:15,d:"Contient un seul fichier : « devoirs_final_FINAL_v3.doc »."},
  art_poster:{n:"Poster Dédicacé par un Inconnu",t:'art',r:'common',price:12,d:"La signature dit « Kevin ». Personne ne sait quel Kevin."},
  art_disquette:{n:"Disquette d'Installation de 1995",t:'art',r:'unc',price:30,d:"Disque 7 sur 13. Les 12 autres sont perdus à jamais."},
  art_carte:{n:"Carte Holographique Première Édition",t:'art',r:'rare',price:90,d:"Jamais sortie de sa pochette. Jamais touchée par la lumière du jour. Comme vous."},
  art_figurine:{n:"Figurine Jamais Sortie de sa Boîte",t:'art',r:'rare',price:120,d:"L'ouvrir diviserait sa valeur par dix. Et briserait un cœur."},
  art_cartouche:{n:"Cartouche Dorée Collector",t:'art',r:'epic',price:240,d:"Souffler dedans pour la faire marcher. Tradition ancestrale."},
  art_dvd:{n:"Intégrale DVD de Kaamelot",t:'art',r:'epic',price:280,d:"Vous les avez tous vus."},
  art_topic:{n:"Topic Légendaire du 18-25 (Imprimé)",t:'art',r:'epic',price:320,d:"Le premier message où quelqu'un a écrit « par pitié le khey ». 1 200 pages. Relié main."},
  art_sticker:{n:"Sticker Original Non Compressé",t:'art',r:'leg',price:700,d:"Le fichier source. 12 Ko. Des kheys se sont battus pour lui."},
  art_wifi:{n:"Mot de Passe du Wi-Fi des Voisins",t:'art',r:'leg',price:900,d:"« azerty1234 ». La plus grande richesse de ce monde."},
  art_save:{n:"Sauvegarde à 100 % (Jamais Corrompue)",t:'art',r:'leg',price:1200,d:"340 heures de jeu. Un seul emplacement. Aucune copie."},
  // ---- Lot 8 : Parking du Lycée (rl 15–22) ----
  regle_fer:{n:"Règle en Fer du Surveillant",t:'eq',s:'arme',r:'rare',atk:34,hp:20,rl:16,price:520,d:"30 cm de justice. Sert aussi à tracer les marges, et à rappeler à l'ordre."},
  gilet:{n:"Gilet Jaune de Délégué",t:'eq',s:'torse',r:'rare',arm:26,hp:55,rl:15,price:430,d:"Visible de très loin. Les élèves vous voient arriver, et ils changent de couloir."},
  gants_cahier:{n:"Gants de Cahier de Textes",t:'eq',s:'mains',r:'unc',atk:6,arm:18,rl:17,price:300,d:"Chaque doigt a une date de rendu. Aucun n'est rendu à temps."},
  jeans_craie:{n:"Jean Tagué à la Craie",t:'eq',s:'jambes',r:'rare',arm:24,hp:48,rl:18,price:480,d:"Quelqu'un a écrit « T nul » dans le dos. En fait, c'est vous, en 3e."},
  casquette_cpe:{n:"Casquette du CPE",t:'eq',s:'tete',r:'epic',atk:8,arm:26,hp:62,rl:20,price:900,d:"Elle n'a jamais quitté sa tête. Elle l'a suivie dans la tombe."},
  pistolet_billes:{n:"Pistolet à Billes de la Fête Foraine",t:'eq',s:'arme',r:'rare',atk:28,hp:15,rl:15,rg:ARME_RG,price:420,d:"Gagné au stand de tir après quarante tickets et une dispute avec le forain. Le canon est tordu, comme l'ambiance."},
  copie_double:{n:"Copie Double Annotée en Rouge",t:'eq',s:'arme',r:'leg',atk:62,hp:70,rl:22,price:1900,d:"« Hors-sujet. » Trois fois. Elle déchire pourtant les ennemis en deux."},
  // ---- Supermarché (rl 25–35) ----
  scanette:{n:"Scanette Qui Bipe Trop",t:'eq',s:'arme',r:'rare',atk:52,hp:40,rl:27,price:900,d:"Un bip, un code-barres, un ennemi en moins. « Article inconnu » : c'est vous."},
  blouse:{n:"Blouse de Stagiaire",t:'eq',s:'torse',r:'rare',arm:34,hp:82,rl:25,price:760,d:"Taille unique, pour tous les stagiaires, et pour personne. Elle porte le badge d'un autre."},
  casquette_promo:{n:"Casquette « Équipe Promo »",t:'eq',s:'tete',r:'rare',atk:8,arm:28,hp:70,rl:28,price:820,d:"Fournie par l'enseigne avec un sourire obligatoire (non fourni)."},
  gants_caisse:{n:"Gants de Caissière Experte",t:'eq',s:'mains',r:'rare',atk:14,arm:26,rl:30,price:900,d:"Scannent à 40 articles par minute. Sans jamais regarder le client."},
  tablier:{n:"Tablier de Boucher Tâché",t:'eq',s:'torse',r:'epic',atk:6,arm:50,hp:112,rl:32,price:1500,d:"Les taches racontent un jeudi soir de 2014. Il vaut mieux ne pas demander."},
  pantalon_stock:{n:"Pantalon de Réserviste",t:'eq',s:'jambes',r:'epic',arm:42,hp:92,rl:34,price:1600,d:"Quinze poches pour quinze cutters. Il tient debout tout seul. Il en a trop vu."},
  palette_or:{n:"Transpalette Doré de l'Employé du Mois",t:'eq',s:'arme',r:'leg',atk:98,hp:120,rl:35,price:3800,d:"Employé du mois depuis 2011. Personne d'autre n'a postulé."},
  // ---- Pôle Emploi (rl 40–50) ----
  tampon:{n:"Tampon « REFUSÉ »",t:'eq',s:'arme',r:'rare',atk:82,hp:60,rl:43,price:1900,d:"Un coup, une décision définitive. Faire appel est possible, par courrier recommandé."},
  cravate:{n:"Chemise à Cravate de Conseiller",t:'eq',s:'torse',r:'rare',arm:48,hp:120,rl:42,price:1700,d:"Le col est amidonné à vie. Le sourire, lui, est en option et en rupture de stock."},
  gants_tampon:{n:"Mitaines de Guichetier",t:'eq',s:'mains',r:'rare',atk:20,arm:40,rl:44,price:1800,d:"Pour tamponner par grand froid. Le froid est permanent, le chauffage « en attente de pièces »."},
  badge_pe:{n:"Badge « Je Suis Là Pour Vous Aider »",t:'eq',s:'tete',r:'epic',atk:12,arm:42,hp:132,rl:45,price:2800,d:"Le « vous » a été effacé à l'usure. Le « aider », depuis longtemps."},
  pantalon_tailleur:{n:"Pantalon de Tailleur Repassé",t:'eq',s:'jambes',r:'epic',arm:58,hp:150,rl:48,price:3200,d:"Un pli parfait, impossible à défaire. Comme le dossier de quelqu'un d'autre."},
  nerf_garage:{n:"Nerf Modifié en Garage",t:'eq',s:'arme',r:'rare',atk:68,hp:50,rl:40,rg:ARME_RG,price:1500,d:"Ressort renforcé, fléchette limée, garantie annulée. Tire fort, tire loin, tire un avertissement de la mairie."},
  cerfa_dore:{n:"Cerfa Rempli et Validé",t:'eq',s:'arme',r:'leg',atk:140,hp:160,rl:50,price:7500,d:"Aucune case oubliée, aucune rature, tamponné trois fois. Le seul. Le dernier. Il tranche."},
  // ---- Artéfacts de donjon : Le Bac de 2012 ----
  art_copie:{n:"Copie Double Vierge",t:'art',r:'common',price:60,d:"Elle est restée vierge pendant toute l'épreuve. Il fallait bien que quelqu'un le fasse."},
  art_trousse:{n:"Trousse Mâchouillée",t:'art',r:'common',price:70,d:"Le capuchon du stylo a une histoire. Plusieurs, en fait, toutes dans les dents."},
  art_calculette:{n:"Calculatrice Graphique Piratée",t:'art',r:'unc',price:130,d:"Contient « Snake », trois formules, et la fin d'un exercice de maths dont personne ne se souvient."},
  art_sujet:{n:"Sujet de Philo Fuité",t:'art',r:'rare',price:380,d:"« Le bonheur est-il possible ? » Avec le corrigé. Il dit que non, en 40 pages."},
  art_carnet:{n:"Carnet de Correspondance Signé « Maman »",t:'art',r:'rare',price:420,d:"Elle a signé à votre place. Elle a aussi écrit « Excellent élève ». Le mensonge le plus tendre."},
  art_diplome:{n:"Diplôme Plastifié (Vrai)",t:'art',r:'epic',price:900,d:"Le seul qu'on ait pu vérifier. Il est plastifié pour qu'on ne le perde pas. On l'a perdu quand même."},
  art_bulletin:{n:"Bulletin « Peut Mieux Faire » (Encadré)",t:'art',r:'epic',price:1000,d:"Quinze années d'appréciations. « Peut mieux faire » revient 31 fois. Il est joliment encadré."},
  art_mention:{n:"Mention Très Bien, Imprimée Recto-Verso",t:'art',r:'leg',price:3200,d:"Tirée du fond d'un tiroir de 2012. Elle brille. Elle sent l'imprimante qui bourre."},
  // ---- La Réserve ----
  art_ticket:{n:"Ticket de Caisse de 4 Mètres",t:'art',r:'common',price:90,d:"Quarante-sept articles, dont 46 que vous n'avez pas achetés. La pub est au verso."},
  art_sac:{n:"Sac Plastique Réutilisé 400 Fois",t:'art',r:'common',price:100,d:"Il a survécu à tout. Il survivra à tous. C'est le véritable héros du supermarché."},
  art_etiquette:{n:"Étiquette −70 % Décollée",t:'art',r:'unc',price:190,d:"Elle s'est décollée de son produit, qui n'a donc jamais été à −70 %. La preuve est ici."},
  art_pate:{n:"Pâté de Foie de la DLC 2009",t:'art',r:'rare',price:520,d:"Il a survécu à la date limite, à la fin du monde et à une grève. Ne l'ouvrez pas."},
  art_jouet:{n:"Jouet d'Œuf Surprise Complet",t:'art',r:'rare',price:600,d:"Les trois pièces. Les stickers. Même la notice, en cinq langues. Un miracle."},
  art_caddie:{n:"Pièce du Caddie (Jamais Rendue)",t:'art',r:'epic',price:1300,d:"Un euro. Un euro qui a coûté vingt ans de remords à son propriétaire."},
  art_fidelite:{n:"Carte de Fidélité à 12 000 Points",t:'art',r:'epic',price:1500,d:"Le « programme » a changé six fois de nom. Les points, eux, n'ont jamais servi."},
  art_dlc:{n:"Produit Frais, Date : Demain (Depuis 2011)",t:'art',r:'leg',price:4800,d:"Il est resté frais. Il sera encore frais demain. Ne cherchez pas à comprendre."},
  // ---- Le Labyrinthe Administratif ----
  art_ticketpe:{n:"Ticket n° 3 (Valide Jusqu'à Hier)",t:'art',r:'common',price:140,d:"Le numéro en cours est 4 812. Vous êtes le 3. Quelqu'un a déjà été appelé à votre place."},
  art_stylo:{n:"Stylo à Bille Enchaîné au Guichet",t:'art',r:'common',price:150,d:"La chaîne est coupée. Le stylo n'écrit plus. Les deux ont eu une belle carrière."},
  art_cerfa_vide:{n:"Cerfa Vierge Introuvable",t:'art',r:'unc',price:280,d:"Le seul exemplaire non périmé. Il manque la page 2, que personne n'a jamais vue."},
  art_tampon:{n:"Tampon Original « Vu et Approuvé »",t:'art',r:'rare',price:760,d:"Jamais utilisé. Il fait trembler les guichetiers, qui n'en ont jamais reçu un."},
  art_justif:{n:"Justificatif de Domicile Valide (Légendaire)",t:'art',r:'rare',price:820,d:"De moins de trois mois, au bon nom, à la bonne adresse. Il n'existe que dans les légendes."},
  art_attestation:{n:"Attestation d'Attestation",t:'art',r:'epic',price:1900,d:"Elle atteste que vous avez bien une attestation. Elle atteste aussi d'elle-même."},
  art_dossier:{n:"Dossier Complet (Enfin)",t:'art',r:'epic',price:2100,d:"Aucune pièce ne manque. Les guichetiers le regardent comme on regarde une comète."},
  art_rdv:{n:"Rendez-vous Fixé à Moins de Trois Mois",t:'art',r:'leg',price:6500,d:"Il est inscrit noir sur blanc, tamponné, signé. La date est dans cinq semaines. Du jamais vu."}
};
export const SLOTS={tete:'Tête',torse:'Torse',mains:'Mains',jambes:'Jambes',arme:'Arme'};
export const RN={poor:'Médiocre',common:'Commun',unc:'Inhabituel',rare:'Rare',epic:'Épique',leg:'Légendaire'};
export const SHOP={armes:['regle','lance_pierre','katana','sabre','resine','flamme'],armures:['sweat','jogging','gants','pantoufles','casque','carton','eva']};
export const STOCK={gerard:['chips'],tavernier:['chouffe'],bernard:[...SHOP.armes,...SHOP.armures]};
export const ART_POOL={common:['art_cle','art_poster'],unc:['art_disquette','art_cle'],rare:['art_carte','art_figurine'],epic:['art_cartouche','art_dvd','art_topic'],leg:['art_sticker','art_wifi','art_save']};

// Pools d'artéfacts par donjon (clé = id de DUNGEONS) ; les Archives gardent ART_POOL.
export const ART_POOLS={
  archives:ART_POOL,
  bac:{common:['art_copie','art_trousse'],unc:['art_calculette','art_copie'],rare:['art_sujet','art_carnet'],epic:['art_diplome','art_bulletin'],leg:['art_mention']},
  reserve:{common:['art_ticket','art_sac'],unc:['art_etiquette','art_sac'],rare:['art_pate','art_jouet'],epic:['art_caddie','art_fidelite'],leg:['art_dlc']},
  labyrinthe:{common:['art_ticketpe','art_stylo'],unc:['art_cerfa_vide','art_stylo'],rare:['art_tampon','art_justif'],epic:['art_attestation','art_dossier'],leg:['art_rdv']},
};

// ---- Lot 9 : Convention Manga/Anime (rl 56–70) et DIIAGE (rl 76–100) ----
// Les stats viennent du niveau requis, de l'emplacement et de la rareté (même échelle que les objets du Lot 8) : ça évite 15 lignes de chiffres à tenir à jour à la main.
const RM9={rare:1,epic:1.25,leg:1.5};
const BUDGET9={arme:{atk:1.9,hp:1.4},tete:{atk:.26,arm:.95,hp:2.7},torse:{arm:1.15,hp:2.85},mains:{atk:.45,arm:.95},jambes:{arm:1.2,hp:3.1}};
const eq9=(n,s,r,rl,d)=>{const it={n,t:'eq',s,r,rl,price:Math.round(rl*rl*.35*RM9[r]+rl*30),d};for(const k in BUDGET9[s])it[k]=Math.round(BUDGET9[s][k]*rl*RM9[r]);return it};
Object.assign(ITEMS,{
  wakizashi:eq9("Wakizashi de Convention",'arme','rare',56,"Acheté au stand n° 47, entre un poster et une peluche. Il n'a jamais coupé que du carton, mais il y met du cœur."),
  perruque:eq9("Perruque Bleue Électrique",'tete','epic',58,"Quarante centimètres de nylon et trois litres de laque. Elle résiste aux coups, à la pluie et au regard des autres."),
  armure_cosplay:eq9("Armure de Cosplay Intégrale",'torse','epic',60,"Trois cents heures de couture, deux brûlures de pistolet à colle, zéro sortie de chez vous. Elle protège mieux que votre vie sociale."),
  gants_manga:eq9("Gants de Dédicace Anti-Crampes",'mains','rare',62,"Pour signer 800 dédicaces sans pleurer. Le pouce a des opinions."),
  hakama:eq9("Hakama du Maître de la Convention",'jambes','epic',65,"Un pli par saison d'anime. Le tissu a vu des épisodes que personne ne devrait voir."),
  tablette_graphique:eq9("Tablette Graphique à Stylet Tranchant",'arme','epic',66,"Elle dessine des lignes parfaites. Elles coupent aussi, dans les cas extrêmes."),
  plume_or:eq9("Plume d'Or du Mangaka",'arme','leg',70,"Elle n'a jamais séché. Elle n'a jamais dormi non plus. Il en sort des chapitres entiers, et des ennemis en moins."),
  sweat_diiage:eq9("Sweat DIIAGE Taché de Café",'torse','rare',76,"Le logo est à moitié parti au lavage. Le café, lui, ne part jamais. Il fait partie de la formation."),
  clavier_ergo:eq9("Clavier Ergonomique Mal Réglé",'arme','rare',78,"Trois pieds, deux axes, une douleur au poignet. Le dernier coup de pied de la journée, en prime."),
  hoodie_dev:eq9("Hoodie de Développeur Nocturne",'torse','epic',85,"Capuche permanente, poche kangourou à snacks. Il protège de la lumière, du soleil et des collègues."),
  badge_diiage:eq9("Badge DIIAGE « Étudiant »",'tete','epic',86,"Il ouvre toutes les portes sauf celle de la salle serveur. Elle est « en maintenance » depuis la rentrée."),
  gants_ssh:eq9("Gants de Terminal",'mains','epic',92,"Aucun clavier ne leur résiste. Ils tapent « sudo » toutes les trois secondes, par réflexe."),
  jean_rendu:eq9("Jean de Veille de Rendu",'jambes','epic',95,"Porté trois jours d'affilée, comme le projet. Il a lâché deux fois, le projet une seule."),
  diplome_epee:eq9("Parchemin du Diplôme",'arme','leg',97,"Roulé comme une lame, signé comme une promesse. Il tranche les doutes. Et un peu tout le reste."),
  toque_diplome:eq9("Toque de Diplômé (Enfin)",'tete','leg',100,"Lancée en l'air, elle n'est jamais retombée. Elle est revenue, d'elle-même, en 2031. Pas de mention."),
  // Artéfacts de La Salle des Dédicaces
  art_dedicace:{n:"Dédicace sur Serviette en Papier",t:'art',r:'common',price:200,d:"« Pour Kévin, avec toute mon… signature. » Le stylo a bavé. Le papier aussi."},
  art_pins:{n:"Pin's d'Édition Limitée (Pas Si Limitée)",t:'art',r:'common',price:220,d:"Tirage limité à 4 000 000 exemplaires. Vous en avez trois. Un par stand."},
  art_tome:{n:"Tome 1 Dédicacé (Sans Tomes 2 à 87)",t:'art',r:'unc',price:420,d:"Le seul qu'on ait réussi à trouver. La suite est en rupture. Depuis 1998."},
  art_cell:{n:"Cellulo Original d'un Épisode Inconnu",t:'art',r:'rare',price:1100,d:"Une scène de combat qui n'a jamais été diffusée. Heureusement pour les spectateurs."},
  art_poster_manga:{n:"Poster Dédicacé Roulé depuis 2009",t:'art',r:'rare',price:1200,d:"Il a gardé la forme du tube. Il garde aussi quelques secrets, dont une page entière de dédicaces à l'ennemi."},
  art_edition:{n:"Édition Collector Jamais Ouverte",t:'art',r:'epic',price:2600,d:"Sous blister depuis la sortie. Le blister a pris de la valeur. L'édition, non."},
  art_manuscrit:{n:"Manuscrit Raturé du Mangaka",t:'art',r:'epic',price:2900,d:"Sept versions du dernier chapitre, toutes barrées de rouge. La huitième est restée dans sa tête."},
  art_planche:{n:"Planche Originale du Chapitre 1 000",t:'art',r:'leg',price:9000,d:"Un arc de fin d'œuvre, en grand format. Il sera publié dans deux mille ans, la deadline est négociable."},
  // Artéfacts de La Soutenance
  art_slide:{n:"Diapositive à Trop de Texte",t:'art',r:'common',price:320,d:"Quatre-vingt-dix lignes en police 8. Le jury a bien lu la première. Il a dit « intéressant »."},
  art_cafe:{n:"Gobelet de Café du Jury",t:'art',r:'common',price:340,d:"Vide depuis la première question. Il a gardé la chaleur de l'angoisse."},
  art_rapport:{n:"Rapport de 87 Pages (Page de Garde Seule)",t:'art',r:'unc',price:650,d:"La page de garde est magnifique. Les 86 autres sont « en cours ». Elles sont en cours depuis septembre."},
  art_maquette:{n:"Maquette Jamais Branchée",t:'art',r:'rare',price:1700,d:"Elle marche parfaitement, tant qu'on ne la branche pas. L'état de l'art est un état d'esprit."},
  art_commit:{n:"Historique de Commits « fix »",t:'art',r:'rare',price:1800,d:"Quatre cent douze commits, tous nommés « fix ». Aucun ne répare quoi que ce soit."},
  art_cahier:{n:"Cahier des Charges Signé (et Ignoré)",t:'art',r:'epic',price:4000,d:"Trente pages de spécifications, quatre signatures. Plus personne ne s'en souvient, mais tout le monde l'a signé."},
  art_note:{n:"Grille de Notation Annotée",t:'art',r:'epic',price:4400,d:"Une colonne « Remarques » remplie d'encre rouge. La note finale est au verso, le verso est vide."},
  art_diplome_dev:{n:"Diplôme DIIAGE (Original, Signé, Soulagé)",t:'art',r:'leg',price:14000,d:"Il est là. Il est signé. Personne n'y croyait, surtout pas vous. On le plastifie ? On l'encadre ? On pleure."},
  // Figurines-artéfacts vendues par l'Otaku Ancestral (prix d'achat : buy ; elles se revendent bien moins cher chez Gérard)
  fig_chibi:{n:"Figurine Chibi d'un Personnage Secondaire",t:'art',r:'rare',price:300,buy:900,d:"Un héros de troisième plan, en version miniature et très mignonne. Il a eu quatre répliques, toutes sur du pain."},
  fig_robot:{n:"Maquette de Robot Géant (Montée en 40 h)",t:'art',r:'rare',price:800,buy:2400,d:"Quarante heures, trois doigts collés, une jambe à l'envers. Le robot est fier de sa pose, c'est l'essentiel."},
  fig_waifu:{n:"Figurine Taille Réelle (Très Gênante)",t:'art',r:'epic',price:2000,buy:6000,d:"Elle regarde les visiteurs sans jamais ciller. Votre mère a demandé qu'on la mette dans la cave. Elle y est restée un jour."},
  fig_numero:{n:"Figurine Édition Limitée N° 1/1",t:'art',r:'leg',price:5000,buy:15000,d:"Une édition limitée à un exemplaire. Il en reste un. L'Otaku Ancestral l'a gardé jusqu'à vous."},
});
STOCK.otaku=['fig_chibi','fig_robot','fig_waifu','fig_numero'];
Object.assign(ART_POOLS,{
  dedicaces:{common:['art_dedicace','art_pins'],unc:['art_tome','art_pins'],rare:['art_cell','art_poster_manga'],epic:['art_edition','art_manuscrit'],leg:['art_planche']},
  soutenance:{common:['art_slide','art_cafe'],unc:['art_rapport','art_cafe'],rare:['art_maquette','art_commit'],epic:['art_cahier','art_note'],leg:['art_diplome_dev']},
});
// Lot 10 : marchands des sanctuaires. Équipement de leur zone (hors récompenses de quête et légendaires, qui restent à gagner) + consommables.
// Prix d'achat : buy s'il existe, sinon 3 × price (buyPrice dans rules.js).
Object.assign(STOCK,{
  cantine:['chips','chouffe','gilet','jeans_craie','pistolet_billes'],
  chef_rayon:['chips','chouffe','blouse','casquette_promo','pantalon_stock'],
  sauvette:['chips','chouffe','tampon','gants_tampon','nerf_garage'],
  goodies:['chips','chouffe','perruque','gants_manga','hakama'],
  bde:['chips','chouffe','sweat_diiage','badge_diiage','jean_rendu'],
  petit_frere:['chips','chouffe','regle','sweat','jogging'],
  buvette:['chips','chouffe'],
});

// ---- Lot 3 : butin exclusif de l'étape 1 de la LAN Party (aucun marchand, aucun tirage ; base epic niveau d'objet 20) ----
Object.assign(ITEMS,{
  multiprise_parafoudre:{n:"Multiprise Parafoudre",t:'eq',s:'arme',r:'epic',atk:52,hp:30,rl:20,price:1100,d:"Neuf prises, un interrupteur lumineux et un parafoudre qui n'a jamais servi. Corps à corps uniquement : le câble fait deux mètres, et la loi des multiprises interdit de la brancher en cascade."},
  tapis_xxl:{n:"Tapis de Souris XXL",t:'eq',s:'torse',r:'epic',atk:4,arm:40,hp:90,rl:20,price:1100,d:"90 × 40 cm de pure surface de glisse, porté en cape. Il a connu trois souris, deux Coca renversés et une rage. Il glisse sur tout, sauf sur vos responsabilités."},
});

// ---- Saison 3 : équipement de l'après-diplôme (rl 100, même échelle que le Lot 9 ; le butin des monstres 100–112 a un niveau d'objet plus haut). ----
Object.assign(ITEMS,{
  lanyard:eq9("Lanyard de Startup",'tete','rare',100,"Il ouvre la porte, la cafétéria et le cœur du manager. Le dernier est verrouillé."),
  doudoune_manager:eq9("Doudoune Sans Manches de Manager",'torse','epic',100,"Brodée au logo d'un fonds d'investissement. Elle tient chaud au torse et laisse les bras dans le doute."),
  macbook:eq9("MacBook Pro Couvert d'Autocollants",'arme','rare',100,"Plus d'autocollants que de touches. Il frappe fort, il chauffe fort, il coûte un loyer."),
  gants_vaisselle:eq9("Gants de Vaisselle Jaunes",'mains','epic',100,"Ils ont touché des choses qu'aucun gant ne devrait toucher. Ils protègent de tout, même de la culpabilité."),
  pyjama_coloc:eq9("Pantalon de Pyjama de Coloc",'jambes','epic',100,"Porté pour télétravailler, dormir, sortir les poubelles et, une fois, à un entretien."),
  balai_coloc:eq9("Balai de la Coloc (Jamais Utilisé)",'arme','rare',100,"Il n'a jamais balayé. Il a toujours tapé. C'est sa vraie vocation."),
  casque_streamer:eq9("Casque de Streamer à Micro Rétractable",'tete','epic',100,"Le micro ne se rétracte plus depuis 2021. Vous parlez toujours trop fort."),
  clavier_60:{...eq9("Clavier 60 % Lanceur de Touches",'arme','epic',100,"Il lui manque les flèches, le pavé numérique et la dignité. Les touches partent toutes seules, à cinq cases."),rg:ARME_RG},
  jogging_rgb:eq9("Jogging RGB Synchronisé",'jambes','rare',100,"Il clignote au rythme du bot musique. Il est désynchronisé aussi."),
  stock_options:eq9("Stock-Options (Sans Valeur)",'arme','leg',100,"Elles vaudront des millions. Après la sortie. Après la prochaine levée. Après."),
  trousseau_proprio:eq9("Trousseau de Clés du Proprio",'arme','leg',100,"Quarante clés, aucune n'ouvre la boîte aux lettres. Elles tranchent quand même les cautions."),
  role_admin:eq9("Rôle Admin (Tranchant)",'arme','leg',100,"Une couleur rouge dans la liste des membres. Ça suffit à tout couper."),
});
Object.assign(STOCK,{
  barista:['chips','chouffe','lanyard','macbook'],
  coloc_ancien:['chips','chouffe','gants_vaisselle','balai_coloc'],
  modo_afk:['chips','chouffe','jogging_rgb','clavier_60'],
});

// ---- Saison 3 : vitesse (va = vitesse d'attaque de base, vd = vitesse de déplacement, en %, plafonnées par VA_MAX / VD_MAX dans rules.js) et armes en plus chez chaque marchand. ----
Object.assign(ITEMS,{
  baskets_led:{n:"Baskets à LED de 2008",t:'eq',s:'jambes',r:'unc',arm:4,hp:8,vd:10,rl:5,buy:140,price:50,d:"Elles clignotent à chaque pas. Vous courez plus vite, surtout pour fuir les regards."},
  mitaines_speedrun:{n:"Mitaines de Speedrunner",t:'eq',s:'mains',r:'rare',atk:3,arm:2,va:12,rl:8,buy:260,price:90,d:"Usées au pouce droit. Frame-perfect, sauf pour les relations humaines."},
  rollers:{...eq9("Rollers de Livreur à Vélo (Sans Vélo)",'jambes','rare',30,"Huit roues, aucun frein, une note de 4,2 sur l'appli."),vd:12},
  gants_apm:{...eq9("Gants 300 APM",'mains','epic',60,"Trois cents actions par minute. Dont deux cent quatre-vingt-dix inutiles, mais très vite."),va:15},
  sneakers_dev:{...eq9("Sneakers de Développeur Pressé",'jambes','epic',88,"Pour courir du daily au rendu, et du rendu au daily. Les lacets sont défaits depuis la rentrée."),vd:15},
  pistolet_eau:{n:"Pistolet à Eau du Petit Frère",t:'eq',s:'arme',r:'common',atk:2,rl:1,rg:ARME_RG,buy:15,price:5,d:"Il fuit. Il fuit beaucoup. Il mouille surtout vous, mais il porte loin."},
  compas:{n:"Compas de Géométrie",t:'eq',s:'arme',r:'unc',atk:4,va:12,rl:2,buy:45,price:15,d:"Pointu d'un côté, crayon de l'autre. Il pique vite et trace des cercles parfaits autour de vos ennemis."},
  sarbacane:{n:"Sarbacane en Stylo Bic",t:'eq',s:'arme',r:'rare',atk:8,rl:6,rg:ARME_RG,buy:220,price:75,d:"Corps de stylo, boulette de papier mâché. Le prof de maths l'a confisquée trois fois. Elle revient toujours."},
  micro_plateau:{n:"Micro de Plateau TV",t:'eq',s:'arme',r:'unc',atk:5,hp:5,va:8,rl:4,buy:90,price:30,d:"Celui qui coupe la parole. Il frappe vite, il frappe fort, il ne laisse jamais finir une phrase."},
  chaise_pliante:{n:"Chaise Pliante de Débat",t:'eq',s:'arme',r:'rare',atk:12,hp:10,rl:8,buy:300,price:100,d:"L'argument final de tout débat de plateau. Elle se plie, vos adversaires aussi."},
  louche:{...eq9("Louche de la Cantine",'arme','rare',18,"Elle sert la purée et les coups. Les deux à la même vitesse : beaucoup trop vite."),va:10},
  baguette:{...eq9("Baguette Rassie de 21 h 58",'arme','rare',30,"Dure comme du béton depuis 21 h 57. Elle frappe vite, elle frappe sec, elle ne se mange plus."),va:12},
  pistolet_etiquettes:{...eq9("Pistolet à Étiquettes",'arme','rare',33,"Il colle « −70 % » sur tout ce qui bouge, à cinq cases. Personne n'ose le décoller."),rg:ARME_RG},
  parapluie:{...eq9("Parapluie à Ressort du Guichet",'arme','rare',46,"Oublié par un usager en 2009. Il s'ouvre tout seul, loin, et toujours au mauvais moment pour l'ennemi."),rg:ARME_RG},
  agrafeuse:{...eq9("Agrafeuse Lourde de Bureau",'arme','epic',50,"Cinquante feuilles d'un coup. Ou un ennemi. Clac, clac, clac, très vite."),va:10},
  arc_mousse:{...eq9("Arc en Mousse de GN",'arme','rare',58,"Les flèches sont en mousse, la conviction est en béton. « Touché ! Tu es mort ! » Il l'est, en effet."),rg:ARME_RG},
  bokken:{...eq9("Bokken de Cosplay Vernis",'arme','epic',62,"Trois couches de vernis, aucun entraînement. Il frappe vite parce qu'il est léger, et parce qu'il est fier."),va:15},
  souris_lasso:{...eq9("Souris Filaire en Lasso",'arme','epic',84,"Deux mètres de câble, un clic gauche à distance. Elle revient toujours, comme un bug."),rg:ARME_RG},
  mug_geant:{...eq9("Mug « World's Best Developer »",'arme','rare',100,"Offert par l'équipe, rempli quatre fois par heure. Il cogne vite : il n'y a jamais assez de temps."),va:10},
  poele_coloc:eq9("Poêle de la Coloc (Jamais Lavée)",'arme','epic',100,"La couche de gras la rend antiadhésive et indestructible. Ne pas lécher."),
  webcam:{...eq9("Webcam Lancée en Plein Appel",'arme','epic',100,"« Tu m'entends ? » Non. Mais elle, elle vous atteint à cinq cases."),rg:ARME_RG},
  ecran_incurve:eq9("Écran Incurvé de 34 Pouces",'arme','epic',90,"Immersif. Lourd. Il épouse la forme du crâne de l'ennemi."),
});
STOCK.bernard.push('compas','sarbacane','baskets_led','mitaines_speedrun');
STOCK.petit_frere.push('pistolet_eau');
STOCK.buvette.push('micro_plateau','chaise_pliante');
STOCK.cantine.push('louche');
STOCK.chef_rayon.push('baguette','pistolet_etiquettes','rollers');
STOCK.sauvette.push('parapluie','agrafeuse');
STOCK.goodies.push('arc_mousse','bokken','gants_apm');
STOCK.barista.push('mug_geant');STOCK.coloc_ancien.push('poele_coloc');STOCK.modo_afk.push('webcam');
STOCK.bde.push('souris_lasso','ecran_incurve','sneakers_dev');
