import {ITEMS,MOBS,DIFFS,ART_POOL,HATS,NPCS,QUESTS} from './data.js';
import {rngTools} from './rng.js';
import {CLASSES,DEFAULT_CLASS,SKILL_DEFS} from './data/classes.js';
import {MOUNTS} from './data/mounts.js';

export const clamp=(v,a,b)=>v<a?a:v>b?b:v,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const xpNeed=l=>Math.round(40+45*(l-1)+15*(l-1)**2);
export const classOf=S=>CLASSES[S.cls]||CLASSES[DEFAULT_CLASS];
export const skillsOf=S=>classOf(S).skills.map(id=>({id,...SKILL_DEFS[id]}));
export function stats(S,drunk=0){let atk=4+2*(S.lvl-1),hp=60+15*(S.lvl-1),arm=0;for(const k in S.eq){const it=S.eq[k]&&ITEMS[S.eq[k]];if(it){atk+=it.atk||0;hp+=it.hp||0;arm+=it.arm||0}}if(drunk>0)atk=Math.round(atk*1.15);const m=classOf(S).mods;hp=Math.round(hp*m.hp);arm=Math.round(arm*m.arm);atk=Math.round(atk*m.atk);return{atk,maxhp:hp,maxcaf:50+8*(S.lvl-1),arm,red:arm/(arm+45),spd:m.spd}}

export const stackable=id=>ITEMS[id].t!=='eq';
export function score(id){const it=id&&ITEMS[id];return it?(it.atk||0)*3+(it.hp||0)+(it.arm||0)*3:-1}

// Vitesse de déplacement relative : classe × monture (P.mount : id de la monture en selle, ou null).
export const moveSpeed=(S,P)=>stats(S).spd*(1+(P.mount&&MOUNTS[P.mount]?MOUNTS[P.mount].speed:0));

export function statsDeMob(type,L){
  const d=MOBS[type];L=L||d.l;
  if(d.hp&&L===d.l)return{hp:d.hp,atk:d.atk,xp:d.xp,g:d.g};
  const am=d.atkM||1;
  return{hp:Math.round((10+18*L)*(d.hpM||1)),atk:[Math.round((1+1.5*L)*am),Math.round((3+2*L)*am)],xp:Math.round((4+12*L)*(d.boss?8:1)),g:d.boss?[30*L,40*L]:[L,L*2]};
}

export function rollArt(ti,rnd){const w=DIFFS[ti].w,{pick}=rngTools(rnd);let tot=0;for(const k in w)tot+=w[k];let r=rnd()*tot;for(const k in w){r-=w[k];if(r<=0)return pick(ART_POOL[k])}return pick(ART_POOL.common)}

export const CMP_KEYS=[['atk','Attaque','Att'],['arm','Protection','Prot'],['hp','PV','PV']];
export function statsWith(S,slot,id,drunk){const keep=S.eq[slot];S.eq[slot]=id;const st=stats(S,drunk);S.eq[slot]=keep;return st}
export function cmpInfo(S,id){
  const it=ITEMS[id];if(!it||it.t!=='eq')return null;
  const curId=S.eq[it.s],cur=curId?ITEMS[curId]:null,same=curId===id;
  const rows=CMP_KEYS.map(([k,l,sh])=>{const a=cur?(cur[k]||0):0,b=it[k]||0;return{k,l,sh,a,b,d:b-a}}).filter(r=>r.a||r.b);
  const ups=rows.some(r=>r.d>0),downs=rows.some(r=>r.d<0),net=rows.reduce((s,r)=>s+r.d*(r.k==='hp'?1:3),0);
  let v,cls;
  if(same){v='Déjà équipé';cls='eq'}
  else if(ups&&!downs){v='Amélioration';cls='up'}
  else if(downs&&!ups){v='Moins bien';cls='down'}
  else if(!ups&&!downs){v='Identique';cls='eq'}
  else{v=net>0?'Compromis, plutôt mieux':net<0?'Compromis, plutôt moins bien':'Compromis';cls='mix'}
  return{it,curId,cur,same,rows,v,cls,net,better:!same&&(cls==='up'||(cls==='mix'&&net>0))&&S.lvl>=(it.rl||1)};
}

// Les droits viennent du fichier de sauvegarde ; le serveur est le seul à trancher, le client ne s'en sert que pour l'affichage.
export const hasRight=(pl,droit)=>(pl.S.droits||[]).includes(droit);
export const fmt=n=>Math.round(n).toLocaleString('fr-FR');
export const npcById=id=>NPCS.find(n=>n.id===id);

export const newSave=(name='Sire_Chouffin',hat=HATS[0][0],cls=DEFAULT_CLASS)=>({name,hat,cls,lvl:1,xp:0,gold:5,hp:60,caf:50,inv:[{id:'chips',n:3},{id:'chouffe',n:1}],eq:{tete:null,torse:null,mains:null,jambes:null,arme:null},q:{i:0,st:'avail',n:0},ach:{},tips:0,deaths:0,kills:0,herbe:0,played:0,chouffes:0,dg:0,artSold:0,mounts:[],mount:null,duelWins:0,duelLosses:0,concede:null});
// Les sauvegardes viennent d'un fichier ou du localStorage : on les remet d'aplomb si le contenu d'objets a changé entre deux versions.
export function normalizeSave(sv){
  sv=JSON.parse(JSON.stringify(sv));
  const S=Object.assign(newSave(),sv);S.eq=Object.assign(newSave().eq,sv.eq||{});S.inv=(S.inv||[]).filter(s=>ITEMS[s.id]);
  for(const k in S.eq)if(S.eq[k]&&!ITEMS[S.eq[k]])S.eq[k]=null;
  if(S.q.i>QUESTS.length)S.q.i=QUESTS.length;
  if(!CLASSES[S.cls])S.cls=DEFAULT_CLASS;
  S.mounts=(Array.isArray(sv.mounts)?sv.mounts:[]).filter(id=>MOUNTS[id]);
  if(!S.mounts.includes(S.mount))S.mount=S.mounts[0]||null;
  S.droits=Array.isArray(sv.droits)?sv.droits.filter(d=>typeof d==='string'):[];
  return S;
}
