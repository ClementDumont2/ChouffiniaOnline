import {QUESTS} from '../shared/data.js';
import {AFFIXES} from '../shared/data/bosses.js';
import {clamp,dist} from '../shared/rules.js';
import {T,tileAt} from '../shared/map.js';
import {$,rnd,rr} from './util.js';
import {MOUNT_LIFT,drawChouffin,drawMob,drawMount,drawNpc,drawObj,playerLook} from './sprites.js';
import {P,S,WD,me,targetEnt,world} from './state.js';

export const cv=$('#world'),ctx=cv.getContext('2d');
export let W=0,H=0,DPR=1,TS=36;
export const cam={x:0,y:0};
export let floaters=[],parts=[],marker=null;
export const setMarker=m=>{marker=m};
const at=(x,y)=>tileAt(WD,x,y);
const PX=32;
function hsh(x,y,k){let n=(x*374761393+y*668265263+(k||0)*982451653)|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296}
function paintTile(g,map,x,y){
  const t=tileAt(map,x,y),X=x*PX,Y=y*PX,R=(a,b,w,h,c)=>{g.fillStyle=c;g.fillRect(X+a,Y+b,w,h)},Hh=k=>hsh(x,y,k);
  const circ=(cx,cy,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X+cx,Y+cy,r,0,7);g.fill()};
  const grass=()=>{R(0,0,32,32,Hh(0)<.5?'#3e6c35':'#3a6632');for(let i=0;i<5;i++)R(Math.floor(Hh(i+1)*29),Math.floor(Hh(i+11)*28),2,4,Hh(i+21)<.5?'#4b7e3f':'#33592c')};
  const wood=()=>{R(0,0,32,32,'#5e4129');for(let i=0;i<4;i++){R(0,i*8+7,32,1,'#46301e');R(Math.floor(Hh(i+3)*30),i*8,1,7,'#46301e')}R(Math.floor(Hh(9)*26),Math.floor(Hh(8)*26),3,1,'#6b4b30')};
  const kt=()=>{for(let j=0;j<2;j++)for(let i=0;i<2;i++)R(i*16,j*16,16,16,(i+j)%2?'#d6cfbd':'#b9b09b')};
  const stone=()=>{R(0,0,32,32,'#57524e');for(let j=0;j<4;j++)for(let i=0;i<2;i++){const o=(j%2)*8;R(i*16+o-8+1,j*8+1,14,6,Hh(i+j*3)<.5?'#77716b':'#6c6661')}};
  const swamp=()=>{R(0,0,32,32,'#36442f');for(let i=0;i<4;i++)R(Math.floor(Hh(i+1)*26),Math.floor(Hh(i+7)*28),6,3,'#2c3927');R(Math.floor(Hh(12)*28),Math.floor(Hh(13)*28),2,2,'#5d6e4c')};
  const salt=()=>{R(0,0,32,32,Hh(0)<.5?'#dcd6c8':'#d5cfc0');g.strokeStyle='#bab2a1';g.lineWidth=1;g.beginPath();const a=Hh(4)*32,b=Hh(5)*32;g.moveTo(X+a,Y);g.lineTo(X+b,Y+16);g.lineTo(X+Hh(6)*32,Y+32);g.stroke();R(Math.floor(Hh(7)*28),Math.floor(Hh(8)*28),2,2,'#f2efe6')};
  const metal=()=>{R(0,0,32,32,'#3a3f46');R(0,0,32,1,'#4a5058');R(0,0,1,32,'#4a5058');R(31,0,1,32,'#2a2e33');R(0,31,32,1,'#2a2e33');R(3,3,2,2,'#2a2e33');R(27,3,2,2,'#2a2e33');R(3,27,2,2,'#2a2e33');R(27,27,2,2,'#2a2e33')};
  const dfloor=()=>{R(0,0,32,32,'#2a2730');R(1,1,14,14,'#322e39');R(17,1,14,14,Hh(1)<.5?'#2f2b36':'#353140');R(1,17,14,14,Hh(2)<.5?'#353140':'#2f2b36');R(17,17,14,14,'#322e39');if(Hh(3)<.3)R(Math.floor(Hh(4)*24),Math.floor(Hh(5)*24),7,1,'#1f1c24')};
  const dwall=()=>{R(0,0,32,32,'#16131a');R(0,0,32,5,'#221e28');for(let j=0;j<4;j++){R(0,5+j*7,32,1,'#0e0c11');R((j%2)*12+6,5+j*7,1,7,'#0e0c11');R((j%2)*12+22,5+j*7,1,7,'#0e0c11')}};
  const asphalt=()=>{R(0,0,32,32,'#3a3b40');for(let i=0;i<5;i++)R(Math.floor(Hh(i+1)*30),Math.floor(Hh(i+9)*30),2,2,Hh(i+17)<.5?'#46474d':'#303137')};
  const sfloor=()=>{for(let j=0;j<2;j++)for(let i=0;i<2;i++)R(i*16,j*16,16,16,(i+j)%2?'#d9d6cc':'#c9c5b8')};
  const hall=()=>{R(0,0,32,32,'#5e5f68');for(let i=0;i<4;i++)R(Math.floor(Hh(i+1)*30),Math.floor(Hh(i+9)*30),2,2,['#e85a8a','#f4d03f','#4ab8ff','#6cd04a'][Math.floor(Hh(i+30)*4)]);R(0,15,32,1,'#6e6f78')};
  const labfloor=()=>{R(0,0,32,32,'#2b3a52');R(0,0,32,1,'#3a4c68');R(0,0,1,32,'#3a4c68');R(Math.floor(Hh(3)*26),Math.floor(Hh(4)*26),3,3,'#324560')};
  const carpet=()=>{R(0,0,32,32,'#3e4a66');for(let i=0;i<6;i++)R(Math.floor(Hh(i+1)*30),Math.floor(Hh(i+9)*30),2,2,'#4a5878')};
  const stall=(c1,c2)=>{stone();R(1,14,30,16,'#6b4a2f');R(1,14,30,3,'#7d5a3a');for(let i=0;i<5;i++)R(1+i*6,2,6,10,i%2?c2:c1);R(1,12,30,2,'#3a2a1e');R(4,10,2,6,'#3a2a1e');R(26,10,2,6,'#3a2a1e')};
  switch(t){
    case T.GRASS:grass();break;
    case T.FLOWER:grass();for(let i=0;i<3;i++){const c=['#e9d26a','#d8708a','#f2efe6'][Math.floor(Hh(i+30)*3)];const a=4+Math.floor(Hh(i+40)*22),b=4+Math.floor(Hh(i+50)*22);R(a,b,3,3,c);R(a+1,b+1,1,1,'#5a4a1a')}break;
    case T.DIRT:R(0,0,32,32,'#7d5e3f');for(let i=0;i<6;i++)R(Math.floor(Hh(i+1)*30),Math.floor(Hh(i+9)*30),2,2,Hh(i+17)<.5?'#6a4f34':'#8f7050');break;
    case T.WOOD:wood();break;
    case T.WALL:R(0,0,32,32,'#2a2630');R(0,0,32,6,'#3a3442');for(let j=0;j<4;j++){R(0,6+j*7,32,1,'#1f1c24');R((j%2)*12+6,6+j*7,1,7,'#1f1c24');R((j%2)*12+22,6+j*7,1,7,'#1f1c24')}break;
    case T.LAKE:R(0,0,32,32,'#58b82c');for(let i=0;i<3;i++)R(Math.floor(Hh(i+1)*24),Math.floor(Hh(i+5)*28),8,2,'#77d943');R(Math.floor(Hh(9)*28),Math.floor(Hh(10)*28),3,3,'#b4f07e');break;
    case T.TREE:grass();R(14,20,5,10,'#4a3020');circ(16,14,13,'#1f4a26');circ(13,11,9,'#2b6132');circ(11,9,4,'#3a7a3d');break;
    case T.ROCK:grass();g.fillStyle='#6f6d73';g.beginPath();g.ellipse(X+16,Y+19,10,7,0,0,7);g.fill();g.fillStyle='#8e8c93';g.beginPath();g.ellipse(X+14,Y+16,6,4,0,0,7);g.fill();break;
    case T.KT:kt();break;
    case T.DESK:wood();R(1,8,30,18,'#3a2a1e');R(1,8,30,3,'#4a3627');
      if(x===3){R(9,0,17,13,'#111');R(11,2,13,8,'#3d8fe8');R(13,4,6,1,'#bfe0ff');R(13,6,9,1,'#bfe0ff');R(16,13,4,3,'#222')}
      else{R(3,14,22,6,'#1a1a1a');for(let i=0;i<6;i++)R(4+i*3,15,2,2,['#ff4a4a','#ffb84a','#f4f04a','#4aff7a','#4ab8ff','#b04aff'][i]);R(26,15,4,5,'#e07a1f')}break;
    case T.BED:wood();R(0,3,32,27,'#6a2e35');R(0,3,32,3,'#521f26');if(x===10)R(3,8,10,18,'#d8d2c4');else R(0,14,32,2,'#521f26');break;
    case T.SHELF:wood();R(2,1,28,30,'#3a2a1e');R(4,11,24,2,'#2a1d14');R(4,22,24,2,'#2a1d14');for(let i=0;i<5;i++){R(5+i*5,5,3,6,['#e2574c','#f0c34a','#4ab8ff','#b06cf0','#6cc23a'][i]);R(5+i*5,16,3,6,['#f2efe6','#e07a1f','#3d8ee6','#d8708a','#9aa0a8'][i])}break;
    case T.FRIDGE:kt();R(3,0,26,31,'#e9e7e1');R(3,12,26,1,'#b8b5ac');R(24,4,2,6,'#9a978f');R(24,16,2,8,'#9a978f');if(x===3)R(8,18,6,6,'#f0c34a');break;
    case T.TABLE:kt();R(0,4,32,26,'#8a5a34');R(0,4,32,3,'#a06c42');break;
    case T.STONE:stone();break;
    case T.FENCE:grass();R(0,12,32,3,'#8a6a44');R(0,21,32,3,'#8a6a44');R(3,8,4,20,'#6b4a2f');R(25,8,4,20,'#6b4a2f');R(3,8,4,2,'#9a7a54');R(25,8,4,2,'#9a7a54');break;
    case T.STALLR:stall('#b9352c','#efe6d6');R(8+Math.floor(Hh(1)*10),18,6,4,'#e07a1f');break;
    case T.STALLB:stall('#2f5f9a','#efe6d6');R(6,19,14,2,'#c8ced6');R(20,18,2,4,'#d4ad60');break;
    case T.BAR:stone();R(0,10,32,20,'#5e3b1c');R(0,10,32,4,'#7d5226');for(let i=0;i<4;i++){R(3+i*7,3,4,8,'#6b4210');R(4+i*7,1,2,3,'#5a3a12');R(3+i*7,6,4,3,'#f2e6c8')}R(0,24,32,1,'#3a2410');break;
    case T.STAIRS:stone();R(2,2,28,28,'#0c0a0e');for(let i=0;i<4;i++)R(4+i*2,6+i*6,24-i*4,3,'#2e2a36');R(2,2,28,2,'#5a3a8a');break;
    case T.SWAMP:swamp();break;
    case T.MURK:R(0,0,32,32,'#1f2f2b');R(Math.floor(Hh(1)*20),Math.floor(Hh(2)*26),10,2,'#2c423b');R(Math.floor(Hh(3)*22),Math.floor(Hh(4)*26),7,1,'#2c423b');break;
    case T.DTREE:swamp();R(14,10,4,20,'#4a4038');R(8,10,7,2,'#4a4038');R(18,6,7,2,'#4a4038');R(8,6,2,5,'#4a4038');R(23,3,2,4,'#4a4038');break;
    case T.SALT:salt();break;
    case T.CRYSTAL:salt();g.fillStyle='#f4f1ea';g.beginPath();g.moveTo(X+10,Y+28);g.lineTo(X+14,Y+6);g.lineTo(X+18,Y+28);g.fill();g.fillStyle='#e6c9d0';g.beginPath();g.moveTo(X+16,Y+28);g.lineTo(X+22,Y+12);g.lineTo(X+26,Y+28);g.fill();g.fillStyle='#ffffff';g.fillRect(X+13,Y+10,1,10);break;
    case T.METAL:metal();break;
    case T.RACK:metal();R(3,0,26,31,'#141619');R(3,0,26,2,'#25282d');for(let j=0;j<5;j++)R(5,4+j*5,22,3,'#1e2125');break;
    // ---- Lot 8 : Parking, Supermarché, Pôle Emploi ----
    case T.ASPHALT:asphalt();break;
    case T.LINE:asphalt();R(14,0,3,32,'#d8d8d0');R(14,Math.floor(Hh(40)*26),3,6,'#3a3b40');break;
    case T.CAR:{asphalt();const c=['#c0392b','#2f6fb0','#d8d8d0','#e0b020','#3a8a4a'][Math.floor(Hh(41)*5)];R(3,12,26,13,c);R(8,6,16,8,c);R(10,7,12,6,'#9fd0e8');R(15,7,2,6,c);R(4,22,6,6,'#111');R(22,22,6,6,'#111');R(5,24,3,3,'#9a9aa2');R(23,24,3,3,'#9a9aa2');R(26,15,3,3,'#f4f0a0');R(3,15,2,3,'#ff4a4a');break}
    case T.LAMP:asphalt();R(15,5,3,25,'#5a5a62');R(9,2,15,4,'#d8d070');R(10,6,13,2,'rgba(240,230,120,.4)');R(12,28,9,3,'#3a3a42');break;
    case T.SFLOOR:sfloor();break;
    case T.AISLE:{sfloor();R(1,3,30,26,'#8a8f98');for(let j=0;j<3;j++){R(2,5+j*8,28,1.5,'#5a5f68');for(let i=0;i<7;i++)R(3+i*4,j*8+7-Math.floor(Hh(i+j*7)*3)*0,3,5,['#d4301f','#2f6fb0','#f4d03f','#3a8a4a','#e07a1f','#8a5ab0'][Math.floor(Hh(i+j*9+60)*6)])}break}
    case T.CASH:sfloor();R(2,10,28,17,'#4a4f58');R(2,10,28,3,'#6a707a');R(4,15,18,5,'#1a1a1e');R(6,16,8,3,'#8a8f98');R(23,12,6,7,'#2a2f38');R(24,13,4,3,'#7fe0ff');R(24,17,2,1,'#ff4a4a');break;
    case T.CART:sfloor();R(6,10,20,10,'rgba(0,0,0,0)');g.strokeStyle='#9aa0a8';g.lineWidth=2;g.strokeRect(X+7,Y+10,18,10);for(let i=1;i<4;i++){g.beginPath();g.moveTo(X+7+i*4.5,Y+10);g.lineTo(X+7+i*4.5,Y+20);g.stroke()}R(4,6,3,6,'#7a7f88');R(4,6,10,2,'#7a7f88');R(8,21,3,3,'#222');R(21,21,3,3,'#222');break;
    case T.CARPET:carpet();break;
    case T.GUICHET:carpet();R(1,8,30,20,'#8a7a5a');R(1,8,30,3,'#a89a74');R(4,1,24,8,'#9fd0e8');R(4,1,24,2,'#c8e6f4');R(12,13,8,2,'#2a2218');R(13,17,6,5,'#f4f1e6');break;
    case T.PLANT:carpet();R(9,19,14,11,'#a0522d');R(9,19,14,3,'#b8683d');circ(16,12,9,'#2f6a34');circ(11,10,6,'#3a7a3d');circ(21,10,6,'#357535');circ(16,6,5,'#4a8a46');break;
    // ---- Lot 9 : Convention, DIIAGE ----
    case T.HALL:hall();break;
    case T.BOOTH:{hall();R(1,2,30,8,'#e8e8e0');for(let i=0;i<5;i++)R(1+i*6,2,3,8,i%2?'#e85a8a':'#e8e8e0');R(1,10,30,18,'#7a3a8a');R(2,16,28,10,'#d8c8a8');R(4,11,9,5,'#f4d03f');R(5,12,7,1,'#c0392b');for(let i=0;i<5;i++)R(4+i*5,18,3,5,['#c0392b','#2f6fb0','#3a8a4a','#e0b020','#8a5ab0'][Math.floor(Hh(i+70)*5)]);break}
    case T.BANNER:hall();R(14,0,4,32,'#6a6a72');R(6,3,20,20,'#c0392b');R(6,3,20,2,'#f4d03f');R(13,9,6,6,'#f4d03f');R(15,10,2,4,'#c0392b');break;
    case T.LABFLOOR:labfloor();break;
    case T.PCDESK:labfloor();R(1,10,30,17,'#8a7a5a');R(1,10,30,3,'#a89a74');R(8,0,16,12,'#111');R(9,1,14,9,'#3d8fe8');for(let i=0;i<4;i++)R(10,2+i*2,6+Math.floor(Hh(i+80)*6),1,'#bfe0ff');R(8,17,16,4,'#222');for(let i=0;i<6;i++)R(9+i*2.4,18,1.6,1.6,'#555');R(26,12,3,4,'#efe6d6');break;
    case T.BOARD:R(0,0,32,32,'#2a2630');R(2,3,28,22,'#e8e8e0');R(4,6,12,1,'#2f6fb0');R(4,10,18,1,'#c0392b');R(4,14,9,1,'#3a8a4a');R(18,16,8,5,'#f4d03f');R(2,25,28,3,'#6a6a72');break;
    case T.DFLOOR:dfloor();break;
    case T.PAPERS:dfloor();for(let i=0;i<3;i++){const a=2+Math.floor(Hh(i+20)*20),b=2+Math.floor(Hh(i+30)*20);R(a,b,8,6,'#cfc7b4');R(a+1,b+2,6,1,'#8a826f');R(a+1,b+4,4,1,'#8a826f')}break;
    case T.DWALL:dwall();break;
    case T.DTORCH:dwall();R(14,14,4,10,'#3a2a1e');R(12,13,8,2,'#5a4a3a');break;
    case T.PILLAR:dfloor();circ(16,18,11,'#1e1b23');circ(16,16,11,'#3b3642');circ(13,13,4,'#4a4552');break;
  }
}
export const MINI_S=3;
const MINI_COL={0:'#3e6c35',1:'#8a6a44',2:'#6a4a2e',3:'#141117',4:'#6fd13a',5:'#1f4424',6:'#c8c0ac',7:'#3e6c35',8:'#6d6b70',9:'#6a4a2e',10:'#6a4a2e',11:'#c8c0ac',12:'#c8c0ac',13:'#6a4a2e',14:'#8a847d',15:'#6b4a2f',16:'#b9352c',17:'#2f5f9a',18:'#5e3b1c',19:'#5a3a8a',20:'#3c4a33',21:'#1f2f2b',22:'#2c3927',23:'#dcd6c8',24:'#f4f1ea',25:'#4a5058',26:'#141619',27:'#433d4c',28:'#100e13',29:'#e08a2a',30:'#2a2730',31:'#5a5448',32:'#3a3b40',33:'#d8d8d0',34:'#2f6fb0',35:'#d8d070',36:'#d9d6cc',37:'#8a8f98',38:'#4a4f58',39:'#9aa0a8',40:'#3e4a66',41:'#8a7a5a',42:'#2f6a34',43:'#5e5f68',44:'#7a3a8a',45:'#c0392b',46:'#2b3a52',47:'#8a7a5a',48:'#e8e8e0'};
export function paintWorld(Wd){
  Wd.c=document.createElement('canvas');Wd.c.width=Wd.w*PX;Wd.c.height=Wd.h*PX;
  const g=Wd.c.getContext('2d');for(let y=0;y<Wd.h;y++)for(let x=0;x<Wd.w;x++)paintTile(g,Wd,x,y);
  Wd.mini=document.createElement('canvas');Wd.mini.width=Wd.w*MINI_S;Wd.mini.height=Wd.h*MINI_S;
  const m=Wd.mini.getContext('2d');for(let y=0;y<Wd.h;y++)for(let x=0;x<Wd.w;x++){m.fillStyle=MINI_COL[tileAt(Wd,x,y)]||'#000';m.fillRect(x*MINI_S,y*MINI_S,MINI_S,MINI_S)}
}
export function floater(x,y,txt,col,big){floaters.push({x:x+rr(-.2,.2),y,txt,col,big,t:0,life:big?1.4:1.1})}
export function burst(x,y,col,n,spd){for(let i=0;i<n;i++){const a=rnd()*7,s=rr(.5,1)*(spd||2.5);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.2,t:0,life:rr(.4,.8),col,sz:rr(.06,.12)})}}
export function updFx(dt){
  for(const f of floaters)f.t+=dt;floaters=floaters.filter(f=>f.t<f.life);
  for(const p of parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=4*dt}parts=parts.filter(p=>p.t<p.life);
  if(marker){marker.t+=dt;if(marker.t>.6)marker=null}
}
const sx=x=>(x-cam.x)*TS,sy=y=>(y-cam.y)*TS;
export function label(txt,x,y,col,size,weight){ctx.font=`${weight||700} ${size}px "Alegreya Sans",sans-serif`;ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=Math.max(2.5,size*.22);ctx.strokeStyle='rgba(0,0,0,.85)';ctx.strokeText(txt,x,y);ctx.fillStyle=col;ctx.fillText(txt,x,y)}
export function wrap(txt,maxW){const words=txt.split(' '),lines=[];let cur='';for(const w of words){const tt=cur?cur+' '+w:w;if(ctx.measureText(tt).width>maxW&&cur){lines.push(cur);cur=w}else cur=tt}if(cur)lines.push(cur);return lines}
function drawBubble(txt,x,y){
  const fs=Math.max(11,Math.round(TS*.3));ctx.font=`600 ${fs}px "Alegreya Sans",sans-serif`;
  const lines=wrap(txt,Math.max(120,TS*4.4)),lh=fs*1.15;let w=0;for(const l of lines)w=Math.max(w,ctx.measureText(l).width);
  const bw=w+14,bh=lines.length*lh+8;const bx=clamp(x-bw/2,4,W-bw-4);const by=y-bh-8;
  ctx.fillStyle='rgba(246,237,214,.97)';ctx.strokeStyle='#2a2230';ctx.lineWidth=1.5;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(bx,by,bw,bh,5);else ctx.rect(bx,by,bw,bh);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-5,by+bh-1);ctx.lineTo(x,by+bh+7);ctx.lineTo(x+5,by+bh-1);ctx.fill();
  ctx.fillStyle='#1b161d';ctx.textAlign='center';ctx.textBaseline='top';lines.forEach((l,i)=>ctx.fillText(l,bx+bw/2,by+4+i*lh));ctx.textBaseline='alphabetic';
}
export function render(t){
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=WD.id==='over'?'#0e0c11':'#050307';ctx.fillRect(0,0,cv.width,cv.height);
  const vw=W/TS,vh=H/TS,MW=WD.w,MH=WD.h;
  cam.x=MW<vw?(MW-vw)/2:clamp(P.x-vw/2,0,MW-vw);
  cam.y=MH<vh?(MH-vh)/2:clamp(P.y-.6-vh/2,0,MH-vh);
  ctx.imageSmoothingEnabled=false;
  const k=DPR*TS/PX;ctx.setTransform(k,0,0,k,-cam.x*TS*DPR,-cam.y*TS*DPR);if(WD.c)ctx.drawImage(WD.c,0,0);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const x0=Math.max(0,Math.floor(cam.x)),y0=Math.max(0,Math.floor(cam.y)),x1=Math.min(MW,Math.ceil(cam.x+vw)),y1=Math.min(MH,Math.ceil(cam.y+vh));
  const torches=[];
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const tt=at(x,y);
    if(tt===T.LAKE){const ph=(t*1.1+hsh(x,y,3)*7)%7;if(ph<1){ctx.fillStyle=`rgba(220,255,170,${(1-ph)*.8})`;ctx.fillRect(sx(x+.15+hsh(x,y,4)*.6),sy(y+.15+hsh(x,y,5)*.6)-ph*TS*.2,TS*.1,TS*.1)}}
    else if(tt===T.MURK){const ph=(t*.8+hsh(x,y,3)*9)%9;if(ph<1.5){ctx.strokeStyle=`rgba(120,160,140,${(1.5-ph)*.4})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(sx(x+.5),sy(y+.5),TS*.1+ph*TS*.2,TS*.05+ph*TS*.1,0,0,7);ctx.stroke()}}
    else if(tt===T.DESK&&x===3){ctx.fillStyle=`rgba(80,160,255,${.13+.05*Math.sin(t*3)})`;ctx.beginPath();ctx.ellipse(sx(x+.5),sy(y+1.2),TS*1.1,TS*.55,0,0,7);ctx.fill()}
    else if(tt===T.RACK){for(let i=0;i<5;i++){const on=hsh(x,y,i+Math.floor(t*3+hsh(x,y,9)*10))<.6;ctx.fillStyle=on?(i%2?'#ffb000':'#4aff7a'):'#1a2a1a';ctx.fillRect(sx(x+.72),sy(y+.16+i*.156),TS*.06,TS*.05)}}
    else if(tt===T.DTORCH)torches.push([x,y]);
    else if(tt===T.STAIRS&&x===20){ctx.fillStyle=`rgba(150,90,255,${.15+.08*Math.sin(t*2)})`;ctx.beginPath();ctx.ellipse(sx(x+1),sy(y+.5),TS*1.2,TS*.6,0,0,7);ctx.fill()}}
  // Zones au sol des boss : incantation de zone, rebond de la Citation en Chaîne autour du joueur marqué, zone de combat qui rétrécit.
  const ring=(x,y,r,fill,stroke)=>{ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(sx(x),sy(y),r*TS,r*TS*.62,0,0,7);ctx.fill();ctx.stroke()};
  for(const m of WD.mobs){
    if(!m.alive)continue;
    if(m.zone){
      ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.ellipse(sx(m.zone.x),sy(m.zone.y),m.zone.r*TS,m.zone.r*TS*.62,0,0,7);
      ctx.fillStyle='rgba(120,15,30,.34)';ctx.fill('evenodd');ctx.restore();
      ctx.strokeStyle='rgba(255,210,120,.95)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(sx(m.zone.x),sy(m.zone.y),m.zone.r*TS,m.zone.r*TS*.62,0,0,7);ctx.stroke();
    }
    if(m.spots&&m.cast>0){const p=1-m.cast/m.castMax;for(const q of m.spots){ring(q.x,q.y,m.castR,`rgba(236,90,76,${.14+.14*p})`,'rgba(236,90,76,.9)');ctx.fillStyle='rgba(236,90,76,.28)';ctx.beginPath();ctx.ellipse(sx(q.x),sy(q.y),m.castR*TS*p,m.castR*TS*.62*p,0,0,7);ctx.fill()}}
    if(m.cast>0&&m.castK==='chain'){
      const mk=m.mark===me?P:world.players[m.mark]&&world.players[m.mark].P;
      if(mk){ring(mk.x,mk.y,m.castR,`rgba(180,120,255,${.1+.1*Math.sin(t*10)})`,'rgba(201,168,255,.9)');ctx.strokeStyle='rgba(201,168,255,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx(m.x),sy(m.y)-m.hgt*TS*.5);ctx.lineTo(sx(mk.x),sy(mk.y)-TS*.6);ctx.stroke()}
    }
  }
  for(const m of WD.mobs)if(m.alive&&m.cast>0&&m.castK==='aoe'){const r=m.castR,p=1-m.cast/m.castMax;ctx.fillStyle=`rgba(236,90,76,${.12+.12*p})`;ctx.strokeStyle='rgba(236,90,76,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(sx(m.x),sy(m.y),r*TS,r*TS*.62,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(236,90,76,.25)';ctx.beginPath();ctx.ellipse(sx(m.x),sy(m.y),r*TS*p,r*TS*.62*p,0,0,7);ctx.fill()}
  const tg=targetEnt();
  if(tg&&(tg.kind!=='mob'||tg.alive)){ctx.strokeStyle=tg.kind==='mob'?'#ff5a4a':tg.kind==='npc'?'#7be37b':tg.kind==='obj'?'#c9a8ff':'#7fb6ff';ctx.lineWidth=2;const rw=(tg.d&&tg.d.boss?.85:.48)*TS;ctx.beginPath();ctx.ellipse(sx(tg.x),sy(tg.y),rw,rw*.42,0,0,7);ctx.stroke()}
  if(marker){const a=1-marker.t/.6;ctx.strokeStyle=`rgba(212,173,96,${a})`;ctx.lineWidth=2;const rw=TS*(.15+marker.t*.5);ctx.beginPath();ctx.ellipse(sx(marker.x),sy(marker.y),rw,rw*.45,0,0,7);ctx.stroke()}
  const ents=[];
  for(const m of WD.mobs)if(m.alive||m.dieT>0)ents.push(m);
  for(const n of WD.npcs)ents.push(n);for(const o of WD.objs)ents.push(o);
  for(const b of WD.bots)ents.push(b);
  for(const pl of Object.values(world.players))if(pl.mapId===WD.id)ents.push(pl.P);
  if(!me)ents.push(P);
  ents.sort((a,b)=>a.y-b.y);
  const vis=e=>e.x>cam.x-2&&e.x<cam.x+vw+2&&e.y>cam.y-1&&e.y<cam.y+vh+3;
  const S1=TS*1.12,lift=e=>e.mount?MOUNT_LIFT[e.mount]*S1/16:0;
  for(const e of ents){if(!vis(e))continue;const X=sx(e.x),Y=sy(e.y);
    if(e.kind==='mob'){ctx.globalAlpha=e.alive?1:Math.max(0,e.dieT/.7);drawMob(ctx,e,X,Y,S1*(e.d.scale||1),t);ctx.globalAlpha=1;if(e.stun>0){for(let i=0;i<3;i++){const a=t*4+i*2.1;ctx.fillStyle='#ffd84a';ctx.fillRect(X+Math.cos(a)*TS*.35-2,Y-e.hgt*TS-4+Math.sin(a)*TS*.1,4,4)}}}
    else if(e.kind==='npc')drawNpc(ctx,e,X,Y,S1,t);
    else if(e.kind==='obj')drawObj(ctx,e,X,Y,t);
    else if(e.kind==='bot')drawChouffin(ctx,X,Y,S1,{hat:e.hat,coat:e.coat,shirt:e.shirt,face:e.face,moving:e.moving,step:e.step,tip:e.tip});
    else if(e.id){if(e.dead)ctx.globalAlpha=.45;const lean=e.drunk>0?Math.sin(t*2.7)*.12:0;if(lean){ctx.save();ctx.translate(X,Y);ctx.rotate(lean);ctx.translate(-X,-Y)}if(e.mount)drawMount(ctx,X,Y,S1,e.mount,e);drawChouffin(ctx,X,Y-lift(e),S1,{...playerLook(world.players[e.id].S),face:e.face,moving:e.moving,step:e.step,tip:e.tipT});if(lean)ctx.restore();ctx.globalAlpha=1}
  }
  for(const p of parts){ctx.globalAlpha=1-p.t/p.life;ctx.fillStyle=p.col;ctx.fillRect(sx(p.x),sy(p.y),p.sz*TS,p.sz*TS)}ctx.globalAlpha=1;
  if(WD.id!=='over'){
    const px=sx(P.x),py=sy(P.y)-TS*.5,gr=ctx.createRadialGradient(px,py,TS*2.2,px,py,TS*8.5);gr.addColorStop(0,'rgba(6,4,10,0)');gr.addColorStop(1,'rgba(6,4,10,.8)');ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='lighter';
    for(const [x,y] of torches){const fl=.75+.25*Math.sin(t*9+x*3)+.1*Math.sin(t*23+y);const cx=sx(x+.5),cy=sy(y+.42);const g=ctx.createRadialGradient(cx,cy,0,cx,cy,TS*2.4);g.addColorStop(0,`rgba(255,150,60,${.32*fl})`);g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.fillRect(cx-TS*2.4,cy-TS*2.4,TS*4.8,TS*4.8);ctx.fillStyle=`rgba(255,${180+Math.floor(40*fl)},80,1)`;ctx.fillRect(cx-TS*.08,cy-TS*.18*fl,TS*.16,TS*.18*fl)}
    ctx.globalCompositeOperation='source-over';
  }
  const fs=Math.max(11,Math.round(TS*.31));
  for(const e of ents){if(!vis(e))continue;if(e.kind==='mob'&&!e.alive)continue;const X=sx(e.x),top=sy(e.y)-lift(e)-e.hgt*TS*(e.kind==='mob'&&e.d.scale?Math.min(1.2,e.d.scale*.75):1)-4;
    if(e.kind==='mob'){const col=e.d.boss?'#ff8a3a':e.l>S.lvl+1?'#ff5a4a':e.l<S.lvl-1?'#9d9d9d':'#ffd84a';
      const showBar=e.hp<e.mhp||P.target===e.id||e.st==='chase'||e.shield>0;let yy=top;
      if(showBar){const bw=TS*(e.d.boss?1.6:.95),bh=Math.max(4,TS*.12);ctx.fillStyle='#000';ctx.fillRect(X-bw/2-1,yy-bh-1,bw+2,bh+2);ctx.fillStyle='#b9352c';ctx.fillRect(X-bw/2,yy-bh,bw*e.hp/e.mhp,bh);if(e.shield>0){ctx.fillStyle='#8ab4ff';ctx.fillRect(X-bw/2,yy-bh-3,bw*e.shield/e.mshield,3)}yy-=bh+4}
      if(P.target===e.id||e.d.boss||e.elite||dist(e,P)<5){
        // L'affixe d'un élite s'affiche juste sous son nom.
        if(e.affix){label(AFFIXES[e.affix],X,yy,'#c9a8ff',fs-2,700);yy-=fs}
        label((e.elite?'★ ':'')+e.d.n,X,yy,e.elite?'#ffd84a':col,fs-1,700)}}
    else if(e.kind==='npc'){label(e.n,X,top-fs*.9,'#7be37b',fs-1);label(`<${e.tag}>`,X,top,'rgba(190,230,190,.9)',fs-3,500);const q=QUESTS[S.q.i];if(q&&q.g===e.id&&S.q.st!=='active'){const bounce=Math.sin(t*4)*3;label(S.q.st==='avail'?'!':'?',X,top-fs*2-2+bounce,S.q.st==='avail'&&S.lvl<q.rl?'#9d9d9d':'#ffd84a',fs*1.9,800)}}
    else if(e.kind==='obj')label(e.n,X,top-TS*.2,e.type==='chest'?'#f0d070':'#c9a8ff',fs-1);
    else if(e.kind==='bot'){if(e.g){label(e.n,X,top-fs*.9,'#7fb6ff',fs-1);label(`<${e.g}>`,X,top,'rgba(180,200,230,.9)',fs-3,500)}else label(e.n,X,top,'#7fb6ff',fs-1)}
    else{
      // Titre obtenu (ex. « Diplômé (enfin) ») : sous le nom, comme la guilde d'un PNJ.
      // Empilés de bas en haut : guilde, titre, pseudo.
      const ti=e.titre||(e.id===me?S.titre:''),g=e.g||(e.id===me?S.guilde:'');let y=top;
      if(g){label(`<${g}>`,X,y,'rgba(180,200,230,.9)',fs-3,500);y-=fs*.9}
      if(ti){label(`« ${ti} »`,X,y,'rgba(240,208,112,.95)',fs-3,500);y-=fs*.9}
      label(e.n||S.name,X,y,e.id&&e.id!==me?'#7fb6ff':'#ffffff',fs);
    }
  }
  for(const f of floaters){const a=1-f.t/f.life;ctx.globalAlpha=Math.min(1,a*1.6);label(f.txt,sx(f.x),sy(f.y)-f.t*TS*1.1,f.col,f.big?fs*1.5:fs*1.15,800)}ctx.globalAlpha=1;
  for(const e of ents){if(e.sayT>0&&e.say&&vis(e)&&(e.kind!=='mob'||e.alive)){const extra=e.kind==='npc'||(e.kind==='bot'&&e.g)?fs:0;drawBubble(e.say,sx(e.x),sy(e.y)-lift(e)-e.hgt*TS*(e.kind==='mob'&&e.d.scale?Math.min(1.2,e.d.scale*.75):1)-fs*1.6-extra-(e.kind==='mob'&&(e.hp<e.mhp||P.target===e.id)?TS*.2:0))}}
}
export function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);TS=Math.max(30,Math.min(50,Math.floor(Math.min(W,H)/12)))}
