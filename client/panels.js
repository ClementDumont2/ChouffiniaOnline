import {DEATH,DIFFS,ITEMS,MOBS,QUESTS,RN,SHOP,SLOTS} from '../shared/data.js';
import {cmpInfo,dist,npcById,stats,statsWith} from '../shared/rules.js';
import {$,esc,fmt,pick} from './util.js';
import {iconCanvas} from './sprites.js';
import {buildBar,itemLink,tipEl,tipOn} from './hud.js';
import {ACTIONS,helpHTML,keyOf,label,rebind,resetKeys} from './keys.js';
import {P,S,WD,me,send} from './state.js';

let dlgNpc=null,dlgRedo=null,trade=null;
let selItem=-1,selId=null;
const PANELS={bag:()=>renderBag(),char:()=>renderChar(),opts:()=>renderOpts()};
export function togglePanel(id){const p=$('#'+id);if(p.hidden){for(const o in PANELS)if(o!==id)$('#'+o).hidden=true;p.hidden=false;PANELS[id]()}else{p.hidden=true;waiting=null}tipEl.hidden=true}
export function closePanel(id){if(id==='opts')waiting=null;if(id==='dlg'){if(dlgLocked)return;if(trade)send({a:'tradeCancel'});dlgNpc=null;$('#dlg').classList.remove('wide')}$('#'+id).hidden=true}
function nearMerchant(){return WD.id==='over'&&['gerard','bernard','tavernier'].some(id=>dist(P,npcById(id))<3.5)}
function sellValue(s){return ITEMS[s.id].price*s.n}
export function renderBag(){
  if($('#bag').hidden)return;
  if(selItem>=0&&(!S.inv[selItem]||S.inv[selItem].id!==selId))selItem=-1;
  $('#goldv').textContent=`${fmt(S.gold)} po`;
  const g=$('#bagGrid');g.innerHTML='';
  for(let i=0;i<24;i++){const s=S.inv[i];const b=document.createElement('button');b.type='button';b.className='slot'+(s?' q-'+ITEMS[s.id].r:'')+(i===selItem?' sel':'');
    if(s){b.appendChild(iconCanvas(s.id,64));if(ITEMS[s.id].t==='eq'&&cmpInfo(S,s.id).better)b.insertAdjacentHTML('beforeend','<span class="upb">▲</span>');if(s.n>1)b.insertAdjacentHTML('beforeend',`<span class="n">${s.n}</span>`);b.setAttribute('aria-label',ITEMS[s.id].n);b.addEventListener('click',()=>{selItem=i;selId=s.id;renderBag()});b.addEventListener('dblclick',()=>{const it=ITEMS[s.id];if(it.t==='eq')send({a:'equip',idx:i});else if(it.t==='use')send({a:'useItem',id:s.id})})}
    else b.disabled=true;
    g.appendChild(b)}
  const det=$('#bagDet');const s=S.inv[selItem];
  if(!s){det.innerHTML=`<span class="ty">Touchez un objet pour l'examiner. Double-clic pour l'utiliser ou l'équiper. Les artéfacts se revendent chez Gérard.</span>`;return}
  const it=ITEMS[s.id],nm=nearMerchant(),v=sellValue(s);
  det.innerHTML=itemHTML(s.id,s.n)+`<div class="acts">${it.t==='eq'?'<button class="btn" id="a1">Équiper</button>':it.t==='use'?`<button class="btn" id="a1">${s.id==='chouffe'?'Boire':'Manger'}</button>`:''}<button class="btn alt" id="a3" ${nm?'':'disabled'}>${nm?`Vendre (${fmt(v)} po)`:'Vendre (près d\'un marchand)'}</button><button class="btn alt" id="a2">Jeter</button></div>`;
  const a1=$('#a1');if(a1)a1.onclick=()=>it.t==='eq'?send({a:'equip',idx:selItem}):send({a:'useItem',id:s.id});
  $('#a3').onclick=()=>{if(nearMerchant())send({a:'sell',idx:selItem})};
  $('#a2').onclick=()=>send({a:'drop',idx:selItem});
}
function statLine(it){const sts=[];if(it.atk)sts.push(`+${it.atk} Attaque`);if(it.arm)sts.push(`+${it.arm} Protection`);if(it.hp)sts.push(`+${it.hp} PV`);if(it.pct)sts.push(`Rend ${Math.round(it.pct*100)} % des PV`);return sts.join(' · ')}
function deltaLine(id){
  const c=cmpInfo(S,id);if(!c)return'';if(c.same)return'<span class="eqd">Équipé actuellement</span>';
  const parts=c.rows.filter(r=>r.d).map(r=>r.d>0?`<span class="up">▲ +${r.d} ${r.sh}</span>`:`<span class="down">▼ −${-r.d} ${r.sh}</span>`);
  return`<span class="vs">${c.cur?'vs '+esc(c.cur.n):'Emplacement vide'} :</span> ${parts.length?parts.join(' · '):'<span class="eqd">aucun changement</span>'}`;
}
function compareHTML(id){
  const c=cmpInfo(S,id);if(!c)return'';
  const now=stats(S,P.drunk),after=statsWith(S,c.it.s,id,P.drunk);
  const ar=(a,b,suf)=>{suf=suf||'';return a===b?`${a}${suf}`:`${a}${suf} → <b class="${b>a?'up':'down'}">${b}${suf}</b>`};
  const red=s=>Math.round(s.red*100);
  return`<div class="cmp"><div class="cmph"><span>Comparé à : ${c.cur?`<b class="q-${c.cur.r}">${esc(c.cur.n)}</b>`:'<i>emplacement vide</i>'}</span><span class="verdict ${c.cls}">${c.v}</span></div>`+
    `<div class="tw"><table><thead><tr><th></th><th>Équipé</th><th>Celui-ci</th><th>Écart</th></tr></thead><tbody>${c.rows.map(r=>`<tr><th>${r.l}</th><td>${r.a}</td><td>${r.b}</td><td class="${r.d>0?'up':r.d<0?'down':'eqd'}">${r.d>0?'▲ +'+r.d:r.d<0?'▼ −'+(-r.d):'='}</td></tr>`).join('')}</tbody></table></div>`+
    (c.same?'':`<div class="cmpt">Si vous l'équipez : Attaque ${ar(now.atk,after.atk)} · Protection ${ar(now.arm,after.arm)} · Réduction des dégâts ${ar(red(now),red(after),' %')} · PV max ${ar(now.maxhp,after.maxhp)}</div>`)+
    (S.lvl<(c.it.rl||1)?`<div class="down">Niveau ${c.it.rl} requis pour l'équiper (vous êtes niveau ${S.lvl}).</div>`:'')+`</div>`;
}
function itemHTML(id,n){const it=ITEMS[id];const sl=statLine(it);
  const ty=it.t==='eq'?SLOTS[it.s]:it.t==='use'?'Consommable':it.t==='art'?'Artéfact · se revend chez Gérard':'Bric-à-brac';
  return`<div class="nm q-${it.r}">${esc(it.n)}${n>1?` ×${n}`:''}</div><div class="ty">${ty} · ${RN[it.r]}${it.rl>1?` · <span style="color:${S.lvl<it.rl?'var(--bad)':'inherit'}">Niveau ${it.rl} requis</span>`:''}</div>${sl?`<div class="stt">${sl}</div>`:''}${it.t==='eq'?compareHTML(id):''}<div class="fl">« ${esc(it.d)} »</div><div class="pr">Revente : ${it.price} po${n>1?` (×${n} = ${fmt(it.price*n)} po)`:''}</div>`}
export function renderChar(){
  if($('#char').hidden)return;
  $('#cname').textContent=S.name;$('#csub').textContent=`Niveau ${S.lvl} · Chouffin · <Sous-Sol Éternel>`;
  const l=$('#eqlist');l.innerHTML='';
  for(const k in SLOTS){const id=S.eq[k];const b=document.createElement('button');b.type='button';b.className='eqrow';
    if(id){b.appendChild(iconCanvas(id,64));b.insertAdjacentHTML('beforeend',`<span class="in"><span class="sl">${SLOTS[k]} · ${statLine(ITEMS[id])} · toucher pour retirer</span><span class="q-${ITEMS[id].r}">${esc(ITEMS[id].n)}</span></span>`);b.onclick=()=>send({a:'unequip',slot:k});tipOn(b,()=>itemHTML(id,1))}
    else{const c=document.createElement('canvas');c.width=c.height=8;b.appendChild(c);b.insertAdjacentHTML('beforeend',`<span class="in"><span class="sl">${SLOTS[k]}</span><span style="color:var(--muted);font-weight:400;font-style:italic">Vide · Bernard en vend au Bourg-Forum</span></span>`);b.disabled=true}
    l.appendChild(b)}
  renderCharStats();
}
export function renderCharStats(){
  const st=stats(S,P.drunk),dig=Math.max(0,100-S.tips),days=6+Math.floor(S.played/60);
  const rows=[['Points de vie',`${Math.ceil(S.hp)} / ${st.maxhp}`],['Caféine',`${Math.floor(S.caf)} / ${st.maxcaf}`],['Attaque',`${st.atk}${P.drunk>0?' <small>(Pompette +15 %)</small>':''}`],['Protection',`${st.arm} <small>(−${Math.round(st.red*100)} % de dégâts subis)</small>`],['Dignité',`${dig} % <small>${dig===0?'(épuisée)':'(−1 par M\'lady)'}</small>`],['Charisme',`${S.eq.tete==='fedora'?2:3} <small>${S.eq.tete==='fedora'?'(−1 fedora)':'(plafonné)'}</small>`],['Herbe touchée','0 <small>(frappée : '+S.herbe+')</small>'],['Dernière douche',`il y a ${days} jours`],['Chouffes bues',fmt(S.chouffes||0)],['Archives terminées',fmt(S.dg||0)],['Ennemis vaincus',fmt(S.kills)],['Morts',S.deaths],['Or',`${fmt(S.gold)} po`]];
  $('#cstats').innerHTML=rows.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('');
}
let dlgLocked=false;
export function dialog(title,sub,html,btns,locked,npc){
  dlgLocked=!!locked;dlgNpc=npc||null;dlgRedo=null;$('#dlgT').textContent=title;$('#dlgSub').textContent=sub||'';const body=$('#dlgBody');body.innerHTML='';if(typeof html==='string')body.innerHTML=html;else body.appendChild(html);
  const a=$('#dlgActs');a.innerHTML='';
  for(const [lbl,fn,alt,dis] of btns){const b=document.createElement('button');b.className='btn'+(alt?' alt':'');b.type='button';b.textContent=lbl;b.disabled=!!dis;b.onclick=fn;a.appendChild(b)}
  $('#dlg').classList.remove('wide');$('#dlg').hidden=false;$('#bag').hidden=true;$('#char').hidden=true;$('#opts').hidden=true;tipEl.hidden=true;
}
function questBlock(n){
  const q=QUESTS[S.q.i];if(!q||q.g!==n.id)return{html:'',btns:[]};
  const rw=`<p class="rw">Récompense : ${fmt(q.xp)} XP · ${q.gold} po${q.item?' · '+(q.itemN?q.itemN+' × ':'')+itemLink(q.item):''}</p>`;
  const obj=q.dg!=null?`terminer les Archives Oubliées en difficulté ${DIFFS[q.dg].n} ou supérieure`:`vaincre ${q.k} × ${esc(MOBS[q.m].n)}`;
  if(S.q.st==='avail')return{html:`<div class="qt">${esc(q.n)}</div><p>${esc(q.t)}</p><p class="rw">Objectif : ${obj} · Niveau recommandé : ${q.rl}</p>${rw}`,btns:[['Accepter la quête',()=>{closePanel('dlg');send({a:'acceptQuest'})}]]};
  if(S.q.st==='active')return{html:`<div class="qt">${esc(q.n)}</div><p>Alors ? Objectif : ${obj}. Progression : ${S.q.n}/${q.k}. Je ne juge pas. Enfin si, un peu.</p>`,btns:[]};
  return{html:`<div class="qt">${esc(q.n)}</div><p>${esc(q.done)}</p>${rw}`,btns:[['Terminer la quête',()=>{closePanel('dlg');send({a:'completeQuest'})}]]};
}
export function openNpc(n){send({a:'talk',id:n.id});showNpc(n)}
// Séparé d'openNpc : le rafraîchissement après une action rappelle showNpc, et un 'talk' à chaque rafraîchissement bouclerait.
function showNpc(n){
  const qb=questBlock(n);let html=`<p class="greet">« ${esc(n.greet)} »</p>`+qb.html;const btns=[...qb.btns];
  if(n.id==='gerard'){
    const arts=S.inv.filter(s=>ITEMS[s.id].t==='art'),av=arts.reduce((a,s)=>a+sellValue(s),0),jv=S.inv.filter(s=>ITEMS[s.id].t==='junk').reduce((a,s)=>a+sellValue(s),0);
    if(arts.length)html+=`<p class="rw">Artéfacts dans votre sac : ${arts.map(s=>itemLink(s.id)+(s.n>1?' ×'+s.n:'')).join(', ')}.</p>`;
    btns.push([`Vendre tous les artéfacts (${fmt(av)} po)`,()=>send({a:'sellAll',kind:'art'}),false,!av]);
    btns.push([`Vendre le bric-à-brac (${jv} po)`,()=>send({a:'sellAll',kind:'junk'}),true,!jv]);
    btns.push(['Acheter des Chips au Fromage Orange (5 po)',()=>send({a:'buy',id:'chips',n:1}),true,S.gold<5]);
  }
  if(n.id==='tavernier'){
    btns.push(['Acheter une Chouffe (12 po)',()=>send({a:'buy',id:'chouffe',n:1}),false,S.gold<12]);
    btns.push(['Acheter 5 Chouffes (55 po, le prix du khey)',()=>send({a:'buy',id:'chouffe',n:5}),true,S.gold<55]);
  }
  if(n.id==='bernard'){btns.unshift(["Voir l'armurerie",()=>openShop(n)])}
  if(n.id==='gardien'){btns.unshift(['Descendre dans les Archives',()=>openDungeonMenu(n)])}
  btns.push(['Au revoir',()=>closePanel('dlg'),true]);
  dialog(n.n,n.ti,html,btns,false,n);
  dlgRedo=()=>showNpc(n);
}
let shopSel=null,shopUp=false;
function openShop(n){
  const sc=$('#dlg').hidden?0:$('#dlg').scrollTop;
  const wrap=document.createElement('div');
  wrap.innerHTML=`<p class="greet">« Tout est garanti 30 jours. Ou 30 minutes. Je ne me souviens plus. »</p><div class="shopbar"><span class="goldv">Votre or : ${fmt(S.gold)} po</span><label class="chk"><input type="checkbox" id="shopUp" ${shopUp?'checked':''}> Améliorations seulement</label></div><p class="ty">Chaque objet est comparé à ce que vous portez. Touchez une ligne pour le détail.</p>`;
  for(const [cat,ids] of [['Armes · augmentent l\'Attaque',SHOP.armes],['Armures · augmentent la Protection',SHOP.armures]]){
    const box=document.createElement('div');box.className='shop';box.innerHTML=`<h4>${cat}</h4>`;let shown=0;
    for(const id of ids){const it=ITEMS[id],c=cmpInfo(S,id),own=S.eq[it.s]===id||S.inv.some(s=>s.id===id),lv=S.lvl<it.rl,short=it.buy-S.gold;
      if(shopUp&&!(c.cls==='up'||(c.cls==='mix'&&c.net>0)))continue;shown++;
      const row=document.createElement('div');row.className='srow q-'+it.r+(own?' own':'')+(shopSel===id?' sel':'');row.tabIndex=0;row.setAttribute('role','button');row.setAttribute('aria-expanded',shopSel===id?'true':'false');
      const ic=document.createElement('span');ic.className='ic';ic.appendChild(iconCanvas(id,64));if(c.better)ic.insertAdjacentHTML('beforeend','<span class="upb" title="Amélioration">▲</span>');row.appendChild(ic);
      row.insertAdjacentHTML('beforeend',`<div class="in"><b class="q-${it.r}">${esc(it.n)}</b><small>${SLOTS[it.s]} · niveau ${it.rl} · ${statLine(it)}${own?' · déjà possédé':''}</small><span class="dl">${deltaLine(id)}</span>${!lv&&short>0?`<small class="down">Il vous manque ${fmt(short)} po</small>`:''}</div>`);
      const b=document.createElement('button');b.className='btn';b.type='button';b.textContent=lv?`Niv ${it.rl}`:`${fmt(it.buy)} po`;b.disabled=lv||S.gold<it.buy;
      b.onclick=e=>{e.stopPropagation();if(S.gold>=it.buy)send({a:'buy',id,n:1})};
      const toggle=()=>{shopSel=shopSel===id?null:id;openShop(n)};
      row.onclick=toggle;row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}};
      row.appendChild(b);box.appendChild(row);
      if(shopSel===id){const d=document.createElement('div');d.className='sdet';d.innerHTML=compareHTML(id)+`<div class="fl">« ${esc(it.d)} »</div>`;box.appendChild(d)}
    }
    if(!shown)box.insertAdjacentHTML('beforeend','<p class="ty">Rien de mieux ici pour vous. Bernard est vexé.</p>');
    wrap.appendChild(box)}
  dialog('Armurerie de Bernard',"Armes et armures de convention · Un achat s'équipe tout seul s'il est meilleur",wrap,[['Retour',()=>{shopSel=null;showNpc(n)},true]],false,n);
  dlgRedo=()=>openShop(n);
  $('#dlg').classList.add('wide');$('#dlg').scrollTop=sc;
  $('#shopUp').onchange=e=>{shopUp=e.target.checked;openShop(n)};
}
function openDungeonMenu(n){
  const wrap=document.createElement('div');
  wrap.innerHTML=`<p>Les Archives se réorganisent à chaque descente. Au fond attend <b>le Grand Archiviste</b> et son coffre d'artéfacts. Plus la difficulté est haute, plus les artéfacts sont rares et chers.</p><p class="rw">Astuce : quand il prépare un Mur de Texte, sortez de la zone rouge. Les ennemis des Archives attaquent en groupe.</p>`;
  const box=document.createElement('div');box.className='diff';
  const g=P.group,follower=g&&g.leader!==me;
  if(g)wrap.insertAdjacentHTML('beforeend',`<p class="rw">${follower?'Seul le chef de groupe peut lancer les Archives.':'Tous les membres présents au Bourg-Forum descendent avec vous. Chaque joueur en plus renforce les ennemis de 60 % de PV.'}</p>`);
  DIFFS.forEach((df,i)=>{const b=document.createElement('button');b.type='button';b.className='dbtn';b.disabled=follower||S.lvl<df.rl;
    const rar=Object.keys(df.w).map(k=>RN[k]).join(', ');
    b.innerHTML=`<b>${df.n}</b><span>${esc(df.sub)} · Artéfacts : ${rar}</span><em>Niveau ${df.rl}+<br>Ennemis niv. ${df.L}</em>`;b.onclick=()=>{closePanel('dlg');send({a:'enterDungeon',ti:i})};box.appendChild(b)});
  wrap.appendChild(box);
  dialog('Les Archives Oubliées','Donjon instancié · 4 difficultés',wrap,[['Retour',()=>showNpc(n),true]],false,n);
}
export function unlockDlg(){dlgLocked=false;$('#dlg').hidden=true}
export function autoCloseDlg(){if(dlgNpc&&!$('#dlg').hidden&&dist(P,dlgNpc)>3.2)closePanel('dlg')}
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.close;if(id==='dlg'&&dlgLocked){send({a:'respawn'});return}closePanel(id)}));
export function refreshDialog(){if(dlgRedo&&!dlgLocked&&!$('#dlg').hidden)dlgRedo()}
export function openPortal(){
  dialog('Sortie des Archives','Les Archives Oubliées',`<p>${WD.done?'Le butin est à vous. Gérard rachète tous les artéfacts au Bourg-Forum.':'Vous partez déjà ? Les Archives ne sont pas terminées. Vous ne pourrez pas reprendre cette exploration.'}</p>`,[['Remonter au Bourg-Forum',()=>{closePanel('dlg');send({a:'leaveDungeon'})}],['Rester',()=>closePanel('dlg'),true]]);
}
export function showChest(e){
  const df=DIFFS[e.ti];
  dialog('Coffre des Archives',`Difficulté ${df.n}`,`<div class="loot">${e.got.map(id=>`<div>${itemLink(id)} <span class="ty">· ${RN[ITEMS[id].r]} · revente ${ITEMS[id].price} po</span></div>`).join('')}<div class="goldv">+ ${e.gold} po${e.extra?` · 2 × ${itemLink('chouffe')}`:''}</div></div><p class="rw">Un portail de sortie vient d'apparaître. Gérard rachète les artéfacts au Bourg-Forum.</p>`,[['Fermer',()=>closePanel('dlg')]]);
}
export function showDeath(){
  const inDg=WD.id!=='over';
  dialog('Vous êtes mort',inDg?'Esprit errant · Archives Oubliées':'Esprit errant · Sous-sol le plus proche : 1',`<p>${esc(pick(DEATH))}</p><p class="rw">Morts au total : ${S.deaths}. Aucune perte d'objet. La perte de dignité, elle, est permanente.</p>`,inDg?[["Réapparaître à l'entrée des Archives",()=>send({a:'respawn'})],['Abandonner et remonter au Bourg',()=>{send({a:'respawn'});send({a:'leaveDungeon'})},true]]:[['Réapparaître au Sous-Sol',()=>send({a:'respawn'})]],true);
}
export function showEnd(){
  dialog('Chouffinia est sauvée','Fin de la campagne · Le farm continue',`<p>Vous avez terminé Chouffinia Online.</p><p class="rw">Temps de jeu : ${Math.round(S.played/60)} min · Ennemis vaincus : ${fmt(S.kills)} · M'lady prononcés : ${fmt(S.tips)} · Chouffes bues : ${fmt(S.chouffes||0)} · Douches prises : 0.</p><p>Il reste la difficulté Sans Douche des Archives, au niveau 13. Par pitié le khey, vas-y.</p>`,[['Continuer à farmer',()=>closePanel('dlg')]]);
}

// Fenêtre d'échange : l'état vient entièrement du serveur ({with, mine, theirs}) ; chaque clic renvoie l'offre complète.
export function showTrade(e){
  if(e.end){if(trade){trade=null;if($('#dlgT').textContent==='Échange')unlockDlg()}return}
  const first=!trade;trade=e;
  const sendOffer=(items,gold)=>send({a:'tradeOffer',items,gold});
  const left=id=>S.inv.filter(s=>s.id===id).reduce((a,s)=>a+s.n,0)-(e.mine.items.find(x=>x.id===id)||{n:0}).n;
  const list=(side,mine)=>side.items.map(x=>`<button type="button" class="trl" ${mine?`data-rm="${x.id}"`:'disabled'}>${itemLink(x.id)} ×${x.n}</button>`).join('')||'<span class="ty">Rien pour l\'instant.</span>';
  const wrap=document.createElement('div');
  wrap.innerHTML=`<div class="trade"><div><h4>Vous proposez</h4>${list(e.mine,true)}<label class="chk">Or : <input type="number" id="trGold" min="0" max="${S.gold}" value="${e.mine.gold}"> po</label><div class="${e.mine.ok?'up':'ty'}">${e.mine.ok?'✔ Validé':'Pas encore validé'}</div></div>`+
    `<div><h4>${esc(e.with)} propose</h4>${list(e.theirs,false)}<div class="goldv">${fmt(e.theirs.gold)} po</div><div class="${e.theirs.ok?'up':'ty'}">${e.theirs.ok?'✔ Validé':'Pas encore validé'}</div></div></div>`+
    `<h4>Votre sac (toucher pour ajouter 1)</h4><div class="trbag">${[...new Set(S.inv.map(s=>s.id))].filter(id=>left(id)>0).map(id=>`<button type="button" class="trl" data-add="${id}">${itemLink(id)} ×${left(id)}</button>`).join('')||'<span class="ty">Sac vide.</span>'}</div>`;
  wrap.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const id=b.dataset.add,it=e.mine.items.map(x=>({...x})),x=it.find(y=>y.id===id);x?x.n++:it.push({id,n:1});sendOffer(it,e.mine.gold)});
  wrap.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{const id=b.dataset.rm,it=e.mine.items.map(x=>({...x})).map(x=>x.id===id?{...x,n:x.n-1}:x).filter(x=>x.n>0);sendOffer(it,e.mine.gold)});
  wrap.querySelector('#trGold').onchange=ev=>sendOffer(e.mine.items,Math.max(0,Math.min(S.gold,Math.floor(+ev.target.value)||0)));
  const sc=first||$('#dlg').hidden?0:$('#dlg').scrollTop;
  dialog('Échange',`Avec ${e.with} · Les deux doivent valider ; modifier une offre annule les validations`,wrap,[[e.mine.ok?'Validé ✔':'Valider',()=>send({a:'tradeOk'}),false,e.mine.ok],['Annuler',()=>closePanel('dlg'),true]]);
  dlgRedo=null;$('#dlg').classList.add('wide');$('#dlg').scrollTop=sc;
}

// Réglage des touches : « Changer » arme `waiting`, et la prochaine touche (écoutée en phase de capture) devient la nouvelle liaison.
let waiting=null;
export function refreshKeyLabels(){buildBar();$('#help').innerHTML=helpHTML()}
export function renderOpts(){
  if($('#opts').hidden)return;
  const body=$('#optsBody');body.innerHTML='';
  for(const [id,lbl] of ACTIONS){
    body.insertAdjacentHTML('beforeend',`<span>${lbl}</span><kbd>${waiting===id?'…':esc(label(keyOf(id)))}</kbd>`);
    const b=document.createElement('button');b.type='button';b.className='btn alt';b.textContent=waiting===id?'Appuyez…':'Changer';
    b.onclick=()=>{waiting=id;renderOpts()};body.appendChild(b);
  }
}
addEventListener('keydown',e=>{
  if(!waiting)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(e.code!=='Escape'){rebind(waiting,e.code);refreshKeyLabels()}
  waiting=null;renderOpts();
},true);
$('#optsReset').onclick=()=>{resetKeys();waiting=null;renderOpts();refreshKeyLabels()};
