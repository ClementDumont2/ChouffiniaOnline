import {DIFFS,DUNGEONS,ITEMS,MAXLVL,MOBS,NPCS,QUESTS,STOCK,ZONES} from '../shared/data.js';
import {MOUNTS} from '../shared/data/mounts.js';
import {zoneLabels} from '../shared/map.js';
import {CLASSES,SKILL_DEFS} from '../shared/data/classes.js';
import {AFFIXES} from '../shared/data/bosses.js';
import {clamp,npcById,skillsOf,stats,xpNeed} from '../shared/rules.js';
import {$,esc,fmt} from './util.js';
import {drawChouffin,iconCanvas,playerLook} from './sprites.js';
import {H,MINI_S,TS,W,cam} from './render.js';
import {openPortal,renderCharStats,togglePanel} from './panels.js';
import {keyOf,label} from './keys.js';
import {P,S,WD,me,online,send,targetEnt,world} from './state.js';

const count=id=>{const s=S.inv.find(s=>!s.uid&&s.id===id);return s?s.n:0};

const logEl=$('#log');
export function chat(cls,html){const stick=logEl.scrollTop+logEl.clientHeight>=logEl.scrollHeight-24;const d=document.createElement('div');d.className='m '+cls;d.innerHTML=html;logEl.appendChild(d);while(logEl.children.length>140)logEl.firstChild.remove();if(stick)logEl.scrollTop=logEl.scrollHeight}
// rarete / nObj : seulement pour une instance d'équipement (la rareté peut différer de celle de l'objet de base).
export const itemLink=(id,rarete,nObj)=>{const it=ITEMS[id];return`<span class="q-${rarete||it.r}">[${esc(it.n)}]</span>${nObj?` <small>niv. ${nObj}</small>`:''}`};
// Balisage des textes de la sim : **gras**, [[id_objet]], [[up]] (voir shared/sim.js).
export const fmtMsg=t=>esc(t).replace(/\[\[up\]\]/g,' <span class="up">▲ amélioration</span>').replace(/\[\[(\w+)(?::(\w+):(\d+))?\]\]/g,(m,id,r,n)=>itemLink(id,r,n&&+n)).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
let errTO=0;
export function err(msg){const e=$('#err');e.textContent=msg;e.classList.add('on');clearTimeout(errTO);errTO=setTimeout(()=>e.classList.remove('on'),2200)}
export function toast(kicker,title,sub){const d=document.createElement('div');d.className='toast frame';d.innerHTML=`<small>${esc(kicker)}</small><b>${esc(title)}</b>${sub?`<span>${esc(sub)}</span>`:''}`;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),5100)}
export function banner(title,sub,cls){const b=$('#banner');b.className='hud '+(cls||'');b.querySelector('b').textContent=title;b.querySelector('span').textContent=sub||'';void b.offsetWidth;b.classList.add('show')}
// Chiffre géant au centre de l'écran (compte à rebours d'un duel).
export function countdown(text){const c=$('#countdown');c.textContent=text;c.classList.remove('show');void c.offsetWidth;c.classList.add('show')}
export function announce(who,text){const a=$('#announce');a.querySelector('small').textContent=`Annonce de ${who}`;a.querySelector('b').textContent=text;a.classList.remove('show');void a.offsetWidth;a.classList.add('show')}
const skEls=[];let conEls=[],barCls=null;
// La barre dépend de la classe : à reconstruire quand l'état privé annonce un changement.
export const syncBar=()=>{if(S.cls!==barCls)buildBar()};
export function buildBar(){
  const bar=$('#bar');bar.innerHTML='';skEls.length=0;conEls=[];barCls=S.cls;
  skillsOf(S).forEach((sk,i)=>{const b=document.createElement('button');b.className='sk';b.type='button';b.setAttribute('aria-label',sk.n);b.appendChild(iconCanvas(sk.id,64));b.insertAdjacentHTML('beforeend',`<span class="cd"></span><span class="cdt"></span><span class="k">${label(keyOf('s'+(i+1)))}</span>`);
    b.addEventListener('click',()=>send({a:'skill',i}));tipOn(b,()=>`<b>${esc(sk.n)}</b><div class="c">${sk.c?sk.c+' Caféine · ':''}${sk.self?(sk.r?'Rayon '+sk.r+' cases':'Soi-même'):'Portée '+sk.rg+' cases'+(sk.ally?' · allié':'')} · Recharge ${String(sk.cd).replace('.',',')} s${S.lvl<sk.l?` · <span style="color:var(--bad)">Niveau ${sk.l} requis</span>`:''}</div><p>${esc(sk.d)}</p>`);
    bar.appendChild(b);skEls.push({b,cd:b.querySelector('.cd'),cdt:b.querySelector('.cdt'),sk})});
  bar.insertAdjacentHTML('beforeend','<span class="sep"></span>');
  ['chouffe','chips'].forEach(id=>{const b=document.createElement('button');b.className='sk';b.type='button';b.setAttribute('aria-label',ITEMS[id].n);b.appendChild(iconCanvas(id,64));b.insertAdjacentHTML('beforeend',`<span class="cd"></span><span class="cdt"></span><span class="k">${label(keyOf(id))}</span><span class="cnt"></span>`);b.addEventListener('click',()=>send({a:'useItem',id}));tipOn(b,()=>`<b>${esc(ITEMS[id].n)}</b><div class="c">Consommable · ${count(id)} dans le sac · Recharge partagée 6 s</div><p>${esc(ITEMS[id].d)}</p>`);bar.appendChild(b);conEls.push({b,id,cd:b.querySelector('.cd'),cdt:b.querySelector('.cdt'),cnt:b.querySelector('.cnt')})});
  bar.insertAdjacentHTML('beforeend','<span class="sep"></span>');
  $('#chatin').placeholder=`${label(keyOf('chat'))} pour parler · /aide`;
  for(const [id,lbl,fn] of [['bag','Sac',()=>togglePanel('bag')],['char','Perso',()=>togglePanel('char')],['opts','Options',()=>togglePanel('opts')]]){const b=document.createElement('button');b.className='sk menu';b.type='button';b.setAttribute('aria-label',lbl);b.appendChild(iconCanvas(id,64));b.insertAdjacentHTML('beforeend',`<span class="lbl">${lbl}</span><span class="k">${label(keyOf(id))}</span>`);b.addEventListener('click',fn);bar.appendChild(b)}
}
export const tipEl=$('#tip');
export function tipOn(el,fn){el.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse')return;tipEl.innerHTML=fn();tipEl.hidden=false;const r=el.getBoundingClientRect(),ar=$('#app').getBoundingClientRect();const tw=tipEl.offsetWidth,th=tipEl.offsetHeight;tipEl.style.left=clamp(r.left-ar.left+r.width/2-tw/2,8,ar.width-tw-8)+'px';tipEl.style.top=Math.max(8,r.top-ar.top-th-8)+'px'});el.addEventListener('pointerleave',()=>tipEl.hidden=true)}
// Capacités à venir du boss ciblé : minuteurs (secondes) puis seuils de PV, les plus proches d'abord.
const mmss=s=>s>=60?`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`:`${s} s`;
function renderUpcoming(up){
  const box=$('#tup');
  if(!up||!up.length){box.hidden=true;return}
  const list=[...up.filter(a=>a.t!=null).sort((a,b)=>a.t-b.t),...up.filter(a=>a.pct!=null).sort((a,b)=>b.pct-a.pct)];
  box.hidden=false;
  box.innerHTML=list.map(a=>`<span class="${a.t!=null&&a.t<=3?'soon':''}">${esc(a.n)} ${a.t!=null?mmss(a.t):'à '+a.pct+' %'}</span>`).join('');
}
export function updTarget(){
  const t=targetEnt(),f=$('#tframe');
  if(!t||(t.kind==='mob'&&!t.alive)){f.hidden=true;return}
  f.hidden=false;const un=$('#tun');
  if(t.kind==='mob'){un.className='uname hostile';$('#tname').textContent=t.d.n;$('#tlvl').textContent=t.d.boss?`Boss ${t.l}`:t.l;$('#tsub').textContent=t.d.boss?(t.d.dg?'Élite · Gardien de donjon':'Élite · Boss de zone'):t.elite?`Élite · ${AFFIXES[t.affix]}`:t.d.dg?'Hostile · Donjon':'Hostile';$('#thpw').className='bar hp'}
  else if(t.kind==='npc'){un.className='uname npcn';$('#tname').textContent=t.n;$('#tlvl').textContent='PNJ';$('#tsub').textContent=t.ti;$('#thpw').className='bar npc'}
  else if(t.kind==='obj'){un.className='uname npcn';$('#tname').textContent=t.n;$('#tlvl').textContent='Objet';$('#tsub').textContent=t.type==='chest'?'Contient des artéfacts':'Portail';$('#thpw').className='bar npc'}
  else if(t.kind==='player'){un.className='uname friendly';$('#tname').textContent=t.n;$('#tlvl').textContent=t.lvl;$('#tsub').textContent=`${t.g?`<${t.g}> · `:''}${CLASSES[t.cls]?CLASSES[t.cls].nom:'Chouffin'} · Joueur${t.dead?' · Mort':''}`;$('#thpw').className='bar hp'}
  else{un.className='uname friendly';$('#tname').textContent=t.n;$('#tlvl').textContent=t.lvl;$('#tsub').textContent=t.g?`<${t.g}> · Chouffin`:'Chouffin · Sans guilde';$('#thpw').className='bar npc'}
}
const miniC=$('#mini'),mctx=miniC.getContext('2d'),mapbox=$('#mapbox');
const SELLERS=new Set([...Object.keys(STOCK),...Object.values(MOUNTS).map(m=>m.seller)]);
const npcCol=n=>{const q=QUESTS[S.q.i];return q&&q.g===n.id&&S.q.st!=='active'?'#ffd84a':n.dungeon?'#ff4fd8':SELLERS.has(n.id)?'#4ad8ff':n.look==='sign'?'#d8d0b8':'#7be37b'};
function wrapText(txt,max){const lines=[];for(const wd of txt.split(' ')){const l=lines.length?lines[lines.length-1]+' '+wd:wd;if(lines.length&&mctx.measureText(l).width<=max)lines[lines.length-1]=l;else lines.push(wd)}return lines}
let zoneLbl=[];
export function setMini(){miniC.width=WD.w*MINI_S;miniC.height=WD.h*MINI_S;zoneLbl=WD.id==='over'?zoneLabels(WD).map(l=>({...l,n:ZONES[l.z].n})):[]}
miniC.onclick=()=>mapbox.classList.toggle('big');
// Infobulle native sur le PNJ le plus proche du curseur (carte agrandie surtout).
miniC.onmousemove=e=>{
  const r=miniC.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*WD.w,y=(e.clientY-r.top)/r.height*WD.h;
  const n=WD.npcs.find(n=>Math.hypot(n.x-x,n.y-y)<2);miniC.title=n?`${n.n} · ${n.ti}`:'';
};
export function hud(t){
  const st=stats(S,P.drunk);
  $('#php').style.width=clamp(S.hp/st.maxhp*100,0,100)+'%';$('#phpt').textContent=`${Math.ceil(S.hp)} / ${st.maxhp}`;
  $('#pcaf').style.width=clamp(S.caf/st.maxcaf*100,0,100)+'%';$('#pcaft').textContent=`Caféine ${Math.floor(S.caf)} / ${st.maxcaf}`;
  $('#plvl').textContent=S.lvl;$('#pname').textContent=S.name;
  const ratio=S.hp/st.maxhp;$('#vig').className=P.dead?'':ratio<.15?'crit':ratio<.3?'low':'';
  renderParty();
  $('#buffs').innerHTML=(P.drunk>0?`<span>Pompette ${Math.ceil(P.drunk)} s</span>`:'')+Object.entries(P.buffs||{}).map(([id,t])=>`<span>${esc(SKILL_DEFS[id].n)} ${Math.ceil(t)} s</span>`).join('');
  $('#deadbar').hidden=!(P.dead&&$('#dlg').hidden);
  const need=xpNeed(S.lvl);$('#xp i').style.width=(S.lvl>=MAXLVL?100:S.xp/need*100)+'%';$('#xp span').textContent=S.lvl>=MAXLVL?'Niveau maximum. Il est temps de sortir.':`XP ${fmt(S.xp)} / ${fmt(need)}`;
  const tg=targetEnt();
  if(tg&&!$('#tframe').hidden){if(tg.kind==='mob'){if(!tg.alive){updTarget()}else{$('#thp').style.width=(tg.hp/tg.mhp*100)+'%';$('#thpt').textContent=`${Math.ceil(tg.hp)} / ${tg.mhp}${tg.shield>0?` (+${tg.shield} bouclier)`:''}`;const cw=$('#tcastw');if(tg.cast>0){cw.hidden=false;$('#tcast').style.width=((1-tg.cast/tg.castMax)*100)+'%';$('#tcastt').textContent=tg.castN+(tg.castI?' · interruptible':'')}else cw.hidden=true;const gw=$('#tgaugew');if(tg.gaugeN){gw.hidden=false;$('#tgauge').style.width=(tg.gauge*100)+'%';$('#tgaugett').textContent=`${tg.gaugeN} ${Math.round(tg.gauge*100)} %`}else gw.hidden=true;renderUpcoming(tg.up)}}else if(tg.kind==='player'){$('#thp').style.width=clamp(tg.hp/tg.mhp*100,0,100)+'%';$('#thpt').textContent=`${tg.hp} / ${tg.mhp}`;$('#tcastw').hidden=true}else{$('#thp').style.width='100%';$('#thpt').textContent=tg.kind==='npc'?'Amical':tg.kind==='obj'?'Interagir':'Joueur';$('#tcastw').hidden=true}}
  for(const e of skEls){const sk=e.sk,cd=P.cd[sk.id]||0,lock=S.lvl<sk.l;e.b.classList.toggle('locked',lock);e.b.classList.toggle('nores',!lock&&S.caf<sk.c);
    if(lock){e.cd.style.height='0';e.cdt.textContent='Niv '+sk.l}else if(cd>0){e.cd.style.height=(cd/sk.cd*100)+'%';e.cdt.textContent=cd>=1.5?Math.ceil(cd):''}else{e.cd.style.height='0';e.cdt.textContent=''}}
  const pc=P.cd.pot||0;
  for(const e of conEls){const n=count(e.id);e.cnt.textContent=n;e.b.classList.toggle('locked',n===0);if(pc>0){e.cd.style.height=(pc/6*100)+'%';e.cdt.textContent=pc>=1.5?Math.ceil(pc):''}else{e.cd.style.height='0';e.cdt.textContent=''}}
  const cb=$('#castbar');if(P.cast){cb.hidden=false;cb.querySelector('i').style.width=((1-P.cast.t/P.cast.max)*100)+'%';cb.querySelector('span').textContent=P.cast.n}else cb.hidden=true;
  mctx.imageSmoothingEnabled=false;if(WD.mini)mctx.drawImage(WD.mini,0,0);
  const dot=(x,y,c,r)=>{mctx.fillStyle=c;mctx.fillRect(x*MINI_S-r,y*MINI_S-r,r*2,r*2)};
  for(const m of WD.mobs)if(m.alive)dot(m.x,m.y,m.d.boss?'#ff8a3a':'#e2574c',m.d.boss?3.5:1.5);
  if(WD.id==='over'){for(const b of WD.bots)dot(b.x,b.y,'#7fb6ff',1.5);for(const n of NPCS)dot(n.x,n.y,npcCol(n),n.dungeon?3.5:2.5)}
  for(const o of WD.objs)dot(o.x,o.y,o.type==='chest'?'#f0d070':'#c9a8ff',3);
  mctx.strokeStyle='rgba(255,255,255,.6)';mctx.lineWidth=1;mctx.strokeRect(cam.x*MINI_S+.5,cam.y*MINI_S+.5,(W/TS)*MINI_S,(H/TS)*MINI_S);
  for(const pl of Object.values(world.players))if(pl.id!==me)dot(pl.P.x,pl.P.y,'#7fb6ff',2.5);
  dot(P.x,P.y,'#fff',2.5);
  if(mapbox.classList.contains('big')){mctx.font='bold 7px sans-serif';mctx.textAlign='center';mctx.lineWidth=2;mctx.strokeStyle='#000';mctx.fillStyle='#ffe9a8';
    mctx.textBaseline='middle';
    for(const z of zoneLbl){const ls=wrapText(z.n,Math.max(2*z.r*MINI_S,40));ls.forEach((l,i)=>{const y=(z.y+(i-(ls.length-1)/2)*2.6)*MINI_S,hw=mctx.measureText(l).width/2+1,x=clamp(z.x*MINI_S,hw,miniC.width-hw);mctx.strokeText(l,x,y);mctx.fillText(l,x,y)})}}
  const d=new Date();$('#clk').textContent=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  $('#pop').textContent=`${fmt(online.length)} en ligne`;
  if(WD.id!=='over'){const left=WD.mobs.filter(m=>m.alive&&!m.d.boss).length,boss=WD.mobs.some(m=>m.alive&&m.d.boss);const el=$('#dgleft');if(el)el.textContent=`Ennemis restants : ${left} · Boss : ${boss?'en vie':'vaincu'}`}
  if(!$('#char').hidden)renderCharStats();
}
const partyRow=m=>`<div class="frame pm${m.dead?' dead':''}"><div class="uname"><span>${esc(m.n)}</span><span class="lvl">${m.lvl}</span></div><div class="bar hp"><i style="width:${clamp(m.hp/m.mhp*100,0,100)}%"></i><span>${m.hp} / ${m.mhp}</span></div></div>`;
function renderParty(){$('#party').innerHTML=(P.crew||[]).map(partyRow).join('')}
export function renderQuest(){
  const q=QUESTS[S.q.i],el=$('#qbody');let h='';
  if(WD.id!=='over'){const df=DIFFS[WD.ti];h+=`<div class="dgbox"><b>${DUNGEONS[WD.dg].n} · ${df.n}</b><span class="obj" id="dgleft"></span><br><button class="btn alt" type="button" id="dgquit">Quitter le donjon</button></div>`}
  if(!q)h+=`<div><b>Aucune quête</b><span class="hint">Toutes les quêtes sont terminées. Farmez les Archives en Sans Douche, ou sortez dehors. Ce n'est pas une quête.</span></div>`;
  else{const giver=npcById(q.g),obj=q.dg!=null?`${DUNGEONS[q.dgn||'archives'].n} en ${DIFFS[q.dg].n} ou plus`:`${MOBS[q.m].n}`;
    if(S.q.st==='avail')h+=`<div><b>${esc(q.n)}</b><span class="hint">Parlez à ${esc(giver.n)} (!) · niveau ${q.rl}</span></div>`;
    else if(S.q.st==='active')h+=`<div><b>${esc(q.n)}</b><span class="obj">${esc(obj)} : ${S.q.n}/${q.k}</span></div>`;
    else h+=`<div><b>${esc(q.n)}</b><span class="obj done">${esc(obj)} : ${q.k}/${q.k}</span><br><span class="hint">Retournez voir ${esc(giver.n)} (?)</span></div>`}
  el.innerHTML=h;
  const b=$('#dgquit');if(b)b.onclick=openPortal;
}
document.querySelectorAll('#tabs button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x===b));logEl.dataset.f=b.dataset.f;logEl.scrollTop=logEl.scrollHeight}));
export function drawPortrait(){const c=$('#portrait'),g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;drawChouffin(g,52,198,176,{...playerLook(S),face:1})}
