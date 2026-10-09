// Monstres des trois zones du Lot 8. Pas de PV/Attaque fixes : ils suivent la formule de statsDeMob au niveau l (le donjon les reprend à son propre niveau).
export const NEW_MOBS={
  delegue:{n:"Ex-Délégué de Classe",l:16,hpM:1,atkM:1,sp:2,ag:4.5,cd:1.7,hgt:1.2,v:"vous colle une heure de retenue",
    lines:["Je parle au nom de la classe.","Votre absence sera notée.","Qui est volontaire ? Personne ? Vous alors."],loot:[['chips',.35],['poignee',.3],['gilet',.04],['chouffe',.1]]},
  scooter:{n:"Scooter Débridé",l:20,hpM:.9,atkM:1.1,sp:3.4,ag:5,cd:1.4,hgt:1,v:"vous passe dessus à 80 km/h",
    lines:["*PRRRRRRRR*","Ça sent le 50 cm³ trafiqué.","Wheeling !"],loot:[['chips',.35],['poignee',.3],['jeans_craie',.04]]},
  souvenir:{n:"Souvenir Gênant",l:24,hpM:1.1,atkM:1,sp:1.8,ag:4,cd:1.8,hgt:1.2,v:"vous rappelle ce que vous avez dit en 4e",
    lines:["Tu te souviens de ta coupe en 2009 ?","Le slow avec personne.","Tu as dit « merci, toi aussi » au serveur."],loot:[['chips',.35],['poignee',.3],['casquette_cpe',.04]]},
  caddie:{n:"Caddie Fou",l:28,hpM:.95,atkM:1.1,sp:3.1,ag:5,cd:1.5,hgt:1,v:"vous fonce dans les tibias",
    lines:["*CLING CLING CLING*","Une roue qui tourne dans le vide.","Rendez-moi ma pièce."],loot:[['chips',.35],['poignee',.3],['blouse',.04],['chouffe',.1]]},
  vigile:{n:"Vigile Fatigué",l:33,hpM:1.5,atkM:.8,sp:1.3,ag:3.5,cd:2,hgt:1.25,v:"vous fouille avec un soupir",
    lines:["Votre sac, s'il vous plaît.","Il me reste quarante minutes de service. Et quarante ans.","J'ai vu des choses dans les rayons."],loot:[['chips',.35],['poignee',.3],['tablier',.04]]},
  promo:{n:"Promo −70 %",l:38,hpM:.8,atkM:1.4,sp:2.4,ag:5,cd:1.4,hgt:1.1,v:"vous annonce que c'est « jusqu'à » −70 %",
    lines:["−70 % SUR LE SECOND ARTICLE !","Offre non cumulable.","Dans la limite des stocks. Il n'y a plus de stock."],loot:[['chips',.35],['poignee',.3],['gants_caisse',.04]]},
  cerfa:{n:"Formulaire Cerfa Vivant",l:42,hpM:.9,atkM:1.2,sp:2.2,ag:5,cd:1.5,hgt:1.1,v:"vous réclame une pièce justificative",
    lines:["Cadre 4 : veuillez noircir.","Il manque un justificatif de domicile.","Cerfa n° 12345*03. Version obsolète."],loot:[['chips',.35],['poignee',.3],['cravate',.04],['chouffe',.1]]},
  file:{n:"File d'Attente",l:48,hpM:1.6,atkM:.7,sp:1,ag:4,cd:2.2,hgt:1.2,v:"vous passe devant, par principe",
    lines:["On attend. On attend.","Vous n'avez pas de ticket ? Vous attendrez aussi.","Moi je suis là depuis ce matin."],loot:[['chips',.35],['poignee',.3],['pantalon_tailleur',.04]]},
  conseillerabs:{n:"Conseiller Absent",l:53,hpM:1.2,atkM:1.2,sp:2,ag:4,cd:1.7,hgt:1.25,v:"vous reçoit sur rendez-vous, dans trois mois",
    lines:["Je suis absent. Laissez un message.","Ce n'est pas mon service.","Revenez avec le bon formulaire."],loot:[['chips',.35],['poignee',.3],['badge_pe',.04]]},
  // Boss de donjon (moteur de shared/data/bosses.js).
  correcteur:{n:"Le Correcteur de Philo",dg:1,boss:1,hpM:5.5,atkM:1.05,sp:2,ag:6,cd:1.9,hgt:2.1,scale:1.6,yn:'Le Correcteur de Philo',v:"vous met 4/20 « hors-sujet »",
    lines:["Le bonheur est-il possible ?","Vous avez quatre heures. Vous en avez perdu trois à lire le sujet.","Une problématique, des parties, une conclusion. Votre vie manque des trois."]},
  gerant:{n:"Le Gérant de 21 h 59",dg:1,boss:1,hpM:5.5,atkM:1.05,sp:2.1,ag:6,cd:1.9,hgt:2.05,scale:1.6,yn:'Le Gérant',v:"vous annonce la fermeture",
    lines:["Il reste une minute. Une minute !","Qui a laissé ce caddie ici ?","Je ferme. Je ferme. Je FERME.","Je vous demande de vous diriger vers la sortie. Vers la sortie !"]},
  guichet:{n:"Le Guichet Fermé",dg:1,boss:1,hpM:5.5,atkM:1.05,sp:1.9,ag:6,cd:2,hgt:2.1,scale:1.6,yn:'Le Guichet Fermé',v:"vous tamponne « refusé »",
    lines:["Le guichet ferme dans cinq minutes.","Il vous manque une pièce.","Prochain !","Ce n'est pas le bon guichet."]},
};

// ---- Lot 9 : Convention Manga/Anime (55–75) et DIIAGE (75–100) ----
Object.assign(NEW_MOBS,{
  otaku:{n:"Otaku Collectionneur",l:58,hpM:1.2,atkM:1,sp:1.9,ag:4.5,cd:1.8,hgt:1.25,v:"vous explique le lore pendant 40 minutes",
    lines:["En fait, dans le manga c'était différent.","Tu n'as pas vu l'épisode 312 ? Impossible.","Ne touche pas à mes figurines. Ne regarde pas mes figurines."],loot:[['chips',.35],['poignee',.3],['gants_manga',.04],['chouffe',.1]]},
  cosplayeur:{n:"Cosplayeur Possédé",l:65,hpM:1,atkM:1.3,sp:2.3,ag:5,cd:1.5,hgt:1.3,v:"vous frappe avec une épée en mousse enchantée",
    lines:["JE SUIS LE PERSONNAGE !","Ne m'appelle pas par mon vrai prénom.","Cette perruque a trois âmes dedans."],loot:[['chips',.35],['poignee',.3],['perruque',.04]]},
  isekai:{n:"Fan d'Isekai",l:72,hpM:1.1,atkM:1.2,sp:2,ag:5,cd:1.6,hgt:1.25,v:"vous renverse avec un camion invisible",
    lines:["Je me suis réincarné ! Ça se voit pas ?","Statut : niveau 1. Compétence : plainte.","Le camion m'a dit que j'étais élu."],loot:[['chips',.35],['poignee',.3],['hakama',.04]]},
  assistant:{n:"Assistant du Mangaka",l:60,hpM:.7,atkM:.9,sp:2.4,ag:5,cd:1.4,hgt:1.1,v:"vous tend une planche à retoucher",
    lines:["Maître, j'ai fini la trame !","Je n'ai pas dormi depuis jeudi.","Encore une planche ? Bien sûr, Maître."],loot:[]},
  bug:{n:"Bug en Prod",l:78,hpM:.9,atkM:1.4,sp:2.9,ag:5,cd:1.3,hgt:1,v:"plante votre serveur un vendredi à 17 h 59",
    lines:["It works on my machine.","NullPointerException","Ça ne devrait pas arriver. Ça arrive."],loot:[['chips',.35],['poignee',.3],['sweat_diiage',.04],['chouffe',.1]]},
  standup:{n:"Daily Standup de 45 Minutes",l:88,hpM:1.6,atkM:.9,sp:1,ag:4.5,cd:2,hgt:1.25,v:"vous demande où vous en êtes, en détail",
    lines:["Hier, j'ai fait... en fait, tu veux que je détaille ?","Un point rapide. Quarante-cinq minutes.","Je n'ai pas de blocage. J'ai trois cents remarques."],loot:[['chips',.35],['poignee',.3],['badge_diiage',.04]]},
  retard:{n:"Étudiant en Retard de Rendu",l:97,hpM:1,atkM:1.5,sp:2.8,ag:5,cd:1.4,hgt:1.2,v:"vous demande 5 minutes de plus",
    lines:["Je n'ai pas eu le temps. Je n'ai jamais le temps.","C'est à rendre pour minuit ? C'était hier ?","J'ai tout fini, il manque juste... tout."],loot:[['chips',.35],['poignee',.3],['jean_rendu',.04]]},
  // Boss de donjon
  mangaka:{n:"Le Mangaka Épuisé",dg:1,boss:1,hpM:5.5,atkM:1.05,sp:2,ag:6,cd:1.9,hgt:2.1,scale:1.6,yn:'Le Mangaka',v:"vous dessine en super-déformé",
    lines:["Encore une planche… encore une…","Mon éditeur m'a promis du repos. En 2034.","Ça vous plaît le chapitre 1 000 ? Moi je le déteste.","Je dessine, donc je suis. Mais je ne dors pas."]},
  jury_secu:{n:"Jury : Le Sécurité",dg:1,boss:1,hpM:2.4,atkM:1,sp:1.9,ag:6,cd:1.9,hgt:2,scale:1.45,yn:'Le Jury de Sécurité',v:"vous trouve une faille",
    lines:["Et la sécurité ?","Vos mots de passe sont dans le code. Dans le code !","C'est en HTTP ? En 2031 ?"]},
  jury_tests:{n:"Jury : Le Testeur",dg:1,boss:1,hpM:2.4,atkM:1,sp:1.9,ag:6,cd:1.9,hgt:2,scale:1.45,yn:'Le Jury de Tests',v:"vous demande la couverture",
    lines:["Vous avez des tests ?","Couverture : 3 %. Et 100 % du cœur.","Je lance la CI. Ça va être long."]},
  jury_archi:{n:"Jury : L'Architecte",dg:1,boss:1,hpM:2.4,atkM:1,sp:1.9,ag:6,cd:1.9,hgt:2,scale:1.45,yn:"Le Jury d'Architecture",v:"vous dessine un diagramme",
    lines:["Pourquoi pas une Clean Architecture ?","Ce contrôleur fait trois choses. C'est deux de trop.","Je vois dix couches. Il en faudrait douze."]},
});

// ---- Lot 10 : un boss par zone de la carte du monde, au niveau du haut de sa zone. look : monstre de la zone dont il reprend le sprite (agrandi par scale).
// Capacités dans bosses.js ; il réapparaît 75 s après sa mort, et son butin d'équipement prend son niveau.
const bossZone=(n,yn,look,l,hgt,v,lines,loot,fem)=>({n,yn,look,l,boss:1,hpM:4,atkM:1.1,sp:2,ag:5,cd:1.9,hgt,scale:1.7,v,lines,loot:[['chouffe',1],...loot],...(fem?{fem:1}:{})});
Object.assign(NEW_MOBS,{
  gazon:bossZone("Le Gazon Anglais Suprême","Le Gazon Suprême",'herbe',3,1.6,"vous interdit de marcher sur la pelouse",["PELOUSE INTERDITE.","Tondu à 4 mm. Toi aussi, bientôt.","Personne ne m'a jamais touché. Personne."],[['katana',.35]]),
  chad:bossZone("Chad, le Normie Alpha","Chad",'normie',4,2,"vous parle de sa salle de sport",["Tu soulèves combien ?","J'ai couru un semi ce matin. Et toi ?","On va boire un verre avec les collègues, tu viens ? Non ? Normal."],[['casque',.35]]),
  zenith:bossZone("Le Soleil de Midi Pile","Le Soleil de Midi",'soleil',5,2.2,"vous colle un coup de soleil de niveau 5",["IL EST MIDI.","INDICE UV : 11.","Crème solaire ? Tu n'en as jamais acheté."],[['sabre',.35]]),
  modo_supreme:bossZone("Le Modo Suprême","Le Modo Suprême",'modo',7,2,"vous bannit de tous les serveurs à la fois",["BAN GLOBAL.","J'ai lu tous vos messages. Tous.","Je modère ce forum depuis 2006. Bénévolement. Pour l'éternité."],[['resine',.3],['clavier',.2]]),
  lag_ancestral:bossZone("Le Lag Ancestral (9 999 ms)","Le Lag Ancestral",'lag',8,2,"vous renvoie trois secondes en arrière",["…","Ping : oui.","Je suis arrivé avant toi. Tu ne m'as vu qu'après."],[['eva',.3]]),
  khey_originel:bossZone("Le Khey Originel (Inscrit en 2011)","Le Khey Originel",'khey',10,2,"vous rappelle que c'était mieux avant",["J'ÉTAIS LÀ AVANT TOI, KHEY.","PAR PITIÉ. LE. KHEY.","Le premier « AYAAA », c'était moi."],[['flamme',.3],['art_topic',.2]]),
  serveur_prod:bossZone("Le Serveur de Prod (Ne Pas Redémarrer)","Le Serveur de Prod",'serveur',12,2.3,"vous déploie un vendredi à 17 h",["UPTIME : 4 012 JOURS.","NE ME REDÉMARREZ PAS.","Qui a lancé un rm -rf ?"],[['heaume',.3],['grimoire',.1]]),
  proviseur:bossZone("Le Proviseur Adjoint","Le Proviseur Adjoint",'delegue',26,2,"vous convoque dans son bureau",["DANS MON BUREAU. TOUT DE SUITE.","Vos parents seront prévenus.","J'ai votre dossier depuis la 6e."],[['casquette_cpe',.25],['copie_double',.08]]),
  vigile_chef:bossZone("Le Chef de la Sécurité","Le Chef de la Sécurité",'vigile',41,2.1,"vous retient à la sortie pendant une heure",["Ouvrez votre sac.","Le portique a sonné. Il sonne toujours.","Vingt ans de service. Zéro voleur attrapé. Vous serez le premier."],[['pantalon_stock',.25],['palette_or',.08]]),
  directeur:bossZone("Le Directeur d'Agence (Introuvable)","Le Directeur d'Agence",'conseillerabs',56,2.1,"vous radie pour absence à un rendez-vous fictif",["Je suis en réunion.","Mon bureau est au fond. Il n'y a pas de fond.","Votre dossier ? Quel dossier ?"],[['pantalon_tailleur',.25],['cerfa_dore',.08]]),
  cosplay_ultime:bossZone("Le Cosplayeur Ultime (Forme Finale)","Le Cosplayeur Ultime",'cosplayeur',76,2.2,"vous attaque avec sa vraie épée en mousse",["CECI N'EST MÊME PAS MA FORME FINALE.","Six cents heures de couture.","Ne touchez pas à la cape. Personne ne touche à la cape."],[['hakama',.25],['plume_or',.08]]),
  heisenbug:bossZone("Le Heisenbug","Le Heisenbug",'bug',100,1.8,"disparaît dès qu'on l'observe, puis vous frappe",["Ça marche chez moi.","Je n'apparais qu'en prod.","Ajoutez un console.log. Je disparais."],[['jean_rendu',.25],['diplome_epee',.08]]),
});
