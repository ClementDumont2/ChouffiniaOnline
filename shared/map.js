// Pas de DOM ni de Math.random ici : le serveur et le client régénèrent la même carte depuis la graine.
import {DIFFS} from './data.js';
import {SAFE} from './data/zones.js';
import {mulberry32,rngTools} from './rng.js';

export const T={GRASS:0,DIRT:1,WOOD:2,WALL:3,LAKE:4,TREE:5,KT:6,FLOWER:7,ROCK:8,DESK:9,BED:10,FRIDGE:11,TABLE:12,SHELF:13,STONE:14,FENCE:15,STALLR:16,STALLB:17,BAR:18,STAIRS:19,SWAMP:20,MURK:21,DTREE:22,SALT:23,CRYSTAL:24,METAL:25,RACK:26,DFLOOR:27,DWALL:28,DTORCH:29,PILLAR:30,PAPERS:31,ASPHALT:32,LINE:33,CAR:34,LAMP:35,SFLOOR:36,AISLE:37,CASH:38,CART:39,CARPET:40,GUICHET:41,PLANT:42,HALL:43,BOOTH:44,BANNER:45,LABFLOOR:46,PCDESK:47,BOARD:48};
export const SOLID=new Uint8Array(64);
for(const k of ['WALL','LAKE','TREE','ROCK','DESK','BED','FRIDGE','TABLE','SHELF','FENCE','STALLR','STALLB','BAR','STAIRS','MURK','DTREE','CRYSTAL','RACK','DWALL','DTORCH','PILLAR','CAR','LAMP','AISLE','CASH','CART','GUICHET','PLANT','BOOTH','BANNER','PCDESK','BOARD'])SOLID[T[k]]=1;

export function tileAt(map,x,y){x=Math.floor(x);y=Math.floor(y);return(x<0||y<0||x>=map.w||y>=map.h)?map.oob:map.t[y*map.w+x]}
export function setTile(map,x,y,v){if(x>=0&&y>=0&&x<map.w&&y<map.h)map.t[y*map.w+x]=v}
export const isSolid=(map,x,y)=>SOLID[tileAt(map,x,y)]===1;
export function canStand(map,x,y,r=.28){return !isSolid(map,x-r,y-r*.6)&&!isSolid(map,x+r,y-r*.6)&&!isSolid(map,x-r,y+r*.4)&&!isSolid(map,x+r,y+r*.4)}
export function moveEnt(map,e,dx,dy,r){if(canStand(map,e.x+dx,e.y,r))e.x+=dx;if(canStand(map,e.x,e.y+dy,r))e.y+=dy}
export function stepToward(map,e,tx,ty,sp,dt){const dx=tx-e.x,dy=ty-e.y,L=Math.hypot(dx,dy);if(L<.05){e.moving=false;return true}const s=Math.min(sp*dt,L);const ox=e.x,oy=e.y;moveEnt(map,e,dx/L*s,dy/L*s);e.moving=true;e.step+=dt*11;if(Math.abs(dx)>.02)e.face=dx>0?1:-1;return Math.hypot(e.x-ox,e.y-oy)<s*.2}
export function fillRect(map,x0,y0,x1,y1,v){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)setTile(map,x,y,v)}

export function genOverworld(seed){
  // 80 colonnes d'origine + 40 de zones (Lot 8) + 40 (Lot 9). Les 80 premières sont générées exactement comme avant ; l'extension a son propre générateur.
  const map={id:'over',w:160,h:60,t:new Uint8Array(160*60),oob:T.TREE};
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
  // L'Arène du Débat Stérile : petit enclos à l'est du Bourg, ouvert sur la route par deux cases au sud.
  rect(29,13,38,19,T.FENCE);rect(30,14,37,18,T.STONE);rect(33,19,34,19,T.STONE);
  genEast(map,seed);genFar(map,seed);
  return map;
}

// Parking du Lycée (y 0–19), Supermarché (y 20–39), Pôle Emploi (y 40–59), x 80–119. Une route part du Marais du Lag, une porte au sud relie les zones entre elles.
function genEast(map,seed){
  const r=mulberry32(seed^0x5a17c0de),rect=(...a)=>fillRect(map,...a),setT=(x,y,v)=>setTile(map,x,y,v);
  for(let y=0;y<60;y++)for(let x=80;x<120;x++)setT(x,y,r()<.06?T.FLOWER:T.GRASS);
  for(let x=80;x<120;x++){setT(x,0,T.TREE);setT(x,59,T.TREE)}
  for(let y=0;y<60;y++)setT(119,y,T.TREE);
  // Route depuis le Marais : la haie de x = 79 s'ouvre sur le parking.
  rect(64,12,80,13,T.DIRT);
  // Parking : bitume, places tracées, voitures (aléatoires) et lampadaires ; l'allée centrale (y 8–11) reste libre.
  rect(80,1,118,18,T.ASPHALT);
  for(const y0 of [2,14])for(let x=84;x<=116;x+=3){
    rect(x,y0,x,y0+3,T.LINE);
    for(const y of [y0,y0+1,y0+2])if(x+1<=116&&r()<.5)setT(x+1,y,T.CAR);
  }
  for(const x of [88,100,112])setT(x,7,T.LAMP);
  for(let x=80;x<=118;x++)setT(x,19,T.TREE);
  rect(99,19,100,21,T.DIRT);
  // Supermarché : bâtiment, deux portes (nord et sud), rayons, caisses et caddies.
  rect(82,22,117,37,T.WALL);rect(83,23,116,36,T.SFLOOR);rect(99,22,100,22,T.SFLOOR);rect(99,37,100,37,T.SFLOOR);
  rect(99,20,100,21,T.DIRT);rect(99,38,100,39,T.DIRT);
  for(const y of [26,31])for(let x=85;x<=114;x++)if(x<98||x>101)setT(x,y,T.AISLE);
  rect(86,34,93,34,T.CASH);
  for(let i=0;i<10;i++){const x=84+Math.floor(r()*32),y=24+Math.floor(r()*12);if(tileAt(map,x,y)===T.SFLOOR&&y!==29&&y!==28)setT(x,y,T.CART)}
  for(let x=80;x<=118;x++)setT(x,39,T.TREE);
  rect(99,39,100,39,T.DIRT);
  // Pôle Emploi : bâtiment, porte nord, guichets et plantes.
  rect(82,42,117,57,T.WALL);rect(83,43,116,56,T.CARPET);rect(99,42,100,42,T.CARPET);rect(99,40,100,41,T.DIRT);
  for(const [x0,x1] of [[86,96],[103,113]])rect(x0,47,x1,47,T.GUICHET);
  for(const [x,y] of [[84,44],[115,44],[84,55],[115,55],[98,55],[101,55]])setT(x,y,T.PLANT);
  // Préau : sanctuaire dallé à l'entrée ouest du parking, sur l'allée centrale (rien d'aléatoire n'y tombe).
  rect(80,8,91,12,T.STONE);
}

// Lot 9, x 120–159 : Convention Manga/Anime (y 40–59, reliée à la porte est du Pôle Emploi) puis DIIAGE (y 0–39, par la porte nord de la Convention).
function genFar(map,seed){
  const r=mulberry32(seed^0x9e3779b1),rect=(...a)=>fillRect(map,...a),setT=(x,y,v)=>setTile(map,x,y,v);
  for(let y=0;y<60;y++)for(let x=120;x<160;x++)setT(x,y,r()<.06?T.FLOWER:T.GRASS);
  for(let x=120;x<160;x++){setT(x,0,T.TREE);setT(x,59,T.TREE)}
  for(let y=0;y<60;y++)setT(159,y,T.TREE);
  // Porte est du Pôle Emploi, puis route jusqu'à la Convention.
  rect(117,50,117,51,T.CARPET);rect(118,50,122,51,T.DIRT);
  // Convention : hall, stands (deux rangées, allée centrale libre), bannières aux angles.
  rect(122,42,157,57,T.WALL);rect(123,43,156,56,T.HALL);rect(122,50,122,51,T.HALL);rect(139,42,140,42,T.HALL);
  for(let x=125;x<=154;x+=4)for(const y of [46,53]){setT(x,y,T.BOOTH);setT(x+1,y,T.BOOTH)}
  for(const [x,y] of [[124,44],[155,44],[124,55],[155,55]])setT(x,y,T.BANNER);
  // Route vers le DIIAGE.
  rect(139,35,140,41,T.DIRT);
  // DIIAGE : campus, salle de cours (bureaux en rangées, tableaux au mur nord), porte sud.
  rect(122,4,157,34,T.WALL);rect(123,5,156,33,T.LABFLOOR);rect(139,34,140,34,T.LABFLOOR);
  for(let x=125;x<=154;x++)if(x<137||x>142)setT(x,5,T.BOARD);
  for(const y of [10,16,22,28])for(let x=126;x<=153;x++)if((x-126)%4<3&&(x<136||x>143))setT(x,y,T.PCDESK);
}

export function randSpot(map,rnd,x0,x1,y0,y1,avoid){
  const {ri}=rngTools(rnd),solid=(x,y)=>isSolid(map,x,y);
  for(let i=0;i<300;i++){const x=ri(x0,x1)+.5,y=ri(y0,y1)+.5;if(!solid(x,y)&&!solid(x+.35,y)&&!solid(x-.35,y)&&!solid(x,y-.4)&&(!avoid||!avoid(x,y)))return{x,y}}
  return{x:x0+.5,y:y0+.5};
}

export function zoneAt(map,x,y){
  if(map.id!=='over')return'dungeon';
  for(const k in SAFE){const r=SAFE[k].r;if(r&&x>=r[0]&&x<r[2]+1&&y>=r[1]&&y<r[3]+1)return k}
  if(x>=120)return y<40?'diiage':'convention';
  if(x>=80)return y<20?'parking':y<40?'supermarche':'pole';
  if(x<14&&y<12)return'base';
  if(x>=11&&x<26&&y>=13&&y<23)return'bourg';
  if(x>=29&&x<39&&y>=13&&y<20)return'arene';
  if(x<16&&y>=26&&y<38)return'cuisine';
  if(x>=51&&y<33)return'marais';
  if(x>=51)return'datacenter';
  if(y>=38)return'sel';
  if(x>=30&&y>=16)return'foret';
  if(x>=25&&y<16)return'lac';
  if(y<14)return'plaine';
  return'steppe';
}
// Point d'ancrage du nom de chaque zone : ses tuiles les plus éloignées du bord (distance de Manhattan, deux passes), lisible même pour les zones en L.
// r = cette distance, en tuiles : la place disponible autour du point.
export function zoneLabels(map){
  const {w,h}=map,z=[],d=new Float32Array(w*h);
  for(let i=0;i<w*h;i++)z[i]=zoneAt(map,i%w+.5,(i/w|0)+.5);
  const at=(x,y,i)=>x<0||y<0||x>=w||y>=h||z[y*w+x]!==z[i]?0:d[y*w+x];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;d[i]=Math.min(at(x-1,y,i),at(x,y-1,i))+1}
  for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const i=y*w+x;d[i]=Math.min(d[i],at(x+1,y,i)+1,at(x,y+1,i)+1)}
  const acc={};for(let i=0;i<w*h;i++){const a=acc[z[i]]??={r:0,x:0,y:0,n:0};if(d[i]>a.r)Object.assign(a,{r:d[i],x:0,y:0,n:0});if(d[i]===a.r){a.x+=i%w+.5;a.y+=(i/w|0)+.5;a.n++}}
  return Object.entries(acc).map(([k,a])=>({z:k,x:a.x/a.n,y:a.y/a.n,r:a.r}));
}
export const isSafe=(map,x,y)=>{const z=zoneAt(map,x,y);return z==='arene'||!!SAFE[z]};

// A* sur les tuiles, 8 directions sans couper les coins. avoid(x, y) : cases interdites en plus des murs (les sanctuaires pour un monstre).
// Renvoie les centres de cases à suivre jusqu'à la case d'arrivée, ou null si elle n'est pas atteinte en `max` cases explorées.
// ponytail: file ouverte parcourue linéairement (O(n²) sur max = 400) ; tas binaire si max ou le nombre de poursuivants grossit.
export function findPath(map,x0,y0,x1,y1,avoid,max=400){
  const w=map.w,gx=Math.floor(x1),gy=Math.floor(y1),start=Math.floor(y0)*w+Math.floor(x0),goal=gy*w+gx;
  const free=(x,y)=>x>=0&&y>=0&&x<w&&y<map.h&&!isSolid(map,x,y)&&!(avoid&&avoid(x+.5,y+.5));
  const h=i=>{const dx=Math.abs(i%w-gx),dy=Math.abs((i/w|0)-gy);return Math.max(dx,dy)+.41*Math.min(dx,dy)};
  const g=new Map([[start,0]]),from=new Map(),shut=new Set(),open=[start];
  while(open.length&&shut.size<max){
    let b=0;for(let k=1;k<open.length;k++)if(g.get(open[k])+h(open[k])<g.get(open[b])+h(open[b]))b=k;
    const c=open[b];open[b]=open[open.length-1];open.pop();
    if(c===goal){const path=[];for(let i=c;i!==start;i=from.get(i))path.push({x:i%w+.5,y:(i/w|0)+.5});return path.reverse()}
    if(shut.has(c))continue;shut.add(c);
    const cx=c%w,cy=c/w|0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!(dx||dy)||!free(cx+dx,cy+dy)||(dx&&dy&&(!free(cx+dx,cy)||!free(cx,cy+dy))))continue;
      const n=(cy+dy)*w+cx+dx,ng=g.get(c)+(dx&&dy?1.41:1);
      if(ng<(g.get(n)??Infinity)){g.set(n,ng);from.set(n,c);open.push(n)}
    }
  }
  return null;
}

// Les monstres ne sont pas créés ici (ils portent de l'état d'exécution) : la carte rend seulement où et quoi faire apparaître.
// opts : {L, packs, kinds, boss, mobs} d'un donjon à thème (mobs : nombre exact de monstres répartis dans toutes les salles sauf l'entrée, sans boss) ; sans eux, les Archives. Les tuiles ne dépendent que de la graine : le client les régénère sans opts.
export function genDungeon(seed,ti,opts={}){
  const df={...DIFFS[ti],...opts},rnd=mulberry32(seed),{ri,pick}=rngTools(rnd);
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
    const kinds=df.kinds||['spam','necro','fantome','pave'];
    if(df.mobs)for(let k=0;k<df.mobs;k++){const r=order[1+k%(order.length-1)],p=randSpot(D,rnd,r.x+1,r.x+r.w-2,r.y+1,r.y+r.h-2);D.spawns.push({type:pick(kinds),x:p.x,y:p.y,l:df.L})}
    else for(let i=1;i<order.length-1;i++){
      const r=order[i],n=ri(df.packs[0],df.packs[1]);
      // Patrouille : le monstre suit le couloir en L qui relie sa salle à la suivante (mêmes points que le creusement ci-dessus). Héroïque et plus, environ un monstre sur huit.
      const a=order[i],b=order[i+1],ax=Math.floor(a.cx),ay=Math.floor(a.cy),bx=Math.floor(b.cx),by=Math.floor(b.cy);
      for(let k=0;k<n;k++){
        const p=randSpot(D,rnd,r.x+1,r.x+r.w-2,r.y+1,r.y+r.h-2),spawn={type:pick(kinds),x:p.x,y:p.y,l:df.L};
        if(ti>=1&&rnd()<.12)spawn.patrol=[{x:ax+.5,y:ay+.5},{x:bx+.5,y:ay+.5},{x:bx+.5,y:by+.5}];
        D.spawns.push(spawn);
      }
    }
    // Plusieurs boss (le Jury de la Soutenance) : côte à côte au centre de la dernière salle.
    const br=order[order.length-1],bosses=df.mobs?[]:[].concat(df.boss||'archiviste');
    bosses.forEach((type,i)=>D.spawns.push({type,x:Math.floor(br.cx)+.5+(i-(bosses.length-1)/2)*2.2,y:Math.floor(br.cy)+.5,l:df.L+1}));
    return D;
  }
  return null;
}
