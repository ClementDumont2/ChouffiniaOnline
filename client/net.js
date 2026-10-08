import {MOBS,NPCS} from '../shared/data.js';
import {genDungeon,genOverworld} from '../shared/map.js';
import {P,WD,bind,me,net,setMap,setS,world} from './state.js';

// Branchés par main.js : net.js ne sait rien de l'interface.
export const hooks={welcome(){},self(){},event(){},target(){},offline(){},refused(){}};

let ws=null,ident=null,pending=null,sent=null,retry=0,joined=false,refusal=null;
const raw=m=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify(m))};

export function buildMap(w){
  const map=w.id==='over'?genOverworld(w.seed):genDungeon(w.seed,w.ti);
  return Object.assign(map,{id:w.id,seed:w.seed,ti:w.ti,done:!!w.done,mobs:[],objs:[],npcs:w.id==='over'?NPCS.map(n=>({...n})):[],bots:[],c:null,mini:null});
}

export function connect(name,hat,cls){ident={name,hat,cls};joined=false;refusal=null;clearTimeout(retry);if(ws){const old=ws;ws=null;old.close()}open()}
function open(){
  clearTimeout(retry);
  const sock=ws=new WebSocket(`${location.protocol==='https:'?'wss':'ws'}://${location.host}`);
  sock.onopen=()=>raw({t:'join',name:ident.name,hat:ident.hat,cls:ident.cls});
  sock.onmessage=e=>{try{onMsg(JSON.parse(e.data))}catch(err){console.error(err)}};
  // Refus au premier join : inutile de réessayer. Après une coupure, on réessaie : l'ancienne connexion finit par être purgée par le serveur.
  sock.onclose=()=>{
    if(ws!==sock)return;
    ws=null;
    if(refusal&&!joined){hooks.refused(refusal);refusal=null;return}
    hooks.offline();retry=setTimeout(open,2000);
  };
}

net.act=a=>raw({t:'act',...a});
net.chat=text=>raw({t:'chat',text});
net.move=(x,y,face)=>{pending={x,y,face}};
// ~10 positions/s suffisent : le serveur ne fait que valider, l'écran local utilise la position calculée ici.
setInterval(()=>{
  if(pending&&(!sent||sent.x!==pending.x||sent.y!==pending.y)){raw({t:'move',...pending});sent=pending}
  pending=null;
},100);

function onMsg(m){
  if(m.t==='welcome'){
    joined=true;ident.name=m.save.name;bind(m.id,m.save);setMap(buildMap({id:'over',seed:m.seed}));pending=sent=null;hooks.welcome();
  }else if(m.t==='self'){setS(m.save);hooks.self()}
  else if(m.t==='refused')refusal=m.msg;
  else if(m.t==='ev'){
    for(const e of m.list){if(e.t==='tp'){P.x=e.x;P.y=e.y;pending=sent=null}hooks.event(e)}
  }else if(m.t==='snap')applySnap(m);
}

const DEFAULTS={say:'',sayT:0};
// Les entités gardent leur identité d'un snapshot à l'autre pour pouvoir être interpolées.
function merge(old,recs,now,make){
  const byId=new Map(old.map(o=>[o.id,o])),next=[];
  for(const r of recs){
    let o=byId.get(r.id);const fresh=!o;if(fresh)o=make(r);
    const {x,y,...rest}=r;Object.assign(o,DEFAULTS,rest);
    if(fresh||Math.hypot(x-o.x,y-o.y)>3){o.x=x;o.y=y}
    o._px=o.x;o._py=o.y;o._tx=x;o._ty=y;o._t=now;
    next.push(o);
  }
  return next;
}

function applySnap(m){
  const w=m.world,now=performance.now();
  if(!me)return;
  if(!WD||WD.id!==w.id||WD.seed!==w.seed)setMap(buildMap(w));
  WD.done=w.done;
  const by={mob:[],obj:[],bot:[],npc:[],player:[]};
  for(const r of m.ents)by[r.kind].push(r);
  WD.mobs=merge(WD.mobs,by.mob,now,r=>({d:MOBS[r.type]}));
  WD.objs=merge(WD.objs,by.obj,now,()=>({}));
  WD.bots=merge(WD.bots,by.bot,now,()=>({}));
  for(const n of WD.npcs){const r=by.npc.find(x=>x.id===n.id);n.say=r?r.say:'';n.sayT=r?r.sayT:0}

  const others=by.player.filter(r=>r.id!==me),old=Object.values(world.players).filter(p=>p.id!==me).map(p=>p.P);
  const ps=merge(old,others,now,()=>({}));
  const mine=world.players[me];
  world.players={[me]:mine};
  for(const [i,r] of others.entries())world.players[r.id]={id:r.id,P:ps[i],mapId:w.id,S:{name:r.n,hat:r.look.hat,eq:r.look.eq,lvl:r.lvl,cls:r.cls}};

  // Sa propre position vient du client ; le reste de son état de combat vient du serveur.
  const r=by.player.find(x=>x.id===me);
  if(r){
    const prev=P.target,{priv}=r;
    Object.assign(P,{tipT:r.tipT,dead:r.dead,drunk:r.drunk,say:r.say,sayT:r.sayT,cd:priv.cd,buffs:priv.buffs,mount:r.mount,cast:priv.cast,target:priv.target,auto:priv.auto,group:priv.group});
    mine.S.hp=priv.hp;mine.S.caf=priv.caf;
    if(prev!==P.target)hooks.target();
  }
}

export function interp(now){
  const step=o=>{const a=Math.min(1,(now-o._t)/50);o.x=o._px+(o._tx-o._px)*a;o.y=o._py+(o._ty-o._py)*a};
  WD.mobs.forEach(step);WD.bots.forEach(step);
  for(const pl of Object.values(world.players))if(pl.id!==me)step(pl.P);
}
