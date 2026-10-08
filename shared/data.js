export const ZONES={
  base:{n:"Le Sous-Sol de Maman",s:"Sanctuaire · Les monstres n'y entrent pas (l'odeur)"},
  bourg:{n:"Bourg-Forum",s:"Sanctuaire · Marchands, Taverne du 18-25 et entrée des Archives"},
  plaine:{n:"Plaines de l'Herbe Jamais Touchée",s:"Niveaux 1–2"},
  steppe:{n:"Steppes des Normies",s:"Niveaux 2–3 · Risque élevé de small talk"},
  lac:{n:"Rives du Lac Énergisant",s:"Niveaux 3–4 · Taux de caféine : 4 000 %"},
  foret:{n:"Forêt des Modérateurs",s:"Niveaux 4–6 · Zone JcJ (Joueur contre Jugement)"},
  cuisine:{n:"Le Rez-de-Chaussée",s:"Donjon · Niveau 7 · Boss : Maman"},
  marais:{n:"Marais du Lag",s:"Niveaux 6–7 · Ping moyen : 999 ms"},
  sel:{n:"Désert de Sel du 18-25",s:"Niveaux 8–9 · Par pitié le khey, ne restez pas là"},
  datacenter:{n:"Datacenter Abandonné",s:"Niveau 10 · Température ambiante : 74 °C"}
};
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
  art_dvd:{n:"Intégrale DVD d'un Anime de 900 Épisodes",t:'art',r:'epic',price:280,d:"Dont 400 épisodes de remplissage. Vous les avez tous vus."},
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
export const DIFFS=[
  {n:'Normal',sub:'Pour les touristes du forum',rl:4,L:4,bonus:150,arts:2,gold:60,w:{common:45,unc:38,rare:17},packs:[2,2]},
  {n:'Héroïque',sub:'Pour ceux qui ont fini le tutoriel',rl:7,L:7,bonus:400,arts:3,gold:150,w:{unc:40,rare:42,epic:18},packs:[2,3]},
  {n:'Mythique',sub:'Interdit aux gens qui ont une copine',rl:10,L:10,bonus:900,arts:3,gold:350,w:{rare:35,epic:45,leg:20},packs:[2,3],grim:.25},
  {n:'Sans Douche',sub:"Odeur de niveau 13. Ne vous retournez pas.",rl:13,L:13,bonus:1600,arts:4,gold:800,w:{epic:55,leg:45},packs:[3,3],grim:.4}
];
export const AOE_MAMAN={n:'Coupure du Wi-Fi',r:4.5,warn:'Coupure du Wi-Fi ! Éloignez-vous de 4 cases !',hit:'coupe le Wi-Fi. Ping : infini.',dodge:'Vous esquivez la Coupure du Wi-Fi en passant en 4G.',dodgeF:'Esquivé (4G)',hitF:'DÉCONNECTÉ',shout:['JE COUPE LE WI-FI !','IL EST 23 H !','JE DÉBRANCHE LA BOX !'],enrage:"J'AI VU TON HISTORIQUE DE NAVIGATION."};
export const AOE_ARCH={n:'Mur de Texte',r:3.6,warn:'Mur de Texte ! Sortez de la zone !',hit:'vous ensevelit sous 40 paragraphes.',dodge:'Vous esquivez le Mur de Texte avec un « TL;DR ».',dodgeF:'TL;DR',hitF:'ENSEVELI',shout:['LISEZ LE RÈGLEMENT !','RÉPONSE EN PAVÉ !','CITATION DE 2008 !'],enrage:'Je vais tout citer. TOUT.'};
export const MOBS={
  herbe:{n:"Herbe Agressive",l:1,hp:24,atk:[2,4],xp:14,g:[1,2],sp:1.4,ag:3,cd:1.8,hgt:.95,v:"vous fouette les chevilles",
    lines:["*bruissement menaçant*","Touche-moi. Pour voir.","Ça fait combien de temps que t'es pas sorti ?"],loot:[['chips',.3],['poignee',.25],['mitaines',.05]]},
  normie:{n:"Normie Sauvage",l:2,hp:40,atk:[3,6],xp:24,g:[2,4],sp:1.9,ag:3.5,cd:1.7,hgt:1.2,v:"vous demande ce que vous faites dans la vie",
    lines:["T'as vu le match hier ?","Tu fais quoi ce week-end ? Dehors, je veux dire.","C'est quoi un « isekai » ?","On se fait un foot ?"],loot:[['chips',.35],['poignee',.3],['tshirt',.08],['bandeau',.08]]},
  soleil:{n:"Rayon de Soleil",l:3,hp:52,atk:[5,8],xp:34,g:[3,5],sp:2.2,ag:4,cd:1.6,hgt:1.35,v:"vous brûle la rétine",
    lines:["*brille intensément*","Ta peau n'a jamais vu de vitamine D.","Sors de l'ombre, petit vampire."],loot:[['chips',.3],['poignee',.2],['bandeau',.1]]},
  modo:{n:"Modérateur Discord Corrompu",l:4,hp:78,atk:[6,10],xp:48,g:[4,7],sp:2,ag:4,cd:1.7,hgt:1.2,v:"vous rend muet pour « spam »",
    lines:["Règle n° 47 : pas de memes dans #général.","Ban. Raison : vibes.","Je fais ça bénévolement. Pour le pouvoir."],loot:[['chips',.4],['poignee',.3],['tshirt',.1],['mitaines',.1]]},
  troll:{n:"Troll de Forum",l:5,hp:110,atk:[8,13],xp:66,g:[5,9],sp:1.8,ag:4,cd:1.9,hgt:1.5,scale:1.25,v:"répond « source ? » à votre existence",
    lines:["Source ?","Ok boomer.","Ton anime préféré est surcoté.","Premier !"],loot:[['chips',.5],['poignee',.4],['clavier',.06]]},
  maman:{n:"Maman, Gardienne du Wi-Fi",l:7,hp:650,atk:[10,15],xp:420,g:[60,60],sp:2.3,ag:5,cd:1.8,hgt:2.15,scale:1.75,boss:1,yn:'Maman',fem:1,aoe:AOE_MAMAN,v:"vous ordonne de ranger votre chambre",
    lines:["TU AS MANGÉ ?","Ta chambre est une porcherie.","Ton cousin, lui, il est notaire.","Tu vas finir avec les yeux carrés !"],loot:[['chips',1]]},
  lag:{n:"Pic de Lag",l:6,hpM:.9,sp:2,ag:4.5,cd:1.6,hgt:1.2,v:"vous fige l'écran",
    lines:["*se téléporte en arrière*","Ping : 999.","Vous avez été déconnecté. Non, en fait si."],loot:[['chips',.4],['poignee',.3],['art_cle',.06]]},
  texture:{n:"Texture Manquante",l:7,hpM:1.15,sp:1.8,ag:4,cd:1.8,hgt:1.2,v:"vous inflige un bug graphique",
    lines:["ERREUR : TEXTURE INTROUVABLE","*damier rose et noir*","Le développeur m'a oublié."],loot:[['chips',.4],['poignee',.3],['art_disquette',.07]]},
  khey:{n:"Khey Enragé",l:8,hpM:1,sp:2.1,ag:4.5,cd:1.7,hgt:1.2,v:"vous spamme des stickers",
    lines:["PAR PITIÉ LE KHEY","AYAAA","C'est la hess, khey.","ISSOU","Je suis au 18-25 depuis 2011, j'ai 33 ans."],loot:[['chips',.4],['chouffe',.15],['art_poster',.1],['art_topic',.02]]},
  topic:{n:"Topic Mort",l:9,hpM:1.3,sp:1.4,ag:4,cd:2,hgt:1.1,v:"vous noie sous les UP",
    lines:["UP","UP","… UP ?","0 réponse depuis 2014."],loot:[['chips',.4],['art_poster',.15],['art_disquette',.06]]},
  serveur:{n:"Serveur Surchauffé",l:10,hpM:1.4,atkM:1.05,sp:1.5,ag:4,cd:1.9,hgt:1.4,v:"vous souffle 74 °C au visage",
    lines:["*ventilateurs à 100 %*","ERREUR 500.","Je chauffe plus que ta chambre en août."],loot:[['chips',.4],['art_cle',.15],['art_disquette',.1]]},
  spam:{n:"Bot de Spam",dg:1,hpM:.75,atkM:.8,sp:2.3,ag:5,cd:1.5,hgt:1.05,v:"vous envoie 400 courriels",
    lines:["ACHETEZ DES FOLLOWERS","Vous êtes le 1 000 000e visiteur !","Cliquez ici pour un téléphone gratuit."]},
  necro:{n:"Nécroposteur",dg:1,hpM:.9,atkM:.95,sp:1.9,ag:5,cd:1.8,hgt:1.25,v:"déterre un topic de 2009 sur vous",
    lines:["UP de 2009.","Je ressuscite ce topic.","Quelqu'un a la réponse ? (posté il y a 14 ans)"]},
  fantome:{n:"Khey Fantôme",dg:1,hpM:.85,atkM:.9,sp:2.1,ag:5,cd:1.7,hgt:1.2,v:"vous murmure « par pitié » à l'oreille",
    lines:["Par pitié le khey…","Ayaaa…","J'étais là au début du forum…","Up mon topic, par pitié."]},
  pave:{n:"Pavé Vivant",dg:1,hpM:1.4,atkM:.75,sp:1.3,ag:4.5,cd:2.1,hgt:1.2,v:"vous fait lire 47 paragraphes",
    lines:["TL;DR ? Non.","Paragraphe 1 sur 47.","Je n'ai pas fini."]},
  archiviste:{n:"Le Grand Archiviste",dg:1,boss:1,hpM:5.5,atkM:1.05,sp:2,ag:6,cd:1.9,hgt:2.2,scale:1.7,yn:'Le Grand Archiviste',aoe:AOE_ARCH,v:"vous déplace dans la corbeille",
    lines:["SILENCE. CE TOPIC EST ARCHIVÉ.","Votre message a été jugé hors-sujet.","Les Archives n'oublient rien. Surtout pas vos posts de 2012."]}
};
export const SPAWNS=[['herbe',7,15,24,1,11],['normie',6,17,29,24,36],['soleil',5,26,47,1,15],['modo',5,32,48,17,27],['troll',4,32,48,28,36],['lag',6,52,77,2,30],['texture',5,52,77,2,30],['khey',7,2,48,40,57],['topic',5,2,48,40,57],['serveur',6,54,76,35,57]];
export const SKILLS=[
  {id:'tip',n:"Tip du Fedora",l:1,cd:1.4,c:0,rg:1.6,d:"Soulève le fedora avec une courtoisie offensive. Inflige 100 % de l'Attaque. Coûte 1 point de Dignité. Se lance automatiquement au contact."},
  {id:'enfait',n:"« En fait... »",l:2,cd:7,c:15,rg:4.5,d:"Entame un monologue non sollicité de 14 paragraphes. Inflige 150 % de l'Attaque et étourdit la cible 2,5 s."},
  {id:'copypasta',n:"Copypasta",l:3,cd:10,c:22,rg:5,d:"Colle un pavé de 4 000 caractères sur la cible et tout ce qui se trouve à 2 cases. 55 % de l'Attaque par seconde pendant 5 s."},
  {id:'canette',n:"Canette Tiède",l:1,cd:18,c:0,self:1,d:"Boit une boisson énergisante ouverte depuis mardi. Rend 35 % des PV et 30 Caféine."},
  {id:'ragequit',n:"Rage Quit",l:5,cd:40,c:0,self:1,d:"Alt+F4 émotionnel. Après 1,5 s d'incantation, vous ramène au Sous-Sol de Maman (ou à l'entrée du donjon)."}
];
export const QUESTS=[
  {g:'sage',n:"Le Premier Pas Dehors",m:'herbe',k:5,rl:1,xp:60,gold:10,item:'fedora',
    t:"Cela fait 1 427 jours que tu n'es pas sorti, jeune chouffin. Les herbes de la plaine se moquent de toi. Va. Ne les touche pas : frappe-les. Ensuite, passe au Bourg-Forum, juste au sud-est : Bernard y vend des armes.",
    done:"Tu es revenu. Tu sens l'extérieur. C'est une première, et pas une bonne odeur. Prends ce fedora. Il te protégera du jugement des autres."},
  {g:'sage',n:"Interactions Sociales Avancées",m:'normie',k:4,rl:2,xp:110,gold:20,item:'trench',
    t:"Des Normies rôdent dans les steppes, au sud du Bourg-Forum. Ils posent des questions comme « ça va ? » et attendent une réponse. Montre-leur ce qu'est un vrai monologue.",
    done:"Ils ont fui en parlant de « mec bizarre ». Tu as gagné. Ce trench-coat est à toi. Ne le lave pas, il perdrait ses pouvoirs."},
  {g:'gerard',n:"Photosensibilité",m:'soleil',k:4,rl:3,xp:170,gold:30,item:'katana',
    t:"Le soleil existe. Je sais, moi aussi j'ai été choqué. Des Rayons de Soleil traînent près du lac, au nord-est. Abats-en quatre avant qu'ils ne te bronzent.",
    done:"Excellent travail. Ta peau reste d'un blanc parfaitement réglementaire. Voici un katana. Je l'ai eu en promo avec des nouilles instantanées."},
  {g:'gerard',n:"Liberté d'Expression",m:'modo',k:3,rl:4,xp:250,gold:40,item:'clavier',
    t:"Les modérateurs de la forêt ont supprimé mon message « en fait, un sabre laser bat un katana ». Trois bans. Trois vengeances.",
    done:"Justice est faite. Mon message est toujours supprimé, mais j'ai le sentiment d'avoir raison, et c'est ce qui compte. Prends ce clavier."},
  {g:'sage',n:"Source ?",m:'troll',k:2,rl:5,xp:300,gold:60,item:null,
    t:"Des Trolls de Forum répondent « source ? » à toutes mes prophéties. Même celle sur la fin du monde. Fais-les taire. Deux suffiront.",
    done:"Le silence. Enfin. Il ne reste qu'une épreuve, la plus terrible de toutes."},
  {g:'sage',n:"23 h 00",m:'maman',k:1,rl:7,xp:600,gold:200,item:'ethernet',
    t:"L'heure approche. Maman va couper le Wi-Fi. Monte au Rez-de-Chaussée, au sud-ouest, et affronte-la. Quand elle brandit la box, éloigne-toi d'au moins 4 cases. Que le ping soit avec toi.",
    done:"Le Wi-Fi restera allumé cette nuit. Tu as quand même dû sortir les poubelles. Voici le Câble Ethernet de Maman. Le Gardien des Archives, au Bourg-Forum, voudra te parler."},
  {g:'gardien',n:"Archéologie Numérique",dg:1,k:1,rl:7,xp:900,gold:150,item:'jambieres',
    t:"Sous ce bourg dorment les Archives Oubliées : quinze ans de topics morts et de flame wars. Elles regorgent d'artéfacts que Gérard rachète à prix d'or. Termine-les en difficulté Héroïque.",
    done:"Tu sens la poussière de 2009. C'est l'odeur de la victoire. Garde le butin, revends-le à Gérard, et prends ce pantalon : quatorze poches pour quatorze artéfacts."},
  {g:'tavernier',n:"Par Pitié le Khey",m:'khey',k:6,rl:8,xp:1000,gold:150,item:'chouffe',itemN:5,
    t:"Khey. Au sud, dans le Désert de Sel, des Kheys Enragés hurlent « PAR PITIÉ LE KHEY » à tous les passants depuis 2011. Ils font fuir mes clients. Calme-en six. Par pitié, le khey.",
    done:"AYAAA, t'as géré khey. Tiens, 5 Chouffes offertes par la maison. Ne dis rien au patron. Le patron, c'est moi."},
  {g:'gerard',n:"Surchauffe",m:'serveur',k:4,rl:10,xp:1400,gold:250,item:'heaume',
    t:"Le Datacenter, au sud-est, surchauffe. Mes cartes holographiques gondolent à cause de la chaleur. Débranche quatre Serveurs Surchauffés. Avec tes poings s'il le faut.",
    done:"La température est redescendue à 61 °C. Un climat agréable pour un chouffin. Prends ce casque de réalité virtuelle : tu pourras voir un paysage sans sortir."},
  {g:'gardien',n:"Les Archives Interdites",dg:2,k:1,rl:10,xp:2200,gold:500,item:'grimoire',
    t:"Il existe un niveau plus profond. Les Archives en Mythique, où dorment les topics que même les modérateurs ont oubliés. Si tu reviens, tu seras une légende. Si tu ne reviens pas, personne ne remarquera.",
    done:"Tu es revenu. Personne n'avait remarqué. Mais moi, je sais. Prends le Grimoire des Topics Épinglés. Et va prendre une douche, par pitié."}
];
export const NPCS=[
  {id:'sage',kind:'npc',n:"Le Vieux Sage du Forum",tag:"Membre depuis 2003",ti:"Membre depuis 2003 · 41 000 messages",x:6.5,y:5.6,hgt:1.25,
    greet:"Ah, un jeune chouffin. Je suis membre de ce forum depuis 2003. 41 000 messages, zéro ami, une sagesse infinie. Écoute-moi."},
  {id:'gerard',kind:'npc',n:"Gérard",tag:"Bric-à-brac",ti:"Marchand · Rachète artéfacts et bric-à-brac",x:14.5,y:16.7,hgt:1.2,
    greet:"Bienvenue chez Gérard. Je rachète les artéfacts des Archives et tout ce qui est moite. Ne touche pas aux cartes holographiques, elles sont sous plastique depuis 1999."},
  {id:'bernard',kind:'npc',n:"Bernard",tag:"Armurerie",ti:"Armurier de convention",x:19.5,y:16.7,hgt:1.2,
    greet:"Armes et armures, tout est fait main. Enfin, fait à l'autre bout du monde, mais assemblé à la main. Par moi. Au pistolet à colle."},
  {id:'tavernier',kind:'npc',n:"Le Khey Tavernier",tag:"Taverne du 18-25",ti:"Taverne du 18-25 · Membre depuis 2011",x:12.9,y:18.55,hgt:1.2,
    greet:"Bienvenue au 18-25, khey. Ici on a tous 18 ans depuis 2011. Une Chouffe ? Par pitié le khey, prends une Chouffe, t'as une tête de PNJ de zone de départ."},
  {id:'gardien',kind:'npc',n:"Le Gardien des Archives",tag:"Archives du Forum",ti:"Donjon · Les Archives Oubliées du Forum",x:22.6,y:18.7,hgt:1.25,
    greet:"Sous ce bourg dorment les Archives Oubliées du Forum : quinze ans de topics morts, de pavés et de flame wars. Des trésors y attendent. Des nécroposteurs aussi."}
];
export const BOTS=[['xX_DarkSasuke_Xx','Les Incompris'],['Kévin_du_42','Ctrl+Alt+Défaite'],['FedoraLord1987','Sous-Sol Éternel'],['MangaKing2009',''],['LeMageNoir','Sans Lumière du Jour'],['Sylvain_Tank','Ctrl+Alt+Défaite'],['NeckbeardSama','Les Incompris'],['PapyGamer',''],['Khey_du_18-25','Par Pitié'],['Célestin_Niv99','Par Pitié']];
export const BOT_LINES=["LFG Archives Héroïque, besoin d'un heal, pas de normies svp","qqun sait comment on parle à une fille ? je demande pour un ami (l'ami c'est moi)","en fait techniquement c'est pas un MMO c'est un MMORPG","/me ajuste ses lunettes avec le majeur","ma mère dit que le soleil existe, qqun confirme ?","j'ai pas dormi depuis jeudi, je suis à 98 % de la quête","la saison 2 était meilleure, changez-moi d'avis (vous pourrez pas)","6 jours avec le même t-shirt, c'est un buff caché","VDS [Poignée de Main Moite] x47, jamais acceptées","la guilde <Les Incompris> recrute, critère : avoir été incompris","ma copine est au Canada, vous la connaissez pas","c'est pas un trench-coat c'est un MANTEAU DE GUERRE","le jeu lag ou c'est ma vie ?","brb ma mère crie","je mange les pâtes crues pour gagner du temps","m'lady (je m'entraîne)","quelqu'un a déjà touché l'herbe ? ça fait quoi ?","le Vieux Sage m'a fait lire un post de 2004 pendant 40 minutes","je suis pas asocial, je suis en mode furtif","par pitié le khey, qqun pour les Archives en Mythique ?","AYAAA j'ai drop un Sticker Original Non Compressé","c'est la hess, il me reste 3 po","ISSOU, Maman m'a os en un coup","+1 le khey","je suis au 18-25 depuis 2011 et j'ai toujours 18 ans dans mon cœur","la Chouffe de la taverne rend 55 % des PV, par pitié buvez-en","khey t'aurais pas 20 po ?","Gérard m'a racheté une Sauvegarde à 100 % pour 1 200 po, je pleure","l'Armure en Carton a pris l'eau, Bernard rembourse pas","les Kheys Enragés du Désert de Sel sont trop chiants, par pitié nerfez-les","Célestin un jour, Célestin toujours"];
export const SYS_LINES=["Rappel : la douche n'est pas un DLC.","Maintenance prévue à 3 h. Personne ne sera dérangé, personne ne dort.","Le mot de passe du Wi-Fi n'est pas un objet de quête. Arrêtez de le demander aux PNJ.","Pensez à hydrater votre personnage. Et vous aussi. L'eau, pas la Chouffe.","Événement « Toucher l'herbe » reporté indéfiniment faute de participants.","Le forum 18-25 rappelle que la moyenne d'âge de ses membres est de 31 ans.","Les Archives Oubliées sont ouvertes. Gérard rachète tous les artéfacts. Par pitié, arrêtez de lui vendre des poignées de main."];
export const BOT_REPLIES=["source ?","ok","t ki ?","+1","en fait non","reported","/me tip son fedora","c'est pas canon ça","mdr","ok boomer","lvl ?","bien dit m'lady","je t'ai pas demandé mais ok","ratio","par pitié le khey","AYAAA","issou","c'est la hess"];
export const WHISPERS=["t ki ?","je suis afk (je suis pas afk)","pas de RP en MP stp","tu veux grouper ? non je rigole","reported","par pitié le khey, laisse-moi farmer"];
export const ENFAIT=["En fait, si on lit le manga…","En fait, techniquement…","En fait, c'est pas canon.","En fait, la VO est meilleure.","En fait, Linux c'est mieux.","En fait, j'ai un QI de…"];
export const DEATH=["Votre mère vous a appelé pour manger. Vous êtes mort avant d'avoir répondu.","Cause du décès : une conversation en vrai.","Vous direz que c'était le lag. Ce n'était pas le lag.","Votre ratio K/D vient de pleurer un peu.","AYAAA. C'est la hess, khey."];
export const LVLUP=["Votre mère est fière. Elle ne sait pas ce que vous faites, mais elle est fière.","+2 Attaque. +0 vie sociale.","Vous êtes désormais plus haut niveau que votre nombre d'amis.","Vos cernes gagnent un niveau aussi."];
export const ACH={
  first:["Premier Sang (Figuré)","Vaincre votre premier ennemi. Ce n'était que de l'herbe."],
  grass:["Toucher l'Herbe","Tentative échouée. Vous l'avez frappée 10 fois à la place."],
  death:["Décès Prématuré","Mourir une fois. Votre mère n'a rien remarqué."],
  mlady:["M'lady ×50","Ôter son chapeau 50 fois. La dignité est une ressource finie."],
  lvl5:["Niveau 5","Plus élevé que votre nombre d'amis."],
  chat:["Monologue Public","Écrire « en fait » dans le canal Général."],
  rich:["Capitaliste","Posséder 100 po. Assez pour une figurine. Pas pour un loyer."],
  rq:["Rage Quit","Quitter un combat avec dignité. Ou sans."],
  boss:["Le Wi-Fi Restera Allumé","Vaincre Maman. Vous devez quand même sortir les poubelles."],
  khey:["Par Pitié le Khey","Parler au Khey Tavernier. Vous avez maintenant 18 ans pour toujours."],
  chouffe:["Le Chouffin et la Chouffe","Boire 10 Chouffes. Une histoire de famille."],
  shop:["Client Fidèle","Acheter chez Bernard. Il connaît votre prénom maintenant."],
  dungeon:["Archéologue du Forum","Terminer les Archives Oubliées."],
  mythic:["Sans Douche, Sans Peur","Terminer les Archives en difficulté Sans Douche."],
  millio:["Brocanteur","Vendre pour 1 000 po d'artéfacts à Gérard."]
};
export const HATS=[['#1d1b22','Noir Éternel'],['#6b6870','Gris Feutré'],['#6d2230','Bordeaux Audacieux'],['#4d3a22','Brun Vintage'],['#2a3a5c','Bleu Convention']];
export const MAXLVL=15;
