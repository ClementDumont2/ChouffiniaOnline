import {WHISPERS} from '../shared/data.js';
import {dist} from '../shared/rules.js';
import {findEnt} from '../shared/sim.js';
import {moveEnt} from '../shared/map.js';
import {$,esc,pick} from './util.js';
import {TS,cam,cv,setMarker} from './render.js';
import {chat} from './hud.js';
import {autoCloseDlg,closePanel,openNpc,openPortal,togglePanel} from './panels.js';
import {P,WD,running,send,sendChat,sendMove,world} from './state.js';

export const keys={};
// Déplacement : le client calcule sa position et la propose ; la sim ne fait que la valider.
export const nav={goal:null,follow:null,stuck:0};
const KM={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
const chatIn=$('#chatin');
function openObj(o){if(o.type==='portal')openPortal();else if(o.type==='chest')send({a:'openChest',id:o.id})}
addEventListener('keydown',e=>{
  if(!running)return;
  if(document.activeElement===chatIn){if(e.key==='Escape')chatIn.blur();return}
  if(document.activeElement===$('#nm'))return;
  const k=KM[e.code];if(k){keys[k]=true;e.preventDefault();return}
  const dm=e.code.match(/^(?:Digit|Numpad)([1-7])$/);if(dm){const n=+dm[1];if(n<=5)send({a:'skill',i:n-1});else send({a:'useItem',id:n===6?'chouffe':'chips'});e.preventDefault();return}
  if(e.code==='Tab'){e.preventDefault();const list=WD.mobs.filter(m=>m.alive&&dist(m,P)<10).sort((a,b)=>dist(a,P)-dist(b,P));if(list.length){const i=list.findIndex(m=>m.id===P.target);send({a:'target',id:list[(i+1)%list.length].id})}return}
  if(e.code==='KeyI'||e.code==='KeyB'){togglePanel('bag');return}
  if(e.code==='KeyC'){togglePanel('char');return}
  if(e.code==='Enter'){e.preventDefault();chatIn.focus();return}
  if(e.code==='Escape'){if(!$('#dlg').hidden)closePanel('dlg');else if(!$('#bag').hidden||!$('#char').hidden){$('#bag').hidden=true;$('#char').hidden=true}else send({a:'target',id:null})}
});
addEventListener('keyup',e=>{const k=KM[e.code];if(k)keys[k]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
// Appelé depuis main.js : à l'évaluation du module, render.js n'est pas encore initialisé (import circulaire).
export function initInput(){cv.addEventListener('pointerdown',e=>{
  if(!running||P.dead)return;
  if(document.activeElement===chatIn)chatIn.blur();
  const r=cv.getBoundingClientRect(),wx=cam.x+(e.clientX-r.left)/TS,wy=cam.y+(e.clientY-r.top)/TS;
  let best=null,bd=99;
  const cands=[...WD.mobs.filter(m=>m.alive),...WD.npcs,...WD.objs,...WD.bots];
  for(const c of cands){const sc=c.kind==='mob'&&c.d.scale?Math.min(1.2,c.d.scale*.75):1;const cy=c.y-c.hgt*sc*.5;const rad=Math.max(.5,c.hgt*sc*.55);const d=Math.hypot(wx-c.x,(wy-cy)*.75);if(d<rad&&d<bd){bd=d;best=c}}
  if(best){
    if(best.kind==='mob'){send({a:'target',id:best.id,auto:true});nav.goal=null;if(dist(P,best)>1.35)nav.follow=best.id}
    else if(best.kind==='npc'||best.kind==='obj'){send({a:'target',id:best.id});nav.goal=null;const need=best.kind==='npc'?1.7:1.3;if(dist(P,best)<need){best.kind==='npc'?openNpc(best):openObj(best)}else nav.follow=best.id}
    else{send({a:'target',id:best.id});chat('wsp',`[${esc(best.n)}] vous chuchote : ${esc(pick(WHISPERS))}`)}
  }else{nav.goal={x:wx,y:wy};nav.follow=null;setMarker({x:wx,y:wy,t:0})}
});}
$('#chatf').addEventListener('submit',e=>{
  e.preventDefault();const v=chatIn.value.trim();chatIn.value='';chatIn.blur();if(!v)return;
  sendChat(v);
});

export function updControl(dt,t){
  if(P.mvT>0){P.mvT-=dt;if(P.mvT<=0)P.moving=false}
  if(P.dead){P.moving=false;autoCloseDlg();return}
  let dx=0,dy=0;const kb=keys.up||keys.down||keys.left||keys.right;
  if(keys.up)dy-=1;if(keys.down)dy+=1;if(keys.left)dx-=1;if(keys.right)dx+=1;
  if(dx||dy){nav.goal=null;nav.follow=null}
  else if(nav.follow){const e=findEnt(world,WD.id,nav.follow);if(!e||(e.kind==='mob'&&!e.alive)){nav.follow=null}else{const d=dist(P,e),need=e.kind==='mob'?1.35:e.kind==='obj'?1.3:1.7;if(d<need){nav.follow=null;if(e.kind==='npc')openNpc(e);else if(e.kind==='obj')openObj(e)}else{dx=e.x-P.x;dy=e.y-P.y}}}
  else if(nav.goal){dx=nav.goal.x-P.x;dy=nav.goal.y-P.y;if(Math.hypot(dx,dy)<.08){nav.goal=null;dx=dy=0}}
  let L=Math.hypot(dx,dy);
  if(L>0&&(kb||!P.cast)){
    if(P.drunk>0){const a=Math.sin(t*2.7)*.55,c=Math.cos(a),s2=Math.sin(a);const nx=dx*c-dy*s2,ny=dx*s2+dy*c;dx=nx;dy=ny}
    const s=Math.min(4.4*dt,kb?99:L),o={x:P.x,y:P.y};
    moveEnt(WD,o,dx/L*s,dy/L*s);
    const moved=Math.hypot(o.x-P.x,o.y-P.y);
    sendMove(o.x,o.y,Math.abs(dx)>.01?(dx>0?1:-1):0);
    // Le cycle de marche du joueur local est calculé ici : les snapshots ne portent pas sa position.
    if(moved>0){P.x=o.x;P.y=o.y;P.step+=moved*2.7;P.moving=true;P.mvT=.15;if(Math.abs(dx)>.01)P.face=dx>0?1:-1}
    if((nav.goal||nav.follow)&&moved<s*.15){nav.stuck+=dt;if(nav.stuck>.35){nav.goal=null;nav.follow=null;nav.stuck=0}}else nav.stuck=0;
  }
  autoCloseDlg();
}
