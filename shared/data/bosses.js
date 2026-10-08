// Un boss = une liste de capacités. diffMin : difficulté minimale (indice de DIFFS : 0 Normal … 3 Sans Douche) à partir de laquelle elle existe.
// Le moteur (shared/sim.js, bossTick) lit ces données ; ajouter une capacité ne demande aucun code spécial tant qu'elle réutilise un type.
//   aoe     zone au sol incantée : n, r (rayon), cast (s), recharge [min,max] (s), ouverture (1re incantation, s), dmg (× Attaque max), textes
//   chain   « Citation en Chaîne » : un joueur est marqué, le coup rebondit sur les joueurs à moins de `jump` cases du précédent (max `jumps`), +25 % par rebond
//   summon  invoque `count` monstres `summon` quand les PV passent sous chaque valeur de seuilsPV
//   rage    à seuilPV : le boss frappe `mult` fois plus fort
//   shrink  à seuilPV : la zone de combat (centrée sur le boss) rétrécit de r0 à rMin en `duree` s ; dehors, `dmg` × Attaque max par seconde
//   enrage  après `apres` s de combat : dégâts × mult et attaques plus rapides
//   spots   `count` cercles au sol, posés sous des joueurs au début de l'incantation ; ceux qui y sont encore à la fin sont touchés. hitF accepte {n} (note tirée au hasard)
//   eject   après `apres` s de combat : tout le groupe est renvoyé hors du donjon (il se détruit : le boss repart à zéro)
//   recall  incantation interruptible (étourdissement, ou `interrupt` × PV max de dégâts pendant l'incantation) ; sinon le groupe est renvoyé à l'entrée du donjon
const COUPURE={id:'coupure',diffMin:0,type:'aoe',n:'Coupure du Wi-Fi',r:4.5,cast:2.6,ouverture:6,recharge:[8,10],dmg:2.2,
  warn:'Coupure du Wi-Fi ! Éloignez-vous de 4 cases !',hit:'coupe le Wi-Fi. Ping : infini.',hitF:'DÉCONNECTÉ',dodge:'Vous esquivez la Coupure du Wi-Fi en passant en 4G.',dodgeF:'Esquivé (4G)',
  shout:['JE COUPE LE WI-FI !','IL EST 23 H !','JE DÉBRANCHE LA BOX !']};
const MUR={id:'mur',diffMin:0,type:'aoe',n:'Mur de Texte',r:3.6,cast:2.6,ouverture:6,recharge:[8,10],dmg:2.2,
  warn:'Mur de Texte ! Sortez de la zone !',hit:'vous ensevelit sous 40 paragraphes.',hitF:'ENSEVELI',dodge:'Vous esquivez le Mur de Texte avec un « TL;DR ».',dodgeF:'TL;DR',
  shout:['LISEZ LE RÈGLEMENT !','RÉPONSE EN PAVÉ !','CITATION DE 2008 !']};

export const BOSSES={
  archiviste:{abilities:[
    MUR,
    {id:'colere',diffMin:0,type:'rage',seuilPV:.5,mult:1.3,say:'Je vais tout citer. TOUT.'},
    {id:'necros',diffMin:1,type:'summon',n:'Nécroposteurs',seuilsPV:[.66,.33],summon:'necro',count:2,say:'DÉTERREZ-MOI CES TOPICS !'},
    {id:'chaine',diffMin:2,type:'chain',n:'Citation en Chaîne',cast:2.2,ouverture:11,recharge:[12,15],jump:3.2,jumps:4,dmg:1.3,
      warn:'Citation en Chaîne ! Écartez-vous les uns des autres !',hit:'vous cite en entier.',hitF:'CITÉ'},
    {id:'verrou',diffMin:3,type:'shrink',n:'Topic Verrouillé',seuilPV:.3,r0:7,rMin:2.6,duree:25,dmg:.8,say:'CE TOPIC EST VERROUILLÉ. PLUS PERSONNE NE SORT.',hit:'vous enferme hors du topic'},
    {id:'delai',diffMin:3,type:'enrage',n:'Enrage',apres:240,mult:2.5,say:'LA DISCUSSION A DURÉ ASSEZ LONGTEMPS. ARCHIVAGE.'},
  ]},
  // Maman suit la même progression ; l'exploration du Rez-de-Chaussée n'a pas de difficulté choisie, elle tourne donc au niveau Normal.
  maman:{abilities:[
    COUPURE,
    {id:'colere',diffMin:0,type:'rage',seuilPV:.5,mult:1.3,say:"J'AI VU TON HISTORIQUE DE NAVIGATION."},
    {id:'cousins',diffMin:1,type:'summon',n:'Les Cousins',seuilsPV:[.66,.33],summon:'normie',count:2,say:'TES COUSINS VIENNENT DÎNER !'},
    {id:'sermon',diffMin:2,type:'chain',n:'Sermon en Chaîne',cast:2.2,ouverture:11,recharge:[12,15],jump:3.2,jumps:4,dmg:1.3,
      warn:'Sermon en Chaîne ! Écartez-vous les uns des autres !',hit:'vous compare à votre cousin.',hitF:'COMPARÉ'},
    {id:'couvrefeu',diffMin:3,type:'shrink',n:'Couvre-feu',seuilPV:.3,r0:7,rMin:2.6,duree:25,dmg:.8,say:'COUVRE-FEU ! TOUT LE MONDE À LA MAISON !',hit:'vous renvoie dans votre chambre'},
    {id:'vingtdeux',diffMin:3,type:'enrage',n:'22 h',apres:240,mult:2.5,say:"IL EST 22 H. J'AI DIT 22 H."},
  ]},
};

// ---- Lot 8 : boss des donjons à thème. Même progression que les Archives : Normal = signature, Héroïque = invocations, Mythique = chaîne, Sans Douche = verrouillage + enrage.
const PALIERS=(summon,sn,say1,chain,shrink,enr)=>[
  {id:'colere',diffMin:0,type:'rage',seuilPV:.5,mult:1.3,say:say1},
  {id:'renforts',diffMin:1,type:'summon',n:sn,seuilsPV:[.66,.33],summon,count:2,say:'RENFORTS ! ON ENVOIE DES RENFORTS !'},
  {id:'chaine',diffMin:2,type:'chain',cast:2.2,ouverture:11,recharge:[12,15],jump:3.2,jumps:4,dmg:1.3,...chain},
  {id:'verrou',diffMin:3,type:'shrink',seuilPV:.3,r0:7,rMin:2.6,duree:25,dmg:.8,...shrink},
  {id:'delai',diffMin:3,type:'enrage',apres:240,mult:2.5,...enr},
];
BOSSES.correcteur={abilities:[
  {id:'sujet',diffMin:0,type:'aoe',n:'Sujet de Dissertation',r:4.2,cast:2.6,ouverture:6,recharge:[9,11],dmg:2.1,
    warn:'Sujet de Dissertation ! Sortez de la zone !',hit:'vous met la note de zéro pointé.',hitF:'Note : {n}/20',dodge:'Vous esquivez le sujet en écrivant « Cela dépend. ».',dodgeF:'Hors-sujet',
    shout:['LE BONHEUR EST-IL POSSIBLE ?','DISSERTEZ. VOUS AVEZ QUATRE HEURES.','PROBLÉMATIQUE, PLAN, CONCLUSION !']},
  {id:'copies',diffMin:0,type:'spots',n:'Copies à Corriger',count:3,r:2.2,cast:2.6,ouverture:12,recharge:[11,14],dmg:1.6,
    warn:'Des copies tombent au sol ! Ne restez pas dessus !',hit:'vous colle une rature.',hitF:'Note : {n}/20'},
  ...PALIERS('delegue','Délégués de Classe','TOUS LES DEVOIRS SONT À RENDRE !',
    {n:'Barème en Chaîne',warn:'Barème en Chaîne ! Écartez-vous les uns des autres !',hit:'vous barème en cascade.',hitF:'BARÉMÉ'},
    {n:'Fin de l\'Épreuve',say:'FIN DE L\'ÉPREUVE ! POSEZ VOS STYLOS !',hit:'vous retire du sujet'},
    {n:'Sonnerie',say:'LA SONNERIE A RETENTI. RENDEZ VOS COPIES.'}),
]};
BOSSES.gerant={abilities:[
  {id:'annonce',diffMin:0,type:'aoe',n:'Annonce au Micro',r:4,cast:2.6,ouverture:6,recharge:[8,10],dmg:2.2,
    warn:'Annonce au Micro ! Éloignez-vous des haut-parleurs !',hit:'vous annonce la fermeture.',hitF:'FERMÉ',dodge:'Vous couvrez vos oreilles avec un rouleau de papier toilette.',dodgeF:'Sourd',
    shout:['LE MAGASIN VA FERMER SES PORTES !','IL EST 21 H 59 !','VEUILLEZ VOUS DIRIGER VERS LES CAISSES !']},
  {id:'rideau',diffMin:0,type:'eject',n:'22 h 00',apres:180,say:'22 H 00. LE RIDEAU TOMBE.',msg:'22 h 00 : le rideau de fer tombe, le groupe est évacué du magasin.'},
  {id:'etiquettes',diffMin:2,type:'spots',n:'Étiquettes Rouges',count:3,r:2.2,cast:2.6,ouverture:14,recharge:[12,15],dmg:1.6,
    warn:'Des étiquettes −70 % tombent au sol ! Ne restez pas dessus !',hit:'vous colle une étiquette rouge.',hitF:'−70 %'},
  {id:'colere',diffMin:0,type:'rage',seuilPV:.5,mult:1.3,say:'JE FERME ! ET JE ME FOUS DE VOS COURSES !'},
  {id:'renforts',diffMin:1,type:'summon',n:'Promos −70 %',seuilsPV:[.66,.33],summon:'promo',count:2,say:'TOUT DOIT DISPARAÎTRE !'},
  {id:'chaine',diffMin:2,type:'chain',n:'Caddie en Chaîne',cast:2.2,ouverture:11,recharge:[12,15],jump:3.2,jumps:4,dmg:1.3,
    warn:'Caddie en Chaîne ! Écartez-vous les uns des autres !',hit:'vous emboutit.',hitF:'EMBOUTI'},
  {id:'verrou',diffMin:3,type:'shrink',n:'Verrouillage du Magasin',seuilPV:.3,r0:7,rMin:2.6,duree:25,dmg:.8,say:'PORTES VERROUILLÉES !',hit:'vous enferme hors du rayon'},
  {id:'delai',diffMin:3,type:'enrage',n:'Alarme Générale',apres:150,mult:2.5,say:'ALARME ! ALARME ! TOUT LE MONDE DEHORS !'},
]};
BOSSES.guichet={abilities:[
  {id:'tampon',diffMin:0,type:'aoe',n:'Tampon Administratif',r:4,cast:2.6,ouverture:6,recharge:[9,11],dmg:2.2,
    warn:'Tampon Administratif ! Sortez de la zone !',hit:'vous tamponne « REFUSÉ ».',hitF:'REFUSÉ',dodge:'Vous esquivez le tampon avec une pièce justificative.',dodgeF:'Pièce jointe',
    shout:['PROCHAIN !','VOTRE DOSSIER EST INCOMPLET !','CE N\'EST PAS LE BON GUICHET !']},
  {id:'revenez',diffMin:0,type:'recall',n:'Revenez Demain',cast:5,interrupt:.05,ouverture:14,recharge:[22,26],
    warn:'« REVENEZ DEMAIN » ! Interrompez-le (étourdissement ou gros dégâts) !',say:'REVENEZ DEMAIN.',msg:'« Revenez demain » : le groupe est renvoyé à l\'entrée du labyrinthe.'},
  ...PALIERS('cerfa','Formulaires Cerfa','VOUS AVEZ OUBLIÉ UNE PIÈCE !',
    {n:'Pièce Manquante en Chaîne',warn:'Pièce Manquante en Chaîne ! Écartez-vous les uns des autres !',hit:'vous réclame un justificatif.',hitF:'JUSTIFICATIF'},
    {n:'Fermeture Imminente',say:'LE GUICHET FERME. LE GUICHET FERME. LE GUICHET FERME.',hit:'vous renvoie dans la file'},
    {n:'Pause Déjeuner',say:'C\'EST L\'HEURE DE LA PAUSE DÉJEUNER. DE MA PAUSE DÉJEUNER.'}),
]};

// ---- Lot 9 : Mangaka Épuisé (jauge Deadline) et Jury de la Soutenance (3 boss, une mécanique chacun) ----
//   adds    comme `summon`, mais toutes les `recharge` s (sans incantation) ; au plus `max` invocations vivantes
//   gauge   jauge « Deadline » : se remplit en duree[difficulté] s (+perAdd par invocation vivante) ; pleine, le boss frappe mult fois plus fort
//   raid    incantation qui touche tous les joueurs ; interruptible comme `recall`
BOSSES.mangaka={abilities:[
  {id:'pinceau',diffMin:0,type:'aoe',n:'Coup de Pinceau',r:4.4,cast:2.6,ouverture:6,recharge:[9,11],dmg:2.2,
    warn:'Coup de Pinceau ! Sortez de la zone !',hit:'vous dessine en super-déformé.',hitF:'ENCRÉ',dodge:'Vous esquivez le coup de pinceau en sortant du cadre.',dodgeF:'Hors cadre',
    shout:['ENCORE UNE PLANCHE !','LE CHAPITRE EST POUR CE SOIR !','PAS DE PAUSE !']},
  {id:'assistants',diffMin:0,type:'adds',n:'Assistants',summon:'assistant',count:2,max:6,ouverture:8,recharge:[20,24],say:'ASSISTANTS ! AU TRAVAIL !'},
  {id:'deadline',diffMin:0,type:'gauge',n:'Deadline',duree:[240,200,170,140],perAdd:.15,mult:2.5,say:'DEADLINE ! LE CHAPITRE EST POUR HIER !'},
  {id:'colere',diffMin:0,type:'rage',seuilPV:.5,mult:1.3,say:"JE N'AI PAS FINI MON CHAPITRE !"},
  {id:'taches',diffMin:1,type:'spots',n:"Taches d'Encre",count:3,r:2.2,cast:2.6,ouverture:12,recharge:[11,14],dmg:1.6,
    warn:"Des taches d'encre tombent au sol ! Ne restez pas dessus !",hit:"vous tache d'encre.",hitF:'TACHÉ'},
  {id:'esquisse',diffMin:2,type:'chain',n:'Esquisse en Chaîne',cast:2.2,ouverture:11,recharge:[12,15],jump:3.2,jumps:4,dmg:1.3,
    warn:'Esquisse en Chaîne ! Écartez-vous les uns des autres !',hit:'vous esquisse au crayon.',hitF:'ESQUISSÉ'},
  {id:'pleine_page',diffMin:3,type:'shrink',n:'Planche Pleine Page',seuilPV:.3,r0:7,rMin:2.6,duree:25,dmg:.8,say:'PLEINE PAGE ! TOUT LE MONDE DANS LE CADRE !',hit:'vous rature hors cadre'},
]};
// Chaque juré : une question signature, un coup de zone, et la progression habituelle (diffMin 1 à 3). Quand l'un tombe, les autres durcissent (voir killMob).
const juré=(sig,extra)=>[
  {id:'rage',diffMin:0,type:'rage',seuilPV:.5,mult:1.3,say:"JE NE SUIS PAS CONVAINCU."},
  ...sig,...extra,
  {id:'delai',diffMin:3,type:'enrage',n:'Temps de Parole',apres:240,mult:2.5,say:'VOTRE TEMPS DE PAROLE EST ÉCOULÉ.'},
];
const zone=(id,n,hit,hitF,shout)=>({id,diffMin:0,type:'aoe',n,r:4,cast:2.6,ouverture:6,recharge:[9,11],dmg:2,warn:`${n} ! Sortez de la zone !`,hit,hitF,dodge:`Vous esquivez ${n}.`,dodgeF:'Esquivé',shout});
BOSSES.jury_secu={abilities:juré(
  [zone('audit','Audit de Sécurité','vous trouve une faille.','FAILLE',['ET LA SÉCURITÉ ?','VOS MOTS DE PASSE SONT EN CLAIR !','C\'EST EN HTTP ? EN 2031 ?'])],
  [{id:'xss',diffMin:1,type:'spots',n:'Failles XSS',count:2,r:2.2,cast:2.6,ouverture:12,recharge:[12,15],dmg:1.6,warn:'Des failles XSS apparaissent ! Ne restez pas dessus !',hit:'injecte un script.',hitF:'INJECTÉ'},
   {id:'escalade',diffMin:2,type:'chain',n:'Escalade de Privilèges',cast:2.2,ouverture:11,recharge:[12,15],jump:3.2,jumps:4,dmg:1.3,warn:'Escalade de Privilèges ! Écartez-vous les uns des autres !',hit:'vous passe root.',hitF:'ROOT'}])};
BOSSES.jury_tests={abilities:juré(
  [{id:'regression',diffMin:0,type:'raid',n:'Régression Générale',cast:4,interrupt:.04,ouverture:10,recharge:[18,22],dmg:2.4,
    warn:'« VOUS AVEZ DES TESTS ? » Régression générale : interrompez-le (étourdissement ou gros dégâts) !',shout:['VOUS AVEZ DES TESTS ?','COUVERTURE : 3 %. ET 100 % DU CŒUR.'],hit:'casse tout ce qui marchait.',hitF:'RÉGRESSION'},
   zone('unitaire','Test Unitaire Échoué','vous met au rouge.','ROUGE',['LA CI EST ROUGE !','ÇA NE PASSE PAS EN LOCAL ?'])],
  [{id:'bugs',diffMin:1,type:'adds',n:'Bugs de Régression',summon:'bug',count:1,max:3,ouverture:12,recharge:[24,28],say:'UN BUG DE RÉGRESSION !'},
   {id:'cascade',diffMin:2,type:'chain',n:'Cascade de Tests Rouges',cast:2.2,ouverture:11,recharge:[12,15],jump:3.2,jumps:4,dmg:1.3,warn:'Cascade de Tests Rouges ! Écartez-vous les uns des autres !',hit:'vous fait échouer en cascade.',hitF:'ÉCHEC'}])};
BOSSES.jury_archi={abilities:juré(
  [zone('uml','Diagramme UML','vous dessine un diagramme.','UML',['POURQUOI PAS UNE CLEAN ARCHITECTURE ?','CE CONTRÔLEUR FAIT TROIS CHOSES !','JE VOIS DIX COUCHES. IL EN FAUT DOUZE.'])],
  [{id:'couches',diffMin:1,type:'adds',n:'Couches Supplémentaires',summon:'bug',count:2,max:4,ouverture:12,recharge:[24,28],say:'AJOUTEZ DES COUCHES !'},
   {id:'circulaires',diffMin:2,type:'spots',n:'Dépendances Circulaires',count:3,r:2.2,cast:2.6,ouverture:12,recharge:[12,15],dmg:1.6,warn:'Des dépendances circulaires se forment ! Ne restez pas dessus !',hit:'vous renvoie à votre point de départ.',hitF:'CYCLE'}])};

// Affixes des monstres d'élite (Mythique et Sans Douche), affichés sous leur nom.
export const AFFIXES={modere:'Modéré',epingle:'Épinglé',necroposte:'Nécroposté'};
