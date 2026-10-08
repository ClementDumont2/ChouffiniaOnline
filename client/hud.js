import {DIFFS,ITEMS,MAXLVL,MOBS,NPCS,QUESTS,SKILLS} from '../shared/data.js';
import {clamp,npcById,stats,xpNeed} from '../shared/rules.js';
import {$,esc,fmt} from './util.js';
import {drawChouffin,iconCanvas,playerLook} from './sprites.js';
import {H,MINI_S,TS,W,cam} from './render.js';
import {openPortal,renderCharStats,togglePanel} from './panels.js';
import {P,S,WD,me,send,targetEnt,world} from './state.js';

const count=id=>{const s=S.inv.find(s=>s.id===id);return s?s.n:0};

const logEl=$('#log');
export function chat(cls,html){const stick=logEl.scrollTop+logEl.clientHeight>=logEl.scrollHeight-24;const d=document.createElement('div');d.className='m '+cls;d.innerHTML=html;logEl.appendChild(d);while(logEl.children.length>140)logEl.firstChild.remove();if(stick)logEl.scrollTop=logEl.scrollHeight}
export const itemLink=id=>{const it=ITEMS[id];return`<span class="q-${it.r}">[${esc(it.n)}]</span>`};
// Balisage des textes de la sim : **gras**, [[id_objet]], [[up]] (voir shared/sim.js).
export const fmtMsg=t=>esc(t).replace(/\[\[up\]\]/g,' <span class="up">▲ amélioration</span>').replace(/\[\[(\w+)\]\]/g,(m,id)=>itemLink(id)).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
let errTO=0;
export function err(msg){const e=$('#err');e.textContent=msg;e.classList.add('on');clearTimeout(errTO);errTO=setTimeout(()=>e.classList.remove('on'),2200)}
export function toast(kicker,title,sub){const d=document.createElement('div');d.className='toast frame';d.innerHTML=`<small>${esc(kicker)}</small><b>${esc(title)}</b>${sub?`<span>${esc(sub)}</span>`:''}`;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),5100)}
export function banner(title,sub,cls){const b=$('#banner');b.className='hud '+(cls||'');b.querySelector('b').textContent=title;b.querySelector('span').textContent=sub||'';void b.offsetWidth;b.classList.add('show')}
const skEls=[];let conEls=[];
export function buildBar(){
  const bar=$('#bar');bar.innerHTML='';skEls.length=0;conEls=[];
  SKILLS.forEach((sk,i)=>{const b=document.createElement('button');b.className='sk';b.type='button';b.setAttribute('aria-label',sk.n);b.appendChild(iconCanvas(sk.id,64));b.insertAdjacentHTML('beforeend',`<span class="cd"></span><span class="cdt"></span><span class="k">${i+1}</span>`);
    b.addEventListener('click',()=>send({a:'skill',i}));tipOn(b,()=>`<b>${esc(sk.n)}</b><div class="c">${sk.c?sk.c+' Caféine · ':''}${sk.self?'Soi-même':'Portée '+sk.rg+' cases'} · Recharge ${String(sk.cd).replace('.',',')} s${S.lvl<sk.l?` · <span style="color:var(--bad)">Niveau ${sk.l} requis</span>`:''}</div><p>${esc(sk.d)}</p>`);
    bar.appendChild(b);skEls.push({b,cd:b.querySelector('.cd'),cdt:b.querySelector('.cdt'),sk})});
  bar.insertAdjacentHTML('beforeend','<span class="sep"></span>');
  [['chouffe',6],['chips',7]].forEach(([id,k])=>{const b=document.createElement('button');b.className='sk';b.type='button';b.setAttribute('aria-label',ITEMS[id].n);b.appendChild(iconCanvas(id,64));b.insertAdjacentHTML('beforeend',`<span class="cd"></span><span class="cdt"></span><span class="k">${k}</span><span class="cnt"></span>`);b.addEventListener('click',()=>send({a:'useItem',id}));tipOn(b,()=>`<b>${esc(ITEMS[id].n)}</b><div class="c">Consommable · ${count(id)} dans le sac · Recharge partagée 6 s</div><p>${esc(ITEMS[id].d)}</p>`);bar.appendChild(b);conEls.push({b,id,cd:b.querySelector('.cd'),cdt:b.querySelector('.cdt'),cnt:b.querySelector('.cnt')})});
  bar.insertAdjacentHTML('beforeend','<span class="sep"></span>');
  for(const [id,lbl,fn] of [['bag','Sac',()=>togglePanel('bag')],['char','Perso',()=>togglePanel('char')]]){const b=document.createElement('button');b.className='sk menu';b.type='button';b.setAttribute('aria-label',lbl);b.appendChild(iconCanvas(id,64));b.insertAdjacentHTML('beforeend',`<span class="lbl">${lbl}</span><span class="k">${id==='bag'?'I':'C'}</span>`);b.addEventListener('click',fn);bar.appendChild(b)}
}
export const tipEl=$('#tip');
export function tipOn(el,fn){el.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse')return;tipEl.innerHTML=fn();tipEl.hidden=false;const r=el.getBoundingClientRect(),ar=$('#app').getBoundingClientRect();const tw=tipEl.offsetWidth,th=tipEl.offsetHeight;tipEl.style.left=clamp(r.left-ar.left+r.width/2-tw/2,8,ar.width-tw-8)+'px';tipEl.style.top=Math.max(8,r.top-ar.top-th-8)+'px'});el.addEventListener('pointerleave',()=>tipEl.hidden=true)}
export function updTarget(){
  const t=targetEnt(),f=$('#tframe');
  if(!t||(t.kind==='mob'&&!t.alive)){f.hidden=true;return}
  f.hidden=false;const un=$('#tun');
  if(t.kind==='mob'){un.className='uname hostile';$('#tname').textContent=t.d.n;$('#tlvl').textContent=t.d.boss?`Boss ${t.l}`:t.l;$('#tsub').textContent=t.d.boss?'Élite · Gardien de donjon':t.d.dg?'Hostile · Archives':'Hostile';$('#thpw').className='bar hp'}
  else if(t.kind==='npc'){un.className='uname npcn';$('#tname').textContent=t.n;$('#tlvl').textContent='PNJ';$('#tsub').textContent=t.ti;$('#thpw').className='bar npc'}
  else if(t.kind==='obj'){un.className='uname npcn';$('#tname').textContent=t.n;$('#tlvl').textContent='Objet';$('#tsub').textContent=t.type==='chest'?'Contient des artéfacts':'Portail';$('#thpw').className='bar npc'}
  else{un.className='uname friendly';$('#tname').textContent=t.n;$('#tlvl').textContent=t.lvl;$('#tsub').textContent=t.g?`<${t.g}> · Chouffin`:'Chouffin · Sans guilde';$('#thpw').className='bar npc'}
}
const miniC=$('#mini'),mctx=miniC.getContext('2d');
export function setMini(){miniC.width=WD.w*MINI_S;miniC.height=WD.h*MINI_S}
export function hud(t){
  const st=stats(S,P.drunk);
  $('#php').style.width=clamp(S.hp/st.maxhp*100,0,100)+'%';$('#phpt').textContent=`${Math.ceil(S.hp)} / ${st.maxhp}`;
  $('#pcaf').style.width=clamp(S.caf/st.maxcaf*100,0,100)+'%';$('#pcaft').textContent=`Caféine ${Math.floor(S.caf)} / ${st.maxcaf}`;
  $('#plvl').textContent=S.lvl;$('#pname').textContent=S.name+(P.group&&P.group.leader===me?' ★':'');
  const ratio=S.hp/st.maxhp;$('#vig').className=P.dead?'':ratio<.15?'crit':ratio<.3?'low':'';
  renderParty();
  $('#buffs').innerHTML=P.drunk>0?`<span>Pompette ${Math.ceil(P.drunk)} s</span>`:'';
  const need=xpNeed(S.lvl);$('#xp i').style.width=(S.lvl>=MAXLVL?100:S.xp/need*100)+'%';$('#xp span').textContent=S.lvl>=MAXLVL?'Niveau maximum. Il est temps de sortir.':`XP ${fmt(S.xp)} / ${fmt(need)}`;
  const tg=targetEnt();
  if(tg&&!$('#tframe').hidden){if(tg.kind==='mob'){if(!tg.alive){updTarget()}else{$('#thp').style.width=(tg.hp/tg.mhp*100)+'%';$('#thpt').textContent=`${Math.ceil(tg.hp)} / ${tg.mhp}`;const cw=$('#tcastw');if(tg.cast>0){cw.hidden=false;$('#tcast').style.width=((1-tg.cast/tg.castMax)*100)+'%';$('#tcastt').textContent=tg.d.aoe.n}else cw.hidden=true}}else{$('#thp').style.width='100%';$('#thpt').textContent=tg.kind==='npc'?'Amical':tg.kind==='obj'?'Interagir':'Joueur';$('#tcastw').hidden=true}}
  for(const e of skEls){const sk=e.sk,cd=P.cd[sk.id]||0,lock=S.lvl<sk.l;e.b.classList.toggle('locked',lock);e.b.classList.toggle('nores',!lock&&S.caf<sk.c);
    if(lock){e.cd.style.height='0';e.cdt.textContent='Niv '+sk.l}else if(cd>0){e.cd.style.height=(cd/sk.cd*100)+'%';e.cdt.textContent=cd>=1.5?Math.ceil(cd):''}else{e.cd.style.height='0';e.cdt.textContent=''}}
  const pc=P.cd.pot||0;
  for(const e of conEls){const n=count(e.id);e.cnt.textContent=n;e.b.classList.toggle('locked',n===0);if(pc>0){e.cd.style.height=(pc/6*100)+'%';e.cdt.textContent=pc>=1.5?Math.ceil(pc):''}else{e.cd.style.height='0';e.cdt.textContent=''}}
  const cb=$('#castbar');if(P.cast){cb.hidden=false;cb.querySelector('i').style.width=((1-P.cast.t/P.cast.max)*100)+'%';cb.querySelector('span').textContent=P.cast.n}else cb.hidden=true;
  mctx.imageSmoothingEnabled=false;if(WD.mini)mctx.drawImage(WD.mini,0,0);
  const dot=(x,y,c,r)=>{mctx.fillStyle=c;mctx.fillRect(x*MINI_S-r,y*MINI_S-r,r*2,r*2)};
  for(const m of WD.mobs)if(m.alive)dot(m.x,m.y,m.d.boss?'#ff8a3a':'#e2574c',m.d.boss?3.5:1.5);
  if(WD.id==='over'){for(const b of WD.bots)dot(b.x,b.y,'#7fb6ff',1.5);for(const n of NPCS){const q=QUESTS[S.q.i];dot(n.x,n.y,q&&q.g===n.id&&S.q.st!=='active'?'#ffd84a':'#7be37b',2.5)}}
  for(const o of WD.objs)dot(o.x,o.y,o.type==='chest'?'#f0d070':'#c9a8ff',3);
  mctx.strokeStyle='rgba(255,255,255,.6)';mctx.lineWidth=1;mctx.strokeRect(cam.x*MINI_S+.5,cam.y*MINI_S+.5,(W/TS)*MINI_S,(H/TS)*MINI_S);
  for(const pl of Object.values(world.players))if(pl.id!==me)dot(pl.P.x,pl.P.y,'#7fb6ff',2.5);
  dot(P.x,P.y,'#fff',2.5);
  const d=new Date();$('#clk').textContent=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  $('#pop').textContent=`${fmt(1247+Math.round(Math.sin(t/40)*23))} en ligne`;
  if(WD.id!=='over'){const left=WD.mobs.filter(m=>m.alive&&!m.d.boss).length,boss=WD.mobs.some(m=>m.alive&&m.d.boss);const el=$('#dgleft');if(el)el.textContent=`Ennemis restants : ${left} · Boss : ${boss?'en vie':'vaincu'}`}
  if(!$('#char').hidden)renderCharStats();
}
const partyRow=(m,leader)=>`<div class="frame pm${m.dead?' dead':''}"><div class="uname"><span>${esc(m.n)}${m.id===leader?' ★':''}</span><span class="lvl">${m.lvl}</span></div><div class="bar hp"><i style="width:${clamp(m.hp/m.mhp*100,0,100)}%"></i><span>${m.hp} / ${m.mhp}</span></div></div>`;
function renderParty(){const g=P.group;$('#party').innerHTML=g?g.members.map(m=>partyRow(m,g.leader)).join(''):''}
export function renderQuest(){
  const q=QUESTS[S.q.i],el=$('#qbody');let h='';
  if(WD.id!=='over'){const df=DIFFS[WD.ti];h+=`<div class="dgbox"><b>Archives Oubliées · ${df.n}</b><span class="obj" id="dgleft"></span><br><button class="btn alt" type="button" id="dgquit">Quitter le donjon</button></div>`}
  if(!q)h+=`<div><b>Aucune quête</b><span class="hint">Toutes les quêtes sont terminées. Farmez les Archives en Sans Douche, ou sortez dehors. Ce n'est pas une quête.</span></div>`;
  else{const giver=npcById(q.g),obj=q.dg!=null?`Archives en ${DIFFS[q.dg].n} ou plus`:`${MOBS[q.m].n}`;
    if(S.q.st==='avail')h+=`<div><b>${esc(q.n)}</b><span class="hint">Parlez à ${esc(giver.n)} (!) · niveau ${q.rl}</span></div>`;
    else if(S.q.st==='active')h+=`<div><b>${esc(q.n)}</b><span class="obj">${esc(obj)} : ${S.q.n}/${q.k}</span></div>`;
    else h+=`<div><b>${esc(q.n)}</b><span class="obj done">${esc(obj)} : ${q.k}/${q.k}</span><br><span class="hint">Retournez voir ${esc(giver.n)} (?)</span></div>`}
  el.innerHTML=h;
  const b=$('#dgquit');if(b)b.onclick=openPortal;
}
document.querySelectorAll('#tabs button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x===b));logEl.dataset.f=b.dataset.f;logEl.scrollTop=logEl.scrollHeight}));
export function drawPortrait(){const c=$('#portrait'),g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;drawChouffin(g,52,198,176,{...playerLook(S),face:1})}
