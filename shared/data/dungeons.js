// Donjons : mêmes quatre difficultés que DIFFS (index 0 à 3), avec leurs propres niveaux, XP et or.
//   npc      PNJ d'entrée (menu des difficultés) ; exit : où l'on ressort dans le monde
//   boss     type de MOBS ; kinds : monstres ordinaires (ceux de la zone, remis au niveau du donjon)
//   diffs    surcharges de DIFFS par difficulté (L = niveau des monstres, rl = niveau requis, bonus = XP de fin, gold = or du coffre)
//   unique   équipement légendaire du coffre : chance par difficulté (les Archives gardent le grimoire de DIFFS.grim)
export const DUNGEONS={
  archives:{n:"Les Archives Oubliées",court:"les Archives",fini:'Archives terminées',sortie:'Sortie des Archives',coffre:'Coffre des Archives',retour:'Vous remontez au Bourg-Forum. La lumière du jour vous agresse un peu.',arrivee:"L'air sent le vieux papier et le topic verrouillé.",npc:'gardien',exit:{x:21.5,y:20.4},boss:'archiviste',kinds:['spam','necro','fantome','pave'],unique:null},
  bac:{n:"Le Bac de 2012",court:"le Bac de 2012",fini:'Bac de 2012 terminé',sortie:'Sortie de la salle d\'examen',coffre:'Coffre du Bac de 2012',retour:'Vous ressortez de la salle d\'examen. Il fait jour. Il y a un parking.',arrivee:"Ça sent le sujet photocopié et l'angoisse.",npc:'porte_bac',exit:{x:110.5,y:12},boss:'correcteur',kinds:['delegue','scooter','souvenir'],
    diffs:[{L:15,rl:15,bonus:1200,gold:300},{L:18,rl:18,bonus:2000,gold:700},{L:21,rl:21,bonus:3300,gold:1500},{L:25,rl:25,bonus:5400,gold:3500}],
    unique:{item:'copie_double',chance:[0,0,.25,.4]}},
  reserve:{n:"La Réserve",court:"la Réserve",fini:'Réserve terminée',sortie:'Sortie de la Réserve',coffre:'Coffre de la Réserve',retour:'Vous ressortez de la Réserve. Le magasin est toujours à 21 h 58.',arrivee:"Ça sent le carton mouillé et la fermeture imminente.",npc:'porte_reserve',exit:{x:112.6,y:29.4},boss:'gerant',kinds:['caddie','vigile','promo'],
    diffs:[{L:25,rl:25,bonus:2700,gold:600},{L:29,rl:29,bonus:4400,gold:1300},{L:34,rl:34,bonus:7200,gold:2700},{L:40,rl:40,bonus:12000,gold:6000}],
    unique:{item:'palette_or',chance:[0,0,.25,.4]}},
  labyrinthe:{n:"Le Labyrinthe Administratif",court:"le Labyrinthe",fini:'Labyrinthe terminé',sortie:'Sortie du Labyrinthe',coffre:'Coffre du Labyrinthe',retour:'Vous ressortez du Labyrinthe, un formulaire à la main. Vous ne savez pas lequel.',arrivee:"Ça sent l'encre de tampon et l'attente.",npc:'porte_labyrinthe',exit:{x:110.6,y:51.4},boss:'guichet',kinds:['cerfa','file','conseillerabs'],
    diffs:[{L:40,rl:40,bonus:7000,gold:1500},{L:45,rl:45,bonus:10000,gold:3000},{L:50,rl:50,bonus:15000,gold:5500},{L:55,rl:55,bonus:23000,gold:11000}],
    unique:{item:'cerfa_dore',chance:[0,0,.25,.4]}},
};
