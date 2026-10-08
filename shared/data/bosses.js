// Un boss = une liste de capacités. diffMin : difficulté minimale (indice de DIFFS : 0 Normal … 3 Sans Douche) à partir de laquelle elle existe.
// Le moteur (shared/sim.js, bossTick) lit ces données ; ajouter une capacité ne demande aucun code spécial tant qu'elle réutilise un type.
//   aoe     zone au sol incantée : n, r (rayon), cast (s), recharge [min,max] (s), ouverture (1re incantation, s), dmg (× Attaque max), textes
//   chain   « Citation en Chaîne » : un joueur est marqué, le coup rebondit sur les joueurs à moins de `jump` cases du précédent (max `jumps`), +25 % par rebond
//   summon  invoque `count` monstres `summon` quand les PV passent sous chaque valeur de seuilsPV
//   rage    à seuilPV : le boss frappe `mult` fois plus fort
//   shrink  à seuilPV : la zone de combat (centrée sur le boss) rétrécit de r0 à rMin en `duree` s ; dehors, `dmg` × Attaque max par seconde
//   enrage  après `apres` s de combat : dégâts × mult et attaques plus rapides
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

// Affixes des monstres d'élite (Mythique et Sans Douche), affichés sous leur nom.
export const AFFIXES={modere:'Modéré',epingle:'Épinglé',necroposte:'Nécroposté'};
