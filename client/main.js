import {ACH,DIFFS,HATS,ZONES} from '../shared/data.js';
import {zoneAt} from '../shared/map.js';
import {cleanName} from '../shared/protocol.js';
import {$,esc,pick,rr} from './util.js';
import {drawChouffin} from './sprites.js';
import {burst,floater,paintWorld,parts,render,resize,updFx} from './render.js';
import {announce,banner,buildBar,chat,drawPortrait,err,fmtMsg,hud,renderQuest,setMini,toast,updTarget} from './hud.js';
import {refreshDialog,renderBag,renderChar,showChest,showDeath,showEnd,showTrade,unlockDlg} from './panels.js';
import {initInput,nav,updControl} from './input.js';
import {helpHTML} from './keys.js';
import {buildMap,connect,hooks,interp} from './net.js';
import {P,S,WD,online,running,setMap} from './state.js';
import './chatcmd.js';

const LAST='chouffinia-dernier-pseudo';
const lastName=()=>{try{return localStorage.getItem(LAST)}catch(e){return null}};
const rememberName=()=>{try{localStorage.setItem(LAST,S.name)}catch(e){}};

let lastWD=null,curZone='';
function syncView(){if(WD!==lastWD){lastWD=WD;if(!WD.c)paintWorld(WD);curZone='';setMini();renderQuest()}}
function updZone(){
  const z=zoneAt(WD,P.x,P.y);if(z===curZone)return;
  curZone=z;const Z=z==='dungeon'?{n:'Les Archives Oubliées',s:`Difficulté ${DIFFS[WD.ti].n} · ${DIFFS[WD.ti].sub}`}:ZONES[z];
  $('#zone').textContent=Z.n;banner(Z.n,Z.s,z==='dungeon'?'dg':'');
}
const refreshUI=()=>{renderBag();renderChar();renderQuest();updTarget();drawPortrait()};

const joinMsg=t=>{const e=$('#joinerr');e.textContent=t||'';e.hidden=!t};
hooks.refused=joinMsg;
hooks.welcome=()=>{joinMsg();$('#start').hidden=true;$('#hudwrap').hidden=false;syncView();buildBar();refreshUI();rememberName()};
hooks.self=()=>{refreshUI();refreshDialog()};
hooks.target=()=>updTarget();
hooks.offline=()=>{if(running)err('Connexion perdue. Reconnexion…');else joinMsg('Serveur injoignable, nouvelle tentative…')};
hooks.event=e=>{
  switch(e.t){
    case 'msg':chat(e.cls,fmtMsg(e.text));break;
    case 'chat':chat(e.me?'gen me':'gen',`<span class="ch">[Général]</span> <span class="who">[${esc(e.who)}]</span> : ${esc(e.text)}`);break;
    case 'emote':chat('gen',`<span class="who">${esc(e.who)}</span> ${esc(e.text)}`);break;
    case 'err':err(e.text);break;
    case 'toast':toast(e.kicker,e.title,e.sub);break;
    case 'banner':banner(e.title,e.sub,e.cls);break;
    case 'float':floater(e.x,e.y,e.txt,e.col,e.big);break;
    case 'burst':burst(e.x,e.y,e.col,e.n,e.spd);break;
    case 'puff':for(let k=0;k<6;k++)parts.push({x:e.x+rr(-.4,.4),y:e.y,vx:rr(-.8,.8),vy:rr(-2,-.5),t:0,life:rr(.6,1),col:'#ede1c5',sz:.12});break;
    case 'lvlup':buildBar();for(let i=0;i<26;i++)parts.push({x:e.x+rr(-.6,.6),y:e.y,vx:rr(-.3,.3),vy:rr(-3.5,-1.5),t:0,life:rr(.7,1.3),col:pick(['#f0d070','#ffe9a8','#d4ad60']),sz:rr(.06,.12)});break;
    case 'ach':toast('Haut fait débloqué',ACH[e.id][0],ACH[e.id][1]);chat('sys',`[Haut fait] ${esc(S.name)} a obtenu <b>${esc(ACH[e.id][0])}</b>.`);break;
    case 'died':nav.goal=nav.follow=null;showDeath();break;
    case 'respawned':unlockDlg();break;
    case 'tp':case 'stop':nav.goal=nav.follow=null;break;
    case 'approach':nav.follow=e.id;nav.goal=null;break;
    case 'chest':showChest(e);break;
    case 'trade':showTrade(e);break;
    case 'announce':announce(e.who,e.text);break;
    case 'online':online.splice(0,online.length,...e.names);break;
    case 'campaignEnd':setTimeout(showEnd,900);break;
  }
};

const pv=$('#preview'),pg=pv.getContext('2d');
function drawPreview(t){pg.clearRect(0,0,pv.width,pv.height);pg.imageSmoothingEnabled=false;const tip=(t%3.2)<.45?(t%3.2):0;drawChouffin(pg,75,172,140,{hat:S.hat,coat:'#4a4552',shirt:'#161419',glasses:true,face:Math.sin(t*.7)>0?1:-1,moving:false,step:0,tip})}
function showStart(){
  $('#help').innerHTML=helpHTML();
  const sw=$('#sw');sw.innerHTML='';
  HATS.forEach(([c,n])=>{const b=document.createElement('button');b.type='button';b.style.background=c;b.title=n;b.setAttribute('aria-label','Fedora '+n);b.onclick=()=>{S.hat=c;showStartSw()};sw.appendChild(b)});
  showStartSw();
  const last=lastName();
  if(last){$('#nm').value=last;const c=$('#cont');c.hidden=false;c.textContent=`Continuer : ${last}`;c.onclick=()=>connect(last,S.hat)}
  $('#newg').onclick=()=>connect(cleanName($('#nm').value),S.hat);
}
function showStartSw(){document.querySelectorAll('#sw button').forEach((b,i)=>b.className=HATS[i][0]===S.hat?'on':'');const h=HATS.find(h=>h[0]===S.hat);$('#swn').textContent=h?`${h[1]} · Fourni sans odeur (pour l'instant)`:''}

let last=performance.now(),hudT=0;
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;
  if(running){updControl(dt,t);interp(now);syncView();updZone();hudT-=dt;if(hudT<=0){hudT=.1;hud(t)}}
  else drawPreview(t);
  updFx(dt);
  render(t);
  requestAnimationFrame(frame);
}
addEventListener('resize',resize);
// Fond de l'écran de création : la carte du monde sans habitants, avec la graine par défaut du serveur.
setMap(buildMap({id:'over',seed:20111}));
lastWD=WD;paintWorld(WD);setMini();resize();
initInput();
showStart();
requestAnimationFrame(frame);
