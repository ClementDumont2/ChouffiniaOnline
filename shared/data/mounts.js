// speed : bonus de vitesse de déplacement (0,3 = +30 %). Sans seller : obtenue autrement (voir MAMAN_KILLS).
export const MOUNTS={
  chaise:{n:"Chaise de Gamer à Roulettes",speed:.3,price:400,rl:10,seller:'kevin',r:'unc',d:"Ergonomique, RGB, et surtout à roulettes. +30 % de vitesse. Le dossier s'incline, la dignité aussi."},
  trottinette:{n:"Trottinette Électrique de Kévin",speed:.5,price:2500,rl:30,seller:'kevin',r:'epic',d:"Kévin l'a « à peine utilisée ». Garantie : aucune. +50 % de vitesse. Casque non fourni."},
  maman:{n:"La Maman qui te dépose en voiture",speed:.8,r:'leg',d:"Elle te dépose où tu veux, mais elle commente. +80 % de vitesse. Légendaire, et humiliante.",
    lines:["Mets ta ceinture.","Tu as pris un pull ?","Ton cousin, lui, il a le permis.","Je ne te dépose pas devant. Tes amis me connaissent.","T'as mangé ce matin ? Des vrais aliments ?","Regarde la route, pas ton téléphone. Ah non, c'est moi qui conduis.","Tu me dis quand tu es arrivé. Même si tu es arrivé.","À ton âge, ton père avait déjà une voiture.","Je mets la radio. Non, pas ta musique.","Tu sors encore ? Il fait nuit dès 17 h, je dis ça, je dis rien.","Tu as éteint la lumière du sous-sol ?","On a dit pas de bêtises. Je te vois dans le rétro.","Un jour tu me remercieras. Pas aujourd'hui.","Tu veux un sandwich ? J'en ai fait trois, par hasard.","Dis bonjour à la dame. Même si c'est un monstre."]}
};
// À défaut de difficulté « Sans Douche » pour Maman, la monture s'obtient en la battant 10 fois (haut fait « Le Wi-Fi Restera Allumé »).
export const MAMAN_KILLS=10;
