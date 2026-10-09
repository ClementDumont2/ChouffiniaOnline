// Simulation pure : ni DOM, ni Math.random, aucun import du client.
// Tout résultat visible sort par world.events ({to: id du joueur concerné, t: type, ...}) ; le client ne fait que les afficher.
// Les textes d'événements 'msg' utilisent un mini-balisage que le client interprète : **gras**, [[id_objet]] (lien d'objet), [[up]] (flèche d'amélioration).
import {ART_POOLS,BOTS,BOT_LINES,BOT_REPLIES,DIFFS,DUNGEONS,ENFAIT,ITEMS,LVLUP,MAXLVL,MOBS,NPCS,QUESTS,SLOTS,SPAWNS,STOCK,SYS_LINES,ZONES} from './data.js';
import {buyPrice,clamp,classOf,cmpInfo,dist,fmt,itemValue,newItem,newSave,normalizeSave,npcById,rollArt,fuse,fuseCost,moveSpeed,score,skillsOf,stackable,stats,statsDeMob,withUid,xpNeed} from './rules.js';
import {CLASSES,CLASS_COST,SKILL_DEFS} from './data/classes.js';
import {MAMAN_KILLS,MOUNTS} from './data/mounts.js';
import {AFFIXES,BOSSES} from './data/bosses.js';
import {canStand,findPath,genDungeon,genOverworld,isSafe,isSolid,randSpot,stepToward,zoneAt} from './map.js';
import {SAFE} from './data/zones.js';
import {mulberry32,rngTools} from './rng.js';
import {findCommand,canUse,visibleCommands} from './commands.js';

const DUEL_TTL=30,DUEL_COUNT=3,PVP_MULT=.5,DG_MAX=4,INVITE_TTL=60,SHARE_RANGE=15,BAG=24,SPAWN={x:7.5,y:8.5},BOURG={x:21.5,y:20.4},NEAR=3.5,MAX_SPEED=5,SLACK=1;
const ev=(w,to,e)=>w.events.push({to,...e});
const msg=(w,to,cls,text)=>ev(w,to,{t:'msg',cls,text});
const err=(w,to,text)=>ev(w,to,{t:'err',text});
const onMap=(w,mapId)=>Object.values(w.players).filter(p=>p.mapId===mapId);
const toMap=(w,mapId,e)=>{for(const p of onMap(w,mapId))ev(w,p.id,e)};
const toAll=(w,e)=>{for(const id in w.players)ev(w,id,e)};
const float=(w,mapId,x,y,txt,col,big)=>toMap(w,mapId,{t:'float',x,y,txt,col,big:!!big});
const burst=(w,mapId,x,y,col,n,spd)=>toMap(w,mapId,{t:'burst',x,y,col,n,spd});
const say=(e,txt,dur)=>{e.say=txt;e.sayT=dur||3.8};
// Lien d'objet dans un message : [[id]] pour une pile, [[id:rareté:nObj]] pour une instance d'équipement.
const link=x=>x.rarete?`[[${x.id}:${x.rarete}:${x.nObj}]]`:`[[${x.id}]]`;
// Difficulté d'un donjon : DIFFS (packs, poids des raretés…) surchargé par les niveaux, l'XP et l'or propres au donjon.
const dgDiff=(dgId,ti)=>({...DIFFS[ti],...((DUNGEONS[dgId].diffs||[])[ti])});
const nid=(w,p)=>p+(w.nextId++);
const later=(w,delay,fn)=>w.later.push({at:w.time+delay,fn});

export function createWorld({seed=20111,rng,bots=false}={}){
  const rnd=rng||mulberry32(seed^0x9e3779b9);
  const w={tick:0,time:0,seed,rnd,r:rngTools(rnd),bots,maps:{},players:{},events:[],later:[],nextId:1,instN:0,invites:{},botT:6,sysT:40};
  w.maps.over=Object.assign(genOverworld(seed),{seed,mobs:[],objs:[],npcs:NPCS.map(n=>({...n})),bots:[]});
  spawnOver(w);
  return w;
}

const newBoss=()=>({t:0,cd:{},done:{},summons:[]});
function mkMob(w,type,x,y,L,id,diff=0){
  const d=MOBS[type];L=L||d.l;const{hp,atk,xp,g}=statsDeMob(type,L),{rr}=w.r;
  return{id:id||nid(w,'m'),kind:'mob',type,d,l:L,x,y,hx:x,hy:y,hp,mhp:hp,atk,xp,g,alive:true,st:'idle',target:null,tag:null,hitters:[],threat:{},acd:0,wt:rr(0,3),wx:x,wy:y,stun:0,slow:0,taunt:null,dots:[],rt:0,dieT:0,ph:w.rnd()*6,step:0,face:1,moving:false,say:'',sayT:0,cast:0,castMax:2.6,castN:'',castK:'',castR:0,castA:null,castDmg:0,gauge:0,gaugeN:'',spots:null,mark:null,enr:0,enrMult:1,hard:0,hardMult:1,zone:null,b:d.boss?newBoss():null,diff,shield:0,mshield:0,affix:null,elite:0,summoned:false,gone:false,patrol:null,pi:0,pd:1,path:null,pathT:0,yt:5,hgt:d.hgt,blink:2};
}

function spawnOver(w){
  const map=w.maps.over,{rr,pick}=w.r,spot=(...a)=>randSpot(map,w.rnd,...a);
  const avoid=(x,y)=>{return isSafe(map,x,y)||zoneAt(map,x,y)==='cuisine'||(x>9&&x<28&&y>11&&y<25)||NPCS.some(n=>Math.hypot(n.x-x,n.y-y)<4)};
  for(const [type,n,x0,x1,y0,y1] of SPAWNS)for(let i=0;i<n;i++){const p=spot(x0,x1,y0,y1,avoid);map.mobs.push(mkMob(w,type,p.x,p.y))}
  map.mobs.push(mkMob(w,'maman',8.5,31));
  if(!w.bots)return;
  const hats=['#1d1b22','#6b6870','#2a3a5c','#3a5a2a','#6d2230','#121212','#4d3a22','#5a2a6a','#2a2a2a','#7a5a2a'];
  const coats=['#3a3340','#2a2630','#4a3a52','#243040','#3a2a24','#2e3a2e','#2a2630','#40323a','#5a5a62','#3a3a3a'];
  map.bots=BOTS.map(([n,g],i)=>{const p=i<2?spot(3,11,4,9):i<5?spot(16,23,17,21):spot(14,48,2,36,(x,y)=>zoneAt(map,x,y)==='cuisine');return{id:nid(w,'b'),kind:'bot',n,g,x:p.x,y:p.y,goal:null,wt:rr(1,4),lvl:pick([12,27,34,48,60,60,71,3,15]),hat:hats[i],coat:coats[i],shirt:pick(['#141414','#2a2a2a','#5a1a1a','#1a2a4a']),face:1,step:0,moving:false,say:'',sayT:0,hgt:1.25,tip:0}});
}

// Les pseudos connectés, pour l'autocomplétion des commandes (le snapshot ne contient que la carte du joueur).
const announceOnline=w=>toAll(w,{t:'online',names:Object.values(w.players).map(p=>p.S.name)});

export function addPlayer(w,id,{save,name,hat,cls}={}){
  const S=save?normalizeSave(save):newSave(name,hat,cls),st=stats(S);
  S.hp=clamp(S.hp||st.maxhp,1,st.maxhp);S.caf=clamp(S.caf,0,st.maxcaf);
  const P={id,n:S.name,x:SPAWN.x,y:SPAWN.y,mt:w.time,face:1,moving:false,mv:0,step:0,tipT:0,target:null,auto:false,combat:99,dead:false,cast:null,hgt:1.25,kind:'player',drunk:0,say:'',sayT:0,cd:{},buffs:{},dots:[],mount:null,mountSayT:0,nextCrit:false,hotAmt:0,hotAcc:0};
  const pl=w.players[id]={id,S,P,mapId:'over',duel:null};
  msg(w,id,'sys',`[Serveur] Bienvenue sur Chouffinia Online, ${S.name}. ${(n=>n>1?`${fmt(n)} joueurs sont connectés. Aucun n'a vu le soleil cette semaine.`:'Vous êtes seul connecté. Comme d\'habitude.')(Object.keys(w.players).length)}`);
  msg(w,id,'sys','[Patch 1.1] Nouveau : le Bourg-Forum (sanctuaire, juste au sud-est du sous-sol) avec l\'Armurerie de Bernard, la Taverne du 18-25 et l\'entrée des Archives Oubliées. Trois nouvelles zones : Marais du Lag, Désert de Sel du 18-25, Datacenter Abandonné.');
  msg(w,id,'sys','[Aide] Touchez le sol ou utilisez le clavier pour bouger. Touchez un ennemi pour l\'attaquer. Les touches se règlent dans Options (engrenage de la barre d\'action).');
  if(!save)msg(w,id,'sys','[Aide] Le Vieux Sage du Forum vous attend dans le sous-sol. Il a un point d\'exclamation au-dessus de la tête. C\'est sa seule expression.');
  announceOnline(w);
  later(w,1.2,()=>{if(w.players[id]&&S.q.i===0&&S.q.st==='avail')say(w.maps.over.npcs[0],'Psst. Jeune chouffin. Viens par ici.',4)});
  return pl;
}

export function removePlayer(w,id){
  const pl=w.players[id];if(!pl)return;
  endTrade(w,pl,`[${pl.S.name}] a quitté l'échange.`);abandonDuel(w,pl);dropAggro(w,pl);
  for(const k in w.invites)if(k===id||w.invites[k].from===id)delete w.invites[k];
  delete w.players[id];
  announceOnline(w);
  destroyIfEmpty(w,pl.mapId);
  return pl.S;
}

export function findEnt(w,mapId,id){
  const map=w.maps[mapId];if(!map||id==null)return null;
  return map.mobs.find(e=>e.id===id)||map.npcs.find(e=>e.id===id)||map.objs.find(e=>e.id===id)||map.bots.find(e=>e.id===id)||onMap(w,mapId).map(p=>p.P).find(e=>e.id===id)||null;
}

export function takeEvents(w,id){
  const mine=[],rest=[];
  for(const e of w.events)(e.to===id?mine:rest).push(e);
  w.events=rest;return mine;
}

export function movePlayer(w,id,x,y,face){
  const pl=w.players[id];if(!pl||pl.P.dead||!Number.isFinite(x)||!Number.isFinite(y))return false;
  const {P}=pl,map=w.maps[pl.mapId],d=Math.hypot(x-P.x,y-P.y);
  if(P.cast){P.cast=null;err(w,id,'Incantation interrompue.')}
  // Exception volontaire : la position vient du client ; on ne refuse que murs et vitesse impossible, et on renvoie alors la vraie position.
  if(!canStand(map,x,y)||d>MAX_SPEED*moveSpeed(pl.S,P)*(w.time-P.mt)+SLACK){ev(w,id,{t:'tp',x:P.x,y:P.y});return false}
  P.step+=d*2.7;P.x=x;P.y=y;P.mt=w.time;
  if(pl.mapId==='over')discover(w,pl,zoneAt(map,x,y));
  if(d>0){P.mv=.15;P.moving=true}
  if(face)P.face=face>0?1:-1;
  return true;
}

export function tick(w,dt){
  w.tick++;w.time+=dt;
  for(const pl of Object.values(w.players))tickPlayer(w,pl,dt);
  for(const map of Object.values(w.maps)){
    const here=onMap(w,map.id);
    for(const m of map.mobs)tickMob(w,map,m,dt,here);
    for(const n of map.npcs){
      if(n.sayT>0)n.sayT-=dt;
      // Les PNJ ne parlent que s'il y a quelqu'un pour les entendre.
      if(n.lines.length&&here.length&&(n.talkT=(n.talkT??w.r.rr(8,25))-dt)<=0){n.talkT=w.r.rr(30,60);say(n,w.r.pick(n.lines),4)}
    }
  }
  for(const map of Object.values(w.maps))if(map.mobs.some(m=>m.gone))map.mobs=map.mobs.filter(m=>!m.gone);
  tickBots(w,dt);
  const due=w.later.filter(l=>l.at<=w.time);
  if(due.length){w.later=w.later.filter(l=>l.at>w.time);for(const l of due)l.fn()}
}

function tickPlayer(w,pl,dt){
  const {S,P}=pl,st=stats(S,P.drunk);
  if(P.tipT>0)P.tipT-=dt;
  if(P.sayT>0)P.sayT-=dt;
  if(P.drunk>0)P.drunk-=dt;
  if(P.mv>0){P.mv-=dt;if(P.mv<=0)P.moving=false}
  S.played+=dt;
  if(pl.duel)checkDuel(w,pl);
  if(P.mount&&inArena(w,pl))dismount(w,pl,'Les montures sont interdites dans l\'Arène.');
  if(P.dead)return;
  S.caf=Math.min(st.maxcaf,S.caf+dt*2.6);
  P.combat+=dt;if(P.combat>5)S.hp=Math.min(st.maxhp,S.hp+st.maxhp*.06*dt);
  if(P.buffs.fiche>0){P.hotAcc+=dt;if(P.hotAcc>=1){P.hotAcc-=1;healBy(w,pl,pl,P.hotAmt)}}
  if(P.mount==='maman'&&(P.mountSayT-=dt)<=0){P.mountSayT=w.r.rr(8,12);say(P,w.r.pick(MOUNTS.maman.lines),4)}
  const haste=P.buffs.anypct>0?1.4:1;
  for(const k in P.buffs)if((P.buffs[k]-=dt)<=0)delete P.buffs[k];
  if(P.cast){P.cast.t-=dt;if(P.cast.t<=0){const c=P.cast;P.cast=null;finishCast(w,pl,c)}}
  for(const o of P.dots){o.t-=dt;o.acc+=dt;if(o.acc>=1){o.acc-=1;const by=w.players[o.by];if(by&&by.duel&&by.duel.foe===pl.id&&by.duel.phase==='fight')pvpHit(w,by,pl,o.dmg,false,'Copypasta')}}
  P.dots=P.dots.filter(o=>o.t>0);
  const tg=findEnt(w,pl.mapId,P.target),sk0=SKILL_DEFS[classOf(S).skills[0]];
  if(tg&&attackable(w,pl,tg)&&P.auto&&!P.cast&&dist(P,tg)<=sk0.rg&&(P.cd[classOf(S).skills[0]]||0)<=0)useSkill(w,pl,0,true);
  for(const k in P.cd)if(P.cd[k]>0)P.cd[k]-=k==='pot'?dt:dt*haste;
}

function finishCast(w,pl,c){
  const {P}=pl;
  if(c.id==='mount'){if(pl.mapId==='over'&&!inArena(w,pl)){P.mount=pl.S.mount;P.mountSayT=w.r.rr(3,6)}return}
  if(c.id!=='ragequit')return;
  respawnAt(w,pl);P.target=null;P.auto=false;dropAggro(w,pl);
  msg(w,pl.id,'sys','Alt+F4. Vous êtes en sécurité. Personne n\'a rien vu.');burst(w,pl.mapId,P.x,P.y-.6,'#ec5a4c',14);ach(w,pl,'rq');
}

function discover(w,pl,z){
  if(!SAFE[z]||pl.S.tp.includes(z))return;
  pl.S.tp.push(z);
  ev(w,pl.id,{t:'toast',kicker:'Sanctuaire découvert',title:ZONES[z].n,sub:`Voyage depuis n'importe quel sanctuaire : /tp ${z}`});ev(w,pl.id,{t:'self'});
}
// Voyage entre sanctuaires découverts, au départ d'un sanctuaire seulement : pas de fuite en plein combat.
function travel(w,pl,to){
  const {S,P}=pl,list=S.tp.map(z=>`${z} (${ZONES[z].n})`).join(', ');
  if(!to){msg(w,pl.id,'sys',`Sanctuaires découverts : ${list}. Voyage : /tp <lieu>, depuis un sanctuaire.`);return}
  const z=S.tp.find(k=>k===to.toLowerCase());
  if(!z){err(w,pl.id,`Sanctuaire inconnu ou pas encore découvert. Découverts : ${S.tp.join(', ')}.`);return}
  if(pl.mapId!=='over'||P.dead||!isSafe(w.maps.over,P.x,P.y)){err(w,pl.id,'On ne voyage que depuis un sanctuaire.');return}
  P.cast=null;P.target=null;P.auto=false;
  teleport(w,pl,SAFE[z].x,SAFE[z].y);
  msg(w,pl.id,'sys',`Vous voyagez jusqu'à ${ZONES[z].n}. Le trajet a duré une seconde. Votre mère aurait mis vingt minutes à se garer.`);
}

function teleport(w,pl,x,y){const {P}=pl;P.x=x;P.y=y;P.mt=w.time;ev(w,pl.id,{t:'tp',x,y})}
function respawnAt(w,pl){
  const map=w.maps[pl.mapId],over=map.id==='over';
  teleport(w,pl,over?SPAWN.x:map.sx,over?SPAWN.y:map.sy);
}

function dropAggro(w,pl){
  for(const map of Object.values(w.maps))for(const m of map.mobs){delete m.threat[pl.id];if(m.target===pl.id)m.target=null}
}

const nearest=(m,list)=>{let best=null,bd=Infinity;for(const p of list){const d=dist(m,p.P);if(d<bd){bd=d;best=p}}return best};
function pickTarget(m,valid){
  if(m.taunt){const tp=valid.find(p=>p.id===m.taunt.by);if(tp)return tp}
  let best=null,bt=0;
  for(const p of valid){const t=m.threat[p.id]||0;if(t>bt){bt=t;best=p}}
  if(best)return best;
  const cur=valid.find(p=>p.id===m.target);if(cur)return cur;
  const n=nearest(m,valid);return n&&dist(m,n.P)<m.d.ag?n:null;
}
const dropMob=m=>{m.taunt=null;m.path=null;m.st='ret';m.cast=0;m.mark=null;m.spots=null;m.zone=null;m.target=null;m.tag=null;m.hitters=[];m.threat={}};

function aggro(w,map,m,pl){
  if(m.st==='chase')return;
  const {pick}=w.r;
  if(m.patrol){m.hx=m.x;m.hy=m.y}
  m.st='chase';m.acd=.6;m.target=pl.id;if(w.rnd()<.55||m.d.boss)say(m,pick(m.d.lines));
  if(map.id!=='over')for(const o of map.mobs)if(o!==m&&o.alive&&o.st==='idle'&&!o.d.boss&&dist(o,m)<4.2){o.st='chase';o.acd=.9;o.target=pl.id}
}

function hitMob(w,map,m,dmg,crit,src,pl){
  if(!m.alive)return;
  // Le bouclier de l'affixe « Épinglé » absorbe avant les PV ; la menace, elle, compte les dégâts bruts.
  const full=dmg,abs=Math.min(m.shield,dmg);m.shield-=abs;dmg-=abs;
  m.hp-=dmg;float(w,map.id,m.x,m.y-m.hgt,dmg>0?String(dmg):'Absorbé',crit?'#ffd84a':dmg>0?'#ffffff':'#8ab4ff',crit);
  burst(w,map.id,m.x,m.y-m.hgt*.5,src==='dot'?'#ede1c5':'#ffcf8a',crit?8:4);
  if(pl){
    msg(w,pl.id,'cb',`${src==='dot'?'Copypasta':'Votre '+src} inflige ${full} dégâts${crit?' (critique)':''}${abs?` (dont ${abs} absorbés)`:''} à ${m.d.n}.`);
    m.threat[pl.id]=(m.threat[pl.id]||0)+full;
    if(!m.tag)m.tag=pl.id;
    if(!m.hitters.includes(pl.id))m.hitters.push(pl.id);
    if(m.cast>0&&m.castA&&m.castA.interrupt!=null){m.castDmg+=full;if(m.castDmg>=m.castA.interrupt*m.mhp)interruptCast(w,map,m,pl)}
  }
  if(m.st==='chase'){if(pl)m.target=pl.id}else if(pl)aggro(w,map,m,pl);
  if(m.hp<=0)killMob(w,map,m);
}

function killMob(w,map,m){
  // « Nécroposté » : revient une fois à 30 % de PV, sans récompense la première fois.
  if(m.affix==='necroposte'&&!m.revived){
    m.revived=1;m.hp=Math.round(m.mhp*.3);m.dots=[];float(w,map.id,m.x,m.y-m.hgt-.3,'Nécroposté !','#c9a8ff',true);burst(w,map.id,m.x,m.y-m.hgt*.5,'#c9a8ff',14);return;
  }
  const inDg=map.id!=='over';
  m.alive=false;m.hp=0;m.dieT=.7;m.rt=inDg||m.summoned?Infinity:(m.d.boss?75:14);m.dots=[];m.cast=0;m.mark=null;m.spots=null;m.zone=null;m.target=null;m.threat={};
  // Les invocations n'ont ni butin ni XP ; elles disparaissent avec leur invocateur.
  if(m.b)for(const o of map.mobs)if(m.b.summons.includes(o.id)){o.alive=false;o.hp=0;o.dieT=.3;o.rt=Infinity}
  // Plusieurs boss : quand l'un tombe, les autres durcissent (+25 % de dégâts, cumulable).
  if(m.d.boss)for(const o of map.mobs)if(o!==m&&o.d.boss&&o.alive){o.enrMult=(o.enr?o.enrMult:1)*1.25;o.enr=1}
  if(m.summoned){m.hitters=[];m.tag=null;for(const o of onMap(w,map.id))if(o.P.target===m.id){o.P.target=null;o.P.auto=false}return}
  // Participants : ceux qui ont frappé et sont encore assez près. Butin et or : au premier frappeur (s'il est parti, au premier participant).
  const group=m.hitters.map(id=>w.players[id]).filter(p=>p&&p.mapId===map.id&&dist(p.P,m)<=SHARE_RANGE);
  const first=w.players[m.tag];
  const tagger=first&&first.mapId===map.id?first:group[0];
  m.tag=null;m.hitters=[];
  for(const o of onMap(w,map.id))if(o.P.target===m.id){o.P.target=null;o.P.auto=false}
  if(!group.length)return;
  rewardKill(w,map,m,group,tagger);
  if(inDg&&m.d.boss&&!map.mobs.some(o=>o.d.boss&&o.alive))dungeonDone(w,map,group);
  for(const p of new Set([...group,tagger]))ev(w,p.id,{t:'self'});
}

// XP partagée à parts égales ; quête et compteurs pour chaque participant ; or et butin au premier frappeur seul.
function rewardKill(w,map,m,group,T){
  const inDg=map.id!=='over',{ri}=w.r,share=Math.max(1,Math.round(m.xp/group.length));
  for(const pl of group){
    const {S}=pl;
    S.kills++;ach(w,pl,'first');
    if(S.cls==='speedrunner'){say(pl.P,'WR !',2);float(w,map.id,pl.P.x,pl.P.y-1.9,'WR !','#ffd84a',true)}
    if(m.type==='herbe'){S.herbe++;if(S.herbe>=10)ach(w,pl,'grass')}
    gainXP(w,pl,share,m.d.n);
  }
  const g=ri(m.g[0],m.g[1]);T.S.gold+=g;
  msg(w,T.id,'loot',`Vous ramassez ${g} po.`);
  // Le butin d'équipement prend le niveau du monstre comme niveau d'objet.
  const drop=lid=>{if(!addItem(w,T,lid,1,m.l))return;const q=ITEMS[lid].t==='eq'?T.S.inv[T.S.inv.length-1]:null;msg(w,T.id,'loot',`Vous recevez le butin : ${q?link(q):`[[${lid}]]`}${q&&cmpInfo(T.S,q).better?'[[up]]':''}.`)};
  for(const [lid,p] of (m.d.loot||[]))if(w.rnd()<p)drop(lid);
  if(inDg&&!m.d.boss){if(w.rnd()<.14+.04*map.ti)drop(rollArt(map.ti,w.rnd,ART_POOLS[map.dg]));if(w.rnd()<.18)drop('chips')}
  if(T.S.gold>=100)ach(w,T,'rich');
  for(const pl of group){
    const {S}=pl,id=pl.id,q=QUESTS[S.q.i];
    if(q&&S.q.st==='active'&&q.m===m.type){S.q.n=Math.min(q.k,S.q.n+1);msg(w,id,'sys',`${MOBS[q.m].n} : ${S.q.n}/${q.k}`);if(S.q.n>=q.k){S.q.st='ready';ev(w,id,{t:'toast',kicker:'Objectif terminé',title:q.n,sub:`Retournez voir ${npcById(q.g).n}.`})}}
    if(m.type==='maman'){ach(w,pl,'boss');mamanKill(w,pl);ev(w,id,{t:'banner',title:'Maman est vaincue',sub:'Le Wi-Fi restera allumé ce soir. Personne ne vous croira.'});msg(w,id,'yell','[Maman] crie : TU NE SORS PLUS DE TA CHAMBRE PENDANT UNE SEMAINE !');ev(w,id,{t:'chat',who:'Kévin_du_42',text:`GG ${S.name}, légende du sous-sol`})}
  }
}

function dungeonDone(w,map,group){
  const dg=DUNGEONS[map.dg],df=dgDiff(map.dg,map.ti),boss=map.mobs.find(x=>x.d.boss);map.done=true;
  map.objs.push({id:nid(w,'o'),kind:'obj',type:'chest',n:dg.coffre,x:boss.x,y:boss.y,hgt:.9,openedBy:[]});
  toMap(w,map.id,{t:'banner',title:dg.fini,sub:`Difficulté ${df.n} · Ouvrez le ${dg.coffre.replace(/^Coffre (de la |de l'|du |des |de )/,'coffre ')}.`,cls:'dg'});
  toMap(w,map.id,{t:'msg',cls:'sys',text:`${dg.vaincu||`${boss.d.n} est vaincu.`} ${dg.fini} (${df.n}).`});
  for(const pl of group){
    const {S}=pl;
    gainXP(w,pl,df.bonus,null);S.dg=(S.dg||0)+1;ach(w,pl,'dungeon');if(map.ti===3)ach(w,pl,'mythic');
    // Le Jury vaincu en Sans Douche : titre affiché sous le nom.
    if(map.dg==='soutenance'&&map.ti===3){ach(w,pl,'diplome');S.titre='Diplômé (enfin)'}
    const q=QUESTS[S.q.i];if(q&&S.q.st==='active'&&q.dg!=null&&map.ti>=q.dg&&(q.dgn||'archives')===map.dg){S.q.n=1;S.q.st='ready';ev(w,pl.id,{t:'toast',kicker:'Objectif terminé',title:q.n,sub:`Retournez voir ${npcById(q.g).n}.`})}
  }
}

function gainXP(w,pl,n,src){
  const {S,P}=pl,id=pl.id,{pick}=w.r;
  if(S.lvl>=MAXLVL)return;
  S.xp+=n;ev(w,id,{t:'float',x:P.x,y:P.y-1.6,txt:`+${n} XP`,col:'#c4a8ff'});msg(w,id,'xpm',`${src?src+' meurt. ':''}Vous gagnez ${n} points d'expérience.`);
  while(S.lvl<MAXLVL&&S.xp>=xpNeed(S.lvl)){
    S.xp-=xpNeed(S.lvl);S.lvl++;const st=stats(S,P.drunk);S.hp=st.maxhp;S.caf=st.maxcaf;
    const sk=skillsOf(S).find(s=>s.l===S.lvl),df=DIFFS.find(d=>d.rl===S.lvl);
    ev(w,id,{t:'banner',title:`Niveau ${S.lvl}`,sub:sk?`Nouvelle compétence : ${sk.n}`:df?`Archives débloquées : difficulté ${df.n}`:pick(LVLUP),cls:'lvl'});
    msg(w,id,'sys',`Félicitations, vous avez atteint le niveau ${S.lvl} !${sk?` Nouvelle compétence : **${sk.n}**.`:''}${df?` Les Archives en difficulté **${df.n}** sont accessibles.`:''}`);
    ev(w,id,{t:'lvlup',x:P.x,y:P.y});
    if(S.lvl>=5)ach(w,pl,'lvl5');
  }
  if(S.lvl>=MAXLVL)S.xp=0;
}

function hurtPlayer(w,pl,d,m,verb){
  const {S,P}=pl;if(P.dead)return;
  if(P.buffs.glitch>0){float(w,pl.mapId,P.x,P.y-1.3,'Glitch','#7fb6ff');return}
  dismount(w,pl,'Vous tombez de votre monture.');
  const st=stats(S,P.drunk);d=Math.max(1,Math.round(d*(1-st.red)*(P.buffs.reglement>0?.5:1)));
  S.hp-=d;P.combat=0;float(w,pl.mapId,P.x,P.y-1.3,'-'+d,'#ff5a4a');
  msg(w,pl.id,'cb in',`${m.d.n} ${verb||m.d.v} : ${d} dégâts.`);
  if(S.hp<=0){S.hp=0;die(w,pl)}
}

function die(w,pl){
  const {S,P}=pl;
  P.dead=true;P.cast=null;P.auto=false;P.buffs={};P.mount=null;S.deaths++;ach(w,pl,'death');endTrade(w,pl,'Échange annulé : un des joueurs est mort.');
  dropAggro(w,pl);
  ev(w,pl.id,{t:'died'});ev(w,pl.id,{t:'self'});
}

function respawn(w,pl){
  const {S,P}=pl,st=stats(S,P.drunk),over=pl.mapId==='over';
  S.hp=st.maxhp;S.caf=st.maxcaf;respawnAt(w,pl);P.dead=false;P.target=null;
  msg(w,pl.id,'sys',over?'Vous vous réveillez au Sous-Sol. Quelqu\'un a mangé vos chips.':'Vous vous réveillez à l\'entrée du donjon, couvert de poussière. Quelqu\'un a pris vos affaires. Non, finalement non.');
  ev(w,pl.id,{t:'respawned'});
}

function ach(w,pl,id){if(pl.S.ach[id])return;pl.S.ach[id]=1;ev(w,pl.id,{t:'ach',id})}

function addItem(w,pl,id,n,nObj,rarete){
  const {S}=pl;
  if(stackable(id)){const st=S.inv.find(s=>s.id===id);if(st){st.n+=n;return true}}
  if(S.inv.length>=BAG){err(w,pl.id,'Sac plein. Comme votre historique de navigation.');return false}
  S.inv.push(stackable(id)?{id,n}:withUid(S,newItem(id,nObj,rarete)));return true;
}

function equip(w,pl,idx){
  const {S,P}=pl,s=S.inv[idx];if(!s||!s.uid)return;
  const it=ITEMS[s.id];
  if(S.lvl<(it.rl||1)){err(w,pl.id,`Niveau ${it.rl} requis pour équiper cet objet.`);return}
  const prev=S.eq[it.s];S.eq[it.s]=s;S.inv.splice(idx,1);if(prev)S.inv.push(prev);
  S.hp=Math.min(S.hp,stats(S,P.drunk).maxhp);msg(w,pl.id,'sys',`Vous équipez ${link(s)}.`);
}

function unequip(w,pl,slot){
  const {S,P}=pl,q=S.eq[slot];if(!q)return;
  if(S.inv.length>=BAG){err(w,pl.id,'Sac plein.');return}
  S.eq[slot]=null;S.inv.push(q);S.hp=Math.min(S.hp,stats(S,P.drunk).maxhp);
}

function useItem(w,pl,id){
  const {S,P}=pl,{pick}=w.r;
  const idx=S.inv.findIndex(s=>s.id===id);
  if(idx<0){err(w,pl.id,id==='chouffe'?'Plus de Chouffe. Le Khey Tavernier en vend au Bourg-Forum.':'Plus de chips. Gérard en vend au Bourg-Forum.');return}
  if((P.cd.pot||0)>0){err(w,pl.id,'Vous digérez encore. Patience.');return}
  const s=S.inv[idx],it=ITEMS[id],st=stats(S,P.drunk),h=Math.round(st.maxhp*it.pct);
  S.hp=Math.min(st.maxhp,S.hp+h);float(w,pl.mapId,P.x,P.y-1.3,'+'+h,'#6cff7a');P.cd.pot=6;
  if(id==='chouffe'){P.drunk=it.drunk;say(P,pick(['*glou glou* … elle est bonne celle-là','À la tienne, khey.','*hips*','Une de plus et je parle aux filles.']),2.4);S.chouffes=(S.chouffes||0)+1;if(S.chouffes>=10)ach(w,pl,'chouffe');burst(w,pl.mapId,P.x,P.y-.9,'#e0a030',10)}
  else say(P,'*crounch crounch*',1.6);
  s.n--;if(s.n<=0)S.inv.splice(idx,1);
}

function nearestMob(map,P,r){let best=null,bd=r;for(const m of map.mobs){if(!m.alive)continue;const d=dist(P,m);if(d<bd){bd=d;best=m}}return best}

const alliesNear=(w,pl,r)=>onMap(w,pl.mapId).filter(p=>!p.P.dead&&dist(p.P,pl.P)<=r);
const pay=(pl,sk)=>{pl.S.caf-=sk.c;pl.P.cd[sk.id]=sk.cd};
function healBy(w,from,to,amt){
  const mx=stats(to.S,to.P.drunk).maxhp;
  to.S.hp=Math.min(mx,to.S.hp+amt);float(w,to.mapId,to.P.x,to.P.y-1.3,'+'+amt,'#6cff7a');
  if(to!==from)msg(w,to.id,'loot',`[${from.S.name}] vous soigne de ${amt} PV.`);
}
function revive(w,by,pl,pct){
  const {S,P}=pl;
  P.dead=false;P.combat=0;S.hp=Math.max(1,Math.round(stats(S,P.drunk).maxhp*pct));
  msg(w,pl.id,'sys',`[${by.S.name}] vous ressuscite avec un Joker MJ. Le MJ est d'accord, exceptionnellement.`);
  burst(w,pl.mapId,P.x,P.y-.8,'#f0d070',18,3);ev(w,pl.id,{t:'respawned'});ev(w,pl.id,{t:'self'});
}
// Mobs vivants dans un rayon autour du lanceur ; sert au contrôle de foule (étourdir, ralentir, provoquer).
const mobsAround=(w,pl,r)=>w.maps[pl.mapId].mobs.filter(m=>m.alive&&dist(m,pl.P)<=r);

// Compétences sans cible ennemie : chacune paie son coût elle-même et peut refuser sans rien débiter.
const SELF={
  canette(w,pl,sk,st){
    const {S,P}=pl;
    S.hp=Math.min(st.maxhp,S.hp+Math.round(st.maxhp*.35));S.caf=Math.min(st.maxcaf,S.caf+30);
    float(w,pl.mapId,P.x,P.y-1.3,'+'+Math.round(st.maxhp*.35),'#6cff7a');say(P,'*gloups* … elle est tiède.',2);burst(w,pl.mapId,P.x,P.y-.8,'#7fe04a',10);pay(pl,sk);
  },
  ragequit(w,pl,sk){const {P}=pl;P.cast={id:'ragequit',n:'Rage Quit',t:1.5,max:1.5};ev(w,pl.id,{t:'stop'});say(P,'C\'EST TRUQUÉ CE JEU',1.6);pay(pl,sk)},
  fiche(w,pl,sk,st){
    const amt=Math.max(1,Math.round(st.atk*.25));
    for(const a of alliesNear(w,pl,sk.r)){a.P.buffs.fiche=6;a.P.hotAmt=amt;a.P.hotAcc=0;burst(w,pl.mapId,a.P.x,a.P.y-.8,'#6cff7a',8)}
    say(pl.P,'Voici vos fiches. Elles sont équilibrées.',2.2);pay(pl,sk);
  },
  ban(w,pl,sk){
    const map=w.maps[pl.mapId];
    for(const m of mobsAround(w,pl,sk.r)){
      // Les boss sont immunisés à l'étourdissement : on les ralentit seulement.
      if(m.d.boss){m.slow=3;float(w,map.id,m.x,m.y-m.hgt-.3,'Ralenti','#7fb6ff');interruptCast(w,map,m,pl)}
      else if(m.affix==='modere')float(w,map.id,m.x,m.y-m.hgt-.3,'Insensible','#ffd84a');
      else{m.stun=3;float(w,map.id,m.x,m.y-m.hgt-.3,'Banni','#ffd84a')}
      aggro(w,map,m,pl);
    }
    say(pl.P,'Ban temporaire. Réfléchissez à vos actes.',2);P_combat(pl);pay(pl,sk);
  },
  lock(w,pl,sk){
    const map=w.maps[pl.mapId];
    for(const m of mobsAround(w,pl,sk.r)){m.taunt={by:pl.id,t:6};aggro(w,map,m,pl);float(w,map.id,m.x,m.y-m.hgt-.3,'!','#ff7a68')}
    say(pl.P,'Ce topic est verrouillé.',2);P_combat(pl);pay(pl,sk);
  },
  anypct(w,pl,sk){pl.P.buffs.anypct=6;say(pl.P,'Any% ! Pas de pause.',2);burst(w,pl.mapId,pl.P.x,pl.P.y-.8,'#7fe0ff',12);pay(pl,sk)},
  glitch(w,pl,sk){pl.P.buffs.glitch=2;say(pl.P,'*clip à travers le décor*',2);burst(w,pl.mapId,pl.P.x,pl.P.y-.8,'#7fb6ff',12);pay(pl,sk)},
  reglement(w,pl,sk){pl.P.buffs.reglement=5;say(pl.P,'Règlement, article 1.',2);burst(w,pl.mapId,pl.P.x,pl.P.y-.8,'#ffd84a',12);pay(pl,sk)},
};
const P_combat=pl=>{pl.P.combat=0};

// Compétences sur un joueur ciblé (allié vivant ou mort).
const targetedPlayer=(w,pl)=>{const t=findEnt(w,pl.mapId,pl.P.target);return t&&t.kind==='player'&&t.id!==pl.id?w.players[t.id]:null};
const ALLY={
  relance(w,pl,sk,st){
    let ally=pl;const t=targetedPlayer(w,pl);
    if(t){
      if(t.P.dead){err(w,pl.id,'Cet allié est mort. Il lui faut un Joker MJ.');return}
      if(dist(pl.P,t.P)>sk.rg){err(w,pl.id,'Allié hors de portée.');return}
      ally=t;
    }
    healBy(w,pl,ally,Math.max(1,Math.round(st.atk*2.2)));say(pl.P,'Je relance !',1.6);burst(w,pl.mapId,ally.P.x,ally.P.y-.8,'#6cff7a',10);pay(pl,sk);
  },
  joker(w,pl,sk){
    const t=targetedPlayer(w,pl),inRange=p=>p.P.dead&&dist(pl.P,p.P)<=sk.rg;
    const dead=t&&inRange(t)?t:onMap(w,pl.mapId).filter(p=>p!==pl&&inRange(p)).sort((a,b)=>dist(pl.P,a.P)-dist(pl.P,b.P))[0];
    if(!dead){err(w,pl.id,'Aucun allié mort à portée.');return}
    revive(w,pl,dead,.4);say(pl.P,'Joker MJ activé.',2);pay(pl,sk);
  },
};

// Compétences sur un ennemi : même cible, même portée, même critique ; seule la formule de dégâts change.
function strike(w,pl,t,sk,st,crit,mul){
  const {P}=pl,map=w.maps[pl.mapId],{pick,rr}=w.r,id=pl.id,roll=base=>Math.max(1,Math.round(base*rr(.85,1.15)));
  // Une cible joueur n'existe qu'en duel : mêmes formules, mais les dégâts passent par pvpHit (réduits de moitié, jamais mortels).
  const hit=(dmg,crit,src)=>t.kind==='player'?pvpHit(w,pl,w.players[t.id],dmg,crit,src):hitMob(w,map,t,dmg,crit,src,pl);
  switch(sk.id){
    case 'tip':
      {const {S}=pl;P.tipT=.45;S.tips++;if(S.tips%4===1)float(w,pl.mapId,P.x,P.y-1.9,'M\'lady.','#ede1c5');if(S.tips>=50)ach(w,pl,'mlady');hit(roll(st.atk*mul),crit,sk.n)}
      break;
    case 'enfait':
      say(P,pick(ENFAIT),2.4);if(t.kind==='mob'){const immune=t.d.boss||t.affix==='modere';if(t.d.boss)interruptCast(w,w.maps[pl.mapId],t,pl);if(!immune)t.stun=2.5;float(w,pl.mapId,t.x,t.y-t.hgt-.3,immune?'Insensible':'Étourdi','#ffd84a')}hit(roll(st.atk*1.5*mul),crit,sk.n);
      break;
    case 'copypasta':
      say(P,'*colle 4 000 caractères*',1.8);
      if(t.kind==='player')t.dots.push({t:5,acc:0,dmg:roll(st.atk*.55),by:id});
      else for(const m of map.mobs){if(m.alive&&dist(m,t)<=2.2){m.dots.push({t:5,acc:0,dmg:roll(st.atk*.55),by:id});aggro(w,map,m,pl);toMap(w,map.id,{t:'puff',x:m.x,y:m.y-m.hgt*.6})}}
      break;
    case 'd20':{
      const nat=w.rnd()<.05,dmg=Math.max(1,Math.round(st.atk*rr(.6,1.4)*(nat?2:1)));
      if(nat){float(w,pl.mapId,P.x,P.y-1.9,'20 NATUREL !','#ffd84a',true);msg(w,id,'sys','20 NATUREL ! Le MJ n\'a rien vu venir.');say(P,'20 NATUREL !',2)}
      hit(dmg,nat,sk.n);break}
    case 'frame':hit(roll(st.atk*.7*mul),crit,sk.n);break;
    case 'avertissement':{
      const dmg=roll(st.atk*mul);hit(dmg,crit,sk.n);
      if(t.alive)t.threat[id]=(t.threat[id]||0)+dmg*2;
      break}
  }
}

function useSkill(w,pl,i,auto){
  const {S,P}=pl,id=pl.id,map=w.maps[pl.mapId],sk=skillsOf(S)[i];
  if(!sk||P.dead)return;
  if(S.lvl<sk.l){if(!auto)err(w,id,`« ${sk.n} » se débloque au niveau ${sk.l}.`);return}
  if((P.cd[sk.id]||0)>0){if(!auto)err(w,id,'Pas encore prêt. La patience n\'est pas votre compétence principale.');return}
  if(P.cast){if(!auto)err(w,id,'Vous êtes déjà occupé.');return}
  if(S.caf<sk.c){err(w,id,'Pas assez de Caféine.');return}
  const st=stats(S,P.drunk);
  if(sk.self)return SELF[sk.id](w,pl,sk,st);
  if(sk.ally)return ALLY[sk.id](w,pl,sk,st);
  let t=findEnt(w,pl.mapId,P.target);
  const foe=duelFoe(w,pl),pvp=!!(foe&&t&&t.kind==='player'&&t.id===foe.id);
  if(pvp&&pl.duel.phase!=='fight'){if(!auto)err(w,id,'Le duel n\'a pas encore commencé.');return}
  if(!pvp&&(!t||t.kind!=='mob'||!t.alive)){t=nearestMob(map,P,sk.rg+.6);if(!t){if(!auto)err(w,id,'Aucune cible. Touchez un ennemi ou appuyez sur Tab.');return}P.target=t.id}
  if(dist(P,t)>sk.rg){
    // Les attaques de base s'approchent toutes seules ; les autres demandent de se rapprocher à la main.
    if(!auto){if(i===0){P.auto=true;ev(w,id,{t:'approach',id:t.id})}else err(w,id,'Hors de portée. Rapprochez-vous (physiquement, ce n\'est pas social).')}
    return;
  }
  if(Math.abs(t.x-P.x)>.05)P.face=t.x>P.x?1:-1;
  dismount(w,pl,'Vous descendez de votre monture pour attaquer.');
  if(sk.id==='skipcine'){
    // « Derrière » = du côté opposé à l'orientation du monstre ; s'il y a un mur, on prend l'autre côté plutôt que d'échouer.
    const spot=[-t.face,t.face].map(d=>({x:t.x+d*1.1,y:t.y})).find(q=>canStand(map,q.x,q.y));
    if(!spot){if(!auto)err(w,id,'Pas de place derrière la cible.');return}
    teleport(w,pl,spot.x,spot.y);P.face=t.x>spot.x?1:-1;P.nextCrit=true;P.auto=true;P.combat=0;
    float(w,pl.mapId,P.x,P.y-1.9,'Skip !','#7fe0ff');burst(w,pl.mapId,P.x,P.y-.8,'#7fe0ff',10);pay(pl,sk);return;
  }
  pay(pl,sk);P.combat=0;P.auto=true;
  const crit=P.nextCrit||w.rnd()<.12,mul=crit?1.8:1;
  P.nextCrit=false;
  strike(w,pl,t,sk,st,crit,mul);
}

// Duels : état symétrique dans pl.duel = {foe, phase:'count'|'fight'}. Le serveur seul décide des touches (pvpHit) ; personne ne meurt, un duel s'arrête à 1 PV.
const inArena=(w,pl)=>pl.mapId==='over'&&zoneAt(w.maps.over,pl.P.x,pl.P.y)==='arene';
const duelFoe=(w,pl)=>pl.duel?w.players[pl.duel.foe]:null;
const attackable=(w,pl,t)=>(t.kind==='mob'&&t.alive)||(t.kind==='player'&&!!duelFoe(w,pl)&&duelFoe(w,pl).id===t.id&&pl.duel.phase==='fight');

function requestDuel(w,pl,name){
  if(!name){msg(w,pl.id,'sys','Usage : /duel <pseudo>');return}
  const dest=byName(w,name);
  if(!dest){msg(w,pl.id,'sys',`Personne ne s'appelle ${name} en ligne.`);return}
  if(dest===pl){msg(w,pl.id,'sys','Vous vous défiez vous-même. Vous gagnez, et vous perdez. Comme d\'habitude.');return}
  if(pl.duel||dest.duel){msg(w,pl.id,'sys','Un duel est déjà en cours.');return}
  if(!inArena(w,pl)||!inArena(w,dest)){msg(w,pl.id,'sys','Les deux joueurs doivent être dans l\'Arène du Débat Stérile (à l\'est du Bourg-Forum).');return}
  w.invites[dest.id]={from:pl.id,exp:w.time+DUEL_TTL,kind:'duel'};
  msg(w,dest.id,'sys',`[${pl.S.name}] vous défie en duel. Acceptez ou refusez dans la fenêtre (ou /accepter) : l'invitation expire dans ${DUEL_TTL} s.`);
  ev(w,dest.id,{t:'duelInvite',from:pl.S.name,ttl:DUEL_TTL});
  msg(w,pl.id,'sys',`Défi envoyé à [${dest.S.name}]. Il a ${DUEL_TTL} s pour avoir peur.`);
}

function duelReply(w,pl,ok){
  const inv=w.invites[pl.id];
  if(!inv||inv.kind!=='duel')return;
  if(ok){acceptInvite(w,pl);return}
  delete w.invites[pl.id];
  const from=w.players[inv.from];if(from)msg(w,from.id,'sys',`[${pl.S.name}] refuse le duel. Il préfère garder sa dignité.`);
}

function startDuel(w,a,b){
  if(a.duel||b.duel||a.P.dead||b.P.dead||!inArena(w,a)||!inArena(w,b)){msg(w,b.id,'sys','Duel impossible : les deux joueurs doivent être libres et dans l\'Arène.');return}
  for(const [p,o] of [[a,b],[b,a]]){
    dismount(w,p);p.duel={foe:o.id,phase:'count'};p.P.target=o.id;p.P.auto=false;p.P.cast=null;
    msg(w,p.id,'sys',`Duel contre [${o.S.name}] : préparez-vous.`);
  }
  const alive=()=>a.duel&&b.duel&&a.duel.foe===b.id&&b.duel.foe===a.id&&w.players[a.id]===a&&w.players[b.id]===b;
  const say3=text=>{if(alive())for(const p of [a,b])ev(w,p.id,{t:'count',text})};
  say3('3');later(w,1,()=>say3('2'));later(w,2,()=>say3('1'));
  later(w,DUEL_COUNT,()=>{if(alive()){a.duel.phase=b.duel.phase='fight';say3('DÉBATTEZ !')}});
}

// Coup d'un joueur sur l'autre : −50 % pour éviter les one-shots, et la barre ne descend jamais sous 1 PV.
function pvpHit(w,from,to,dmg,crit,src){
  const {S,P}=to;if(P.dead||!from.duel||from.duel.foe!==to.id||from.duel.phase!=='fight')return;
  if(P.buffs.glitch>0){float(w,to.mapId,P.x,P.y-1.3,'Glitch','#7fb6ff');return}
  const st=stats(S,P.drunk),d=Math.max(1,Math.round(dmg*PVP_MULT*(1-st.red)*(P.buffs.reglement>0?.5:1)));
  S.hp-=d;P.combat=0;from.P.combat=0;
  float(w,to.mapId,P.x,P.y-1.3,String(d),crit?'#ffd84a':'#ffffff',crit);burst(w,to.mapId,P.x,P.y-.8,'#ffcf8a',crit?8:4);
  msg(w,from.id,'cb',`Votre ${src} inflige ${d} dégâts${crit?' (critique)':''} à ${S.name}.`);
  msg(w,to.id,'cb in',`${from.S.name} vous inflige ${d} dégâts (${src}).`);
  if(S.hp<=1){S.hp=1;endDuel(w,from,to)}
}

function endDuel(w,winner,loser){
  for(const p of [winner,loser]){
    const st=stats(p.S,p.P.drunk);
    p.duel=null;p.S.hp=st.maxhp;p.S.caf=st.maxcaf;p.P.dots=[];p.P.auto=false;p.P.buffs={};p.P.cast=null;
  }
  winner.S.duelWins=(winner.S.duelWins||0)+1;loser.S.duelLosses=(loser.S.duelLosses||0)+1;
  loser.S.concede=winner.S.name;
  ev(w,winner.id,{t:'banner',title:'Victoire',sub:`Débat remporté contre ${loser.S.name}`,cls:'lvl'});
  ev(w,loser.id,{t:'banner',title:'Défaite',sub:'Écrivez « tu as raison ».'});
  msg(w,winner.id,'sys',`Vous avez gagné le duel contre [${loser.S.name}]. Il va devoir reconnaître que vous avez raison.`);
  msg(w,loser.id,'sys','Vous avez perdu un débat. Écrivez « tu as raison ».');
  ev(w,winner.id,{t:'self'});ev(w,loser.id,{t:'self'});
}

// Sortir de l'arène, mourir ou se déconnecter = abandon : l'adversaire gagne.
function abandonDuel(w,pl){
  if(!pl.duel)return;
  const foe=duelFoe(w,pl);
  if(foe)endDuel(w,foe,pl);else pl.duel=null
}
function checkDuel(w,pl){
  if(!pl.duel)return;
  const foe=duelFoe(w,pl);
  if(!foe||!inArena(w,pl)||!inArena(w,foe)||pl.P.dead||foe.P.dead)abandonDuel(w,pl);
}

function dismount(w,pl,why){
  if(!pl.P.mount)return;
  pl.P.mount=null;if(why)msg(w,pl.id,'sys',why);
}
function mountToggle(w,pl){
  const {S,P}=pl,m=MOUNTS[S.mount];
  if(P.mount){dismount(w,pl,'Vous descendez de votre monture.');return}
  if(P.cast)return;
  if(!m||!S.mounts.includes(S.mount)){err(w,pl.id,'Aucune monture. Kévin, au Bourg-Forum, en vend.');return}
  // Pas de monture en donjon ni en arène.
  if(pl.mapId!=='over'||inArena(w,pl)){err(w,pl.id,'Les montures sont interdites ici.');return}
  P.cast={id:'mount',n:m.n,t:1,max:1};ev(w,pl.id,{t:'stop'});
}
function buyMount(w,pl,id){
  const {S}=pl,m=MOUNTS[id];
  if(!m||m.seller!=='kevin'||!nearNpc(pl,m.seller)||S.mounts.includes(id))return;
  if(S.lvl<m.rl){err(w,pl.id,`Niveau ${m.rl} requis pour cette monture.`);return}
  if(S.gold<m.price){err(w,pl.id,'Pas assez d\'or. Kévin ne fait pas crédit, même à ses amis.');return}
  S.gold-=m.price;S.mounts.push(id);if(!S.mount)S.mount=id;
  msg(w,pl.id,'loot',`Vous achetez la monture **${m.n}** pour ${fmt(m.price)} po.`);
}
function mamanKill(w,pl){
  const {S}=pl;
  S.mamanKills=(S.mamanKills||0)+1;
  if(S.mounts.includes('maman'))return;
  if(S.mamanKills<MAMAN_KILLS){msg(w,pl.id,'sys',`Maman vaincue ${S.mamanKills}/${MAMAN_KILLS}. À ${MAMAN_KILLS}, elle propose de vous déposer en voiture.`);return}
  S.mounts.push('maman');if(!S.mount)S.mount='maman';
  ev(w,pl.id,{t:'banner',title:'Nouvelle monture',sub:MOUNTS.maman.n,cls:'lvl'});
  msg(w,pl.id,'loot',`Maman, vaincue ${MAMAN_KILLS} fois, accepte enfin de vous déposer : monture **${MOUNTS.maman.n}** obtenue.`);
}

// Le serveur recalcule la fusion avec la même fonction que l'aperçu du client, puis débite et remplace les deux objets du sac par le résultat.
function fusion(w,pl,ua,ub){
  const {S}=pl,a=S.inv.find(s=>s.uid===ua),b=S.inv.find(s=>s.uid===ub);
  if(!nearNpc(pl,'fanfiqueuse')||ua===ub||!a||!b)return;
  const r=fuse(a,b);
  if(!r){err(w,pl.id,'Il faut deux objets du même emplacement.');return}
  const cost=fuseCost(r);
  if(S.gold<cost){err(w,pl.id,`Pas assez d'or : cette fusion coûte ${fmt(cost)} po. La Fanfiqueuse vit de commandes.`);return}
  S.gold-=cost;S.inv=S.inv.filter(s=>s.uid!==ua&&s.uid!==ub);
  S.inv.push(withUid(S,r));
  msg(w,pl.id,'loot',`Fusion réussie pour ${fmt(cost)} po : ${link(S.inv[S.inv.length-1])}. Les deux originaux sont partis dans un fanzine.`);
}

function changeClass(w,pl,cls){
  const {S,P}=pl,cost=CLASS_COST*S.lvl;
  if(!nearNpc(pl,'conseiller')||!CLASSES[cls])return;
  if(S.cls===cls){err(w,pl.id,`Vous êtes déjà ${CLASSES[cls].nom}.`);return}
  if(S.gold<cost){err(w,pl.id,'Pas assez d\'or. La reconversion professionnelle, ça se finance.');return}
  S.gold-=cost;S.cls=cls;P.cd={};P.buffs={};P.cast=null;P.auto=false;P.nextCrit=false;
  S.hp=Math.min(S.hp,stats(S,P.drunk).maxhp);
  msg(w,pl.id,'sys',`Reconversion terminée : vous êtes désormais **${CLASSES[cls].nom}** (${fmt(cost)} po). Niveau, équipement et quêtes conservés.`);
  ev(w,pl.id,{t:'toast',kicker:'Nouvelle classe',title:CLASSES[cls].nom,sub:''});
}

const byName=(w,name)=>Object.values(w.players).find(p=>p.S.name.toLowerCase()===String(name).toLowerCase());
const allSaves=w=>w.saves?w.saves():Object.values(w.players).map(p=>p.S);
const guildOnline=(w,g)=>Object.values(w.players).filter(p=>p.S.guilde===g);
const toGuild=(w,g,text)=>{for(const p of guildOnline(w,g))msg(w,p.id,'guild',text)};
const cleanGuild=n=>n.replace(/[<>[\]*]/g,'').replace(/\s+/g,' ').trim().slice(0,32);

// Guilde : un simple nom dans la sauvegarde de chaque membre. Pas de chef : tout membre peut recruter.
function guilde(w,pl,v){
  const {S}=pl,name=cleanGuild(v.replace(/^\S+\s*/,''));
  if(!name){
    if(!S.guilde){msg(w,pl.id,'sys','Vous n\'avez pas de guilde. /guilde <nom> pour en fonder une, ou demandez à un membre de vous /recruter.');return}
    msg(w,pl.id,'guild',`<${S.guilde}> · membres connectés : ${guildOnline(w,S.guilde).map(p=>`${p.S.name} (niv. ${p.S.lvl})`).join(', ')}.`);return;
  }
  if(S.guilde){msg(w,pl.id,'sys',`Vous êtes déjà dans <${S.guilde}>. /quitter d'abord.`);return}
  if(allSaves(w).some(o=>o.guilde&&plain(o.guilde)===plain(name))){msg(w,pl.id,'sys',`La guilde <${name}> existe déjà. Demandez à un de ses membres de vous /recruter.`);return}
  S.guilde=name;
  toAll(w,{t:'msg',cls:'sys',text:`[Serveur] ${S.name} fonde la guilde <${name}>. Les candidatures sont ouvertes. Personne n'en enverra.`});
}

function inviteCheck(w,pl,name,usage){
  if(!name){msg(w,pl.id,'sys',usage);return null}
  const dest=byName(w,name);
  if(!dest){msg(w,pl.id,'sys',`Personne ne s'appelle ${name} en ligne.`);return null}
  if(dest===pl){msg(w,pl.id,'sys','Vous vous invitez vous-même. Vous acceptez. Vous êtes toujours seul.');return null}
  return dest;
}

function recruit(w,pl,name){
  if(!pl.S.guilde){msg(w,pl.id,'sys','Vous n\'avez pas de guilde à proposer. /guilde <nom> pour en fonder une.');return}
  const dest=inviteCheck(w,pl,name,'Usage : /recruter <pseudo>');if(!dest)return;
  if(dest.S.guilde){msg(w,pl.id,'sys',`[${dest.S.name}] est déjà dans <${dest.S.guilde}>.`);return}
  w.invites[dest.id]={from:pl.id,exp:w.time+INVITE_TTL,kind:'guild',g:pl.S.guilde};
  msg(w,dest.id,'sys',`[${pl.S.name}] vous propose de rejoindre la guilde <${pl.S.guilde}>. Tapez /accepter (l'invitation expire dans ${INVITE_TTL} s).`);
  msg(w,pl.id,'sys',`Proposition envoyée à [${dest.S.name}].`);
}

// Donjon à plusieurs : on entre seul, puis on fait venir ses amis où qu'ils soient sur la carte du monde.
function invite(w,pl,name){
  const D=w.maps[pl.mapId];
  if(pl.mapId==='over'){msg(w,pl.id,'sys','Entrez d\'abord dans un donjon, puis /inviter <pseudo> pour qu\'un ami vous rejoigne.');return}
  const dest=inviteCheck(w,pl,name,'Usage : /inviter <pseudo>');if(!dest)return;
  if(onMap(w,D.id).length>=DG_MAX){msg(w,pl.id,'sys',`Le donjon est complet (${DG_MAX} joueurs maximum).`);return}
  if(dest.mapId===D.id){msg(w,pl.id,'sys',`[${dest.S.name}] est déjà là. Regardez mieux.`);return}
  w.invites[dest.id]={from:pl.id,exp:w.time+INVITE_TTL,kind:'dungeon',map:D.id};
  msg(w,dest.id,'sys',`[${pl.S.name}] vous invite dans ${DUNGEONS[D.dg].n} (${DIFFS[D.ti].n}). Tapez /accepter pour le rejoindre (l'invitation expire dans ${INVITE_TTL} s).`);
  msg(w,pl.id,'sys',`Invitation envoyée à [${dest.S.name}]. Il a ${INVITE_TTL} s pour réfléchir.`);
}

function joinDungeon(w,pl,inv){
  const D=w.maps[inv.map],df=D&&dgDiff(D.dg,D.ti);
  if(!D||D.done){msg(w,pl.id,'sys','Ce donjon est déjà terminé (ou détruit). Trop tard.');return}
  if(pl.mapId!=='over'||pl.P.dead||pl.duel||pl.trade){msg(w,pl.id,'sys','Revenez sur la carte du monde, vivant et libre, puis réessayez.');return}
  if(pl.S.lvl<df.rl){msg(w,pl.id,'sys',`Niveau ${df.rl} requis pour la difficulté ${df.n}.`);return}
  if(onMap(w,D.id).length>=DG_MAX){msg(w,pl.id,'sys','Le donjon est complet.');return}
  // Chaque joueur en plus renforce les ennemis encore debout, comme s'il était entré dès le début.
  const scale=1+.6*onMap(w,D.id).length;
  for(const m of D.mobs)if(m.alive){m.hp=Math.round(m.hp*scale/D.scale);m.mhp=Math.round(m.mhp*scale/D.scale)}
  D.scale=scale;
  toMap(w,D.id,{t:'msg',cls:'sys',text:`[${pl.S.name}] vous rejoint. Les ennemis le sentent et prennent du volume.`});
  descend(w,pl,D);
}

function acceptInvite(w,pl){
  const inv=w.invites[pl.id],from=inv&&w.players[inv.from];
  delete w.invites[pl.id];
  if(!inv||inv.exp<w.time||!from){msg(w,pl.id,'sys','Personne ne vous a invité récemment. Ça arrive.');return}
  if(inv.kind==='trade'){openTrade(w,from,pl);return}
  if(inv.kind==='duel'){startDuel(w,from,pl);return}
  if(inv.kind==='dungeon'){joinDungeon(w,pl,inv);return}
  if(pl.S.guilde){msg(w,pl.id,'sys',`Vous êtes déjà dans <${pl.S.guilde}> : /quitter d'abord.`);return}
  pl.S.guilde=inv.g;
  toGuild(w,inv.g,`[${pl.S.name}] rejoint la guilde <${inv.g}>.`);
}

function leaveGuild(w,pl){
  const g=pl.S.guilde;
  if(!g){msg(w,pl.id,'sys','Vous n\'avez pas de guilde à quitter.');return}
  toGuild(w,g,`[${pl.S.name}] quitte la guilde <${g}>.`);
  pl.S.guilde=null;
}

function guildChat(w,pl,v){
  const text=v.replace(/^\S+\s*/,'');
  if(!pl.S.guilde){msg(w,pl.id,'sys','Vous n\'avez pas de guilde. Vous parlez seul, comme d\'habitude.');return}
  if(!text){msg(w,pl.id,'sys','Usage : /g <texte>');return}
  for(const p of guildOnline(w,pl.S.guilde))ev(w,p.id,{t:'chat',ch:'Guilde',who:pl.S.name,text,me:p===pl});
}

// Échange : l'offre de chaque joueur vit dans pl.trade. Toute modification d'une offre annule les deux validations,
// sinon on pourrait changer l'objet après que l'autre a validé.
// Offre = instances d'équipement désignées par uid + piles {id,n}. Les piles se comptent par id, les instances une à une.
const owned=(S,id)=>S.inv.reduce((a,s)=>a+(!s.uid&&s.id===id?s.n:0),0);
function takeItem(S,id,n){
  for(const s of S.inv){if(s.uid||s.id!==id)continue;const k=Math.min(n,s.n);s.n-=k;n-=k;if(!n)break}
  S.inv=S.inv.filter(s=>s.uid||s.n>0);
}
const tradeSide=T=>({items:T.items,gold:T.gold,ok:T.ok});
function sendTrade(w,pl){
  const T=pl.trade,o=w.players[T.with];
  ev(w,pl.id,{t:'trade',with:o.S.name,mine:tradeSide(T),theirs:tradeSide(o.trade)});
}
function endTrade(w,pl,why){
  const T=pl.trade;if(!T)return;
  const o=w.players[T.with];
  for(const p of [pl,o])if(p&&p.trade){p.trade=null;ev(w,p.id,{t:'trade',end:true});if(why)msg(w,p.id,'sys',why)}
}

function requestTrade(w,pl,name){
  if(!name){msg(w,pl.id,'sys','Usage : /echanger <pseudo>');return}
  const dest=byName(w,name);
  if(!dest){msg(w,pl.id,'sys',`Personne ne s'appelle ${name} en ligne.`);return}
  if(dest===pl){msg(w,pl.id,'sys','Vous échangez avec vous-même. Le taux est avantageux, mais ça ne rapporte rien.');return}
  if(pl.trade||dest.trade){msg(w,pl.id,'sys','Un échange est déjà en cours.');return}
  w.invites[dest.id]={from:pl.id,exp:w.time+INVITE_TTL,kind:'trade'};
  msg(w,dest.id,'sys',`[${pl.S.name}] vous propose un échange. Tapez /accepter pour ouvrir la fenêtre (l'invitation expire dans ${INVITE_TTL} s).`);
  msg(w,pl.id,'sys',`Proposition d'échange envoyée à [${dest.S.name}].`);
}

function openTrade(w,a,b){
  if(a.trade||b.trade||a.P.dead||b.P.dead){msg(w,b.id,'sys','Échange impossible pour le moment.');return}
  for(const [p,o] of [[a,b],[b,a]])p.trade={with:o.id,items:[],gold:0,ok:false};
  sendTrade(w,a);sendTrade(w,b);
}

function tradeOffer(w,pl,a){
  const T=pl.trade;if(!T)return;
  const stacks=new Map(),insts=[];
  for(const x of Array.isArray(a.items)?a.items.slice(0,BAG):[]){
    if(x&&typeof x.uid==='string'){const q=pl.S.inv.find(s=>s.uid===x.uid);if(q&&!insts.some(i=>i.uid===q.uid))insts.push({...q});continue}
    if(!x||!ITEMS[x.id]||!stackable(x.id)||!Number.isInteger(x.n)||x.n<1)continue;
    stacks.set(x.id,(stacks.get(x.id)||0)+x.n);
  }
  const gold=Number.isInteger(a.gold)?a.gold:0;
  if(gold<0||gold>pl.S.gold||[...stacks].some(([id,n])=>n>owned(pl.S,id)))err(w,pl.id,'Offre refusée : vous ne possédez pas tout ça.');
  else{T.items=[...insts,...[...stacks].map(([id,n])=>({id,n}))];T.gold=gold;T.ok=false;w.players[T.with].trade.ok=false}
  sendTrade(w,pl);sendTrade(w,w.players[T.with]);
}

function tradeOk(w,pl){
  const T=pl.trade;if(!T)return;
  const o=w.players[T.with];T.ok=true;
  if(o.trade.ok)commitTrade(w,pl,o);
  else{sendTrade(w,pl);sendTrade(w,o)}
}

function commitTrade(w,a,b){
  const valid=p=>p.trade.gold<=p.S.gold&&p.trade.items.every(x=>x.uid?p.S.inv.some(s=>s.uid===x.uid):owned(p.S,x.id)>=x.n);
  if(!valid(a)||!valid(b)){endTrade(w,a,'Échange annulé : une offre n\'est plus valide.');return}
  const bak=[a,b].map(p=>JSON.stringify([p.S.inv,p.S.gold,p.S.nextUid]));
  for(const p of [a,b])for(const x of p.trade.items){if(x.uid)p.S.inv=p.S.inv.filter(s=>s.uid!==x.uid);else takeItem(p.S,x.id,x.n)}
  // Les emplacements libérés par l'un servent à l'autre : on ne teste la place qu'une fois les deux sacs vidés.
  const give=(from,to)=>{
    to.S.gold+=from.trade.gold;from.S.gold-=from.trade.gold;
    return from.trade.items.every(x=>x.uid?addItem(w,to,x.id,1,x.nObj,x.rarete):addItem(w,to,x.id,x.n));
  };
  if(!(give(a,b)&&give(b,a))){
    [a,b].forEach((p,i)=>{[p.S.inv,p.S.gold,p.S.nextUid]=JSON.parse(bak[i])});
    endTrade(w,a,'Échange annulé : un des sacs est plein.');return;
  }
  for(const [p,o] of [[a,b],[b,a]]){
    for(const x of o.trade.items)msg(w,p.id,'loot',`Vous recevez ${link(x)} de [${o.S.name}].`);
    if(o.trade.gold)msg(w,p.id,'loot',`Vous recevez ${fmt(o.trade.gold)} po de [${o.S.name}].`);
    if(p.S.gold>=100)ach(w,p,'rich');
  }
  endTrade(w,a,'Échange terminé.');
  ev(w,a.id,{t:'self'});ev(w,b.id,{t:'self'});
}

const nearNpc=(pl,id)=>{const n=npcById(id);return !!n&&pl.mapId==='over'&&dist(pl.P,n)<NEAR};
const nearMerchant=pl=>['gerard','bernard','tavernier'].some(id=>nearNpc(pl,id));
const buyCost=(id,n)=>id==='chouffe'&&n===5?55:buyPrice(id)*n;

function buy(w,pl,id,n){
  // Plusieurs marchands vendent les mêmes consommables : c'est celui d'à côté qui vend.
  const {S}=pl,seller=Object.keys(STOCK).find(k=>STOCK[k].includes(id)&&nearNpc(pl,k));
  if(!seller||!Number.isInteger(n)||n<1||n>5)return;
  const it=ITEMS[id],cost=buyCost(id,n);
  if(it.t==='eq'&&(n!==1||S.lvl<it.rl)){if(n===1)err(w,pl.id,`Niveau ${it.rl} requis pour équiper cet objet.`);return}
  if(S.gold<cost){err(w,pl.id,'Pas assez d\'or. Personne ne fait crédit depuis l\'incident de 2014.');return}
  const better=it.t==='eq'&&cmpInfo(S,newItem(id)).better;
  if(!addItem(w,pl,id,n))return;
  S.gold-=cost;msg(w,pl.id,'loot',`Vous achetez ${n>1?n+' × ':''}${it.t==='eq'?link(S.inv[S.inv.length-1]):`[[${id}]]`} pour ${cost} po.`);
  if(seller==='bernard')ach(w,pl,'shop');
  if(better)equip(w,pl,S.inv.length-1);
}

function gainGold(w,pl,v,art){
  const {S}=pl;S.gold+=v;
  if(art){S.artSold=(S.artSold||0)+v;if(S.artSold>=1000)ach(w,pl,'millio')}
  if(S.gold>=100)ach(w,pl,'rich');
}

function sell(w,pl,idx){
  const {S}=pl,s=S.inv[idx];if(!s||!nearMerchant(pl))return;
  const it=ITEMS[s.id],v=s.uid?itemValue(s):it.price*s.n;
  S.inv.splice(idx,1);gainGold(w,pl,v,it.t==='art');
  msg(w,pl.id,'loot',`Vous vendez ${link(s)}${s.n>1?' ×'+s.n:''} pour ${fmt(v)} po.`);
}

function sellAll(w,pl,kind){
  const {S}=pl;if(!nearNpc(pl,'gerard')||(kind!=='art'&&kind!=='junk'))return;
  const lot=S.inv.filter(s=>ITEMS[s.id].t===kind),v=lot.reduce((a,s)=>a+ITEMS[s.id].price*s.n,0);
  S.inv=S.inv.filter(s=>ITEMS[s.id].t!==kind);gainGold(w,pl,v,kind==='art');
  msg(w,pl.id,'loot',kind==='art'?`Gérard vous rachète vos artéfacts pour ${fmt(v)} po. Il les caresse en silence.`:`Vous vendez votre bric-à-brac pour ${v} po. Gérard s'essuie les mains.`);
}

function acceptQuest(w,pl){
  const {S}=pl,q=QUESTS[S.q.i];
  if(!q||S.q.st!=='avail'||!nearNpc(pl,q.g))return;
  S.q.st='active';S.q.n=0;msg(w,pl.id,'sys',`Quête acceptée : **${q.n}**.`);
}

function completeQuest(w,pl){
  const {S}=pl,q=QUESTS[S.q.i];
  if(!q||S.q.st!=='ready'||!nearNpc(pl,q.g))return;
  S.gold+=q.gold;msg(w,pl.id,'sys',`Quête terminée : **${q.n}**. Vous recevez ${q.gold} po.`);
  if(q.item&&addItem(w,pl,q.item,q.itemN||1)){
    const it=ITEMS[q.item],got=it.t==='eq'?S.inv[S.inv.length-1]:null;
    msg(w,pl.id,'loot',`Vous recevez ${q.itemN?q.itemN+' × ':''}${got?link(got):`[[${q.item}]]`}.`);
    if(got&&score(got)>score(S.eq[it.s])&&S.lvl>=(it.rl||1))equip(w,pl,S.inv.length-1);
  }
  S.q.i++;S.q.st='avail';S.q.n=0;
  gainXP(w,pl,q.xp);ev(w,pl.id,{t:'toast',kicker:'Quête terminée',title:q.n,sub:''});
  if(S.gold>=100)ach(w,pl,'rich');
  if(q.fin)ev(w,pl.id,{t:'campaignEnd',final:!!q.final});
}

// Monstre de donjon : mise à l'échelle du nombre de joueurs, Héroïque et plus (PV ×1,3, dégâts ×1,2), élite (PV ×1,5, dégâts ×1,2) avec son affixe.
function mkDgMob(w,D,type,x,y,l,spec={}){
  const m=mkMob(w,type,x,y,l,undefined,D.ti),hard=D.ti>=1;
  let hp=D.scale*(hard?1.3:1),dm=hard?1.2:1;
  if(spec.elite){m.elite=1;m.affix=spec.affix;hp*=1.5;dm*=1.2}
  m.hp=m.mhp=Math.round(m.hp*hp);m.atk=m.atk.map(a=>Math.round(a*dm));
  if(m.affix==='epingle')m.shield=m.mshield=Math.round(m.mhp*.5);
  if(spec.patrol)m.patrol=spec.patrol;
  return m;
}

function enterDungeon(w,pl,ti,dgId='archives'){
  const dg=DUNGEONS[dgId],df=dg&&DIFFS[ti]&&dgDiff(dgId,ti);
  if(!df||pl.mapId!=='over'||!nearNpc(pl,dg.npc))return;
  if(pl.S.lvl<df.rl){err(w,pl.id,`Niveau ${df.rl} requis pour la difficulté ${df.n}.`);return}
  const seed=(w.rnd()*2**32)>>>0,D=genDungeon(seed,ti,{L:df.L,kinds:dg.kinds,boss:dg.boss});
  if(!D){err(w,pl.id,`${dg.n} est en maintenance. Réessayez.`);return}
  D.id='dg'+(++w.instN);D.seed=seed;D.dg=dgId;D.done=false;D.npcs=[];D.bots=[];D.scale=1;
  D.mobs=D.spawns.map(s=>{
    const elite=ti>=2&&![].concat(dg.boss).includes(s.type)&&w.rnd()<(ti===2?.15:.25);
    return mkDgMob(w,D,s.type,s.x,s.y,s.l,{elite,affix:elite?w.r.pick(Object.keys(AFFIXES)):null,patrol:s.patrol});
  });
  D.objs=[{id:nid(w,'o'),kind:'obj',type:'portal',n:dg.sortie,x:D.portal.x,y:D.portal.y,hgt:.9}];
  w.maps[D.id]=D;
  descend(w,pl,D);
  msg(w,pl.id,'sys','[Aide] Pour faire venir des amis : /inviter <pseudo>.');
}

function descend(w,p,D){
  dismount(w,p);p.mapId=D.id;p.P.target=null;p.P.auto=false;p.P.cast=null;dropAggro(w,p);
  teleport(w,p,D.sx,D.sy);
  msg(w,p.id,'sys',`Vous descendez dans ${DUNGEONS[D.dg].n} (${DIFFS[D.ti].n}). ${DUNGEONS[D.dg].arrivee}`);
}

function destroyIfEmpty(w,mapId){if(mapId!=='over'&&!onMap(w,mapId).length)delete w.maps[mapId]}

function leaveDungeon(w,pl){
  const {P}=pl,from=pl.mapId;
  if(from==='over')return;
  const dg=DUNGEONS[w.maps[from].dg];
  pl.mapId='over';P.target=null;P.auto=false;P.cast=null;
  teleport(w,pl,dg.exit.x,dg.exit.y);
  msg(w,pl.id,'sys',dg.retour);
  destroyIfEmpty(w,from);
}

function openChest(w,pl,id){
  const {S,P}=pl,map=w.maps[pl.mapId],o=map.objs.find(x=>x.id===id&&x.type==='chest');
  if(!o||dist(P,o)>2.5)return;
  if(o.openedBy.includes(pl.id)){err(w,pl.id,'Le coffre est vide. Comme votre agenda.');return}
  o.openedBy.push(pl.id);
  const dg=DUNGEONS[map.dg],df=dgDiff(map.dg,map.ti),got=[];
  for(let i=0;i<df.arts;i++){const aid=rollArt(map.ti,w.rnd,ART_POOLS[map.dg]);if(addItem(w,pl,aid,1))got.push(aid)}
  // Équipement légendaire du donjon : le grimoire des Archives (DIFFS.grim), ou l'objet unique du donjon à thème.
  const rare=dg.unique?{item:dg.unique.item,p:dg.unique.chance[map.ti]}:{item:'grimoire',p:df.grim};
  if(rare.p&&w.rnd()<rare.p&&addItem(w,pl,rare.item,1,df.L))got.push(rare.item);
  const extra=w.rnd()<.6&&addItem(w,pl,'chouffe',2);
  S.gold+=df.gold;burst(w,pl.mapId,o.x,o.y-.5,'#f0d070',24,3);
  for(const g of got)msg(w,pl.id,'loot',`Vous recevez le butin : ${ITEMS[g].t==='eq'?link(S.inv[S.inv.length-1]):`[[${g}]]`}.`);
  msg(w,pl.id,'loot',`Vous ramassez ${df.gold} po.`);
  if(!map.objs.some(x=>x.type==='portal'&&x.exit))map.objs.push({id:nid(w,'o'),kind:'obj',type:'portal',exit:true,n:dg.sortie,x:o.x+1.6,y:o.y,hgt:.9});
  ev(w,pl.id,{t:'chest',ti:map.ti,dg:map.dg,got,extra,gold:df.gold});
  if(S.gold>=100)ach(w,pl,'rich');
}

export function handleAction(w,id,a){
  const pl=w.players[id];if(!pl||!a)return;
  const {S,P}=pl;
  if(P.dead&&a.a!=='respawn')return;
  switch(a.a){
    case 'target':
      if(a.id==null){P.target=null;P.auto=false;break}
      {const e=findEnt(w,pl.mapId,a.id);if(!e||(e.kind==='mob'&&!e.alive))break;P.target=e.id;if(a.auto&&(e.kind==='mob'||(e.kind==='player'&&duelFoe(w,pl)&&duelFoe(w,pl).id===e.id)))P.auto=true}
      break;
    case 'talk':if(nearNpc(pl,a.id)){P.target=a.id;if(a.id==='tavernier')ach(w,pl,'khey');if(npcById(a.id).board)ev(w,id,{t:'board',tops:tops(w,10)})}break;
    case 'skill':useSkill(w,pl,a.i,false);break;
    case 'useItem':if(ITEMS[a.id]&&ITEMS[a.id].t==='use')useItem(w,pl,a.id);break;
    case 'equip':equip(w,pl,a.idx);break;
    case 'unequip':if(SLOTS[a.slot])unequip(w,pl,a.slot);break;
    case 'drop':{const s=S.inv[a.idx];if(s){S.inv.splice(a.idx,1);msg(w,id,'sys',`Vous jetez ${link(s)}. Personne ne le ramassera.`)}break}
    case 'buy':buy(w,pl,a.id,a.n);break;
    case 'sell':sell(w,pl,a.idx);break;
    case 'sellAll':sellAll(w,pl,a.kind);break;
    case 'acceptQuest':acceptQuest(w,pl);break;
    case 'completeQuest':completeQuest(w,pl);break;
    case 'enterDungeon':enterDungeon(w,pl,a.ti,a.dg||'archives');break;
    case 'leaveDungeon':leaveDungeon(w,pl);break;
    case 'openChest':openChest(w,pl,a.id);break;
    case 'tradeOffer':tradeOffer(w,pl,a);break;
    case 'tradeOk':tradeOk(w,pl);break;
    case 'tradeCancel':endTrade(w,pl,'Échange annulé.');break;
    case 'duelReply':duelReply(w,pl,!!a.ok);break;
    case 'mount':mountToggle(w,pl);break;
    case 'selectMount':if(S.mounts.includes(a.id))S.mount=a.id;break;
    case 'buyMount':buyMount(w,pl,a.id);break;
    case 'fuse':fusion(w,pl,a.x,a.y);break;
    case 'changeClass':changeClass(w,pl,a.cls);break;
    case 'respawn':if(P.dead)respawn(w,pl);break;
    default:return;
  }
  ev(w,id,{t:'self'});
}

// Insensible à la casse et aux accents.
const plain=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const emote=(w,pl,txt)=>toAll(w,{t:'emote',who:pl.S.name,text:txt});
// Un handler par entrée de shared/data/commands.js ; le dispatch (alias, droit requis) est fait une seule fois dans runCommand.
const RUN={
  aide:(w,pl)=>msg(w,pl.id,'sys','Commandes : '+visibleCommands(pl).map(c=>'/'+c.nom).join(' · ')),
  qui:(w,pl)=>{const all=Object.values(w.players);msg(w,pl.id,'sys',`Joueurs connectés (${all.length}) : ${all.map(p=>`${p.S.name} (niv. ${p.S.lvl}, ${zoneName(w.maps[p.mapId],p.P)})`).join(', ')}.`)},
  mp:(w,pl,v)=>whisper(w,pl,v),
  inviter:(w,pl,v)=>invite(w,pl,v.split(/\s+/)[1]),
  accepter:(w,pl)=>acceptInvite(w,pl),
  guilde:(w,pl,v)=>guilde(w,pl,v),
  recruter:(w,pl,v)=>recruit(w,pl,v.split(/\s+/)[1]),
  quitter:(w,pl)=>leaveGuild(w,pl),
  g:(w,pl,v)=>guildChat(w,pl,v),
  echanger:(w,pl,v)=>requestTrade(w,pl,v.split(/\s+/)[1]),
  duel:(w,pl,v)=>requestDuel(w,pl,v.split(/\s+/)[1]),
  top:(w,pl)=>top(w,pl),
  tp:(w,pl,v)=>travel(w,pl,v.split(/\s+/)[1]),
  danse:(w,pl)=>{say(pl.P,'*danse comme à une soirée où il n\'a pas été invité*',3);emote(w,pl,'danse maladroitement. Personne ne regarde. Heureusement.')},
  mlady:(w,pl)=>{const {S,P}=pl;P.tipT=.45;S.tips++;say(P,"M'lady.",2);emote(w,pl,'soulève son fedora en direction de personne en particulier.');if(S.tips>=50)ach(w,pl,'mlady')},
  herbe:(w,pl)=>msg(w,pl.id,'sys','Vous tendez la main vers l\'herbe. Votre main refuse. Vous ne pouvez pas toucher l\'herbe pour le moment.'),
  khey:(w,pl)=>{
    say(pl.P,'PAR PITIÉ LE KHEY',2.5);toAll(w,{t:'chat',who:pl.S.name,text:'PAR PITIÉ LE KHEY'});
    if(w.bots)later(w,1.2,()=>{const bots=w.maps.over.bots,b=bots.find(b=>b.g==='Par Pitié')||w.r.pick(bots);toAll(w,{t:'chat',who:b.n,text:'AYAAA un vrai du 18-25'});say(b,'AYAAA un vrai du 18-25',3)});
  },
  annonce:(w,pl,v)=>{
    const text=v.replace(/^\S+\s*/,'');
    if(!text){msg(w,pl.id,'sys','Usage : /annonce <texte>');return}
    toAll(w,{t:'announce',who:pl.S.name,text});
    toAll(w,{t:'msg',cls:'yell',text:`[Annonce] ${pl.S.name} : ${text}`});
  },
  douche:(w,pl)=>msg(w,pl.id,'sys','Vous cherchez la douche. Erreur 404 : salle de bain introuvable.'),
};
function runCommand(w,pl,v){
  const word=v.split(/\s+/)[0],cmd=findCommand(word.slice(1));
  // Sans le droit, la commande doit être indiscernable d'une commande qui n'existe pas.
  if(cmd&&canUse(pl,cmd))RUN[cmd.nom](w,pl,v);
  else msg(w,pl.id,'sys',`Commande inconnue : ${word}.`);
}

export function handleChat(w,id,text){
  const pl=w.players[id];if(!pl)return;
  const {S,P}=pl,{pick}=w.r,v=String(text||'').trim().slice(0,140);if(!v)return;
  if(v.startsWith('/')){runCommand(w,pl,v);ev(w,id,{t:'self'});return}
  // Le perdant d'un duel ne peut plus rien écrire dans le Général tant qu'il n'a pas reconnu son tort.
  const conceded=S.concede&&plain(v)==='tu as raison';
  if(S.concede&&!conceded){msg(w,id,'sys','Vous avez perdu un débat. Écrivez « tu as raison ».');return}
  for(const o of Object.values(w.players))ev(w,o.id,{t:'chat',who:S.name,text:v,me:o.id===id});
  say(P,v,4);
  if(conceded){toAll(w,{t:'msg',cls:'sys',text:`[Serveur] ${S.name} a perdu le débat contre ${S.concede} et reconnaît : « tu as raison ». Victoire de ${S.concede}.`});S.concede=null}
  if(/en fait/i.test(v))ach(w,pl,'chat');
  if(w.bots&&w.rnd()<.75)later(w,w.r.rr(.9,2.6),()=>botTalk(w,pick(BOT_REPLIES),3.5));
  ev(w,id,{t:'self'});
}

const zoneName=(map,P)=>{const z=zoneAt(map,P.x,P.y);return z==='dungeon'?`${DUNGEONS[map.dg].n}, ${DIFFS[map.ti].n}`:ZONES[z].n};

// w.saves() est fourni par le serveur (toutes les sauvegardes, hors-ligne compris) ; la sim seule ne connaît que les connectés.
const TOPS=[['Niveau',S=>S.lvl,(a,b)=>b.xp-a.xp],['Archives terminées',S=>S.dg||0],['Chouffes bues',S=>S.chouffes||0],['Duels',S=>S.duelWins||0,null,S=>`${S.duelWins||0}V/${S.duelLosses||0}D`]];
// [[intitulé, [[pseudo, valeur affichée, guilde], …]], …] : partagé par /top et le Tableau d'Honneur du sous-sol.
function tops(w,n=5){
  const rows=allSaves(w);
  return TOPS.map(([label,val,tie,show])=>[label,[...rows].sort((a,b)=>val(b)-val(a)||(tie?tie(a,b):0)).slice(0,n).map(S=>[S.name,show?show(S):fmt(val(S)),S.guilde||''])]);
}
function top(w,pl){
  for(const [label,best] of tops(w))msg(w,pl.id,'sys',`Top ${label} : ${best.map(([n,v],i)=>`${i+1}. ${n} (${v})`).join(' · ')}`);
}

function whisper(w,pl,v){
  const [,to,...words]=v.split(/\s+/),text=words.join(' ');
  if(!to||!text){msg(w,pl.id,'sys','Usage : /mp <pseudo> <message>');return}
  const dest=Object.values(w.players).find(p=>p.S.name.toLowerCase()===to.toLowerCase());
  if(!dest){msg(w,pl.id,'sys',`Personne ne s'appelle ${to} en ligne.`);return}
  if(dest===pl){msg(w,pl.id,'sys','Vous vous chuchotez à vous-même. Personne ne vous a entendu, comme d\'habitude.');return}
  msg(w,dest.id,'wsp',`[${pl.S.name}] vous chuchote : ${text}`);
  msg(w,pl.id,'wsp',`Vous chuchotez à [${dest.S.name}] : ${text}`);
}

function botTalk(w,l,dur){
  const bots=w.maps.over.bots,b=w.r.pick(bots);
  if(l.startsWith('/me '))toAll(w,{t:'emote',who:b.n,text:l.slice(4)});
  else{toAll(w,{t:'chat',who:b.n,text:l});say(b,l,dur)}
  return b;
}

function tickBots(w,dt){
  if(!w.bots)return;
  const map=w.maps.over,{rr,pick}=w.r;
  for(const b of map.bots){
    if(b.sayT>0)b.sayT-=dt;if(b.tip>0)b.tip-=dt;
    b.wt-=dt;
    if(b.wt<=0){b.wt=rr(2,7);if(w.rnd()<.6){const p={x:b.x+rr(-6,6),y:b.y+rr(-6,6)};if(p.x>1&&p.y>1&&p.x<79&&p.y<59&&!isSolid(map,p.x,p.y)&&zoneAt(map,p.x,p.y)!=='cuisine')b.goal=p}else if(w.rnd()<.3)b.tip=.45}
    if(b.goal){if(stepToward(map,b,b.goal.x,b.goal.y,2.6,dt)||Math.hypot(b.goal.x-b.x,b.goal.y-b.y)<.1){b.goal=null;b.moving=false}}else b.moving=false;
  }
  w.botT-=dt;if(w.botT<=0){w.botT=rr(6,12);const l=pick(BOT_LINES),b=botTalk(w,l,4.5);if(l.startsWith('/me '))b.tip=.45}
  w.sysT-=dt;if(w.sysT<=0){w.sysT=rr(45,80);toAll(w,{t:'msg',cls:'sys',text:`[Serveur] ${pick(SYS_LINES)}`})}
}

// ---- Moteur de boss : lit shared/data/bosses.js, ne connaît aucun boss en particulier ----
const bossAbilities=m=>BOSSES[m.type].abilities.filter(a=>m.diff>=a.diffMin);
const yell=(w,map,m,text,dur)=>{say(m,text,dur||3.5);toMap(w,map.id,{t:'msg',cls:'yell',text:`[${m.d.yn}] crie : ${text}`})};
const bossMult=m=>(m.hard?m.hardMult:1);
// hitF peut contenir {n} : une note sur 20 tirée au hasard (Correcteur de Philo).
const hitText=(w,a)=>a.hitF.replace('{n}',w.r.ri(0,8));

// Phases déclenchées par un seuil de PV ou un délai.
const PHASE={
  rage(w,map,m,a){m.enr=1;m.enrMult=a.mult;yell(w,map,m,a.say);toMap(w,map.id,{t:'err',text:`${m.d.yn} devient enragé${m.d.fem?'e':''} !`})},
  summon(w,map,m,a){
    yell(w,map,m,a.say);
    const spots=[[-1.8,0],[1.8,0],[0,1.8],[0,-1.8]].map(([dx,dy])=>({x:m.x+dx,y:m.y+dy})).filter(q=>canStand(map,q.x,q.y));
    for(let i=0;i<a.count&&spots.length;i++){
      const q=spots[i%spots.length],l=Math.max(1,m.l-1);
      const c=map.id==='over'?mkMob(w,a.summon,q.x,q.y,l,undefined,m.diff):mkDgMob(w,map,a.summon,q.x,q.y,l);
      c.summoned=true;c.xp=0;c.g=[0,0];c.rt=Infinity;c.st='chase';c.acd=.9;c.target=m.target;
      map.mobs.push(c);m.b.summons.push(c.id);burst(w,map.id,q.x,q.y-.5,'#c9a8ff',8);
    }
  },
  shrink(w,map,m,a){m.zone={x:m.hx,y:m.hy,r:a.r0,t:0,acc:0,a};yell(w,map,m,a.say);toMap(w,map.id,{t:'err',text:`${a.n} : la zone de combat rétrécit !`})},
  // Le rideau tombe : tout le groupe sort du donjon, qui se détruit ; le boss repart à zéro à la prochaine descente.
  eject(w,map,m,a){
    yell(w,map,m,a.say);toMap(w,map.id,{t:'banner',title:a.n,sub:a.msg,cls:'dg'});toMap(w,map.id,{t:'msg',cls:'sys',text:a.msg});
    for(const p of onMap(w,map.id))leaveDungeon(w,p);
  },
  enrage(w,map,m,a){m.hard=1;m.hardMult=a.mult;yell(w,map,m,a.say);toMap(w,map.id,{t:'err',text:`${m.d.yn} n'a plus de patience !`})},
};

// Incantations : le début annonce (barre nommée, zone au sol), la fin applique.
function startCast(w,map,m,a,here){
  const {pick}=w.r;
  if(a.type==='chain'){
    const cands=here.filter(p=>!p.P.dead&&dist(m,p.P)<14);
    if(!cands.length)return false;
    m.mark=pick(cands).id;
  }
  if(a.type==='spots'){
    // Un cercle sous chacun des joueurs tirés au hasard (le même joueur peut en recevoir plusieurs) : il faut bouger pendant l'incantation.
    const cands=here.filter(p=>!p.P.dead&&dist(m,p.P)<14);
    if(!cands.length)return false;
    m.spots=Array.from({length:a.count},()=>{const p=pick(cands).P;return{x:p.x+w.r.rr(-.8,.8),y:p.y+w.r.rr(-.8,.8)}});
  }
  m.cast=m.castMax=a.cast;m.castN=a.n;m.castK=a.type;m.castR=a.type==='aoe'?a.r:a.type==='spots'?a.r:a.jump;m.castA=a;m.castDmg=0;
  if(a.shout)yell(w,map,m,pick(a.shout),2.6);else if(a.say)yell(w,map,m,a.say,2.6);
  toMap(w,map.id,{t:'err',text:a.warn});
  return true;
}
const FINISH={
  aoe(w,map,m,a,here){
    for(const p of here){
      if(p.P.dead)continue;
      if(dist(m,p.P)<a.r){hurtPlayer(w,p,Math.round(m.atk[1]*a.dmg*bossMult(m)),m,a.hit);float(w,map.id,p.P.x,p.P.y-1.9,hitText(w,a),'#ec5a4c',true);burst(w,map.id,p.P.x,p.P.y-.6,'#ec5a4c',16,4)}
      else if(m.threat[p.id]||m.target===p.id){msg(w,p.id,'sys',a.dodge);float(w,map.id,p.P.x,p.P.y-1.9,a.dodgeF,'#7fb6ff')}
    }
  },
  // Toute l'équipe est touchée, sauf si l'incantation a été interrompue.
  raid(w,map,m,a,here){
    for(const p of here)if(!p.P.dead){hurtPlayer(w,p,Math.round(m.atk[1]*a.dmg*bossMult(m)),m,a.hit);float(w,map.id,p.P.x,p.P.y-1.9,hitText(w,a),'#ec5a4c',true)}
  },
  spots(w,map,m,a,here){
    for(const p of here){
      if(p.P.dead||!m.spots.some(q=>Math.hypot(p.P.x-q.x,p.P.y-q.y)<a.r))continue;
      hurtPlayer(w,p,Math.round(m.atk[1]*a.dmg*bossMult(m)),m,a.hit);float(w,map.id,p.P.x,p.P.y-1.9,hitText(w,a),'#ec5a4c',true);
    }
    m.spots=null;
  },
  // Non interrompue, « Revenez demain » renvoie tout le groupe dans la salle de départ.
  recall(w,map,m,a,here){
    toMap(w,map.id,{t:'msg',cls:'sys',text:a.msg});toMap(w,map.id,{t:'err',text:a.msg});
    for(const p of here)if(!p.P.dead){teleport(w,p,map.sx,map.sy);burst(w,map.id,p.P.x,p.P.y-.6,'#cfc7b4',10)}
  },
  // Le coup part du joueur marqué puis saute au plus proche non encore touché, à moins de `jump` cases : seul, on n'en prend qu'un.
  chain(w,map,m,a,here){
    const first=w.players[m.mark];
    if(!first||first.P.dead||first.mapId!==map.id)return;
    const hit=[first];
    while(hit.length<=a.jumps){
      const last=hit[hit.length-1].P,next=here.filter(p=>!p.P.dead&&!hit.includes(p)&&dist(last,p.P)<=a.jump).sort((x,y)=>dist(last,x.P)-dist(last,y.P))[0];
      if(!next)break;hit.push(next);
    }
    hit.forEach((p,i)=>{hurtPlayer(w,p,Math.round(m.atk[1]*a.dmg*(1+.25*i)*bossMult(m)),m,a.hit);float(w,map.id,p.P.x,p.P.y-1.9,hitText(w,a),'#c9a8ff',true);burst(w,map.id,p.P.x,p.P.y-.6,'#c9a8ff',12,3)});
  },
};

// Interrompre une incantation interruptible : étourdissement (« En fait… », Ban) ou assez de dégâts pendant la barre.
function interruptCast(w,map,m,by){
  const a=m.castA;
  if(!(m.cast>0)||!a||a.interrupt==null)return;
  m.cast=0;m.mark=null;m.spots=null;
  m.b.cd[a.id]=w.r.rr(a.recharge[0],a.recharge[1]);
  float(w,map.id,m.x,m.y-m.hgt-.3,'Interrompu !','#7be37b',true);
  toMap(w,map.id,{t:'msg',cls:'sys',text:`${by?by.S.name:'Quelqu\'un'} interrompt « ${a.n} ».`});
}

function bossTick(w,map,m,dt,here){
  const B=m.b,{rr}=w.r,abs=bossAbilities(m);
  B.t+=dt;m.yt-=dt;
  if(m.yt<=0&&m.cast<=0){m.yt=rr(6,10);yell(w,map,m,w.r.pick(m.d.lines))}
  // La zone de combat rétrécit : ce qui est dehors prend des dégâts à chaque seconde.
  const z=m.zone;
  if(z){
    const a=z.a;z.t+=dt;z.r=Math.max(a.rMin,a.r0-(a.r0-a.rMin)*z.t/a.duree);z.acc+=dt;
    if(z.acc>=1){z.acc-=1;for(const p of here)if(!p.P.dead&&Math.hypot(p.P.x-z.x,p.P.y-z.y)>z.r)hurtPlayer(w,p,Math.round(m.atk[1]*a.dmg*bossMult(m)),m,a.hit)}
  }
  const ratio=m.hp/m.mhp;
  for(const a of abs){
    if(a.type==='gauge'){
      // Les assistants vivants accélèrent la jauge ; une fois pleine, le boss est enragé pour de bon.
      if(B.done[a.id])continue;
      const vivants=map.mobs.filter(o=>o.alive&&B.summons.includes(o.id)).length;
      m.gaugeN=a.n;m.gauge=Math.min(1,m.gauge+dt*(1+a.perAdd*vivants)/a.duree[Math.min(m.diff,a.duree.length-1)]);
      if(m.gauge>=1){B.done[a.id]=1;PHASE.enrage(w,map,m,a)}
    }
  }
  for(const a of abs){
    if(a.apres!=null){if(!B.done[a.id]&&B.t>=a.apres){B.done[a.id]=1;PHASE[a.type](w,map,m,a)}continue}
    for(const th of a.seuilsPV||(a.seuilPV!=null?[a.seuilPV]:[])){
      const k=a.id+th;
      if(ratio<=th&&!B.done[k]){B.done[k]=1;PHASE[a.type](w,map,m,a)}
    }
  }
  if(m.cast>0){
    m.cast-=dt;m.moving=false;
    if(m.cast<=0){const a=m.castA;FINISH[a.type](w,map,m,a,here);B.cd[a.id]=rr(a.recharge[0],a.recharge[1]);m.mark=null}
    return true;
  }
  for(const a of abs){
    if(!a.recharge)continue;
    B.cd[a.id]=(B.cd[a.id]??a.ouverture)-dt;
    if(B.cd[a.id]>0)continue;
    if(a.type==='adds'){
      // Invocation périodique, sans incantation, plafonnée.
      const vivants=map.mobs.filter(o=>o.alive&&B.summons.includes(o.id)).length;
      B.cd[a.id]=rr(a.recharge[0],a.recharge[1]);
      if(vivants<a.max)PHASE.summon(w,map,m,{...a,count:Math.min(a.count,a.max-vivants)});
    }else if(startCast(w,map,m,a,here))return true;
  }
  return false;
}
function resetBoss(map,m){
  for(const o of map.mobs)if(m.b.summons.includes(o.id))o.gone=true;
  m.b=newBoss();m.enr=0;m.hard=0;m.gauge=0;m.zone=null;m.mark=null;
}

function tickMob(w,map,m,dt,here){
  const {rr,ri,pick}=w.r,over=map.id==='over';
  if(m.sayT>0)m.sayT-=dt;
  if(!m.alive){if(m.dieT>0)m.dieT-=dt;if(m.summoned&&m.dieT<=0){m.gone=true;return}m.rt-=dt;if(m.rt<=0)Object.assign(m,mkMob(w,m.type,m.hx,m.hy,m.l,m.id,m.diff));return}
  const d=m.d;
  for(const o of m.dots){o.t-=dt;o.acc+=dt;if(o.acc>=1){o.acc-=1;hitMob(w,map,m,o.dmg,false,'dot',w.players[o.by]);if(!m.alive)return}}
  m.dots=m.dots.filter(o=>o.t>0);
  if(m.stun>0)m.stun-=dt;
  if(m.slow>0)m.slow-=dt;
  if(m.taunt&&(m.taunt.t-=dt)<=0)m.taunt=null;
  m.acd-=dt;
  const dh=Math.hypot(m.x-m.hx,m.y-m.hy),valid=here.filter(p=>!p.P.dead&&!(over&&isSafe(map,p.P.x,p.P.y)));
  if(m.st==='idle'){
    m.hp=Math.min(m.mhp,m.hp+m.mhp*.2*dt);
    const near=nearest(m,valid);
    if(near&&dist(m,near.P)<d.ag)aggro(w,map,m,near);
    else if(m.patrol){const q=m.patrol[m.pi];if(stepToward(map,m,q.x,q.y,d.sp*.5,dt)){m.pi+=m.pd;if(m.pi<0||m.pi>=m.patrol.length){m.pd*=-1;m.pi+=2*m.pd}}}
    else if(!d.boss){m.wt-=dt;if(m.wt<=0){m.wt=rr(2.5,6);const p={x:m.hx+rr(-2,2),y:m.hy+rr(-2,2)};if(!isSolid(map,p.x,p.y)&&!(over&&isSafe(map,p.x,p.y))){m.wx=p.x;m.wy=p.y}}if(Math.hypot(m.wx-m.x,m.wy-m.y)>.1){if(stepToward(map,m,m.wx,m.wy,d.sp*.4,dt)){m.wx=m.x;m.wy=m.y}}else m.moving=false}
  }else if(m.st==='chase'){
    const leash=over?(d.boss?8:9):16,tgt=pickTarget(m,valid);
    if(!tgt||dh>leash){dropMob(m);return}
    m.target=tgt.id;
    if(m.stun>0){m.moving=false;return}
    const T=tgt.P,dp=dist(m,T);
    if(d.boss&&bossTick(w,map,m,dt,here))return;
    if(m.type==='lag'){m.blink-=dt;if(m.blink<=0&&dp>2){m.blink=rr(2,3.2);const L=Math.min(1.8,dp-1),nx=m.x+(T.x-m.x)/dp*L,ny=m.y+(T.y-m.y)/dp*L;if(!isSolid(map,nx,ny)){burst(w,map.id,m.x,m.y-.6,'#ff3bd5',6);m.x=nx;m.y=ny;float(w,map.id,m.x,m.y-1.4,'*lag*','#3bf0ff')}}}
    if(dp>1.1){
      // Tout droit tant que ça avance ; bloqué par un mur, A* jusqu'à la case de la cible, recalculé chaque seconde tant qu'on le suit (la cible bouge).
      const sp=d.sp*(m.slow>0?.5:1),plan=()=>{m.path=findPath(map,m.x,m.y,T.x,T.y,over&&((x,y)=>isSafe(map,x,y)))||[];m.pathT=1};m.pathT-=dt;
      if(m.path&&m.path.length){if(m.pathT<=0)plan();if(m.path.length&&stepToward(map,m,m.path[0].x,m.path[0].y,sp,dt))m.path.shift()}
      else if(stepToward(map,m,T.x,T.y,sp,dt)&&m.pathT<=0)plan();
    }
    else{m.moving=false;if(Math.abs(T.x-m.x)>.05)m.face=T.x>m.x?1:-1;if(m.acd<=0){m.acd=d.cd*(m.slow>0?2:1)/(m.hard?1.6:1);let dmg=Math.round(ri(m.atk[0],m.atk[1])*(m.enr?m.enrMult:1)*bossMult(m));hurtPlayer(w,tgt,dmg,m)}}
  }else if(m.st==='ret'){
    m.hp=Math.min(m.mhp,m.hp+m.mhp*.6*dt);
    if(stepToward(map,m,m.hx,m.hy,d.sp*1.6,dt)||dh<.15){m.x=m.hx;m.y=m.hy;m.st='idle';m.hp=m.mhp;m.moving=false;if(m.b)resetBoss(map,m)}
  }
}
