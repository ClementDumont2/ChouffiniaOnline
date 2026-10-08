import {LIGNES_PNJ,NOUVELLES_BOT_LINES} from './data/dialogues.js';
import {NEW_ZONES,NEW_SPAWNS,NEW_NPCS} from './data/zones.js';
import {NEW_MOBS} from './data/mobs.js';
import {NEW_QUESTS} from './data/quests.js';
import {DUNGEONS} from './data/dungeons.js';
export const ZONES={
  base:{n:"Le Sous-Sol de Maman",s:"Sanctuaire · Les monstres n'y entrent pas (l'odeur)"},
  arene:{n:"L'Arène du Débat Stérile",s:"Sanctuaire · Duels sur invitation (/duel) · Personne n'y a jamais convaincu personne"},
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
export {ITEMS,SLOTS,RN,SHOP,STOCK,ART_POOL,ART_POOLS,RARITY_MULT} from './data/items.js';
export {DUNGEONS};
export const DIFFS=[
  {n:'Normal',sub:'Pour les touristes du forum',rl:4,L:4,bonus:150,arts:2,gold:60,w:{common:45,unc:38,rare:17},packs:[2,2]},
  {n:'Héroïque',sub:'Pour ceux qui ont fini le tutoriel',rl:7,L:7,bonus:400,arts:3,gold:150,w:{unc:40,rare:42,epic:18},packs:[3,4]},
  {n:'Mythique',sub:'Interdit aux gens qui ont une copine',rl:10,L:10,bonus:900,arts:3,gold:350,w:{rare:35,epic:45,leg:20},packs:[3,5],grim:.25},
  {n:'Sans Douche',sub:"Odeur de niveau 13. Ne vous retournez pas.",rl:13,L:13,bonus:1600,arts:4,gold:800,w:{epic:55,leg:45},packs:[4,5],grim:.4}
];
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
  maman:{n:"Maman, Gardienne du Wi-Fi",l:7,hp:650,atk:[10,15],xp:420,g:[60,60],sp:2.3,ag:5,cd:1.8,hgt:2.15,scale:1.75,boss:1,yn:'Maman',fem:1,v:"vous ordonne de ranger votre chambre",
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
  archiviste:{n:"Le Grand Archiviste",dg:1,boss:1,hpM:5.5,atkM:1.05,sp:2,ag:6,cd:1.9,hgt:2.2,scale:1.7,yn:'Le Grand Archiviste',v:"vous déplace dans la corbeille",
    lines:["SILENCE. CE TOPIC EST ARCHIVÉ.","Votre message a été jugé hors-sujet.","Les Archives n'oublient rien. Surtout pas vos posts de 2012."]}
};
export const SPAWNS=[['herbe',7,15,24,1,11],['normie',6,17,29,24,36],['soleil',5,26,47,1,15],['modo',5,32,48,17,27],['troll',4,32,48,28,36],['lag',6,52,77,2,30],['texture',5,52,77,2,30],['khey',7,2,48,40,57],['topic',5,2,48,40,57],['serveur',6,54,76,35,57]];
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
    done:"Tu es revenu. Personne n'avait remarqué. Mais moi, je sais. Prends le Grimoire des Topics Épinglés. Et va prendre une douche, par pitié.",fin:true}
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
  {id:'gardien',kind:'npc',n:"Le Gardien des Archives",tag:"Archives du Forum",ti:"Donjon · Les Archives Oubliées du Forum",x:22.6,y:18.7,hgt:1.25,dungeon:'archives',
    greet:"Sous ce bourg dorment les Archives Oubliées du Forum : quinze ans de topics morts, de pavés et de flame wars. Des trésors y attendent. Des nécroposteurs aussi."},
  {id:'kevin',kind:'npc',n:"Kévin, Concessionnaire",tag:"Montures",ti:"Concessionnaire · Chaises et trottinettes",x:22.4,y:15.3,hgt:1.2,
    greet:"Salut le khey. Chaise de Gamer, Trottinette Électrique : tout roule, littéralement. Je prends les paiements en or, en Chouffe, ou en compliments. Surtout en or."},
  {id:'arene',kind:'npc',n:"Panneau de l'Arène",tag:"Règlement du débat",ti:"Arène du Débat Stérile · Duels",x:36.6,y:14.9,hgt:1.1,
    greet:"RÈGLEMENT : on se défie avec /duel <pseudo>, à l'intérieur de l'enclos. Dégâts réduits de moitié, personne ne meurt, tout le monde repart énervé. Le perdant doit écrire « tu as raison ». C'est la loi du Général."},
  {id:'fanfiqueuse',kind:'npc',n:"La Fanfiqueuse",tag:"Fusion d'équipement",ti:"Écrivaine · Fusionne deux objets du même emplacement",x:23.4,y:20.2,hgt:1.2,
    greet:"Chut, j'écris. Tiens, j'ai un crossover à te proposer : tes deux objets, dans le même univers, avec une tension qu'on ne voit pas à l'écran. Rassure-toi, ça ne choque que les objets."},
  {id:'conseiller',kind:'npc',n:"Le Conseiller d'Orientation",tag:"Reconversion",ti:"Orientation · Changement de classe",x:16.9,y:19.8,hgt:1.2,
    greet:"Bonjour. Vous voulez être soigneur, tank ou en vitesse ? Dans la vraie vie on n'a pas ce choix, profitez. Je ne juge pas votre parcours. Enfin si, mais ça se règle avec de l'or."},
  {id:'tableau',kind:'npc',n:"Tableau d'Honneur",tag:"Classement",ti:"Classement du serveur · Mis à jour en direct",x:10.5,y:9.6,hgt:1.2,look:'sign',board:true,
    greet:"Punaisé au mur du sous-sol par Maman, à côté du dessin de CP. Les meilleurs chouffins du serveur. Si vous n'y êtes pas, ce n'est pas grave. Si, un peu."}

].map(n=>({...n,lines:LIGNES_PNJ[n.id]||[]}));
export const BOTS=[['xX_DarkSasuke_Xx','Les Incompris'],['Kévin_du_42','Ctrl+Alt+Défaite'],['FedoraLord1987','Sous-Sol Éternel'],['MangaKing2009',''],['LeMageNoir','Sans Lumière du Jour'],['Sylvain_Tank','Ctrl+Alt+Défaite'],['NeckbeardSama','Les Incompris'],['PapyGamer',''],['Khey_du_18-25','Par Pitié'],['Célestin_Niv99','Par Pitié']];
export const BOT_LINES=["LFG Archives Héroïque, besoin d'un heal, pas de normies svp","qqun sait comment on parle à une fille ? je demande pour un ami (l'ami c'est moi)","en fait techniquement c'est pas un MMO c'est un MMORPG","/me ajuste ses lunettes avec le majeur","ma mère dit que le soleil existe, qqun confirme ?","j'ai pas dormi depuis jeudi, je suis à 98 % de la quête","la saison 2 était meilleure, changez-moi d'avis (vous pourrez pas)","6 jours avec le même t-shirt, c'est un buff caché","VDS [Poignée de Main Moite] x47, jamais acceptées","la guilde <Les Incompris> recrute, critère : avoir été incompris","ma copine est au Canada, vous la connaissez pas","c'est pas un trench-coat c'est un MANTEAU DE GUERRE","le jeu lag ou c'est ma vie ?","brb ma mère crie","je mange les pâtes crues pour gagner du temps","m'lady (je m'entraîne)","quelqu'un a déjà touché l'herbe ? ça fait quoi ?","le Vieux Sage m'a fait lire un post de 2004 pendant 40 minutes","je suis pas asocial, je suis en mode furtif","par pitié le khey, qqun pour les Archives en Mythique ?","AYAAA j'ai drop un Sticker Original Non Compressé","c'est la hess, il me reste 3 po","ISSOU, Maman m'a os en un coup","+1 le khey","je suis au 18-25 depuis 2011 et j'ai toujours 18 ans dans mon cœur","la Chouffe de la taverne rend 55 % des PV, par pitié buvez-en","khey t'aurais pas 20 po ?","Gérard m'a racheté une Sauvegarde à 100 % pour 1 200 po, je pleure","l'Armure en Carton a pris l'eau, Bernard rembourse pas","les Kheys Enragés du Désert de Sel sont trop chiants, par pitié nerfez-les","Célestin un jour, Célestin toujours",...NOUVELLES_BOT_LINES];
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
  millio:["Brocanteur","Vendre pour 1 000 po d'artéfacts à Gérard."],
  diplome:["Diplômé (enfin)","Vaincre le Jury de la Soutenance en difficulté Sans Douche."]
};
export const HATS=[['#1d1b22','Noir Éternel'],['#6b6870','Gris Feutré'],['#6d2230','Bordeaux Audacieux'],['#4d3a22','Brun Vintage'],['#2a3a5c','Bleu Convention']];
export const MAXLVL=100;

// Lot 8 : les nouvelles zones s'ajoutent aux tables d'origine.
Object.assign(ZONES,NEW_ZONES);Object.assign(MOBS,NEW_MOBS);SPAWNS.push(...NEW_SPAWNS);NPCS.push(...NEW_NPCS);QUESTS.push(...NEW_QUESTS);
