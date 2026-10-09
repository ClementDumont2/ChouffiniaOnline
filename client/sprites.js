import {clamp} from '../shared/rules.js';
import {ITEMS} from '../shared/data.js';
import {rnd,rr} from './util.js';
import {TS,parts} from './render.js';

function drawHuman(g,cx,fy,s,o){
  const u=s/16,bob=o.moving?Math.abs(Math.sin(o.step))*.6:0,lg=o.moving?Math.sin(o.step):0,f=o.face||1;
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(cx+(x-8)*u,fy+(y-18)*u,w*u+.6,h*u+.6)};
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(cx,fy-.2*u,(o.wide?6:4.6)*u,1.5*u,0,0,7);g.fill();
  const pants=o.pants||'#26222c';
  R(5.2,15,2.4,3-Math.max(0,lg)*.9,pants);R(8.4,15,2.4,3-Math.max(0,-lg)*.9,pants);
  const b=-bob;
  if(o.wide){R(3,9+b,10,6.5,o.top);R(1.6,9.6+b,1.6,5,o.top);if(!o.armUp)R(12.8,9.6+b,1.6,5,o.top);R(1.6,14.4+b,1.6,1.2,o.skin);if(!o.armUp)R(12.8,14.4+b,1.6,1.2,o.skin)}
  else{R(4,9.5+b,8,6,o.top);R(2.8,10+b,1.4,4.6,o.top);if(!o.armUp)R(11.8,10+b,1.4,4.6,o.top);R(2.8,14.5+b,1.4,1.1,o.skin);if(!o.armUp)R(11.8,14.5+b,1.4,1.1,o.skin)}
  R(5,3.6+b,6,6,o.skin);R(4.4,4.6+b,7.2,4,o.skin);
  if(o.hair)R(4.4,3+b,7.2,1.8,o.hair);
  R(6+f*.5,6+b,1,1.1,o.eye||'#1b1410');R(9+f*.5,6+b,1,1.1,o.eye||'#1b1410');
  R(7+f*.3,8.2+b,2,.6,o.mouth||'#8a3c34');
  if(o.extra)o.extra(R,b,f,u);
}
export function drawChouffin(g,cx,fy,s,o){
  const hl=o.tip>0?Math.sin(clamp(o.tip/.45,0,1)*Math.PI)*1.8:0;
  drawHuman(g,cx,fy,s,{skin:o.skin||'#efc8a4',top:o.coat,pants:o.pants||'#25232b',face:o.face,moving:o.moving,step:o.step,armUp:o.tip>0,extra:(R,b,f)=>{
    R(6.4,9.5+b,3.2,5.6,o.shirt||'#161419');R(7.2,11+b,1.6,1.2,o.logo||'#d4ad60');
    const bd=o.beard||'#5a3d26';
    if(o.longBeard){R(4.4,7.4+b,7.2,6.6,bd);R(5.4,13.9+b,5.2,1.6,bd);R(7+f*.3,8.1+b,2,.6,'#9a5a50')}
    else{R(4.4,7.8+b,7.2,1.9,bd);R(5,9.6+b,6,.9,bd);R(4.4,6.4+b,.8,1.6,bd);R(10.8,6.4+b,.8,1.6,bd);R(7+f*.3,8.1+b,2,.6,'#c4776a')}
    if(o.glasses){R(5.3+f*.5,5.5+b,2,.4,'#111');R(8.3+f*.5,5.5+b,2,.4,'#111');R(5.3+f*.5,6.9+b,2,.3,'#111');R(8.3+f*.5,6.9+b,2,.3,'#111')}
    if(o.vr){R(4.6,5.1+b,6.8,2.4,'#e8e8ea');R(5.2,5.6+b,5.6,1.4,'#1a1a2a');R(5.8+f*.5,5.9+b,1.6,.6,'#6ab8ff')}
    if(o.ears){R(3.2,2.2+b,1.6,1.6,'#ff6ad5');R(11.2,2.2+b,1.6,1.6,'#ff6ad5');R(3.4,5+b,1.2,2.6,'#222');R(11.4,5+b,1.2,2.6,'#222')}
    R(1.8,3.5+b-hl,12.4,1.1,o.hat);R(4.4,.6+b-hl,7.2,3.1,o.hat);R(6,.6+b-hl,4,.5,'rgba(0,0,0,.35)');R(4.4,2.6+b-hl,7.2,.8,o.band||'#7a2f2f');R(1.8,3.5+b-hl,12.4,.3,'rgba(255,255,255,.12)');
    if(o.tip>0){R(11.8,4.6+b-hl,1.4,6,o.coat);R(11.8,3.8+b-hl,1.4,1.1,o.skin||'#efc8a4')}
    const wp=o.wpn;
    if(wp==='katana'||wp==='resine'){R(13.4,5+b,.6,9,wp==='resine'?'#c9b8a8':'#d8dde3');R(12.7,13.6+b,2,.6,wp==='resine'?'#7a4ab0':'#d4ad60');R(13.3,14.2+b,.8,2.2,'#222')}
    else if(wp==='sabre'){R(13.3,4.5+b,.8,9.5,'#7fe0ff');R(13.5,4.5+b,.3,9.5,'#fff');R(13.1,14+b,1.2,2.4,'#888')}
    else if(wp==='regle'){R(13.2,7+b,1,8,'#e8d36a')}
    else if(wp==='clavier'){R(12.4,13+b,3.6,1.8,'#111');R(12.8,13.4+b,.6,.6,'#ff4a4a');R(13.6,13.4+b,.6,.6,'#4aff7a');R(14.4,13.4+b,.6,.6,'#4ab8ff');R(15.2,13.4+b,.6,.6,'#f4f04a')}
    else if(wp==='ethernet'){R(13.1,11+b,.6,5.5,'#3d6fc2');R(12.7,16.3+b,1.4,1.2,'#d6e4f0');R(13,17.3+b,.8,.4,'#d4ad60')}
    else if(wp==='flamme'){R(12.2,12.6+b,4,1.4,'#555');R(12.8,14+b,1.4,1.6,'#c0392b');R(16,12.4+b,1,1.6,'#ffb000')}
    else if(wp==='grimoire'){R(12.2,11.6+b,3.4,4.2,'#5a1a3a');R(15.2,11.8+b,.5,3.8,'#e8dfc8');R(13.3,13+b,1.2,1.2,'#d4ad60')}
    if(o.cls==='roliste'){R(2.4,9.6+b,1.5,7,'#5a1f6e');R(12.1,9.6+b,1.5,7,'#5a1f6e');R(3.6,15.2+b,8.8,1.8,'#5a1f6e');R(10.8,13.6+b,2.8,3,'#e8e8f0');R(10.4,14.2+b,3.6,1.8,'#e8e8f0');R(11.6,14.8+b,1.2,.8,'#7a2f2f')}
    else if(o.cls==='speedrunner'){R(4.4,4.7+b,7.2,.8,'#e03a3a');R(11.4,4.9+b,1.8,.5,'#e03a3a');R(4.8,16.9,3.2,1.1,'#f2f2f2');R(8,16.9,3.2,1.1,'#f2f2f2');R(4.8,17.6,3.2,.4,'#e03a3a');R(8,17.6,3.2,.4,'#e03a3a')}
    else if(o.cls==='modo'){R(.9,6.4+b,.9,8,'#6b4a2f');R(-.4,4.8+b,3.5,2.3,'#8a8a96');R(-.4,4.8+b,3.5,.6,'#b8b8c4');R(9.2,10.1+b,2.8,1.7,'#d4ad60');R(9.5,10.5+b,.5,.9,'#222');R(10.4,10.5+b,.5,.9,'#222');R(11.2,10.5+b,.5,.9,'#222')}
    if(o.coatLong){R(3.6,15+b,3.8,2.2,o.coat);R(8.6,15+b,3.8,2.2,o.coat)}
    if(o.armor==='carton'){R(4,9.6+b,8,5.4,'#c49a5a');R(7.6,9.6+b,.8,5.4,'#d8c38a')}
    else if(o.armor==='eva'){R(4,9.6+b,8,5.6,'#3a6a8a');R(4.6,10.2+b,6.8,2,'#5a8aaa');R(4,9.6+b,8,.5,'#d4ad60')}
  }});
}
// Hauteur (en unités de sprite) dont le cavalier est surélevé : la selle, le plateau ou le toit.
export const MOUNT_LIFT={chaise:5,trottinette:2,maman:8};
export function drawMount(g,cx,fy,s,id,o){
  const u=s/16,f=o.face||1;
  // Dessiné pour un cavalier qui regarde à droite ; f<0 retourne tout.
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(cx+((f>0?x:16-x-w)-8)*u,fy+(y-18)*u,w*u+.6,h*u+.6)};
  const wheel=(x,y,r)=>{
    const X=cx+((f>0?x:16-x)-8)*u,Y=fy+(y-18)*u,a=o.moving?o.step*1.5:0;
    g.fillStyle='#111';g.beginPath();g.arc(X,Y,r*u,0,7);g.fill();
    g.strokeStyle='#8a8a94';g.lineWidth=u*.5;g.beginPath();g.moveTo(X-Math.cos(a)*r*u*.8,Y-Math.sin(a)*r*u*.8);g.lineTo(X+Math.cos(a)*r*u*.8,Y+Math.sin(a)*r*u*.8);g.stroke();
  };
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(cx,fy-.2*u,(id==='maman'?9:6)*u,1.6*u,0,0,7);g.fill();
  if(id==='chaise'){
    R(7.2,13,1.6,3.4,'#333');R(3,16.2,10,.8,'#333');wheel(3.5,17.2,.9);wheel(8,17.4,.9);wheel(12.5,17.2,.9);
    R(4,11.4,8,1.8,'#1c1c22');R(4,11.4,8,.5,'#e03a3a');R(2.2,3.5,1.8,8,'#1c1c22');R(2.2,3.5,.5,8,'#e03a3a');R(1.8,2.6,2.6,1.2,'#33333c');
  }else if(id==='trottinette'){
    R(2,15.4,12,1.4,'#2a2a30');R(2,16.5,12,.3,'#7fe0ff');wheel(3.2,17.1,1.1);wheel(12.8,17.1,1.1);
    R(12.6,5.5,.9,10,'#9a9aa4');R(11.6,5.3,3,.8,'#9a9aa4');R(12,13,1.6,1,'#3a3a44');
  }else if(id==='maman'){
    R(0,11.5,16,4.2,'#c0392b');R(2,8.6,12,3,'#c0392b');R(3.2,9.1,4.5,2.3,'#9fd0e8');R(8.6,9.1,4.5,2.3,'#9fd0e8');
    R(4.4,9.5,1.9,1.9,'#e8c09c');R(4.2,9.1,2.3,.8,'#6a4a3a');R(0,14.6,16,.8,'#8a8a94');R(14.6,12.2,1.4,1,'#f4f04a');R(0,12.2,.8,1,'#ff4a4a');
    wheel(3.5,16.2,1.8);wheel(12.5,16.2,1.8);
  }
}
export function playerLook(S){
  // Soi-même : instances ; autres joueurs : identifiants seuls (voir le snapshot).
  const id=k=>{const q=S.eq[k];return q&&(q.id||q)},t=id('torse'),h=id('tete');
  return{cls:S.cls,hat:S.hat,coat:t==='trench'?'#1f1c23':t==='tshirt'?'#2d2a33':t==='sweat'?'#4a5a6a':'#4a4552',coatLong:t==='trench',armor:(t==='carton'||t==='eva')?t:null,shirt:t==='tshirt'?'#111':'#161419',logo:t==='tshirt'?'#e07a1f':'#d4ad60',band:h==='bandeau'?'#2b3a8a':'#7a2f2f',wpn:id('arme'),glasses:h!=='heaume',vr:h==='heaume',ears:h==='casque',pants:id('jambes')==='jambieres'?'#5f5e34':id('jambes')==='jogging'?'#2a2a3a':'#25232b'};
}
export function drawMob(g,m,cx,fy,s,t){
  // Boss de zone : le sprite du monstre de sa zone, agrandi par d.scale.
  if(m.d.look)m={...m,type:m.d.look};
  const u=s/16;
  if(m.type==='herbe'){
    const sw=Math.sin(t*3+m.ph)*u*.9;
    g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(cx,fy,5.5*u,1.5*u,0,0,7);g.fill();
    for(const [ox,h,c] of [[-5,8,'#3d8a2c'],[-2.6,12,'#4fa83a'],[0,14,'#5cb846'],[2.6,11,'#4fa83a'],[5,8,'#3d8a2c']]){g.fillStyle=c;g.beginPath();g.moveTo(cx+(ox-1.8)*u,fy);g.lineTo(cx+(ox+1.8)*u,fy);g.lineTo(cx+ox*u+sw*h/10,fy-h*u);g.closePath();g.fill()}
    g.fillStyle='#fff';g.fillRect(cx-3.4*u,fy-6.6*u,2.2*u,2.2*u);g.fillRect(cx+1.2*u,fy-6.6*u,2.2*u,2.2*u);
    g.fillStyle='#111';g.fillRect(cx-2.6*u,fy-5.8*u,1.2*u,1.2*u);g.fillRect(cx+1.6*u,fy-5.8*u,1.2*u,1.2*u);
    g.strokeStyle='#1d4a16';g.lineWidth=u*.8;g.beginPath();g.moveTo(cx-3.8*u,fy-8.2*u);g.lineTo(cx-1*u,fy-7*u);g.moveTo(cx+3.8*u,fy-8.2*u);g.lineTo(cx+1*u,fy-7*u);g.stroke();
    return;
  }
  if(m.type==='soleil'){
    const cy=fy-9*u+Math.sin(t*2+m.ph)*u;
    g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(cx,fy,4*u,1.2*u,0,0,7);g.fill();
    g.save();g.translate(cx,cy);g.rotate(t*.8+m.ph);g.fillStyle='#ffb000';
    for(let i=0;i<8;i++){g.rotate(Math.PI/4);g.beginPath();g.moveTo(-1.3*u,-5*u);g.lineTo(1.3*u,-5*u);g.lineTo(0,-8.4*u);g.closePath();g.fill()}
    g.restore();
    g.fillStyle='#ffd23f';g.beginPath();g.arc(cx,cy,5*u,0,7);g.fill();g.fillStyle='#ffe57a';g.beginPath();g.arc(cx-1.4*u,cy-1.6*u,2*u,0,7);g.fill();
    g.fillStyle='#111';g.fillRect(cx-4*u,cy-1.4*u,3.4*u,1.8*u);g.fillRect(cx+.6*u,cy-1.4*u,3.4*u,1.8*u);g.fillRect(cx-.8*u,cy-1*u,1.6*u,.6*u);
    g.fillStyle='#b8501a';g.fillRect(cx-.6*u,cy+2*u,2.6*u,.7*u);
    return;
  }
  if(m.type==='lag'){
    const cy=fy-8*u+Math.sin(t*2.5+m.ph)*u;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(cx,fy,4*u,1.2*u,0,0,7);g.fill();
    const gl=(Math.floor(t*6+m.ph*10)%5===0);
    for(let i=0;i<5;i++){const off=gl?Math.sin(t*40+i*2)*2*u:0;g.fillStyle='rgba(255,59,213,.55)';g.fillRect(cx-5*u+off-u*.6,cy-5*u+i*2*u,10*u,2*u);g.fillStyle='rgba(59,240,255,.55)';g.fillRect(cx-5*u-off+u*.6,cy-5*u+i*2*u,10*u,2*u);g.fillStyle='#2a2a3a';g.fillRect(cx-5*u+off*.3,cy-5*u+i*2*u,10*u,2*u)}
    g.fillStyle='#fff';g.fillRect(cx-3*u,cy-2*u,2*u,2*u);g.fillRect(cx+1*u,cy-2*u,2*u,2*u);g.fillStyle='#ff3bd5';g.fillRect(cx-2.4*u,cy+1.6*u,4.8*u,.8*u);
    return;
  }
  if(m.type==='texture'){
    const j=Math.sin(t*9+m.ph)*.5*u;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(cx,fy,5*u,1.4*u,0,0,7);g.fill();
    for(let yy=0;yy<4;yy++)for(let xx=0;xx<4;xx++){g.fillStyle=(xx+yy)%2?'#ff00dc':'#111';g.fillRect(cx-6*u+xx*3*u+j,fy-13*u+yy*3*u,3*u+.5,3*u+.5)}
    g.fillStyle='#fff';g.font=`800 ${Math.round(2.4*u)}px sans-serif`;g.textAlign='center';g.fillText('ERR',cx+j,fy-14*u);
    return;
  }
  if(m.type==='topic'){
    g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(cx,fy,5.5*u,1.4*u,0,0,7);g.fill();
    g.fillStyle='#7d7d86';g.beginPath();g.moveTo(cx-5*u,fy);g.lineTo(cx-5*u,fy-10*u);g.arc(cx,fy-10*u,5*u,Math.PI,0);g.lineTo(cx+5*u,fy);g.fill();
    g.fillStyle='#9a9aa3';g.fillRect(cx-4*u,fy-11*u,2*u,9*u);g.fillStyle='#4a6a3a';g.fillRect(cx-5*u,fy-1.5*u,10*u,1.5*u);
    g.fillStyle='#2a2a30';g.font=`800 ${Math.round(3.6*u)}px sans-serif`;g.textAlign='center';g.fillText('UP',cx,fy-6*u);
    g.fillStyle='rgba(255,255,255,.5)';g.font=`700 ${Math.round(2.4*u)}px sans-serif`;g.fillText('2014',cx,fy-2.6*u);
    return;
  }
  if(m.type==='serveur'){
    g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(cx,fy,5.6*u,1.4*u,0,0,7);g.fill();
    g.fillStyle='#1c1e22';g.fillRect(cx-5*u,fy-15*u,10*u,15*u);g.fillStyle='#2a2d33';for(let i=0;i<5;i++)g.fillRect(cx-4*u,fy-14*u+i*2.8*u,8*u,2*u);
    for(let i=0;i<5;i++){const on=(Math.floor(t*5+i*1.7+m.ph)%3)!==0;g.fillStyle=on?(i%2?'#ffb000':'#4aff7a'):'#2a3a2a';g.fillRect(cx+2.4*u,fy-13.4*u+i*2.8*u,u,.8*u)}
    g.fillStyle='#ff3b3b';g.fillRect(cx-3*u,fy-11*u,1.2*u,1.2*u);g.fillRect(cx-.6*u,fy-11*u,1.2*u,1.2*u);
    g.strokeStyle='rgba(255,140,40,.6)';g.lineWidth=u*.5;for(let i=0;i<3;i++){const ox=cx-3*u+i*3*u,ph=t*4+i;g.beginPath();g.moveTo(ox,fy-16*u);g.quadraticCurveTo(ox+Math.sin(ph)*u,fy-18*u,ox,fy-20*u);g.stroke()}
    return;
  }
  if(m.type==='spam'){
    const bb=Math.abs(Math.sin(t*6+m.ph))*u;g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(cx,fy,4*u,1.2*u,0,0,7);g.fill();
    g.fillStyle='#8a9098';g.fillRect(cx-4*u,fy-10*u-bb,8*u,8*u);g.fillStyle='#a8aeb6';g.fillRect(cx-3*u,fy-15*u-bb,6*u,5*u);
    g.fillStyle='#ff3b3b';g.fillRect(cx-2*u,fy-13.6*u-bb,1.4*u,1.4*u);g.fillRect(cx+.6*u,fy-13.6*u-bb,1.4*u,1.4*u);
    g.fillStyle='#555';g.fillRect(cx-.3*u,fy-18*u-bb,.6*u,3*u);g.fillStyle='#ff3b3b';g.fillRect(cx-.7*u,fy-18.6*u-bb,1.4*u,1.4*u);
    g.fillStyle='#ede1c5';g.fillRect(cx-2.6*u,fy-8.6*u-bb,5.2*u,3.4*u);g.strokeStyle='#c0392b';g.lineWidth=u*.5;g.beginPath();g.moveTo(cx-2.6*u,fy-8.6*u-bb);g.lineTo(cx,fy-6.6*u-bb);g.lineTo(cx+2.6*u,fy-8.6*u-bb);g.stroke();
    g.fillStyle='#555';g.fillRect(cx-3*u,fy-2*u,2*u,2*u);g.fillRect(cx+1*u,fy-2*u,2*u,2*u);
    return;
  }
  if(m.type==='fantome'){
    const cy=fy-2*u+Math.sin(t*2+m.ph)*u;g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(cx,fy,4*u,1.1*u,0,0,7);g.fill();
    g.globalAlpha*=.8;g.fillStyle='#e8eef8';g.beginPath();g.moveTo(cx-5*u,cy);g.lineTo(cx-5*u,cy-9*u);g.arc(cx,cy-9*u,5*u,Math.PI,0);g.lineTo(cx+5*u,cy);
    for(let i=0;i<4;i++){const x1=cx+5*u-(i+.5)*2.5*u;g.lineTo(x1,cy-1.6*u+Math.sin(t*5+i)*.5*u);g.lineTo(x1-1.25*u,cy)}g.fill();g.globalAlpha/=.8;
    g.fillStyle='#1a1a2a';g.fillRect(cx-2.8*u,cy-11*u,1.6*u,2*u);g.fillRect(cx+1.2*u,cy-11*u,1.6*u,2*u);g.beginPath();g.ellipse(cx,cy-6.6*u,1.4*u,1.8*u,0,0,7);g.fill();
    return;
  }
  if(m.type==='pave'){
    const sq=Math.sin(t*3+m.ph)*.4*u;g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(cx,fy,5.5*u,1.4*u,0,0,7);g.fill();
    g.fillStyle='#3a2a1e';g.fillRect(cx-3*u,fy-2*u,1.4*u,2*u);g.fillRect(cx+1.6*u,fy-2*u,1.4*u,2*u);
    g.fillStyle='#efe6d0';g.fillRect(cx-5.5*u,fy-15*u+sq,11*u,13*u-sq);g.fillStyle='#d6cbb0';g.fillRect(cx+4.5*u,fy-15*u+sq,u,13*u-sq);
    g.fillStyle='#6d6455';for(let i=0;i<6;i++)g.fillRect(cx-4.5*u,fy-9*u+i*1.2*u+sq,(i===5?5:8.5)*u,.5*u);
    g.fillStyle='#111';g.fillRect(cx-3*u,fy-13*u+sq,1.6*u,1.6*u);g.fillRect(cx+1.4*u,fy-13*u+sq,1.6*u,1.6*u);
    g.strokeStyle='#111';g.lineWidth=u*.6;g.beginPath();g.moveTo(cx-3.6*u,fy-14.2*u+sq);g.lineTo(cx-1.2*u,fy-13.4*u+sq);g.moveTo(cx+3.6*u,fy-14.2*u+sq);g.lineTo(cx+1.2*u,fy-13.4*u+sq);g.stroke();
    return;
  }
  // ---- Lot 8 : monstres des trois nouvelles zones (B : rectangle relatif au centre/au sol, en unités de sprite) ----
  const B=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(cx+x*u,fy+y*u,w*u,h*u)};
  const shadow=(r=4)=>{g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(cx,fy,r*u,1.2*u,0,0,7);g.fill()};
  const wheel=(x,y,r)=>{g.fillStyle='#111';g.beginPath();g.arc(cx+x*u,fy+y*u,r*u,0,7);g.fill();g.fillStyle='#9a9aa2';g.beginPath();g.arc(cx+x*u,fy+y*u,r*u*.4,0,7);g.fill()};
  const f=m.face||1,eyes=(y,c='#fff',pc='#c00')=>{for(const dx of [-2.6,1.2]){B(dx,y,1.8,1.8,c);B(dx+(f>0?.7:.1),y+.5,.9,.9,pc)}};
  if(m.type==='bug'){
    const bb=Math.abs(Math.sin(t*10+m.ph))*.3;shadow(5);
    for(const dx of [-4,-2,2,4]){B(dx-.4,-3.4,.8,3.4,'#2a3a1a');B(dx*1.3-.4,-2,.8,2,'#2a3a1a')}
    g.fillStyle='#4a8a2a';g.beginPath();g.ellipse(cx,fy+(-5.6-bb)*u,5.6*u,3.6*u,0,0,7);g.fill();g.fillStyle='#6aaa3a';g.beginPath();g.ellipse(cx,fy+(-6.6-bb)*u,4.4*u,2*u,0,0,7);g.fill();
    B(-.4,-9-bb,.8,3,'#2a3a1a');B(f>0?2:-4.4,-9.4-bb,2.4,2,'#c0392b');B(f>0?-1.4:.4,-9.4-bb,2.4,2,'#c0392b');B(-4,-5.4-bb,2,1,'#2a5a1a');B(2,-5.4-bb,2,1,'#2a5a1a');
    g.fillStyle='#fff';g.font=`bold ${1.8*u}px monospace`;g.textAlign='center';g.fillText('404',cx,fy+(-4.4-bb)*u);return;
  }
  if(m.type==='standup'){
    const bb=Math.abs(Math.sin(t*3+m.ph))*.4;shadow(4.6);
    B(-3,-3,1.6,3,'#2a2a3a');B(1.4,-3,1.6,3,'#2a2a3a');
    g.fillStyle='#f4f1e6';g.beginPath();g.arc(cx,fy+(-9.6-bb)*u,6*u,0,7);g.fill();g.strokeStyle='#2a2a3a';g.lineWidth=u*.9;g.stroke();
    g.fillStyle='#2a2a3a';g.font=`bold ${2.8*u}px monospace`;g.textAlign='center';g.fillText('45:00',cx,fy+(-8.6-bb)*u);
    B(-3,-13-bb,.8,1.6,'#2a2a3a');B(2.2,-13-bb,.8,1.6,'#2a2a3a');B(-2.4,-5.6-bb,4.8,.8,'#c0392b');return;
  }
  if(m.type==='scooter'){
    const bb=Math.abs(Math.sin(t*9+m.ph))*.4;shadow(6);
    B(-9,-3.4-bb,2.6,.9,Math.sin(t*30)>0?'#ff7a1a':'#ffd84a');
    wheel(-5,-1.8,1.8);wheel(5,-1.8,1.8);
    B(-6.4,-5.4-bb,12.6,2.8,'#e0b020');B(-7.6,-7.6-bb,4.4,2.6,'#e0b020');B(-5.2,-6.8-bb,5.2,1.2,'#222');
    B(3,-10-bb,1.2,5,'#8a8a94');B(1.4,-10.6-bb,4,.9,'#333');
    B(f>0?4.6:-6.4,-7.4-bb,1.8,1.8,'#fffbd0');eyes(-9.4-bb,'#fff','#c00');return;
  }
  if(m.type==='souvenir'){
    const cy=fy-2*u+Math.sin(t*2+m.ph)*u;g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(cx,fy,4*u,1.1*u,0,0,7);g.fill();
    g.globalAlpha*=.82;g.fillStyle='#f4c8d8';g.beginPath();g.moveTo(cx-5*u,cy);g.lineTo(cx-5*u,cy-9*u);g.arc(cx,cy-9*u,5*u,Math.PI,0);g.lineTo(cx+5*u,cy);
    for(let i=0;i<4;i++){const x1=cx+5*u-(i+.5)*2.5*u;g.lineTo(x1,cy-1.6*u+Math.sin(t*5+i)*.5*u);g.lineTo(x1-1.25*u,cy)}g.fill();g.globalAlpha/=.82;
    g.fillStyle='#1a1a2a';g.fillRect(cx-2.8*u,cy-11*u,1.6*u,1.2*u);g.fillRect(cx+1.2*u,cy-11*u,1.6*u,1.2*u);
    g.fillStyle='#e85a8a';g.fillRect(cx-4*u,cy-9.2*u,2.2*u,1.2*u);g.fillRect(cx+1.8*u,cy-9.2*u,2.2*u,1.2*u);
    g.fillStyle='#efc8a4';g.fillRect(cx-3.4*u,cy-12.6*u,6.8*u,1.8*u);g.fillRect(cx-3*u,cy-7.6*u,6*u,3*u);g.fillStyle='#1a1a2a';g.fillRect(cx-1.4*u,cy-6.6*u,2.8*u,.7*u);
    return;
  }
  if(m.type==='caddie'){
    const bb=Math.abs(Math.sin(t*8+m.ph))*.4;shadow(5.4);
    wheel(-4.4,-1.6,1.5);wheel(4.4,-1.6,1.5);
    B(-6,-10-bb,12,6.4,'#c4c8d0');g.strokeStyle='#8a8f98';g.lineWidth=u*.4;for(let i=1;i<6;i++){g.beginPath();g.moveTo(cx+(-6+i*2)*u,fy+(-10-bb)*u);g.lineTo(cx+(-6+i*2)*u,fy+(-3.6-bb)*u);g.stroke()}
    B(-6,-3.6-bb,12,1,'#8a8f98');B(-6.4,-12-bb,12.8,1.2,'#8a8f98');B(f>0?-7:5.4,-12-bb,1.6,5,'#8a8f98');
    eyes(-9-bb);B(-1,-5.4-bb,2,1.2,'#d4ad60');return;
  }
  if(m.type==='promo'){
    const cy=fy-9*u+Math.sin(t*3+m.ph)*u;shadow(3.6);
    g.save();g.translate(cx,cy);g.rotate(Math.sin(t*2+m.ph)*.12);g.fillStyle='#d4301f';g.beginPath();
    for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?5.4*u:7.6*u;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();
    g.fillStyle='#f4d03f';g.beginPath();g.arc(0,0,5*u,0,7);g.fill();g.fillStyle='#d4301f';g.font=`bold ${3.9*u}px sans-serif`;g.textAlign='center';g.fillText('−70%',0,1.3*u);
    g.restore();B(-2.4,-3,1.4,3,'#333');B(1,-3,1.4,3,'#333');return;
  }
  if(m.type==='cerfa'){
    const bb=Math.abs(Math.sin(t*5+m.ph))*.7;shadow(4.4);
    B(-3.6,-3-bb,1.2,3,'#333');B(2.4,-3-bb,1.2,3,'#333');
    B(-5,-14-bb,10,11.6,'#f4f1e6');B(-5,-14-bb,10,2.2,'#2a5aa0');B(-4,-13.4-bb,3,1,'#fff');
    for(let i=0;i<3;i++)B(-4,-8.2-bb+i*1.4,i===2?4:8,.5,'#9a968a');
    B(-4,-11-bb,2,2,'#fff');B(1.6,-11-bb,2,2,'#fff');B(-3.2,-10.6-bb,1,1,'#c00');B(2.4,-10.6-bb,1,1,'#c00');
    B(2.4,-6.4-bb,3.4,2.6,'#c0392b');return;
  }
  if(m.type==='file'){
    shadow(7);
    for(const [i,c] of [[0,'#4a6a9a'],[1,'#9a4a4a'],[2,'#4a8a5a']]){
      const x=-5.4+i*5.4,bb=Math.abs(Math.sin(t*4+m.ph+i))*.5;
      B(x-1.2,-3,2.4,3,'#2a2a3a');B(x-2,-8.4-bb,4,5.6,c);B(x-1.6,-12-bb,3.2,3.4,'#efc8a4');B(x-1,-10.8-bb,.7,.7,'#111');B(x+.4,-10.8-bb,.7,.7,'#111');
      B(x-1,-7.6-bb,2,1.4,'#f4f1e6');
    }return;
  }
  if(m.type==='guichet'){
    const casting=m.cast>0,bb=Math.sin(t*2+m.ph)*.3;shadow(7.4);
    B(-7,-13+bb,14,11.4,'#6a5a3a');B(-7,-13+bb,14,1.4,'#8a7a5a');B(-5.4,-11+bb,10.8,5.4,'#9fd0e8');B(-5.4,-11+bb,10.8,.8,'#c8e6f4');
    eyes(-9.6+bb,'#fff',m.enr?'#ff3b3b':'#c9a8ff');B(-3,-4.4+bb,6,1.2,'#2a2218');
    B(-4.6,-16.4+bb,9.2,3.2,'#c0392b');g.fillStyle='#fff';g.font=`bold ${2*u}px sans-serif`;g.textAlign='center';g.fillText('FERMÉ',cx,fy+(-14.2+bb)*u);
    if(casting){B(-1,-21+bb,2,5,'#8a8a94');B(-3,-17.6+bb,6,1.6,'#c0392b')}
    B(-5.4,-1.8,2,1.8,'#333');B(3.4,-1.8,2,1.8,'#333');return;
  }
  const o={face:m.face,moving:m.moving,step:m.step};
  if(m.type==='normie')drawHuman(g,cx,fy,s,{...o,skin:'#f0c39a',top:'#e7b04a',pants:'#3c5a8a',mouth:'#fff',extra:(R,b,f)=>{R(4.4,2.6+b,7.2,2,'#c0392b');R(f>0?10.5:2,4.2+b,3.6,.8,'#a32f23');R(6.6,8+b,2.8,.9,'#fff');R(6.8,10+b,2.4,1.5,'#c99a3a')}});
  else if(m.type==='modo')drawHuman(g,cx,fy,s,{...o,skin:'#d8b896',top:'#5a64d6',pants:'#2a2a3a',eye:'#ff3b3b',extra:(R,b)=>{R(3.6,2.4+b,8.8,1.6,'#4a53b8');R(3.6,2.4+b,1,5,'#4a53b8');R(11.4,2.4+b,1,5,'#4a53b8');R(12.6,7+b,.9,8,'#6b4a2f');R(11,5.8+b,4.2,2.6,'#9aa0a8');R(11,5.8+b,4.2,.6,'#c4c9cf');R(6.5,11+b,3,2,'#fff');R(7,11.5+b,2,1,'#5a64d6')}});
  else if(m.type==='troll')drawHuman(g,cx,fy,s,{...o,wide:true,skin:'#7d9a62',top:'#4b3a5a',pants:'#3a2a24',eye:'#f4e04a',mouth:'#3a2a1a',extra:(R,b)=>{R(6.6,8+b,.8,1.2,'#fff');R(8.6,8+b,.8,1.2,'#fff');R(4.2,2.6+b,7.6,1.4,'#55703f');R(3.6,4+b,1,2,'#7d9a62');R(11.4,4+b,1,2,'#7d9a62');R(5,11+b,6,3,'#3a2c48');R(7.2,11.4+b,1.4,2.2,'#f4e04a')}});
  else if(m.type==='khey')drawHuman(g,cx,fy,s,{...o,skin:'#e89a82',top:'#6a6a72',pants:'#2a2a32',hair:'#2a1a12',eye:'#1a0a0a',extra:(R,b,f)=>{R(4,2.4+b,8,1.6,'#5a5a62');R(3.6,2.8+b,1,5,'#5a5a62');R(11.4,2.8+b,1,5,'#5a5a62');R(6.4+f*.3,7.8+b,3.2,1.6,'#3a1010');R(7+f*.3,8+b,2,.5,'#fff');R(5.6,5+b,1.8,.4,'#2a1a12');R(8.6,5+b,1.8,.4,'#2a1a12');R(12,3.4+b,.8,1.4,'#6ab8ff');R(6,11+b,4,2.4,'#4a4a52');R(6.6,11.6+b,2.8,1,'#f4d03f')}});
  else if(m.type==='delegue')drawHuman(g,cx,fy,s,{...o,skin:'#f0c39a',top:'#2f6fb0',pants:'#2a2a3a',hair:'#5a3a22',extra:(R,b)=>{R(4,9.6+b,8,1.4,'#e0b020');R(11.4,9+b,3.4,4.6,'#8a6a44');R(11.8,9.6+b,2.6,3.4,'#f4f1e6');R(6.6,10.2+b,2.8,1.2,'#d4ad60')}});
  else if(m.type==='vigile')drawHuman(g,cx,fy,s,{...o,wide:true,skin:'#d8b896',top:'#1a2a4a',pants:'#14203a',eye:'#3a2a3a',extra:(R,b,f)=>{R(4.2,2.4+b,7.6,2.2,'#1a2a4a');R(f>0?9.4:2.2,3.8+b,4.4,.8,'#14203a');R(5.2,6.6+b,2,.5,'#7a6a8a');R(8.4,6.6+b,2,.5,'#7a6a8a');R(4.6,10+b,2.4,1.4,'#d4ad60');R(12.2,11+b,2.2,3,'#efe6d6');R(12.4,11+b,1.8,.6,'#6a4a2a')}});
  else if(m.type==='conseillerabs')drawHuman(g,cx,fy,s,{...o,skin:'#cdb8a0',top:'#3a4a5a',pants:'#22282f',hair:'#6a6a70',extra:(R,b,f)=>{R(5.3+f*.5,5.5+b,2,.4,'#111');R(8.3+f*.5,5.5+b,2,.4,'#111');R(6.6,9.6+b,2.8,5,'#e8e8e0');R(10.4,8.4+b,5,4,'#e8e8e0');R(10.4,8.4+b,5,1,'#c0392b');R(11.2,10+b,3.4,.5,'#555');R(11.2,11+b,2.4,.5,'#555')}});
  else if(m.type==='correcteur'){
    const casting=m.cast>0;
    drawHuman(g,cx,fy,s,{...o,wide:true,skin:'#e0c8b0',top:'#5a1f1f',pants:'#1e1618',eye:m.enr?'#ff3b3b':'#2a1a1a',mouth:'#5a2a2a',armUp:casting,extra:(R,b,f)=>{
      R(4.4,7.8+b,7.2,6,'#efe6d6');R(7.4,8+b,1.2,5.6,'#c0392b');R(5.2,5.4+b,2.4,.5,'#111');R(8.6,5.4+b,2.4,.5,'#111');R(4.6,2.8+b,6.8,1.6,'#7a7a82');
      R(2.4,10+b,1.4,1.8,'#a8793a');R(12.2,10+b,1.4,1.8,'#a8793a');
      if(casting){R(12.8,0+b,1,9,'#c0392b');R(12.4,-1+b,1.8,1.4,'#c0392b')}else{R(12.6,5+b,1,9,'#c0392b');R(10.6,11+b,5,3.4,'#efe6d0');R(10.6,12+b,5,.4,'#9a968a')}
    }});
  }
  else if(m.type==='gerant'){
    const casting=m.cast>0;
    drawHuman(g,cx,fy,s,{...o,wide:true,skin:'#e8b894',top:'#e8e8e0',pants:'#2a2a3a',hair:'#3a2a1a',eye:m.enr?'#ff3b3b':'#1a1410',mouth:'#8a2a2a',armUp:casting,extra:(R,b,f)=>{
      R(3.6,9.6+b,2.2,5.6,'#2f7a3a');R(10.2,9.6+b,2.2,5.6,'#2f7a3a');R(7.4,9.4+b,1.2,5.4,'#c0392b');R(4.4,10.6+b,1.8,1,'#f4d03f');
      R(4.2,2.6+b,7.6,1.4,'#3a2a1a');R(5.3+f*.5,5.5+b,2,.4,'#111');R(8.3+f*.5,5.5+b,2,.4,'#111');
      R(12,(casting?3:9)+b,4,3,'#c4c8d0');R(15,(casting?2:8)+b,1.4,5,'#8a8f98');
    }});
  }
  else if(m.type==='otaku')drawHuman(g,cx,fy,s,{...o,skin:'#f0c39a',top:'#e8e8e0',pants:'#3a3a4a',hair:'#2a1a12',extra:(R,b,f)=>{R(4.4,2.6+b,7.2,1.4,'#c0392b');R(5.3+f*.5,5.5+b,2,.4,'#111');R(8.3+f*.5,5.5+b,2,.4,'#111');R(5,9.8+b,6,4,'#2f6fb0');R(6,10.6+b,4,2,'#f4d03f');R(2.4,9+b,2.2,5.6,'#8a5a3a');R(2.8,9.4+b,1.4,1.4,'#e85a8a');R(2.8,11.4+b,1.4,1.4,'#4ab8ff')}});
  else if(m.type==='cosplayeur')drawHuman(g,cx,fy,s,{...o,wide:true,skin:'#f0c39a',top:'#2a3a8a',pants:'#1e2a5a',eye:'#c9a8ff',extra:(R,b,f)=>{R(3.4,1.4+b,9.2,3.4,'#e85a8a');R(3.4,1.4+b,1.4,6.4,'#e85a8a');R(11.2,1.4+b,1.4,6.4,'#e85a8a');R(5,8.4+b,6,.9,'#f4d03f');R(12.4,6+b,1.2,9,'#c4c8d0');R(11.6,12+b,2.8,1.2,'#d4ad60');if(m.cast>0||Math.sin(m.ph*3)>.5)R(4.4,-.4+b,7.2,.8,'rgba(201,168,255,.7)')}});
  else if(m.type==='isekai')drawHuman(g,cx,fy,s,{...o,skin:'#e8b894',top:'#2f4a8a',pants:'#22304a',hair:'#d8d8e0',extra:(R,b,f)=>{R(4.2,2+b,7.6,1.8,'#d8d8e0');R(4.4,7.6+b,7.2,6.4,'#3a5aa0');R(11.8,3+b,.9,10,'#c4c8d0');R(11.2,12.6+b,2.2,.8,'#d4ad60');R(1.6,3+b,.8,.8,'#f4f04a');R(13.4,1.4+b,.8,.8,'#f4f04a');R(2.6,8+b,.8,.8,'#f4f04a')}});
  else if(m.type==='assistant')drawHuman(g,cx,fy,s,{...o,skin:'#f0c39a',top:'#e8e0d0',pants:'#4a4a5a',eye:'#3a2a3a',extra:(R,b,f)=>{R(4.2,2.2+b,7.6,1.6,'#2a2a3a');R(5.4,1+b,5,1.6,'#2a2a3a');R(5.2,6.4+b,2,.5,'#6a5a7a');R(8.4,6.4+b,2,.5,'#6a5a7a');R(4.6,10+b,6.4,1.4,'#2a2a3a');R(10.8,9+b,4,4,'#f4f1e6');R(11.4,10+b,2.6,.4,'#555')}});
  else if(m.type==='retard')drawHuman(g,cx,fy,s,{...o,skin:'#d8c8a8',top:'#4a3a5a',pants:'#2a2a3a',hair:'#3a2a1a',eye:'#7a4a4a',extra:(R,b,f)=>{R(5.2,6.5+b,2,.9,'#6a4a6a');R(8.4,6.5+b,2,.9,'#6a4a6a');R(4.4,9.8+b,7.2,1.2,'#e8e8e0');R(10.6,8+b,5,5,'#c4c8d0');R(11,8.4+b,4.2,3.6,'#2f6fb0');R(11.4,13+b,3.4,.5,'#555');R(2,10+b,2.4,3,'#f4f1e6');R(2.4,10.6+b,1.6,.4,'#c0392b')}});
  else if(m.type==='mangaka'){
    const casting=m.cast>0;
    drawHuman(g,cx,fy,s,{...o,wide:true,skin:'#e8d0b8',top:'#3a3a4a',pants:'#22222c',hair:'#1a1a22',eye:m.enr?'#ff3b3b':'#2a1a1a',mouth:'#5a2a2a',armUp:casting,extra:(R,b,f)=>{
      R(4.2,2.4+b,7.6,2,'#1a1a22');R(3.6,3.4+b,1.4,4,'#1a1a22');R(11,3.4+b,1.4,4,'#1a1a22');R(5.2,6.6+b,2.2,1,'#7a5a7a');R(8.6,6.6+b,2.2,1,'#7a5a7a');R(4.6,5.2+b,2.6,.5,'#111');R(8.8,5.2+b,2.6,.5,'#111');
      R(4.4,8.4+b,7.2,6,'#e8e4dc');R(10,9+b,5,4,'#f4f1e6');R(10.6,9.8+b,3.4,.4,'#111');R(10.6,11+b,3.4,.4,'#111');
      if(casting){R(12.8,.6+b,1,8,'#111');R(12.2,-.6+b,2.2,1.6,'#d4ad60')}else{R(12.6,6+b,1,8,'#111');R(12.2,5+b,2.2,1.4,'#d4ad60')}
    }});
  }
  else if(m.type==='jury_secu'||m.type==='jury_tests'||m.type==='jury_archi'){
    const casting=m.cast>0,col={jury_secu:['#1a1a22','#c0392b','#e85a4c'],jury_tests:['#1e3a2a','#3a8a4a','#6cff7a'],jury_archi:['#2a2a4a','#2f6fb0','#7fb6ff']}[m.type];
    drawHuman(g,cx,fy,s,{...o,wide:true,skin:'#e0c8b0',top:col[0],pants:'#14141a',eye:m.enr?'#ff3b3b':'#1a1410',mouth:'#5a2a2a',armUp:casting,extra:(R,b,f)=>{
      R(4.2,2.4+b,7.6,1.6,'#5a5a62');R(5.3+f*.5,5.5+b,2.2,.4,'#111');R(8.3+f*.5,5.5+b,2.2,.4,'#111');R(4.4,8+b,7.2,6.4,'#e8e8e0');R(7.2,8.2+b,1.6,6,col[1]);
      if(m.type==='jury_secu'){R(10.6,9+b,3.8,3.4,'#8a8a94');R(11.4,8.2+b,2.2,1.6,'#8a8a94');R(11.9,10+b,1.2,1.2,'#111')}
      else if(m.type==='jury_tests'){R(10.6,8.6+b,4.4,5.2,'#e8e8e0');R(11.2,9.4+b,.8,.8,col[2]);R(12.4,9.4+b,2,.4,'#555');R(11.2,11+b,.8,.8,col[2]);R(12.4,11+b,2,.4,'#555');R(11.2,12.6+b,.8,.8,'#ff4a4a');R(12.4,12.6+b,2,.4,'#555')}
      else{R(10.4,8.4+b,5,5,'#cfe0f4');R(10.8,12+b,4.2,.4,col[1]);R(12.6,9+b,.4,3,col[1]);R(11.4,10.4+b,2.4,.4,col[1])}
    }});
  }
  else if(m.type==='necro')drawHuman(g,cx,fy,s,{...o,skin:'#9a9488',top:'#3a1f4a',pants:'#2a1636',eye:'#7fffd4',mouth:'#2a1636',extra:(R,b)=>{R(3.8,2+b,8.4,2,'#2a1636');R(3.8,2+b,1.2,6.4,'#2a1636');R(11,2+b,1.2,6.4,'#2a1636');R(4,14.6+b,8,2.6,'#3a1f4a');R(12.4,10+b,2.2,3.2,'#efe6d0');R(12.4,10+b,2.2,.5,'#8a826f')}});
  else if(m.type==='maman'){
    const casting=m.cast>0;
    drawHuman(g,cx,fy,s,{...o,wide:true,skin:'#f0c8a6',top:'#8e4a7a',pants:'#6e3a5e',hair:'#7a5a44',mouth:'#b03a3a',armUp:casting,extra:(R,b)=>{
      R(5.5,.4+b,5,2.8,'#7a5a44');R(5.2,1+b,1.2,1.2,'#f28bb6');R(9.6,1+b,1.2,1.2,'#f28bb6');R(7.4,.2+b,1.2,1.2,'#f28bb6');
      R(4.8,10+b,6.4,6,'#efe6d6');R(4.8,10+b,6.4,.6,'#d6c9b0');R(5.6,5.1+b,1.6,.4,'#4a2a1a');R(8.8,5.1+b,1.6,.4,'#4a2a1a');
      if(casting){R(12.8,1+b,1.6,8.6,'#8e4a7a');R(11,-1.4+b,6,2.2,'#1a1a1a');R(11.6,-4+b,.6,2.6,'#1a1a1a');R(15.8,-4+b,.6,2.6,'#1a1a1a');const on=Math.floor(t*8)%2;R(12,-.6+b,.8,.6,on?'#4aff7a':'#1e5a2a');R(13.4,-.6+b,.8,.6,on?'#1e5a2a':'#4aff7a');R(14.8,-.6+b,.8,.6,'#4aff7a')}
      else{R(12.4,14.2+b,3.8,1.6,'#1a1a1a');R(13,13+b,.5,1.2,'#1a1a1a');R(15.2,13+b,.5,1.2,'#1a1a1a');R(13.2,14.6+b,.6,.5,'#4aff7a')}
      if(m.enr){R(3.4,4.6+b,1,1,'#ff3b3b');R(11.6,4.6+b,1,1,'#ff3b3b')}
    }});
  }
  else if(m.type==='archiviste'){
    const casting=m.cast>0;
    drawHuman(g,cx,fy,s,{...o,wide:true,skin:'#d8c8b0',top:'#2a2440',pants:'#1e1a30',eye:m.enr?'#ff3b3b':'#c9a8ff',mouth:'#2a2440',armUp:casting,extra:(R,b)=>{
      R(4.4,7.4+b,7.2,7,'#e8e4dc');R(5.4,14.2+b,5.2,2,'#e8e4dc');R(3.6,15+b,8.8,2.6,'#2a2440');
      R(4.6,-2.6+b,6.8,6.4,'#2a2440');R(5.4,-4.6+b,5.2,2.2,'#2a2440');R(6.4,-5.8+b,3.2,1.4,'#2a2440');R(4.6,1.6+b,6.8,.8,'#d4ad60');
      if(casting){R(12.6,1+b,1.8,8.6,'#2a2440');R(10.6,-2.4+b,6.4,3.6,'#5a1a3a');R(11,-2+b,5.6,2.8,'#e8dfc8');R(12.4,-1.6+b,2.6,.4,'#6d6455');R(12.4,-.8+b,2.6,.4,'#6d6455')}
      else{R(12.2,11.4+b,3.6,4.4,'#5a1a3a');R(15.4,11.6+b,.6,4,'#e8dfc8');R(13.4,13+b,1.2,1.2,'#d4ad60')}
    }});
  }
}
export function drawNpc(g,n,cx,fy,s,t){
  if(n.look==='sign'||n.look==='door'){
    const u=s/16,R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(cx+(x-8)*u,fy+(y-18)*u,w*u+.6,h*u+.6)};
    g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(cx,fy-.2*u,4.4*u,1.2*u,0,0,7);g.fill();
    if(n.look==='sign'){R(7.2,7,1.6,11,'#6b4a2f');R(1.5,1.5,13,7,'#3a2a1a');R(2,2,12,6,'#a07a4a');R(3,3.2,10,.8,'#3a2a1a');R(3,4.8,7,.8,'#3a2a1a');R(3,6.4,9,.8,'#3a2a1a');R(11,2.4,2,2,'#2f6fb0')}
    else{R(2.4,0,11.2,18,'#4a3a2a');R(3.6,1.2,8.8,16.8,'#16121a');R(3.6,1.2,8.8,2,'#2a2230');R(5.4,5,5.2,13,'#2a2230');R(9.2,11,1,2,'#d4ad60');R(5.6,-1.8,4.8,2.4,'#2f8a4a');R(6.4,-1.2,3.2,.8,'#cfe8d4')}
    return;
  }
  if(n.id==='cpe')drawHuman(g,cx,fy,s,{skin:'#e0b890',top:'#4a3a2a',pants:'#2a2420',hair:'#8a8a90',face:1,extra:(R,b,f)=>{R(5.3+f*.5,5.5+b,2,.4,'#111');R(8.3+f*.5,5.5+b,2,.4,'#111');R(4.8,9.6+b,6.4,5.8,'#6a5a3a');R(7.4,9.6+b,1.2,5.6,'#a83232');R(10.4,12+b,3,.8,'#d4ad60');R(12.4,12+b,.9,2.6,'#c0c4cc');R(10,8+b,.7,3,'#d4ad60')}});
  else if(n.id==='otaku')drawHuman(g,cx,fy,s,{skin:'#e0c0a0',top:'#5a2a6a',pants:'#2a1a3a',hair:'#d8d8e0',face:1,extra:(R,b,f)=>{R(4.2,2.2+b,7.6,1.6,'#c0392b');R(4.2,2.2+b,1.2,5.8,'#d8d8e0');R(10.6,2.2+b,1.2,5.8,'#d8d8e0');R(5.3+f*.5,5.5+b,2,.4,'#111');R(8.3+f*.5,5.5+b,2,.4,'#111');R(4.4,7.6+b,7.2,7,'#d8d8e0');R(4.6,14.4+b,6.8,1.6,'#d8d8e0');R(10.4,10+b,4.4,5.4,'#8a5a3a');R(11,10.8+b,1.4,1.4,'#e85a8a');R(13,10.8+b,1.4,1.4,'#4ab8ff');R(11,12.8+b,1.4,1.4,'#f4d03f');R(13,12.8+b,1.4,1.4,'#6cd04a')}});
  else if(n.id==='responsable')drawHuman(g,cx,fy,s,{skin:'#e8c8a8',top:'#2a3a5a',pants:'#1a2030',hair:'#7a7a80',face:-1,extra:(R,b,f)=>{R(5.3+f*.5,5.5+b,2,.4,'#111');R(8.3+f*.5,5.5+b,2,.4,'#111');R(6.6,9.6+b,2.8,5.4,'#e8e8e0');R(7.4,9.6+b,1.2,4,'#c0392b');R(4.4,9.8+b,.8,5,'#2f6fb0');R(10.4,10.6+b,5,3.6,'#c4c8d0');R(10.8,11+b,4.2,2.6,'#2f6fb0');R(10.4,14.2+b,5,.8,'#8a8f98')}});
  else if(n.id==='caissiere')drawHuman(g,cx,fy,s,{skin:'#efc8a4',top:'#c0392b',pants:'#2a2a3a',hair:'#6a4a2a',face:-1,extra:(R,b,f)=>{R(4.2,2.6+b,7.6,2,'#6a4a2a');R(7,1+b,2.6,2,'#6a4a2a');R(4.6,9.6+b,6.8,5.8,'#f4f1e6');R(5.2,10.4+b,2.4,1.2,'#2a5aa0');R(10.8,10+b,3.6,3,'#222');R(11.2,10.4+b,2.8,1,'#7fe0ff');R(11.2,12+b,.8,.8,'#ff4a4a')}});
  else if(n.id==='mystique')drawHuman(g,cx,fy,s,{skin:'#d8b896',top:'#4a2a7a',pants:'#2a1a4a',face:1,eye:'#4a2a7a',extra:(R,b,f)=>{R(3.8,1.6+b,8.4,3.2,'#d4ad60');R(5,.2+b,6,1.8,'#d4ad60');R(7.4,-1+b,1.2,1.4,'#c0392b');R(4,9.6+b,8,6,'#4a2a7a');R(4,14+b,8,2.6,'#3a1f6a');R(10.4,10.6+b,4.4,4.4,'#9a7aff');R(11,11.2+b,1.6,1.6,'#e8dcff');R(4.8,7.8+b,6.4,3,'#b8a0d0')}});
  else if(n.id==='sage')drawChouffin(g,cx,fy,s,{hat:'#4a4552',coat:'#3b2a4a',shirt:'#22182a',band:'#d4ad60',beard:'#d8d3c8',longBeard:true,face:1,glasses:true,skin:'#e8c09c'});
  else if(n.id==='conseiller')drawHuman(g,cx,fy,s,{skin:'#efc8a4',top:'#34456a',pants:'#22283a',hair:'#8a8a90',face:-1,extra:(R,b,f)=>{R(6.6,9.5+b,2.8,6,'#e8e8f0');R(7.6,10+b,.9,4.6,'#a83232');R(5.3+f*.5,5.5+b,2,.4,'#111');R(8.3+f*.5,5.5+b,2,.4,'#111');R(10.6,11+b,3,3.4,'#8a6a3a');R(11.2,10.4+b,1.8,.8,'#6a4a22')}});
  else if(n.id==='arene'){
    const u=s/16,R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(cx+(x-8)*u,fy+(y-18)*u,w*u+.6,h*u+.6)};
    g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(cx,fy-.2*u,4*u,1.2*u,0,0,7);g.fill();
    R(7.2,7,1.6,11,'#6b4a2f');R(1.5,1.5,13,7,'#3a2a1a');R(2,2,12,6,'#a07a4a');R(3,3.2,10,.8,'#3a2a1a');R(3,4.8,7,.8,'#3a2a1a');R(3,6.4,9,.8,'#3a2a1a');R(11,2.4,2,2,'#ec5a4c');
  }
  else if(n.id==='fanfiqueuse')drawHuman(g,cx,fy,s,{skin:'#efc8a4',top:'#7a3a6a',pants:'#2a2230',hair:'#c04a9a',face:1,extra:(R,b,f)=>{R(4.2,2.8+b,7.6,2.2,'#c04a9a');R(4.2,2.8+b,1.2,5.4,'#c04a9a');R(10.6,2.8+b,1.2,5.4,'#c04a9a');R(5.3+f*.5,5.5+b,2,.4,'#111');R(8.3+f*.5,5.5+b,2,.4,'#111');R(10.8,11+b,3.4,4,'#e8e8f0');R(11.2,11.8+b,2.6,.4,'#6d6455');R(11.2,12.8+b,2.6,.4,'#6d6455');R(13.2,10.2+b,.5,3,'#d4ad60')}});
  else if(n.id==='kevin')drawHuman(g,cx,fy,s,{skin:'#efc8a4',top:'#2f7a3a',pants:'#2a2a3a',hair:'#2a1c10',face:-1,extra:(R,b,f)=>{R(4.4,2.4+b,7.2,1.4,'#e03a3a');R(f>0?9.6:2.8,3.4+b,3.6,.8,'#e03a3a');R(7.4,9.6+b,1.2,4,'#e8e8f0');R(6.8,13.4+b,2.4,1.4,'#d4ad60')}});
  else if(n.id==='gerard')drawHuman(g,cx,fy,s,{skin:'#eabf98',top:'#d9d2c0',pants:'#3a3a44',hair:'#5a4632',face:-1,extra:(R,b,f)=>{R(4.8,9.6+b,6.4,5.8,'#2f6b4a');R(6.8,11+b,2.4,1.2,'#d4ad60');R(5.3+f*.5,5.5+b,2.2,2,'rgba(160,210,255,.35)');R(8.3+f*.5,5.5+b,2.2,2,'rgba(160,210,255,.35)');R(5.3+f*.5,5.5+b,5.2,.4,'#111');R(4.4,3+b,7.2,.9,'#efc8a4')}});
  else if(n.id==='bernard')drawHuman(g,cx,fy,s,{wide:true,skin:'#e0a888',top:'#5a4a40',pants:'#2a2420',face:1,extra:(R,b)=>{R(4.8,9.4+b,6.4,6.6,'#6b4a2f');R(4.4,7.6+b,7.2,2.2,'#7a4a2a');R(5,9.6+b,6,1,'#7a4a2a');R(4.4,3+b,7.2,.8,'#e0a888');R(12.8,8+b,1,6,'#6b4a2f');R(11.8,6.8+b,3,2,'#8a8f96')}});
  else if(n.id==='tavernier')drawHuman(g,cx,fy,s,{skin:'#efc8a4',top:'#5a5a62',pants:'#2a2a32',hair:'#3a2a1a',face:1,extra:(R,b,f)=>{R(4.2,2.4+b,7.6,1.8,'#1e1e1e');R(f>0?2.4:10,3.4+b,3.6,.8,'#1e1e1e');R(4.4,7.8+b,7.2,1.4,'#3a2a1a');R(10.6,9.4+b,2,4,'#efe6d6');R(6,11+b,4,1.6,'#c0392b');R(6.4,11.3+b,3.2,1,'#fff')}});
  else drawHuman(g,cx,fy,s,{skin:'#cdb8a0',top:'#2f4a3a',pants:'#1f2a24',eye:'#f0d070',face:-1,extra:(R,b)=>{R(3.8,2.2+b,8.4,2.2,'#24382c');R(3.8,2.2+b,1.2,6,'#24382c');R(11,2.2+b,1.2,6,'#24382c');R(4,14.6+b,8,2.6,'#2f4a3a');R(1.4,12+b,2.2,3,'#d4ad60');const fl=.6+.4*Math.sin(t*6);R(1.8,12.6+b,1.4,1.8,`rgba(255,220,120,${fl})`)}});
}
export function drawObj(g,o,X,Y,t){
  if(o.type==='portal'){
    const r=TS*.6,cy=Y-TS*.2;
    g.fillStyle='rgba(140,80,255,.22)';g.beginPath();g.ellipse(X,cy,r,r*.5,0,0,7);g.fill();
    for(let i=0;i<3;i++){g.strokeStyle=`rgba(${190-i*20},${140-i*20},255,${.9-i*.25})`;g.lineWidth=2.5;g.beginPath();g.ellipse(X,cy,r*(1-i*.28),r*.5*(1-i*.28),0,t*2.4+i*1.3,t*2.4+i*1.3+4.4);g.stroke()}
    if(rnd()<.15)parts.push({x:o.x+rr(-.4,.4),y:o.y-.2,vx:0,vy:rr(-1.4,-.6),t:0,life:.8,col:'#c9a8ff',sz:.07});
  }else{
    const u=TS/16,R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(X+x*u,Y+y*u,w*u,h*u)};
    if(!o.opened){const a=.25+.15*Math.sin(t*4);g.fillStyle=`rgba(240,208,112,${a})`;g.beginPath();g.ellipse(X,Y-4*u,10*u,6*u,0,0,7);g.fill()}
    g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(X,Y,8*u,2*u,0,0,7);g.fill();
    R(-7,-8,14,8,'#7a4e26');R(-7,-8,14,1,'#9a6a36');R(-7,-5,14,1,'#d4ad60');R(-6,-8,1,8,'#d4ad60');R(5,-8,1,8,'#d4ad60');
    if(o.opened){R(-7,-14,14,4,'#5e3b1c');R(-7,-14,14,1,'#d4ad60');R(-5,-9,10,2,'#1a1008')}
    else{R(-7,-12,14,4,'#8a5a2e');R(-7,-12,14,1,'#b07a40');R(-1,-8,2,3,'#d4ad60')}
  }
}
function paintIcon(g,id){
  const r=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  const bg=g.createLinearGradient(0,0,0,32);bg.addColorStop(0,'#2a2230');bg.addColorStop(1,'#120e14');g.fillStyle=bg;g.fillRect(0,0,32,32);
  const rot=(a,fn)=>{g.save();g.translate(16,16);g.rotate(a);fn();g.restore()};
  switch(id){
    case 'tip':case 'fedora':r(3,19,26,3,'#3a3640');r(8,8,16,11,'#3a3640');r(10,7,12,2,'#4a4652');r(8,15,16,3,'#8a3434');r(11,9,10,1,'#57535f');if(id==='tip'){r(25,6,2,2,'#f0d070');r(5,9,2,2,'#f0d070');r(27,12,1,1,'#f0d070')}break;
    case 'enfait':r(4,6,24,15,'#ede1c5');r(5,5,22,1,'#ede1c5');r(8,21,5,4,'#ede1c5');r(9,12,3,3,'#222');r(15,12,3,3,'#222');r(21,12,3,3,'#222');break;
    case 'copypasta':r(10,4,17,22,'#8a826f');r(6,7,17,22,'#ede1c5');for(let i=0;i<6;i++)r(9,11+i*3,i===5?6:11,1.5,'#6d6455');break;
    case 'canette':r(11,7,10,20,'#3b9a2a');r(11,7,10,2,'#c8c8c8');r(11,25,10,2,'#c8c8c8');r(13,11,6,10,'#111');r(15,12,3,3,'#7fe04a');r(14,15,3,3,'#7fe04a');r(15,18,2,2,'#7fe04a');r(14,5,4,2,'#aaa');break;
    case 'd20':g.fillStyle='#c9c9e0';g.beginPath();g.moveTo(16,2);g.lineTo(28,9);g.lineTo(28,23);g.lineTo(16,30);g.lineTo(4,23);g.lineTo(4,9);g.fill();g.strokeStyle='#3a3a55';g.lineWidth=1.5;g.beginPath();g.moveTo(16,8);g.lineTo(24,22);g.lineTo(8,22);g.closePath();g.moveTo(16,2);g.lineTo(16,8);g.moveTo(4,9);g.lineTo(16,8);g.lineTo(28,9);g.moveTo(8,22);g.lineTo(4,23);g.moveTo(24,22);g.lineTo(28,23);g.moveTo(8,22);g.lineTo(16,30);g.lineTo(24,22);g.stroke();break;
    case 'relance':r(4,11,15,15,'#ede1c5');r(7,14,3,3,'#222');r(13,20,3,3,'#222');r(10,17,3,3,'#222');r(21,5,4,12,'#6cff7a');r(17,9,12,4,'#6cff7a');break;
    case 'fiche':r(6,3,18,26,'#ede1c5');for(let i=0;i<5;i++)r(9,7+i*4,12,1.5,'#6d6455');r(18,19,10,4,'#6cff7a');r(21,16,4,10,'#6cff7a');break;
    case 'joker':r(7,3,18,26,'#f4f0e0');r(7,3,18,2,'#7a2fb0');r(10,7,12,5,'#7a2fb0');r(9,5,3,6,'#7a2fb0');r(20,5,3,6,'#7a2fb0');r(13,15,6,6,'#d4ad60');r(14,22,4,3,'#ec5a4c');break;
    case 'frame':r(3,7,26,18,'#111');r(7,10,18,12,'#7fe0ff');r(11,13,10,6,'#fff');for(let i=0;i<5;i++){r(4,9+i*3.4,2,2,'#aaa');r(26,9+i*3.4,2,2,'#aaa')}break;
    case 'skipcine':g.fillStyle='#7fe0ff';for(const dx of [3,15]){g.beginPath();g.moveTo(dx,6);g.lineTo(dx+12,16);g.lineTo(dx,26);g.fill()}r(27,6,3,20,'#fff');break;
    case 'anypct':g.fillStyle='#f4f04a';g.beginPath();g.moveTo(18,2);g.lineTo(6,18);g.lineTo(14,18);g.lineTo(11,30);g.lineTo(26,12);g.lineTo(17,12);g.fill();r(21,22,3,3,'#fff');r(27,27,3,3,'#fff');g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(28,21);g.lineTo(20,30);g.stroke();break;
    case 'glitch':r(4,6,24,20,'#3a3a55');r(4,10,10,5,'#ff3bd5');r(18,14,10,5,'#3bf0ff');r(8,20,12,3,'#ff3bd5');r(14,6,6,3,'#3bf0ff');r(22,22,6,4,'#fff');break;
    case 'avertissement':g.fillStyle='#f0c030';g.beginPath();g.moveTo(16,3);g.lineTo(30,28);g.lineTo(2,28);g.fill();r(14.5,11,3,9,'#111');r(14.5,22,3,3,'#111');break;
    case 'ban':rot(-.6,()=>{r(-2,-4,4,22,'#6b4a2f');r(-9,-12,18,9,'#8a8a96');r(-9,-12,18,2,'#b8b8c4')});r(4,24,24,3,'#ec5a4c');break;
    case 'lock':r(8,14,16,13,'#d4ad60');r(10,6,3,10,'#aaa');r(19,6,3,10,'#aaa');r(10,4,12,3,'#aaa');r(14.5,18,3,5,'#111');break;
    case 'reglement':r(6,4,20,25,'#ede1c5');for(let i=0;i<4;i++)r(9,11+i*4,14,1.5,'#6d6455');r(9,7,10,2,'#111');g.fillStyle='#ec5a4c';g.beginPath();g.arc(16,5,3.5,0,7);g.fill();break;
    case 'ragequit':r(10,4,14,24,'#6b4a2f');r(12,6,10,20,'#4a321f');r(19,16,2,2,'#d4ad60');r(3,14,9,4,'#ec5a4c');g.fillStyle='#ec5a4c';g.beginPath();g.moveTo(4,10);g.lineTo(4,22);g.lineTo(-1,16);g.fill();break;
    case 'bag':r(7,10,18,18,'#7a5530');r(7,10,18,4,'#5e3f22');r(12,5,8,6,'#5e3f22');r(14,7,4,4,'#1a1410');r(14,16,4,3,'#d4ad60');break;
    case 'opts':r(13,4,6,24,'#a89a88');r(4,13,24,6,'#a89a88');r(8,8,16,16,'#a89a88');r(12,12,8,8,'#1a1410');break;
    case 'char':r(10,4,12,12,'#efc8a4');r(7,6,18,3,'#3a3640');r(10,2,12,5,'#3a3640');r(10,13,12,4,'#5a3d26');r(7,18,18,12,'#4a4552');r(13,18,6,10,'#161419');break;
    case 'chouffe':r(14,3,4,8,'#5a3a12');r(13,1,6,2,'#c8c8c8');r(11,10,10,19,'#6b4210');r(12,11,2,16,'#8a5a1e');r(11,15,10,8,'#f2e6c8');r(11,18,10,2,'#c0392b');r(13,16,6,1,'#5a3a12');break;
    case 'chips':r(8,5,16,23,'#e07a1f');r(8,5,16,3,'#b85c10');r(8,25,16,3,'#b85c10');g.fillStyle='#ffcf5a';g.beginPath();g.moveTo(12,20);g.lineTo(20,20);g.lineTo(16,12);g.fill();break;
    case 'poignee':r(7,13,16,9,'#efc8a4');r(21,12,7,3,'#efc8a4');r(21,15,7,3,'#e3b893');r(21,18,6,3,'#efc8a4');r(9,10,5,4,'#efc8a4');r(5,6,2,4,'#6ab8ff');r(25,6,2,3,'#6ab8ff');r(14,6,2,3,'#6ab8ff');break;
    case 'trench':r(8,5,16,24,'#2a2630');r(13,5,6,12,'#111');r(8,17,16,2,'#4a3b2a');r(5,7,3,14,'#2a2630');r(24,7,3,14,'#2a2630');break;
    case 'tshirt':r(5,7,22,7,'#222');r(9,7,14,21,'#222');r(13,7,6,2,'#3a3a3a');r(12,14,8,5,'#e07a1f');break;
    case 'sweat':r(5,9,22,8,'#4a5a6a');r(8,9,16,19,'#4a5a6a');r(10,4,12,6,'#3a4a5a');r(16,17,5,4,'#8a7a3a');r(11,22,10,4,'#3a4a5a');break;
    case 'carton':r(7,6,18,22,'#c49a5a');r(15,6,2,22,'#d8c38a');r(9,12,6,2,'#a33');r(4,8,3,12,'#b48a4a');r(25,8,3,12,'#b48a4a');break;
    case 'eva':r(7,6,18,22,'#3a6a8a');r(9,8,14,6,'#5a8aaa');r(9,16,14,6,'#5a8aaa');r(7,6,18,1,'#d4ad60');r(4,7,3,10,'#2a5a7a');r(25,7,3,10,'#2a5a7a');break;
    case 'mitaines':r(8,12,16,13,'#555a60');for(let i=0;i<4;i++){r(8+i*4,7,3,6,'#efc8a4');r(8+i*4,12,3,1,'#444')}r(4,15,5,5,'#555a60');r(8,22,16,3,'#3a3e44');break;
    case 'gants':r(8,9,16,16,'#2a2a2a');r(8,9,16,3,'#4ab8ff');r(4,14,5,6,'#2a2a2a');r(8,22,16,3,'#1a1a1a');r(11,14,2,2,'#4ab8ff');r(17,14,2,2,'#4ab8ff');break;
    case 'jogging':r(9,5,6,24,'#2a2a3a');r(17,5,6,24,'#2a2a3a');r(9,5,14,4,'#3a3a4a');r(9,9,1,20,'#ddd');r(22,9,1,20,'#ddd');break;
    case 'jambieres':r(9,5,6,24,'#5f5e34');r(17,5,6,24,'#5f5e34');r(9,5,14,4,'#4a4928');r(7,12,4,6,'#4a4928');r(21,12,4,6,'#4a4928');r(10,20,4,4,'#4a4928');r(18,20,4,4,'#4a4928');break;
    case 'pantoufles':r(3,18,12,8,'#b06070');r(17,18,12,8,'#b06070');r(3,24,12,2,'#ede1c5');r(17,24,12,2,'#ede1c5');r(5,15,4,4,'#f2d0d8');r(19,15,4,4,'#f2d0d8');break;
    case 'casque':r(7,7,18,3,'#222');r(5,10,3,4,'#222');r(24,10,3,4,'#222');r(4,13,7,10,'#222');r(21,13,7,10,'#222');r(6,16,3,4,'#ff6ad5');r(23,16,3,4,'#ff6ad5');g.fillStyle='#ff6ad5';g.beginPath();g.moveTo(8,8);g.lineTo(11,2);g.lineTo(13,8);g.fill();g.beginPath();g.moveTo(19,8);g.lineTo(21,2);g.lineTo(24,8);g.fill();break;
    case 'heaume':r(5,11,22,11,'#e8e8ea');r(7,13,18,7,'#1a1a2a');r(9,15,5,2,'#6ab8ff');r(18,15,5,2,'#6ab8ff');r(2,14,3,4,'#333');r(27,14,3,4,'#333');r(10,8,12,3,'#c8c8ca');break;
    case 'bandeau':r(3,13,26,6,'#2b3a8a');r(10,11,12,10,'#b9c0c8');r(11,12,10,1,'#e0e4e8');r(14,14,4,4,'#555');r(2,18,4,8,'#2b3a8a');break;
    case 'regle':rot(-.7,()=>{r(-14,-3,28,6,'#e8d36a');for(let i=0;i<9;i++)r(-13+i*3,-3,1,i%2?2:3,'#6b5a1a')});break;
    case 'katana':rot(-.78,()=>{r(-1.5,-15,3,20,'#d8dde3');r(-1.5,-15,1,20,'#fff');r(-5,5,10,2,'#d4ad60');r(-1.5,7,3,8,'#222')});break;
    case 'sabre':rot(-.78,()=>{r(-2,-15,4,21,'#3fbfff');r(-1,-15,2,21,'#dff7ff');r(-2.5,6,5,9,'#888');r(-2.5,8,5,1,'#333')});break;
    case 'resine':rot(-.78,()=>{r(-2,-15,4,20,'#c9b8a8');r(-1,-15,1,20,'#e6dbd0');r(-6,5,12,2,'#7a4ab0');r(-1.5,7,3,8,'#4a2a1a');r(-2,14,4,2,'#7a4ab0')});break;
    case 'flamme':r(4,14,18,6,'#555');r(20,15,6,4,'#333');r(8,20,6,7,'#c0392b');r(26,11,4,12,'#ffb000');r(27,13,3,8,'#fff3a0');r(5,12,4,2,'#777');break;
    case 'grimoire':r(7,5,18,23,'#5a1a3a');r(23,6,3,21,'#e8dfc8');r(13,12,6,6,'#d4ad60');r(15,14,2,2,'#5a1a3a');r(7,5,18,1,'#8a2a5a');break;
    case 'clavier':r(2,11,28,13,'#151515');{const cs=['#ff4a4a','#ffb84a','#f4f04a','#4aff7a','#4ab8ff','#b04aff'];for(let j=0;j<3;j++)for(let i=0;i<6;i++)r(4+i*4.2,13+j*3.5,3,2.4,cs[(i+j)%6])}break;
    case 'ethernet':r(3,22,18,3,'#3d6fc2');r(3,8,3,16,'#3d6fc2');r(3,8,10,3,'#3d6fc2');r(19,15,10,11,'#d6e4f0');r(20,24,8,3,'#b8c8d8');for(let i=0;i<4;i++)r(21+i*2,16,1,3,'#d4ad60');break;
    case 'art_cle':r(6,12,15,8,'#3a7ad0');r(21,13,7,6,'#c8c8c8');r(23,15,1,2,'#555');r(26,15,1,2,'#555');r(8,14,6,1,'#7aaaf0');break;
    case 'art_poster':r(6,6,20,20,'#efe6d0');r(11,9,10,10,'#d8708a');r(14,12,4,4,'#f4d03f');r(9,21,12,1,'#222');r(19,20,3,1,'#222');break;
    case 'art_disquette':r(6,6,20,20,'#2a2a2a');r(11,6,10,7,'#b8bcc2');r(17,7,2,5,'#2a2a2a');r(9,16,14,9,'#ede1c5');r(10,18,10,1,'#6d6455');break;
    case 'art_carte':{r(9,4,14,24,'#e8d36a');const gr=g.createLinearGradient(11,7,21,17);gr.addColorStop(0,'#ff6ad5');gr.addColorStop(.5,'#6ab8ff');gr.addColorStop(1,'#7fe04a');g.fillStyle=gr;g.fillRect(11,7,10,10);r(11,19,10,1.5,'#555');r(11,22,7,1.5,'#555')}break;
    case 'art_figurine':r(7,4,18,24,'#c0392b');r(10,8,12,14,'#9fd0f0');r(14,11,4,9,'#efc8a4');r(13,9,6,3,'#f4d03f');r(13,14,6,4,'#2b3a8a');r(9,24,14,2,'#f4d03f');break;
    case 'art_cartouche':r(7,6,18,20,'#d4ad60');r(10,9,12,9,'#6a2a8a');r(12,11,8,5,'#f4d03f');r(9,24,14,2,'#8a6a2a');r(7,6,18,1,'#f0d890');break;
    case 'art_dvd':r(4,8,24,18,'#1a2a5a');for(let i=0;i<6;i++)r(5+i*4,9,3,16,['#4a6ad0','#d04a6a','#4ad06a','#d0b04a','#9a4ad0','#4ad0c0'][i]);break;
    case 'art_topic':r(8,4,16,24,'#efe6d0');r(10,7,12,3,'#2a5aa0');r(10,7,4,3,'#ff9a2a');for(let i=0;i<5;i++)r(10,13+i*3,i===4?7:12,1.5,'#6d6455');break;
    case 'art_sticker':g.fillStyle='#f4d03f';g.beginPath();g.arc(16,16,11,0,7);g.fill();r(10,11,4,3,'#2a1a0a');r(18,11,4,3,'#2a1a0a');r(10,18,12,5,'#3a1010');r(11,18,10,2,'#fff');r(7,13,2,6,'#6ab8ff');r(23,13,2,6,'#6ab8ff');break;
    case 'art_wifi':g.strokeStyle='#d4ad60';g.lineWidth=3;for(let i=0;i<3;i++){g.beginPath();g.arc(16,24,5+i*5,Math.PI*1.25,Math.PI*1.75);g.stroke()}r(14,22,4,4,'#d4ad60');r(6,27,20,3,'#ede1c5');break;
    case 'art_save':r(9,5,14,22,'#4a4a52');r(11,8,10,9,'#6cc23a');r(13,10,6,2,'#1a3a10');r(13,13,4,2,'#1a3a10');r(11,22,10,3,'#d4ad60');r(9,5,14,1,'#6a6a72');break;
  default:{
      // Équipements et artéfacts sans icône dessinée à la main (Lot 8) : forme selon l'emplacement, couleurs tirées de l'identifiant.
      const it=ITEMS[id];let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))>>>0;
      const pal=['#c0392b','#2f6fb0','#e0b020','#3a8a4a','#8a5ab0','#d8d8d0','#e07a1f','#5aa0a0'],c1=pal[h%8],c2=pal[(h>>3)%8];
      const sl=it&&it.t==='eq'?it.s:'art';
      if(sl==='arme')rot(-.7,()=>{r(-2,-13,4,19,c1);r(-2,-13,1,19,'rgba(255,255,255,.35)');r(-6,6,12,3,'#8a8a96');r(-1.5,9,3,6,'#5e3b1c')});
      else if(sl==='tete'){r(7,9,18,11,c1);r(4,18,24,4,c2);r(10,6,12,4,c1)}
      else if(sl==='torse'){r(8,8,16,19,c1);r(3,8,6,11,c1);r(23,8,6,11,c1);r(13,8,6,3,'#111');r(8,23,16,3,c2)}
      else if(sl==='mains'){r(9,10,14,15,c1);r(7,16,4,8,c1);r(9,25,14,3,c2);for(let i=0;i<4;i++)r(10+i*3.4,5,2.6,6,c1)}
      else if(sl==='jambes'){r(8,5,16,6,c2);r(8,11,7,17,c1);r(17,11,7,17,c1)}
      else{r(6,6,20,20,c2);r(8,8,16,16,'#1a1420');r(11,11,10,10,c1);r(9,9,4,2,'rgba(255,255,255,.4)')}
    }
  }
}
export function iconCanvas(id,px){const c=document.createElement('canvas');c.width=c.height=px||64;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.scale(c.width/32,c.height/32);paintIcon(g,id);return c}
