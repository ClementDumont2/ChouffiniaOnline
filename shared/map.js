// Pas de DOM ni de Math.random ici : le serveur et le client régénèrent la même carte depuis la graine.
import {DIFFS} from './data.js';
import {mulberry32,rngTools} from './rng.js';

export const T={GRASS:0,DIRT:1,WOOD:2,WALL:3,LAKE:4,TREE:5,KT:6,FLOWER:7,ROCK:8,DESK:9,BED:10,FRIDGE:11,TABLE:12,SHELF:13,STONE:14,FENCE:15,STALLR:16,STALLB:17,BAR:18,STAIRS:19,SWAMP:20,MURK:21,DTREE:22,SALT:23,CRYSTAL:24,METAL:25,RACK:26,DFLOOR:27,DWALL:28,DTORCH:29,PILLAR:30,PAPERS:31};
export const SOLID=new Uint8Array(40);
for(const k of ['WALL','LAKE','TREE','ROCK','DESK','BED','FRIDGE','TABLE','SHELF','FENCE','STALLR','STALLB','BAR','STAIRS','MURK','DTREE','CRYSTAL','RACK','DWALL','DTORCH','PILLAR'])SOLID[T[k]]=1;

export function tileAt(map,x,y){x=Math.floor(x);y=Math.floor(y);return(x<0||y<0||x>=map.w||y>=map.h)?map.oob:map.t[y*map.w+x]}
export function setTile(map,x,y,v){if(x>=0&&y>=0&&x<map.w&&y<map.h)map.t[y*map.w+x]=v}
export const isSolid=(map,x,y)=>SOLID[tileAt(map,x,y)]===1;
export function canStand(map,x,y,r=.28){return !isSolid(map,x-r,y-r*.6)&&!isSolid(map,x+r,y-r*.6)&&!isSolid(map,x-r,y+r*.4)&&!isSolid(map,x+r,y+r*.4)}
export function moveEnt(map,e,dx,dy,r){if(canStand(map,e.x+dx,e.y,r))e.x+=dx;if(canStand(map,e.x,e.y+dy,r))e.y+=dy}
export function stepToward(map,e,tx,ty,sp,dt){const dx=tx-e.x,dy=ty-e.y,L=Math.hypot(dx,dy);if(L<.05){e.moving=false;return true}const s=Math.min(sp*dt,L);const ox=e.x,oy=e.y;moveEnt(map,e,dx/L*s,dy/L*s);e.moving=true;e.step+=dt*11;if(Math.abs(dx)>.02)e.face=dx>0?1:-1;return Math.hypot(e.x-ox,e.y-oy)<s*.2}
export function fillRect(map,x0,y0,x1,y1,v){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)setTile(map,x,y,v)}

export function genOverworld(seed){
  const map={id:'over',w:80,h:60,t:new Uint8Array(80*60),oob:T.TREE};
  const setT=(x,y,v)=>setTile(map,x,y,v),rect=(...a)=>fillRect(map,...a);
  const r=mulberry32(seed),RI=(a,b)=>a+Math.floor(r()*(b-a+1));
  for(let y=0;y<60;y++)for(let x=0;x<80;x++){const q=r();setT(x,y,q<.07?T.FLOWER:q<.083?T.ROCK:T.GRASS)}
  for(let y=17;y<38;y++)for(let x=31;x<50;x++)if(r()<.2)setT(x,y,T.TREE);
  for(let i=0;i<45;i++)setT(Math.floor(r()*50),Math.floor(r()*38),T.TREE);
  for(let y=0;y<38;y++)for(let x=0;x<50;x++){if(((x-35)/8.5)**2+((y-8)/4.6)**2<1)setT(x,y,T.LAKE)}
  // Marais du Lag
  for(let y=1;y<32;y++)for(let x=51;x<79;x++)setT(x,y,r()<.07?T.DTREE:T.SWAMP);
  for(let i=0;i<8;i++){const cx=RI(54,76),cy=RI(3,29),rx=1.5+r()*2.5,ry=1.2+r()*1.6;for(let y=cy-4;y<=cy+4;y++)for(let x=cx-5;x<=cx+5;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<1)setT(x,y,T.MURK)}
  // Désert de Sel du 18-25
  for(let y=39;y<59;y++)for(let x=1;x<50;x++){const q=r();setT(x,y,q<.045?T.CRYSTAL:T.SALT)}
  // Datacenter
  rect(52,33,78,58,T.WALL);rect(53,34,77,57,T.METAL);
  for(let y=36;y<=56;y+=4)for(let x=55;x<=75;x++)if((x-55)%7<5)setT(x,y,T.RACK);
  // hedges
  for(let y=0;y<60;y++)setT(50,y,T.TREE);
  for(let x=0;x<=50;x++)setT(x,38,T.TREE);
  for(let x=51;x<80;x++)setT(x,32,T.TREE);
  for(let x=0;x<80;x++){setT(x,0,T.TREE);setT(x,59,T.TREE)}
  for(let y=0;y<60;y++){setT(0,y,T.TREE);setT(79,y,T.TREE)}
  // paths
  rect(14,5,24,6,T.DIRT);rect(23,5,24,21,T.DIRT);rect(8,20,66,21,T.DIRT);rect(8,20,9,25,T.DIRT);rect(24,12,27,13,T.DIRT);
  rect(64,4,65,20,T.DIRT);rect(66,20,67,35,T.DIRT);rect(30,21,31,49,T.DIRT);rect(6,48,60,49,T.DIRT);
  // basement
  rect(1,1,13,11,T.WALL);rect(2,2,12,10,T.WOOD);rect(13,5,13,6,T.DIRT);
  setT(3,2,T.DESK);setT(4,2,T.DESK);setT(10,2,T.BED);setT(11,2,T.BED);setT(2,6,T.SHELF);setT(2,7,T.SHELF);
  // kitchen
  rect(1,26,15,36,T.WALL);rect(2,27,14,35,T.KT);rect(8,26,9,26,T.DIRT);
  setT(2,27,T.FRIDGE);setT(3,27,T.FRIDGE);rect(12,33,13,34,T.TABLE);
  // Bourg-Forum
  rect(11,13,25,22,T.FENCE);rect(12,14,24,21,T.STONE);rect(23,13,24,13,T.STONE);rect(11,20,11,21,T.STONE);rect(25,20,25,21,T.STONE);
  rect(13,15,15,15,T.STALLR);rect(18,15,20,15,T.STALLB);setT(12,19,T.BAR);setT(13,19,T.BAR);setT(20,18,T.STAIRS);setT(21,18,T.STAIRS);
  return map;
}

export function randSpot(map,rnd,x0,x1,y0,y1,avoid){
  const {ri}=rngTools(rnd),solid=(x,y)=>isSolid(map,x,y);
  for(let i=0;i<300;i++){const x=ri(x0,x1)+.5,y=ri(y0,y1)+.5;if(!solid(x,y)&&!solid(x+.35,y)&&!solid(x-.35,y)&&!solid(x,y-.4)&&(!avoid||!avoid(x,y)))return{x,y}}
  return{x:x0+.5,y:y0+.5};
}

export function zoneAt(map,x,y){
  if(map.id!=='over')return'dungeon';
  if(x<14&&y<12)return'base';
  if(x>=11&&x<26&&y>=13&&y<23)return'bourg';
  if(x<16&&y>=26&&y<38)return'cuisine';
  if(x>=51&&y<33)return'marais';
  if(x>=51)return'datacenter';
  if(y>=38)return'sel';
  if(x>=30&&y>=16)return'foret';
  if(x>=25&&y<16)return'lac';
  if(y<14)return'plaine';
  return'steppe';
}
export const isSafe=(map,x,y)=>{const z=zoneAt(map,x,y);return z==='base'||z==='bourg'};

// Les monstres ne sont pas créés ici (ils portent de l'état d'exécution) : la carte rend seulement où et quoi faire apparaître.
export function genDungeon(seed,ti){
  const df=DIFFS[ti],rnd=mulberry32(seed),{ri,pick}=rngTools(rnd);
  for(let attempt=0;attempt<20;attempt++){
    const w=48,h=38,D={id:'dg',w,h,t:new Uint8Array(w*h).fill(T.DWALL),oob:T.DWALL,ti,spawns:[]};
    const setT=(x,y,v)=>setTile(D,x,y,v),at=(x,y)=>tileAt(D,x,y),rect=(...a)=>fillRect(D,...a);
    const rooms=[];
    for(let k=0;k<500&&rooms.length<8;k++){const rw=ri(6,10),rh=ri(5,8),x=ri(2,w-rw-3),y=ri(2,h-rh-3);if(rooms.every(o=>x+rw+2<o.x||o.x+o.w+2<x||y+rh+2<o.y||o.y+o.h+2<y))rooms.push({x,y,w:rw,h:rh,cx:x+rw/2,cy:y+rh/2})}
    if(rooms.length<6)continue;
    const order=[rooms.reduce((a,b)=>a.cx+a.cy<b.cx+b.cy?a:b)];let rest=rooms.filter(r=>r!==order[0]);
    while(rest.length){const l=order[order.length-1];rest.sort((a,b)=>Math.hypot(a.cx-l.cx,a.cy-l.cy)-Math.hypot(b.cx-l.cx,b.cy-l.cy));order.push(rest.shift())}
    for(const r of order)rect(r.x,r.y,r.x+r.w-1,r.y+r.h-1,T.DFLOOR);
    for(let i=0;i<order.length-1;i++){const a=order[i],b=order[i+1];const ax=Math.floor(a.cx),ay=Math.floor(a.cy),bx=Math.floor(b.cx),by=Math.floor(b.cy);
      rect(Math.min(ax,bx),ay,Math.max(ax,bx)+1,ay+1,T.DFLOOR);rect(bx,Math.min(ay,by),bx+1,Math.max(ay,by)+1,T.DFLOOR)}
    for(let i=1;i<order.length;i++){const r=order[i];if(r.w>=8&&r.h>=7&&rnd()<.6){for(const [px,py] of [[r.x+1,r.y+1],[r.x+r.w-2,r.y+1],[r.x+1,r.y+r.h-2],[r.x+r.w-2,r.y+r.h-2]])setT(px,py,T.PILLAR)}}
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const t=at(x,y);if(t===T.DFLOOR&&rnd()<.05)setT(x,y,T.PAPERS);else if(t===T.DWALL){const b=at(x,y+1);if((b===T.DFLOOR||b===T.PAPERS)&&rnd()<.16)setT(x,y,T.DTORCH)}}
    const st=order[0];D.sx=Math.floor(st.cx)+.5;D.sy=Math.floor(st.cy)+1.5;
    D.portal={x:Math.floor(st.cx)+.5,y:Math.floor(st.cy)-.2};
    D.rooms=rooms;
    const kinds=['spam','necro','fantome','pave'];
    for(let i=1;i<order.length-1;i++){const r=order[i],n=ri(df.packs[0],df.packs[1]);for(let k=0;k<n;k++){const p=randSpot(D,rnd,r.x+1,r.x+r.w-2,r.y+1,r.y+r.h-2);D.spawns.push({type:pick(kinds),x:p.x,y:p.y,l:df.L})}}
    const br=order[order.length-1];D.spawns.push({type:'archiviste',x:Math.floor(br.cx)+.5,y:Math.floor(br.cy)+.5,l:df.L+1});
    return D;
  }
  return null;
}
