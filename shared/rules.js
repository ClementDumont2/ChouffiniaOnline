import {ITEMS,MOBS,DIFFS,ART_POOL,HATS,NPCS,QUESTS,RARITY_MULT} from './data.js';
import {rngTools} from './rng.js';
import {CLASSES,DEFAULT_CLASS,SKILL_DEFS} from './data/classes.js';
import {MOUNTS} from './data/mounts.js';
import {BOSSES} from './data/bosses.js';

export const clamp=(v,a,b)=>v<a?a:v>b?b:v,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Niveaux 1 à 15 : courbe d'origine (les parties existantes ne changent pas). Au-delà : XP d'un monstre du niveau × nombre de monstres à tuer pour monter,
// interpolé entre des points de repère réglés avec `npm run balance -- --ideal` (≈ 17 min/niveau vers 50, ≈ 35 min vers 90).
const OLD_XP=l=>40+45*(l-1)+15*(l-1)**2;
const KILLS=[[15,OLD_XP(15)/(4+12*15)],[50,55],[90,112],[100,126]];
export function xpNeed(l){
  if(l<=15)return Math.round(OLD_XP(l));
  const i=KILLS.findIndex(([lv])=>lv>=l),[l0,k0]=KILLS[i-1],[l1,k1]=KILLS[i];
  return Math.round((4+12*l)*(k0+(k1-k0)*(l-l0)/(l1-l0)));
}
// Stats de base par niveau : courbe d'origine jusqu'au niveau 15, puis croissance plus lente (l'équipement, qui grossit avec nObj, prend le relais).
export const baseStats=l=>{const e=Math.max(0,l-15),n=l-e;return{atk:4+2*(n-1)+Math.round(1.2*e),hp:60+15*(n-1)+11*e,caf:50+8*(n-1)+3*e}};
export const classOf=S=>CLASSES[S.cls]||CLASSES[DEFAULT_CLASS];
export const skillsOf=S=>classOf(S).skills.map(id=>({id,...SKILL_DEFS[id]}));
export function stats(S,drunk=0){const bs=baseStats(S.lvl);let atk=bs.atk,hp=bs.hp,arm=0;for(const k in S.eq){const q=S.eq[k];if(q){const i=itemStats(q);atk+=i.atk;hp+=i.hp;arm+=i.arm}}if(drunk>0)atk=Math.round(atk*1.15);const m=classOf(S).mods;hp=Math.round(hp*m.hp);arm=Math.round(arm*m.arm);atk=Math.round(atk*m.atk);return{atk,maxhp:hp,maxcaf:bs.caf,arm,red:arm/(arm+45),spd:m.spd}}

export const stackable=id=>ITEMS[id].t!=='eq';

// Un équipement est une instance { uid, id, nObj, rarete } : ITEMS donne les stats d'un objet à nObj = rl et rareté d'origine,
// et on les met à l'échelle × (1 + nObj/10) × multiplicateur de rareté. Les piles (consommables, artéfacts) restent { id, n }.
export const newItem=(id,nObj,rarete)=>{const it=ITEMS[id];return{id,nObj:Math.max(1,Math.floor(nObj||it.rl||1)),rarete:RARITY_MULT[rarete]?rarete:it.r}};
export const withUid=(S,x)=>({uid:'i'+(S.nextUid=(S.nextUid||0)+1),...x});
const scaleOf=q=>{const it=ITEMS[q.id];return(1+q.nObj/10)*RARITY_MULT[q.rarete]/((1+(it.rl||1)/10)*RARITY_MULT[it.r])};
export const itemStats=q=>{const it=ITEMS[q.id],f=scaleOf(q);return{atk:Math.round((it.atk||0)*f),hp:Math.round((it.hp||0)*f),arm:Math.round((it.arm||0)*f)}};
export const itemValue=q=>Math.max(1,Math.round(ITEMS[q.id].price*scaleOf(q)));
export const RARITY_ORDER=['common','unc','rare','epic','leg'];
// Fusion de deux équipements du même emplacement (fonction pure : le client s'en sert pour l'aperçu, le serveur pour trancher).
//  - même objet et même rareté : rareté +1 (plafond Légendaire), nObj = max + 2 ;
//  - sinon : base du meilleur des deux, nObj = max + 3, rareté la plus haute.
export function fuse(a,b){
  if(!a||!b||ITEMS[a.id].s!==ITEMS[b.id].s)return null;
  const ra=RARITY_ORDER.indexOf(a.rarete),rb=RARITY_ORDER.indexOf(b.rarete),n=Math.max(a.nObj,b.nObj);
  if(a.id===b.id&&a.rarete===b.rarete)return newItem(a.id,n+2,RARITY_ORDER[Math.min(RARITY_ORDER.length-1,ra+1)]);
  return newItem((score(a)>=score(b)?a:b).id,n+3,RARITY_ORDER[Math.max(ra,rb)]);
}
// 15 po par niveau d'objet du résultat : une dizaine de monstres d'or au niveau de l'objet.
export const FUSE_PER_LEVEL=15;
export const fuseCost=q=>FUSE_PER_LEVEL*q.nObj;
export function score(q){if(!q)return -1;const i=itemStats(q);return i.atk*3+i.hp+i.arm*3}

// Vitesse de déplacement relative : classe × monture (P.mount : id de la monture en selle, ou null).
export const moveSpeed=(S,P)=>stats(S).spd*(1+(P.mount&&MOUNTS[P.mount]?MOUNTS[P.mount].speed:0));

// Capacités à venir d'un boss, pour le cadre de cible : {n, t} (secondes avant) ou {n, pct} (à ce % de PV).
export function bossUpcoming(m){
  const B=m.b,out=[];
  for(const a of BOSSES[m.type].abilities){
    if(m.diff<a.diffMin||!a.n)continue;
    if(a.recharge)out.push({n:a.n,t:Math.max(0,Math.ceil(B.cd[a.id]??a.ouverture)),k:a.type});
    else if(a.apres!=null){if(!B.done[a.id])out.push({n:a.n,t:Math.max(0,Math.ceil(a.apres-B.t)),k:a.type})}
    else for(const th of a.seuilsPV||[a.seuilPV])if(!B.done[a.id+th])out.push({n:a.n,pct:Math.round(th*100),k:a.type});
  }
  return out;
}

export function statsDeMob(type,L){
  const d=MOBS[type];L=L||d.l;
  if(d.hp&&L===d.l)return{hp:d.hp,atk:d.atk,xp:d.xp,g:d.g};
  const am=d.atkM||1;
  return{hp:Math.round((10+18*L)*(d.hpM||1)),atk:[Math.round((1+1.5*L)*am),Math.round((3+2*L)*am)],xp:Math.round((4+12*L)*(d.boss?8:1)),g:d.boss?[30*L,40*L]:[L,L*2]};
}

export function rollArt(ti,rnd,pool=ART_POOL){const w=DIFFS[ti].w,{pick}=rngTools(rnd);let tot=0;for(const k in w)tot+=w[k];let r=rnd()*tot;for(const k in w){r-=w[k];if(r<=0)return pick(pool[k])}return pick(pool.common)}

export const CMP_KEYS=[['atk','Attaque','Att'],['arm','Protection','Prot'],['hp','PV','PV']];
export function statsWith(S,slot,q,drunk){const keep=S.eq[slot];S.eq[slot]=q;const st=stats(S,drunk);S.eq[slot]=keep;return st}
export function cmpInfo(S,q){
  const it=q&&ITEMS[q.id];if(!it||it.t!=='eq')return null;
  const cur=S.eq[it.s]||null,curIt=cur&&ITEMS[cur.id],mine=itemStats(q),was=cur?itemStats(cur):{};
  const same=!!cur&&cur.id===q.id&&cur.nObj===q.nObj&&cur.rarete===q.rarete;
  const rows=CMP_KEYS.map(([k,l,sh])=>{const a=was[k]||0,b=mine[k]||0;return{k,l,sh,a,b,d:b-a}}).filter(r=>r.a||r.b);
  const ups=rows.some(r=>r.d>0),downs=rows.some(r=>r.d<0),net=rows.reduce((s,r)=>s+r.d*(r.k==='hp'?1:3),0);
  let v,cls;
  if(same){v='Déjà équipé';cls='eq'}
  else if(ups&&!downs){v='Amélioration';cls='up'}
  else if(downs&&!ups){v='Moins bien';cls='down'}
  else if(!ups&&!downs){v='Identique';cls='eq'}
  else{v=net>0?'Compromis, plutôt mieux':net<0?'Compromis, plutôt moins bien':'Compromis';cls='mix'}
  return{it,inst:q,cur,curIt,same,rows,v,cls,net,better:!same&&(cls==='up'||(cls==='mix'&&net>0))&&S.lvl>=(it.rl||1)};
}

// Les droits viennent du fichier de sauvegarde ; le serveur est le seul à trancher, le client ne s'en sert que pour l'affichage.
export const hasRight=(pl,droit)=>(pl.S.droits||[]).includes(droit);
export const fmt=n=>Math.round(n).toLocaleString('fr-FR');
export const npcById=id=>NPCS.find(n=>n.id===id);

export const newSave=(name='Sire_Chouffin',hat=HATS[0][0],cls=DEFAULT_CLASS)=>({name,hat,cls,lvl:1,xp:0,gold:5,hp:60,caf:50,inv:[{id:'chips',n:3},{id:'chouffe',n:1}],eq:{tete:null,torse:null,mains:null,jambes:null,arme:null},q:{i:0,st:'avail',n:0},ach:{},tips:0,deaths:0,kills:0,herbe:0,played:0,chouffes:0,dg:0,artSold:0,mounts:[],mount:null,duelWins:0,duelLosses:0,concede:null});
// Les sauvegardes viennent d'un fichier ou du localStorage : on les remet d'aplomb si le contenu d'objets a changé entre deux versions.
export function normalizeSave(sv){
  sv=JSON.parse(JSON.stringify(sv));
  const S=Object.assign(newSave(),sv);S.eq=Object.assign(newSave().eq,sv.eq||{});
  // Migration : avant les instances, un équipement était un simple identifiant (dans le sac : {id,n:1}). Il devient un objet au niveau de son rl, à sa rareté d'origine.
  const isInst=x=>x&&typeof x==='object'&&typeof x.uid==='string'&&ITEMS[x.id]&&ITEMS[x.id].t==='eq';
  S.nextUid=Math.max(+S.nextUid||0,...[...(sv.inv||[]),...Object.values(S.eq)].map(x=>isInst(x)?+x.uid.slice(1)||0:0));
  const inst=x=>{
    if(isInst(x))return{uid:x.uid,...newItem(x.id,x.nObj,x.rarete)};
    const id=typeof x==='string'?x:x&&x.id;
    return ITEMS[id]&&ITEMS[id].t==='eq'?withUid(S,newItem(id)):null;
  };
  S.inv=(sv.inv||[]).map(x=>ITEMS[x&&x.id]&&ITEMS[x.id].t!=='eq'?{id:x.id,n:Math.max(1,x.n|0)}:inst(x)).filter(Boolean);
  for(const k in S.eq)S.eq[k]=inst(S.eq[k]);
  if(S.q.i>QUESTS.length)S.q.i=QUESTS.length;
  if(!CLASSES[S.cls])S.cls=DEFAULT_CLASS;
  S.mounts=(Array.isArray(sv.mounts)?sv.mounts:[]).filter(id=>MOUNTS[id]);
  if(!S.mounts.includes(S.mount))S.mount=S.mounts[0]||null;
  S.droits=Array.isArray(sv.droits)?sv.droits.filter(d=>typeof d==='string'):[];
  return S;
}
