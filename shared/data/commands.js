// Table unique des commandes de chat : le serveur la lit pour dispatcher et filtrer par droit, le client pour l'autocomplétion.
// args : types d'arguments dans l'ordre ('joueur' est complété avec les pseudos connectés, 'destination' avec les sanctuaires découverts puis les pseudos, 'texte' absorbe le reste).
export const COMMANDS=[
  {nom:'aide',alias:['help'],args:[],description:'Liste les commandes disponibles.'},
  {nom:'qui',alias:['who'],args:[],description:'Joueurs connectés, avec niveau et zone.'},
  {nom:'mp',alias:['w'],args:['joueur','texte'],description:'Chuchote un message privé.'},
  {nom:'inviter',alias:['invite'],args:['joueur'],description:'Fait venir un joueur dans votre donjon.'},
  {nom:'accepter',alias:['accept'],args:[],description:'Accepte la dernière invitation (donjon, guilde, échange ou duel).'},
  {nom:'guilde',alias:['guild'],args:['texte'],description:'Fonde une guilde ; sans nom, liste ses membres connectés.'},
  {nom:'recruter',alias:['recruit'],args:['joueur'],description:'Propose à un joueur de rejoindre votre guilde.'},
  {nom:'quitter',alias:['leave'],args:[],description:'Quitte votre guilde.'},
  {nom:'g',alias:[],args:['texte'],description:'Parle au canal de votre guilde.'},
  {nom:'echanger',alias:['trade'],args:['joueur'],description:'Propose un échange d\'objets et d\'or.'},
  {nom:'duel',alias:[],args:['joueur'],description:'Défie un joueur dans l\'Arène du Débat Stérile.'},
  {nom:'tp',alias:['voyage'],args:['destination'],description:'Voyage vers un sanctuaire découvert ou un joueur, depuis un sanctuaire ; seul, liste les sanctuaires.'},
  {nom:'top',alias:[],args:[],description:'Classements : niveau, Archives, Chouffes.'},
  {nom:'danse',alias:['dance'],args:[],description:'Danse maladroitement.'},
  {nom:'mlady',alias:["m'lady"],args:[],description:'Soulève le fedora.'},
  {nom:'herbe',alias:[],args:[],description:'Tente de toucher l\'herbe.'},
  {nom:'khey',alias:[],args:[],description:'Par pitié le khey.'},
  {nom:'annonce',alias:[],args:['texte'],description:'Bannière dorée chez tous les joueurs.',droit:'annonce'},
  {nom:'douche',alias:[],args:[],description:'Cherche la douche.'},
];
