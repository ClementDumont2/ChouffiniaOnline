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
  art_save:{n:"Sauvegarde à 100 % (Jamais Corrompue)",t:'art',r:'leg',price:1200,d:"340 heures de jeu. Un seul emplacement. Aucune copie."}
};
export const SLOTS={tete:'Tête',torse:'Torse',mains:'Mains',jambes:'Jambes',arme:'Arme'};
export const RN={poor:'Médiocre',common:'Commun',unc:'Inhabituel',rare:'Rare',epic:'Épique',leg:'Légendaire'};
export const SHOP={armes:['regle','katana','sabre','resine','flamme'],armures:['sweat','jogging','gants','pantoufles','casque','carton','eva']};
export const STOCK={gerard:['chips'],tavernier:['chouffe'],bernard:[...SHOP.armes,...SHOP.armures]};
export const ART_POOL={common:['art_cle','art_poster'],unc:['art_disquette','art_cle'],rare:['art_carte','art_figurine'],epic:['art_cartouche','art_dvd','art_topic'],leg:['art_sticker','art_wifi','art_save']};
