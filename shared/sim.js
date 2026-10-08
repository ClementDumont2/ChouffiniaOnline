// Simulation pure : ni DOM, ni Math.random, aucun import du client.
// Tout résultat visible sort par world.events ({to: id du joueur concerné, t: type, ...}) ; le client ne fait que les afficher.
// Les textes d'événements 'msg' utilisent un mini-balisage que le client interprète : **gras**, [[id_objet]] (lien d'objet), [[up]] (flèche d'amélioration).
import {BOTS,BOT_LINES,BOT_REPLIES,DIFFS,ENFAIT,ITEMS,LVLUP,MAXLVL,MOBS,NPCS,QUESTS,SKILLS,SLOTS,SPAWNS,STOCK,SYS_LINES,ZONES} from './data.js';
import {clamp,cmpInfo,dist,fmt,newSave,normalizeSave,npcById,rollArt,score,stackable,stats,statsDeMob,xpNeed} from './rules.js';
import {canStand,genDungeon,genOverworld,isSafe,isSolid,randSpot,stepToward,zoneAt} from './map.js';
import {mulberry32,rngTools} from './rng.js';
import {findCommand,canUse,visibleCommands} from './commands.js';

const GROUP_MAX=4,INVITE_TTL=60,SHARE_RANGE=15,BAG=24,SPAWN={x:7.5,y:8.5},BOURG={x:21.5,y:20.4},NEAR=3.5,MAX_SPEED=5,SLACK=1;
const ev=(w,to,e)=>w.events.push({to,...e});
const msg=(w,to,cls,text)=>ev(w,to,{t:'msg',cls,text});
const err=(w,to,text)=>ev(w,to,{t:'err',text});
const onMap=(w,mapId)=>Object.values(w.players).filter(p=>p.mapId===mapId);
const toMap=(w,mapId,e)=>{for(const p of onMap(w,mapId))ev(w,p.id,e)};
const toAll=(w,e)=>{for(const id in w.players)ev(w,id,e)};
const float=(w,mapId,x,y,txt,col,big)=>toMap(w,mapId,{t:'float',x,y,txt,col,big:!!big});
const burst=(w,mapId,x,y,col,n,spd)=>toMap(w,mapId,{t:'burst',x,y,col,n,spd});
const say=(e,txt,dur)=>{e.say=txt;e.sayT=dur||3.8};
const nid=(w,p)=>p+(w.nextId++);
const later=(w,delay,fn)=>w.later.push({at:w.time+delay,fn});

export function createWorld({seed=20111,rng,bots=false}={}){
  const rnd=rng||mulberry32(seed^0x9e3779b9);
  const w={tick:0,time:0,seed,rnd,r:rngTools(rnd),bots,maps:{},players:{},events:[],later:[],nextId:1,instN:0,groupN:0,groups:{},invites:{},botT:6,sysT:40};
  w.maps.over=Object.assign(genOverworld(seed),{seed,mobs:[],objs:[],npcs:NPCS.map(n=>({...n})),bots:[]});
  spawnOver(w);
  return w;
}

function mkMob(w,type,x,y,L,id){
  const d=MOBS[type];L=L||d.l;const{hp,atk,xp,g}=statsDeMob(type,L),{rr}=w.r;
  return{id:id||nid(w,'m'),kind:'mob',type,d,l:L,x,y,hx:x,hy:y,hp,mhp:hp,atk,xp,g,alive:true,st:'idle',target:null,tag:null,hitters:[],threat:{},acd:0,wt:rr(0,3),wx:x,wy:y,stun:0,dots:[],rt:0,dieT:0,ph:w.rnd()*6,step:0,face:1,moving:false,say:'',sayT:0,bt:6,cast:0,castMax:2.6,enr:0,yt:5,hgt:d.hgt,blink:2};
}

function spawnOver(w){
  const map=w.maps.over,{rr,pick}=w.r,spot=(...a)=>randSpot(map,w.rnd,...a);
  const avoid=(x,y)=>{const z=zoneAt(map,x,y);return z==='base'||z==='bourg'||z==='cuisine'||(x>9&&x<28&&y>11&&y<25)};
  for(const [type,n,x0,x1,y0,y1] of SPAWNS)for(let i=0;i<n;i++){const p=spot(x0,x1,y0,y1,avoid);map.mobs.push(mkMob(w,type,p.x,p.y))}
  map.mobs.push(mkMob(w,'maman',8.5,31));
  if(!w.bots)return;
  const hats=['#1d1b22','#6b6870','#2a3a5c','#3a5a2a','#6d2230','#121212','#4d3a22','#5a2a6a','#2a2a2a','#7a5a2a'];
  const coats=['#3a3340','#2a2630','#4a3a52','#243040','#3a2a24','#2e3a2e','#2a2630','#40323a','#5a5a62','#3a3a3a'];
  map.bots=BOTS.map(([n,g],i)=>{const p=i<2?spot(3,11,4,9):i<5?spot(16,23,17,21):spot(14,48,2,36,(x,y)=>zoneAt(map,x,y)==='cuisine');return{id:nid(w,'b'),kind:'bot',n,g,x:p.x,y:p.y,goal:null,wt:rr(1,4),lvl:pick([12,27,34,48,60,60,71,3,15]),hat:hats[i],coat:coats[i],shirt:pick(['#141414','#2a2a2a','#5a1a1a','#1a2a4a']),face:1,step:0,moving:false,say:'',sayT:0,hgt:1.25,tip:0}});
}

// Les pseudos connectés, pour l'autocomplétion des commandes (le snapshot ne contient que la carte du joueur).
const announceOnline=w=>toAll(w,{t:'online',names:Object.values(w.players).map(p=>p.S.name)});

export function addPlayer(w,id,{save,name,hat}={}){
  const S=save?normalizeSave(save):newSave(name,hat),st=stats(S);
  S.hp=clamp(S.hp||st.maxhp,1,st.maxhp);S.caf=clamp(S.caf,0,st.maxcaf);
  const P={id,n:S.name,x:SPAWN.x,y:SPAWN.y,mt:w.time,face:1,moving:false,mv:0,step:0,tipT:0,target:null,auto:false,combat:99,dead:false,cast:null,hgt:1.25,kind:'player',drunk:0,say:'',sayT:0,cd:{}};
  const pl=w.players[id]={id,S,P,mapId:'over',group:null};
  msg(w,id,'sys',`[Serveur] Bienvenue sur Chouffinia Online, ${S.name}. ${fmt(1247)} joueurs sont connectés. Aucun n'a vu le soleil cette semaine.`);
  msg(w,id,'sys','[Patch 1.1] Nouveau : le Bourg-Forum (sanctuaire, juste au sud-est du sous-sol) avec l\'Armurerie de Bernard, la Taverne du 18-25 et l\'entrée des Archives Oubliées. Trois nouvelles zones : Marais du Lag, Désert de Sel du 18-25, Datacenter Abandonné.');
  msg(w,id,'sys','[Aide] Touchez le sol ou utilisez le clavier pour bouger. Touchez un ennemi pour l\'attaquer. Les touches se règlent dans Options (engrenage de la barre d\'action).');
  if(!save)msg(w,id,'sys','[Aide] Le Vieux Sage du Forum vous attend dans le sous-sol. Il a un point d\'exclamation au-dessus de la tête. C\'est sa seule expression.');
  announceOnline(w);
  later(w,1.2,()=>{if(w.players[id]&&S.q.i===0&&S.q.st==='avail')say(w.maps.over.npcs[0],'Psst. Jeune chouffin. Viens par ici.',4)});
  return pl;
}

export function removePlayer(w,id){
  const pl=w.players[id];if(!pl)return;
  endTrade(w,pl,`[${pl.S.name}] a quitté l'échange.`);dropAggro(w,pl);leaveGroup(w,pl,true);
  for(const k in w.invites)if(k===id||w.invites[k].from===id)delete w.invites[k];
  delete w.players[id];
  announceOnline(w);
  destroyIfEmpty(w,pl.mapId);
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
  if(!canStand(map,x,y)||d>MAX_SPEED*(w.time-P.mt)+SLACK){ev(w,id,{t:'tp',x:P.x,y:P.y});return false}
  P.step+=d*2.7;P.x=x;P.y=y;P.mt=w.time;
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
  if(P.dead)return;
  S.caf=Math.min(st.maxcaf,S.caf+dt*2.6);
  P.combat+=dt;if(P.combat>5)S.hp=Math.min(st.maxhp,S.hp+st.maxhp*.06*dt);
  if(P.cast){P.cast.t-=dt;if(P.cast.t<=0){const c=P.cast;P.cast=null;finishCast(w,pl,c)}}
  const tg=findEnt(w,pl.mapId,P.target);
  if(tg&&tg.kind==='mob'&&tg.alive&&P.auto&&!P.cast&&dist(P,tg)<=SKILLS[0].rg&&(P.cd.tip||0)<=0)useSkill(w,pl,0,true);
  for(const k in P.cd)if(P.cd[k]>0)P.cd[k]-=dt;
}

function finishCast(w,pl,c){
  if(c.id!=='ragequit')return;
  const {P}=pl;
  respawnAt(w,pl);P.target=null;P.auto=false;dropAggro(w,pl);
  msg(w,pl.id,'sys','Alt+F4. Vous êtes en sécurité. Personne n\'a rien vu.');burst(w,pl.mapId,P.x,P.y-.6,'#ec5a4c',14);ach(w,pl,'rq');
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
  let best=null,bt=0;
  for(const p of valid){const t=m.threat[p.id]||0;if(t>bt){bt=t;best=p}}
  if(best)return best;
  const cur=valid.find(p=>p.id===m.target);if(cur)return cur;
  const n=nearest(m,valid);return n&&dist(m,n.P)<m.d.ag?n:null;
}
const dropMob=m=>{m.st='ret';m.cast=0;m.target=null;m.tag=null;m.hitters=[];m.threat={}};

function aggro(w,map,m,pl){
  if(m.st==='chase')return;
  const {pick}=w.r;
  m.st='chase';m.acd=.6;m.target=pl.id;if(w.rnd()<.55||m.d.boss)say(m,pick(m.d.lines));
  if(map.id!=='over')for(const o of map.mobs)if(o!==m&&o.alive&&o.st==='idle'&&!o.d.boss&&dist(o,m)<4.2){o.st='chase';o.acd=.9;o.target=pl.id}
}

function hitMob(w,map,m,dmg,crit,src,pl){
  if(!m.alive)return;
  m.hp-=dmg;float(w,map.id,m.x,m.y-m.hgt,String(dmg),crit?'#ffd84a':'#ffffff',crit);
  burst(w,map.id,m.x,m.y-m.hgt*.5,src==='dot'?'#ede1c5':'#ffcf8a',crit?8:4);
  if(pl){
    msg(w,pl.id,'cb',`${src==='dot'?'Copypasta':'Votre '+src} inflige ${dmg} dégâts${crit?' (critique)':''} à ${m.d.n}.`);
    m.threat[pl.id]=(m.threat[pl.id]||0)+dmg;
    if(!m.tag)m.tag=pl.id;
    if(!m.hitters.includes(pl.id))m.hitters.push(pl.id);
  }
  if(m.st==='chase'){if(pl)m.target=pl.id}else if(pl)aggro(w,map,m,pl);
  if(m.hp<=0)killMob(w,map,m);
}

function killMob(w,map,m){
  const inDg=map.id!=='over';
  m.alive=false;m.hp=0;m.dieT=.7;m.rt=inDg?Infinity:(m.d.boss?75:14);m.dots=[];m.cast=0;m.target=null;m.threat={};
  // Participants : ceux qui ont frappé et sont encore assez près. Butin et or : au premier frappeur (s'il est parti, au premier participant).
  const group=m.hitters.map(id=>w.players[id]).filter(p=>p&&p.mapId===map.id&&dist(p.P,m)<=SHARE_RANGE);
  const first=w.players[m.tag];
  const tagger=first&&first.mapId===map.id?first:group[0];
  m.tag=null;m.hitters=[];
  for(const o of onMap(w,map.id))if(o.P.target===m.id){o.P.target=null;o.P.auto=false}
  if(!group.length)return;
  rewardKill(w,map,m,group,tagger);
  if(m.type==='archiviste')dungeonDone(w,map,group);
  for(const p of new Set([...group,tagger]))ev(w,p.id,{t:'self'});
}

// XP partagée à parts égales ; quête et compteurs pour chaque participant ; or et butin au premier frappeur seul.
function rewardKill(w,map,m,group,T){
  const inDg=map.id!=='over',{ri}=w.r,share=Math.max(1,Math.round(m.xp/group.length));
  for(const pl of group){
    const {S}=pl;
    S.kills++;ach(w,pl,'first');
    if(m.type==='herbe'){S.herbe++;if(S.herbe>=10)ach(w,pl,'grass')}
    gainXP(w,pl,share,m.d.n);
  }
  const g=ri(m.g[0],m.g[1]);T.S.gold+=g;
  msg(w,T.id,'loot',`Vous ramassez ${g} po.`);
  const drop=lid=>{if(addItem(w,T,lid,1))msg(w,T.id,'loot',`Vous recevez le butin : [[${lid}]]${ITEMS[lid].t==='eq'&&cmpInfo(T.S,lid).better?'[[up]]':''}.`)};
  for(const [lid,p] of (m.d.loot||[]))if(w.rnd()<p)drop(lid);
  if(inDg&&!m.d.boss){if(w.rnd()<.14+.04*map.ti)drop(rollArt(map.ti,w.rnd));if(w.rnd()<.18)drop('chips')}
  if(T.S.gold>=100)ach(w,T,'rich');
  for(const pl of group){
    const {S}=pl,id=pl.id,q=QUESTS[S.q.i];
    if(q&&S.q.st==='active'&&q.m===m.type){S.q.n=Math.min(q.k,S.q.n+1);msg(w,id,'sys',`${MOBS[q.m].n} : ${S.q.n}/${q.k}`);if(S.q.n>=q.k){S.q.st='ready';ev(w,id,{t:'toast',kicker:'Objectif terminé',title:q.n,sub:`Retournez voir ${npcById(q.g).n}.`})}}
    if(m.type==='maman'){ach(w,pl,'boss');ev(w,id,{t:'banner',title:'Maman est vaincue',sub:'Le Wi-Fi restera allumé ce soir. Personne ne vous croira.'});msg(w,id,'yell','[Maman] crie : TU NE SORS PLUS DE TA CHAMBRE PENDANT UNE SEMAINE !');ev(w,id,{t:'chat',who:'Kévin_du_42',text:`GG ${S.name}, légende du sous-sol`})}
  }
}

function dungeonDone(w,map,group){
  const df=DIFFS[map.ti],boss=map.mobs.find(x=>x.type==='archiviste');map.done=true;
  map.objs.push({id:nid(w,'o'),kind:'obj',type:'chest',n:'Coffre des Archives',x:boss.x,y:boss.y,hgt:.9,openedBy:[]});
  toMap(w,map.id,{t:'banner',title:'Archives terminées',sub:`Difficulté ${df.n} · Ouvrez le Coffre des Archives.`,cls:'dg'});
  toMap(w,map.id,{t:'msg',cls:'sys',text:`Le Grand Archiviste est vaincu. Les Archives (${df.n}) sont terminées.`});
  for(const pl of group){
    const {S}=pl;
    gainXP(w,pl,df.bonus,null);S.dg=(S.dg||0)+1;ach(w,pl,'dungeon');if(map.ti===3)ach(w,pl,'mythic');
    const q=QUESTS[S.q.i];if(q&&S.q.st==='active'&&q.dg!=null&&map.ti>=q.dg){S.q.n=1;S.q.st='ready';ev(w,pl.id,{t:'toast',kicker:'Objectif terminé',title:q.n,sub:'Retournez voir le Gardien des Archives.'})}
  }
}

function gainXP(w,pl,n,src){
  const {S,P}=pl,id=pl.id,{pick}=w.r;
  if(S.lvl>=MAXLVL)return;
  S.xp+=n;ev(w,id,{t:'float',x:P.x,y:P.y-1.6,txt:`+${n} XP`,col:'#c4a8ff'});msg(w,id,'xpm',`${src?src+' meurt. ':''}Vous gagnez ${n} points d'expérience.`);
  while(S.lvl<MAXLVL&&S.xp>=xpNeed(S.lvl)){
    S.xp-=xpNeed(S.lvl);S.lvl++;const st=stats(S,P.drunk);S.hp=st.maxhp;S.caf=st.maxcaf;
    const sk=SKILLS.find(s=>s.l===S.lvl),df=DIFFS.find(d=>d.rl===S.lvl);
    ev(w,id,{t:'banner',title:`Niveau ${S.lvl}`,sub:sk?`Nouvelle compétence : ${sk.n}`:df?`Archives débloquées : difficulté ${df.n}`:pick(LVLUP),cls:'lvl'});
    msg(w,id,'sys',`Félicitations, vous avez atteint le niveau ${S.lvl} !${sk?` Nouvelle compétence : **${sk.n}**.`:''}${df?` Les Archives en difficulté **${df.n}** sont accessibles.`:''}`);
    ev(w,id,{t:'lvlup',x:P.x,y:P.y});
    if(S.lvl>=5)ach(w,pl,'lvl5');
  }
  if(S.lvl>=MAXLVL)S.xp=0;
}

function hurtPlayer(w,pl,d,m,verb){
  const {S,P}=pl;if(P.dead)return;
  const st=stats(S,P.drunk);d=Math.max(1,Math.round(d*(1-st.red)));
  S.hp-=d;P.combat=0;float(w,pl.mapId,P.x,P.y-1.3,'-'+d,'#ff5a4a');
  msg(w,pl.id,'cb in',`${m.d.n} ${verb||m.d.v} : ${d} dégâts.`);
  if(S.hp<=0){S.hp=0;die(w,pl)}
}

function die(w,pl){
  const {S,P}=pl;
  P.dead=true;P.cast=null;P.auto=false;S.deaths++;ach(w,pl,'death');endTrade(w,pl,'Échange annulé : un des joueurs est mort.');
  dropAggro(w,pl);
  ev(w,pl.id,{t:'died'});ev(w,pl.id,{t:'self'});
}

function respawn(w,pl){
  const {S,P}=pl,st=stats(S,P.drunk),over=pl.mapId==='over';
  S.hp=st.maxhp;S.caf=st.maxcaf;respawnAt(w,pl);P.dead=false;P.target=null;
  msg(w,pl.id,'sys',over?'Vous vous réveillez au Sous-Sol. Quelqu\'un a mangé vos chips.':'Vous vous réveillez à l\'entrée des Archives, couvert de vieux papiers.');
  ev(w,pl.id,{t:'respawned'});
}

function ach(w,pl,id){if(pl.S.ach[id])return;pl.S.ach[id]=1;ev(w,pl.id,{t:'ach',id})}

function addItem(w,pl,id,n){
  const {S}=pl;
  if(stackable(id)){const st=S.inv.find(s=>s.id===id);if(st){st.n+=n;return true}}
  if(S.inv.length>=BAG){err(w,pl.id,'Sac plein. Comme votre historique de navigation.');return false}
  S.inv.push({id,n:stackable(id)?n:1});return true;
}

function equip(w,pl,idx){
  const {S,P}=pl,s=S.inv[idx];if(!s)return;
  const it=ITEMS[s.id];if(it.t!=='eq')return;
  if(S.lvl<(it.rl||1)){err(w,pl.id,`Niveau ${it.rl} requis pour équiper cet objet.`);return}
  const prev=S.eq[it.s];S.eq[it.s]=s.id;S.inv.splice(idx,1);if(prev)S.inv.push({id:prev,n:1});
  S.hp=Math.min(S.hp,stats(S,P.drunk).maxhp);msg(w,pl.id,'sys',`Vous équipez [[${s.id}]].`);
}

function unequip(w,pl,slot){
  const {S,P}=pl,id=S.eq[slot];if(!id)return;
  if(S.inv.length>=BAG){err(w,pl.id,'Sac plein.');return}
  S.eq[slot]=null;S.inv.push({id,n:1});S.hp=Math.min(S.hp,stats(S,P.drunk).maxhp);
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

function useSkill(w,pl,i,auto){
  const {S,P}=pl,id=pl.id,map=w.maps[pl.mapId],{pick}=w.r,sk=SKILLS[i];
  if(!sk||P.dead)return;
  if(S.lvl<sk.l){if(!auto)err(w,id,`« ${sk.n} » se débloque au niveau ${sk.l}.`);return}
  if((P.cd[sk.id]||0)>0){if(!auto)err(w,id,'Pas encore prêt. La patience n\'est pas votre compétence principale.');return}
  if(P.cast){if(!auto)err(w,id,'Vous êtes déjà occupé.');return}
  if(S.caf<sk.c){err(w,id,'Pas assez de Caféine.');return}
  const st=stats(S,P.drunk),roll=base=>Math.max(1,Math.round(base*w.r.rr(.85,1.15)));
  if(sk.id==='canette'){
    const h=Math.round(st.maxhp*.35);S.hp=Math.min(st.maxhp,S.hp+h);S.caf=Math.min(st.maxcaf,S.caf+30);
    float(w,pl.mapId,P.x,P.y-1.3,'+'+h,'#6cff7a');say(P,'*gloups* … elle est tiède.',2);burst(w,pl.mapId,P.x,P.y-.8,'#7fe04a',10);P.cd[sk.id]=sk.cd;return;
  }
  if(sk.id==='ragequit'){P.cast={id:'ragequit',n:'Rage Quit',t:1.5,max:1.5};ev(w,id,{t:'stop'});say(P,'C\'EST TRUQUÉ CE JEU',1.6);P.cd[sk.id]=sk.cd;return}
  let t=findEnt(w,pl.mapId,P.target);
  if(!t||t.kind!=='mob'||!t.alive){t=nearestMob(map,P,sk.rg+.6);if(!t){if(!auto)err(w,id,'Aucune cible. Touchez un ennemi ou appuyez sur Tab.');return}P.target=t.id}
  if(dist(P,t)>sk.rg){
    if(!auto){if(sk.id==='tip'){P.auto=true;ev(w,id,{t:'approach',id:t.id})}else err(w,id,'Hors de portée. Rapprochez-vous (physiquement, ce n\'est pas social).')}
    return;
  }
  if(Math.abs(t.x-P.x)>.05)P.face=t.x>P.x?1:-1;
  S.caf-=sk.c;P.cd[sk.id]=sk.cd;P.combat=0;P.auto=true;
  const crit=w.rnd()<.12,mul=crit?1.8:1;
  if(sk.id==='tip'){P.tipT=.45;S.tips++;if(S.tips%4===1)float(w,pl.mapId,P.x,P.y-1.9,'M\'lady.','#ede1c5');if(S.tips>=50)ach(w,pl,'mlady');hitMob(w,map,t,roll(st.atk*mul),crit,'Tip du Fedora',pl)}
  else if(sk.id==='enfait'){say(P,pick(ENFAIT),2.4);if(!t.d.boss)t.stun=2.5;float(w,pl.mapId,t.x,t.y-t.hgt-.3,t.d.boss?'Insensible':'Étourdi','#ffd84a');hitMob(w,map,t,roll(st.atk*1.5*mul),crit,'« En fait... »',pl)}
  else if(sk.id==='copypasta'){
    say(P,'*colle 4 000 caractères*',1.8);
    for(const m of map.mobs){if(m.alive&&dist(m,t)<=2.2){m.dots.push({t:5,acc:0,dmg:roll(st.atk*.55),by:id});aggro(w,map,m,pl);toMap(w,map.id,{t:'puff',x:m.x,y:m.y-m.hgt*.6})}}
  }
}

const groupOf=(w,pl)=>pl.group?w.groups[pl.group]:null;
const toGroup=(w,g,text)=>{for(const id of g.members)msg(w,id,'sys',text)};
const byName=(w,name)=>Object.values(w.players).find(p=>p.S.name.toLowerCase()===String(name).toLowerCase());

function invite(w,pl,name){
  const g=groupOf(w,pl);
  if(!name){msg(w,pl.id,'sys','Usage : /inviter <pseudo>');return}
  const dest=byName(w,name);
  if(!dest){msg(w,pl.id,'sys',`Personne ne s'appelle ${name} en ligne.`);return}
  if(dest===pl){msg(w,pl.id,'sys','Vous invitez vous-même. Le groupe est complet, il n\'y a que vous.');return}
  if(g&&g.leader!==pl.id){msg(w,pl.id,'sys','Seul le chef de groupe peut inviter.');return}
  if(g&&g.members.length>=GROUP_MAX){msg(w,pl.id,'sys',`Le groupe est complet (${GROUP_MAX} joueurs maximum).`);return}
  if(dest.group){msg(w,pl.id,'sys',`[${dest.S.name}] est déjà dans un groupe.`);return}
  w.invites[dest.id]={from:pl.id,exp:w.time+INVITE_TTL};
  msg(w,dest.id,'sys',`[${pl.S.name}] vous invite dans son groupe. Tapez /accepter pour rejoindre (l'invitation expire dans ${INVITE_TTL} s).`);
  msg(w,pl.id,'sys',`Invitation envoyée à [${dest.S.name}]. Il a ${INVITE_TTL} s pour réfléchir.`);
}

function acceptInvite(w,pl){
  const inv=w.invites[pl.id],from=inv&&w.players[inv.from];
  delete w.invites[pl.id];
  if(!inv||inv.exp<w.time||!from){msg(w,pl.id,'sys','Personne ne vous a invité récemment. Ça arrive.');return}
  if(inv.kind==='trade'){openTrade(w,from,pl);return}
  if(pl.group){msg(w,pl.id,'sys','Vous êtes déjà dans un groupe : /quitter d\'abord.');return}
  let g=groupOf(w,from);
  if(g&&(g.leader!==from.id||g.members.length>=GROUP_MAX)){msg(w,pl.id,'sys','Ce groupe est complet ou son chef a changé.');return}
  if(!g){g=w.groups['g'+(++w.groupN)]={id:'g'+w.groupN,leader:from.id,members:[from.id]};from.group=g.id}
  g.members.push(pl.id);pl.group=g.id;
  toGroup(w,g,`[${pl.S.name}] rejoint le groupe de [${w.players[g.leader].S.name}].`);
}

function leaveGroup(w,pl,quiet){
  const g=groupOf(w,pl);if(!g)return;
  g.members=g.members.filter(id=>id!==pl.id);pl.group=null;
  if(!quiet)msg(w,pl.id,'sys','Vous quittez le groupe.');
  if(g.members.length<2){
    for(const id of g.members){w.players[id].group=null;msg(w,id,'sys',`[${pl.S.name}] quitte le groupe. Le groupe est dissous.`)}
    delete w.groups[g.id];return;
  }
  toGroup(w,g,`[${pl.S.name}] quitte le groupe.`);
  if(g.leader===pl.id){g.leader=g.members[0];toGroup(w,g,`[${w.players[g.leader].S.name}] devient chef de groupe.`)}
}

// Échange : l'offre de chaque joueur vit dans pl.trade. Toute modification d'une offre annule les deux validations,
// sinon on pourrait changer l'objet après que l'autre a validé.
const owned=(S,id)=>S.inv.reduce((a,s)=>a+(s.id===id?s.n:0),0);
function takeItem(S,id,n){
  for(const s of S.inv){if(s.id!==id)continue;const k=Math.min(n,s.n);s.n-=k;n-=k;if(!n)break}
  S.inv=S.inv.filter(s=>s.n>0);
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
  const items=new Map();
  for(const x of Array.isArray(a.items)?a.items.slice(0,BAG):[]){
    if(!x||!ITEMS[x.id]||!Number.isInteger(x.n)||x.n<1)continue;
    items.set(x.id,(items.get(x.id)||0)+x.n);
  }
  const gold=Number.isInteger(a.gold)?a.gold:0;
  if(gold<0||gold>pl.S.gold||[...items].some(([id,n])=>n>owned(pl.S,id)))err(w,pl.id,'Offre refusée : vous ne possédez pas tout ça.');
  else{T.items=[...items].map(([id,n])=>({id,n}));T.gold=gold;T.ok=false;w.players[T.with].trade.ok=false}
  sendTrade(w,pl);sendTrade(w,w.players[T.with]);
}

function tradeOk(w,pl){
  const T=pl.trade;if(!T)return;
  const o=w.players[T.with];T.ok=true;
  if(o.trade.ok)commitTrade(w,pl,o);
  else{sendTrade(w,pl);sendTrade(w,o)}
}

function commitTrade(w,a,b){
  const valid=p=>p.trade.gold<=p.S.gold&&p.trade.items.every(({id,n})=>owned(p.S,id)>=n);
  if(!valid(a)||!valid(b)){endTrade(w,a,'Échange annulé : une offre n\'est plus valide.');return}
  const bak=[a,b].map(p=>JSON.stringify([p.S.inv,p.S.gold]));
  for(const p of [a,b])for(const {id,n} of p.trade.items)takeItem(p.S,id,n);
  // Les emplacements libérés par l'un servent à l'autre : on ne teste la place qu'une fois les deux sacs vidés.
  const give=(from,to)=>{
    to.S.gold+=from.trade.gold;from.S.gold-=from.trade.gold;
    return from.trade.items.every(({id,n})=>stackable(id)?addItem(w,to,id,n):Array.from({length:n},()=>addItem(w,to,id,1)).every(Boolean));
  };
  if(!(give(a,b)&&give(b,a))){
    [a,b].forEach((p,i)=>{[p.S.inv,p.S.gold]=JSON.parse(bak[i])});
    endTrade(w,a,'Échange annulé : un des sacs est plein.');return;
  }
  for(const [p,o] of [[a,b],[b,a]]){
    for(const {id} of o.trade.items)msg(w,p.id,'loot',`Vous recevez [[${id}]] de [${o.S.name}].`);
    if(o.trade.gold)msg(w,p.id,'loot',`Vous recevez ${fmt(o.trade.gold)} po de [${o.S.name}].`);
    if(p.S.gold>=100)ach(w,p,'rich');
  }
  endTrade(w,a,'Échange terminé.');
  ev(w,a.id,{t:'self'});ev(w,b.id,{t:'self'});
}

const nearNpc=(pl,id)=>{const n=npcById(id);return !!n&&pl.mapId==='over'&&dist(pl.P,n)<NEAR};
const nearMerchant=pl=>['gerard','bernard','tavernier'].some(id=>nearNpc(pl,id));
const buyCost=(id,n)=>id==='chouffe'&&n===5?55:ITEMS[id].buy*n;

function buy(w,pl,id,n){
  const {S}=pl,seller=Object.keys(STOCK).find(k=>STOCK[k].includes(id));
  if(!seller||!nearNpc(pl,seller)||!Number.isInteger(n)||n<1||n>5)return;
  const it=ITEMS[id],cost=buyCost(id,n);
  if(it.t==='eq'&&S.lvl<it.rl){err(w,pl.id,`Niveau ${it.rl} requis pour équiper cet objet.`);return}
  if(S.gold<cost){err(w,pl.id,'Pas assez d\'or. Personne ne fait crédit depuis l\'incident de 2014.');return}
  const better=it.t==='eq'&&cmpInfo(S,id).better;
  if(!addItem(w,pl,id,n))return;
  S.gold-=cost;msg(w,pl.id,'loot',`Vous achetez ${n>1?n+' × ':''}[[${id}]] pour ${cost} po.`);
  if(seller==='bernard'){ach(w,pl,'shop');const idx=S.inv.findIndex(s=>s.id===id);if(better&&idx>=0)equip(w,pl,idx)}
}

function gainGold(w,pl,v,art){
  const {S}=pl;S.gold+=v;
  if(art){S.artSold=(S.artSold||0)+v;if(S.artSold>=1000)ach(w,pl,'millio')}
  if(S.gold>=100)ach(w,pl,'rich');
}

function sell(w,pl,idx){
  const {S}=pl,s=S.inv[idx];if(!s||!nearMerchant(pl))return;
  const it=ITEMS[s.id],v=it.price*s.n;
  S.inv.splice(idx,1);gainGold(w,pl,v,it.t==='art');
  msg(w,pl.id,'loot',`Vous vendez [[${s.id}]]${s.n>1?' ×'+s.n:''} pour ${fmt(v)} po.`);
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
    msg(w,pl.id,'loot',`Vous recevez ${q.itemN?q.itemN+' × ':''}[[${q.item}]].`);
    const it=ITEMS[q.item];
    if(it.t==='eq'&&score(q.item)>score(S.eq[it.s])&&S.lvl>=(it.rl||1))equip(w,pl,S.inv.findIndex(s=>s.id===q.item));
  }
  S.q.i++;S.q.st='avail';S.q.n=0;
  gainXP(w,pl,q.xp);ev(w,pl.id,{t:'toast',kicker:'Quête terminée',title:q.n,sub:''});
  if(S.gold>=100)ach(w,pl,'rich');
  if(S.q.i>=QUESTS.length)ev(w,pl.id,{t:'campaignEnd'});
}

function enterDungeon(w,pl,ti){
  const df=DIFFS[ti],g=groupOf(w,pl);
  if(!df||pl.mapId!=='over'||!nearNpc(pl,'gardien'))return;
  if(g&&g.leader!==pl.id){err(w,pl.id,'Seul le chef de groupe peut lancer les Archives.');return}
  if(pl.S.lvl<df.rl){err(w,pl.id,`Niveau ${df.rl} requis pour la difficulté ${df.n}.`);return}
  // Le groupe descend ensemble : tous les membres présents au Bourg-Forum, sauf ceux qui n'ont pas le niveau.
  const crew=(g?g.members.map(id=>w.players[id]):[pl]).filter(p=>p.mapId==='over'&&zoneAt(w.maps.over,p.P.x,p.P.y)==='bourg');
  const ready=crew.filter(p=>p.S.lvl>=df.rl);
  for(const p of crew)if(!ready.includes(p))msg(w,p.id,'sys',`Niveau ${df.rl} requis pour la difficulté ${df.n} : vous restez au Bourg-Forum.`);
  let D=g&&Object.values(w.maps).find(m=>m.gid===g.id&&!m.done);
  if(!D){
    const seed=(w.rnd()*2**32)>>>0;D=genDungeon(seed,ti);
    if(!D){err(w,pl.id,'Les Archives sont en maintenance. Réessayez.');return}
    const scale=1+.6*(ready.length-1);
    D.id='dg'+(++w.instN);D.seed=seed;D.gid=g?g.id:null;D.done=false;D.npcs=[];D.bots=[];
    D.mobs=D.spawns.map(s=>{const m=mkMob(w,s.type,s.x,s.y,s.l);m.hp=m.mhp=Math.round(m.hp*scale);return m});
    D.objs=[{id:nid(w,'o'),kind:'obj',type:'portal',n:'Sortie des Archives',x:D.portal.x,y:D.portal.y,hgt:.9}];
    w.maps[D.id]=D;
  }
  for(const p of ready){
    p.mapId=D.id;p.P.target=null;p.P.auto=false;p.P.cast=null;dropAggro(w,p);
    teleport(w,p,D.sx,D.sy);
    msg(w,p.id,'sys',`Vous descendez dans les Archives Oubliées (${DIFFS[D.ti].n}). L'air sent le vieux papier et le topic verrouillé.`);
  }
}

function destroyIfEmpty(w,mapId){if(mapId!=='over'&&!onMap(w,mapId).length)delete w.maps[mapId]}

function leaveDungeon(w,pl){
  const {P}=pl,from=pl.mapId;
  if(from==='over')return;
  pl.mapId='over';P.target=null;P.auto=false;P.cast=null;
  teleport(w,pl,BOURG.x,BOURG.y);
  msg(w,pl.id,'sys','Vous remontez au Bourg-Forum. La lumière du jour vous agresse un peu.');
  destroyIfEmpty(w,from);
}

function openChest(w,pl,id){
  const {S,P}=pl,map=w.maps[pl.mapId],o=map.objs.find(x=>x.id===id&&x.type==='chest');
  if(!o||dist(P,o)>2.5)return;
  if(o.openedBy.includes(pl.id)){err(w,pl.id,'Le coffre est vide. Comme votre agenda.');return}
  o.openedBy.push(pl.id);
  const df=DIFFS[map.ti],got=[];
  for(let i=0;i<df.arts;i++){const aid=rollArt(map.ti,w.rnd);if(addItem(w,pl,aid,1))got.push(aid)}
  if(df.grim&&w.rnd()<df.grim&&addItem(w,pl,'grimoire',1))got.push('grimoire');
  const extra=w.rnd()<.6&&addItem(w,pl,'chouffe',2);
  S.gold+=df.gold;burst(w,pl.mapId,o.x,o.y-.5,'#f0d070',24,3);
  for(const g of got)msg(w,pl.id,'loot',`Vous recevez le butin : [[${g}]].`);
  msg(w,pl.id,'loot',`Vous ramassez ${df.gold} po.`);
  if(!map.objs.some(x=>x.type==='portal'&&x.exit))map.objs.push({id:nid(w,'o'),kind:'obj',type:'portal',exit:true,n:'Sortie des Archives',x:o.x+1.6,y:o.y,hgt:.9});
  ev(w,pl.id,{t:'chest',ti:map.ti,got,extra,gold:df.gold});
  if(S.gold>=100)ach(w,pl,'rich');
}

export function handleAction(w,id,a){
  const pl=w.players[id];if(!pl||!a)return;
  const {S,P}=pl;
  if(P.dead&&a.a!=='respawn')return;
  switch(a.a){
    case 'target':
      if(a.id==null){P.target=null;P.auto=false;break}
      {const e=findEnt(w,pl.mapId,a.id);if(!e||(e.kind==='mob'&&!e.alive))break;P.target=e.id;if(a.auto&&e.kind==='mob')P.auto=true}
      break;
    case 'talk':if(nearNpc(pl,a.id)){P.target=a.id;if(a.id==='tavernier')ach(w,pl,'khey')}break;
    case 'skill':useSkill(w,pl,a.i,false);break;
    case 'useItem':if(ITEMS[a.id]&&ITEMS[a.id].t==='use')useItem(w,pl,a.id);break;
    case 'equip':equip(w,pl,a.idx);break;
    case 'unequip':if(SLOTS[a.slot])unequip(w,pl,a.slot);break;
    case 'drop':{const s=S.inv[a.idx];if(s){S.inv.splice(a.idx,1);msg(w,id,'sys',`Vous jetez [[${s.id}]]. Personne ne le ramassera.`)}break}
    case 'buy':buy(w,pl,a.id,a.n);break;
    case 'sell':sell(w,pl,a.idx);break;
    case 'sellAll':sellAll(w,pl,a.kind);break;
    case 'acceptQuest':acceptQuest(w,pl);break;
    case 'completeQuest':completeQuest(w,pl);break;
    case 'enterDungeon':enterDungeon(w,pl,a.ti);break;
    case 'leaveDungeon':leaveDungeon(w,pl);break;
    case 'openChest':openChest(w,pl,a.id);break;
    case 'tradeOffer':tradeOffer(w,pl,a);break;
    case 'tradeOk':tradeOk(w,pl);break;
    case 'tradeCancel':endTrade(w,pl,'Échange annulé.');break;
    case 'respawn':if(P.dead)respawn(w,pl);break;
    default:return;
  }
  ev(w,id,{t:'self'});
}

const emote=(w,pl,txt)=>toAll(w,{t:'emote',who:pl.S.name,text:txt});
// Un handler par entrée de shared/data/commands.js ; le dispatch (alias, droit requis) est fait une seule fois dans runCommand.
const RUN={
  aide:(w,pl)=>msg(w,pl.id,'sys','Commandes : '+visibleCommands(pl).map(c=>'/'+c.nom).join(' · ')),
  qui:(w,pl)=>{const all=Object.values(w.players);msg(w,pl.id,'sys',`Joueurs connectés (${all.length}) : ${all.map(p=>`${p.S.name} (niv. ${p.S.lvl}, ${zoneName(w.maps[p.mapId],p.P)})`).join(', ')}.`)},
  mp:(w,pl,v)=>whisper(w,pl,v),
  inviter:(w,pl,v)=>invite(w,pl,v.split(/\s+/)[1]),
  accepter:(w,pl)=>acceptInvite(w,pl),
  quitter:(w,pl)=>leaveGroup(w,pl),
  echanger:(w,pl,v)=>requestTrade(w,pl,v.split(/\s+/)[1]),
  top:(w,pl)=>top(w,pl),
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
  for(const o of Object.values(w.players))ev(w,o.id,{t:'chat',who:S.name,text:v,me:o.id===id});
  say(P,v,4);
  if(/en fait/i.test(v))ach(w,pl,'chat');
  if(w.bots&&w.rnd()<.75)later(w,w.r.rr(.9,2.6),()=>botTalk(w,pick(BOT_REPLIES),3.5));
  ev(w,id,{t:'self'});
}

const zoneName=(map,P)=>{const z=zoneAt(map,P.x,P.y);return z==='dungeon'?`Archives Oubliées, ${DIFFS[map.ti].n}`:ZONES[z].n};

// w.saves() est fourni par le serveur (toutes les sauvegardes, hors-ligne compris) ; la sim seule ne connaît que les connectés.
const TOPS=[['Niveau',S=>S.lvl,(a,b)=>b.xp-a.xp],['Archives terminées',S=>S.dg||0],['Chouffes bues',S=>S.chouffes||0]];
function top(w,pl){
  const rows=w.saves?w.saves():Object.values(w.players).map(p=>p.S);
  for(const [label,val,tie] of TOPS){
    const best=[...rows].sort((a,b)=>val(b)-val(a)||(tie?tie(a,b):0)).slice(0,5);
    msg(w,pl.id,'sys',`Top ${label} : ${best.map((S,i)=>`${i+1}. ${S.name} (${fmt(val(S))})`).join(' · ')}`);
  }
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

function tickMob(w,map,m,dt,here){
  const {rr,ri,pick}=w.r,over=map.id==='over';
  if(m.sayT>0)m.sayT-=dt;
  if(!m.alive){if(m.dieT>0)m.dieT-=dt;m.rt-=dt;if(m.rt<=0)Object.assign(m,mkMob(w,m.type,m.hx,m.hy,m.l,m.id));return}
  const d=m.d;
  for(const o of m.dots){o.t-=dt;o.acc+=dt;if(o.acc>=1){o.acc-=1;hitMob(w,map,m,o.dmg,false,'dot',w.players[o.by]);if(!m.alive)return}}
  m.dots=m.dots.filter(o=>o.t>0);
  if(m.stun>0)m.stun-=dt;
  m.acd-=dt;
  const dh=Math.hypot(m.x-m.hx,m.y-m.hy),valid=here.filter(p=>!p.P.dead&&!(over&&isSafe(map,p.P.x,p.P.y)));
  if(m.st==='idle'){
    m.hp=Math.min(m.mhp,m.hp+m.mhp*.2*dt);
    const near=nearest(m,valid);
    if(near&&dist(m,near.P)<d.ag)aggro(w,map,m,near);
    else if(!d.boss){m.wt-=dt;if(m.wt<=0){m.wt=rr(2.5,6);const p={x:m.hx+rr(-2,2),y:m.hy+rr(-2,2)};if(!isSolid(map,p.x,p.y)&&!(over&&isSafe(map,p.x,p.y))){m.wx=p.x;m.wy=p.y}}if(Math.hypot(m.wx-m.x,m.wy-m.y)>.1){if(stepToward(map,m,m.wx,m.wy,d.sp*.4,dt)){m.wx=m.x;m.wy=m.y}}else m.moving=false}
  }else if(m.st==='chase'){
    const leash=over?(d.boss?8:9):16,tgt=pickTarget(m,valid);
    if(!tgt||dh>leash){dropMob(m);return}
    m.target=tgt.id;
    if(m.stun>0){m.moving=false;return}
    const T=tgt.P,dp=dist(m,T);
    if(d.boss){
      const A=d.aoe;m.bt-=dt;m.yt-=dt;
      if(m.yt<=0&&m.cast<=0){m.yt=rr(6,10);const l=pick(d.lines);say(m,l);toMap(w,map.id,{t:'msg',cls:'yell',text:`[${d.yn}] crie : ${l}`})}
      if(!m.enr&&m.hp<m.mhp*.5){m.enr=1;say(m,A.enrage,3.5);toMap(w,map.id,{t:'msg',cls:'yell',text:`[${d.yn}] crie : ${A.enrage}`});toMap(w,map.id,{t:'err',text:`${d.yn} devient enragé${d.fem?'e':''} !`})}
      if(m.cast>0){
        m.cast-=dt;m.moving=false;
        if(m.cast<=0){
          for(const p of here){
            if(p.P.dead)continue;
            if(dist(m,p.P)<A.r){hurtPlayer(w,p,Math.round(m.atk[1]*2.2),m,A.hit);float(w,map.id,p.P.x,p.P.y-1.9,A.hitF,'#ec5a4c',true);burst(w,map.id,p.P.x,p.P.y-.6,'#ec5a4c',16,4)}
            else if(m.threat[p.id]||m.target===p.id){msg(w,p.id,'sys',A.dodge);float(w,map.id,p.P.x,p.P.y-1.9,A.dodgeF,'#7fb6ff')}
          }
          m.bt=rr(8,10);
        }
        return;
      }
      if(m.bt<=0){m.cast=2.6;m.castMax=2.6;const l=pick(A.shout);say(m,l,2.6);toMap(w,map.id,{t:'msg',cls:'yell',text:`[${d.yn}] crie : ${l}`});toMap(w,map.id,{t:'err',text:A.warn});return}
    }
    if(m.type==='lag'){m.blink-=dt;if(m.blink<=0&&dp>2){m.blink=rr(2,3.2);const L=Math.min(1.8,dp-1),nx=m.x+(T.x-m.x)/dp*L,ny=m.y+(T.y-m.y)/dp*L;if(!isSolid(map,nx,ny)){burst(w,map.id,m.x,m.y-.6,'#ff3bd5',6);m.x=nx;m.y=ny;float(w,map.id,m.x,m.y-1.4,'*lag*','#3bf0ff')}}}
    if(dp>1.1){stepToward(map,m,T.x,T.y,d.sp,dt)}
    else{m.moving=false;if(Math.abs(T.x-m.x)>.05)m.face=T.x>m.x?1:-1;if(m.acd<=0){m.acd=d.cd;let dmg=ri(m.atk[0],m.atk[1]);if(m.enr)dmg=Math.round(dmg*1.3);hurtPlayer(w,tgt,dmg,m)}}
  }else if(m.st==='ret'){
    m.hp=Math.min(m.mhp,m.hp+m.mhp*.6*dt);
    if(stepToward(map,m,m.hx,m.hy,d.sp*1.6,dt)||dh<.15){m.x=m.hx;m.y=m.hy;m.st='idle';m.hp=m.mhp;m.moving=false;m.bt=6;m.enr=0}
  }
}
