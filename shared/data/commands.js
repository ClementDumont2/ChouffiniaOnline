// Table unique des commandes de chat : le serveur la lit pour dispatcher et filtrer par droit, le client pour l'autocomplétion.
// args : types d'arguments dans l'ordre ('joueur' est complété avec les pseudos connectés, 'texte' absorbe le reste).
export const COMMANDS=[
  {nom:'aide',alias:['help'],args:[],description:'Liste les commandes disponibles.'},
  {nom:'qui',alias:['who'],args:[],description:'Joueurs connectés, avec niveau et zone.'},
  {nom:'mp',alias:['w'],args:['joueur','texte'],description:'Chuchote un message privé.'},
  {nom:'inviter',alias:['invite'],args:['joueur'],description:'Invite un joueur dans votre groupe.'},
  {nom:'accepter',alias:['accept'],args:[],description:'Accepte la dernière invitation de groupe ou d\'échange.'},
  {nom:'quitter',alias:['leave'],args:[],description:'Quitte votre groupe.'},
  {nom:'echanger',alias:['trade'],args:['joueur'],description:'Propose un échange d\'objets et d\'or.'},
  {nom:'top',alias:[],args:[],description:'Classements : niveau, Archives, Chouffes.'},
  {nom:'danse',alias:['dance'],args:[],description:'Danse maladroitement.'},
  {nom:'mlady',alias:["m'lady"],args:[],description:'Soulève le fedora.'},
  {nom:'herbe',alias:[],args:[],description:'Tente de toucher l\'herbe.'},
  {nom:'khey',alias:[],args:[],description:'Par pitié le khey.'},
  {nom:'douche',alias:[],args:[],description:'Cherche la douche.'},
];
