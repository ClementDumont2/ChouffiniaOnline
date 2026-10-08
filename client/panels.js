import {DEATH,DIFFS,DUNGEONS,ITEMS,MOBS,QUESTS,RN,SHOP,SLOTS,STOCK} from '../shared/data.js';
// Difficulté d'un donjon : DIFFS surchargé par les niveaux propres au donjon (même règle que le serveur).
const dgDiffs=id=>DIFFS.map((d,i)=>({...d,...((DUNGEONS[id].diffs||[])[i])}));
import {FUSE_PER_LEVEL,cmpInfo,classOf,dist,fuse,fuseCost,itemStats,itemValue,newItem,npcById,stats,statsWith} from '../shared/rules.js';
import {CLASSES,CLASS_COST} from '../shared/data/classes.js';
import {$,esc,fmt,pick} from './util.js';
import {iconCanvas} from './sprites.js';
import {buildBar,itemLink,tipEl,tipOn} from './hud.js';
import {MOUNTS} from '../shared/data/mounts.js';
import {getSound,setSound} from './sound.js';
import {ACTIONS,helpHTML,keyOf,label,rebind,resetKeys} from './keys.js';
import {P,S,WD,send} from './state.js';

let dlgNpc=null,dlgRedo=null,trade=null;
let selItem=-1,selId=null;
const PANELS={bag:()=>renderBag(),char:()=>renderChar(),opts:()=>renderOpts()};
export function togglePanel(id){const p=$('#'+id);if(p.hidden){for(const o in PANELS)if(o!==id)$('#'+o).hidden=true;p.hidden=false;PANELS[id]()}else{p.hidden=true;waiting=null}tipEl.hidden=true}
export function closePanel(id){if(id==='opts')waiting=null;if(id==='dlg'){if(dlgLocked)return;if(trade)send({a:'tradeCancel'});dlgNpc=null;$('#dlg').classList.remove('wide')}$('#'+id).hidden=true}
function nearMerchant(){return WD.id==='over'&&['gerard','bernard','tavernier'].some(id=>dist(P,npcById(id))<3.5)}
function sellValue(s){return s.uid?itemValue(s):ITEMS[s.id].price*s.n}
const rar=q=>q.rarete||ITEMS[q.id].r;
const keyOfItem=q=>q.uid||q.id;
export function renderBag(){
  if($('#bag').hidden)return;
  if(selItem>=0&&(!S.inv[selItem]||keyOfItem(S.inv[selItem])!==selId))selItem=-1;
  $('#goldv').textContent=`${fmt(S.gold)} po`;
  const g=$('#bagGrid');g.innerHTML='';
  for(let i=0;i<24;i++){const s=S.inv[i];const b=document.createElement('button');b.type='button';b.className='slot'+(s?' q-'+rar(s):'')+(i===selItem?' sel':'');
    if(s){b.appendChild(iconCanvas(s.id,64));if(s.uid&&cmpInfo(S,s).better)b.insertAdjacentHTML('beforeend','<span class="upb">▲</span>');const cnt=s.uid?s.nObj:s.n>1?s.n:'';if(cnt)b.insertAdjacentHTML('beforeend',`<span class="n">${cnt}</span>`);b.setAttribute('aria-label',ITEMS[s.id].n);b.addEventListener('click',()=>{selItem=i;selId=keyOfItem(s);renderBag()});b.addEventListener('dblclick',()=>{const it=ITEMS[s.id];if(it.t==='eq')send({a:'equip',idx:i});else if(it.t==='use')send({a:'useItem',id:s.id})})}
    else b.disabled=true;
    g.appendChild(b)}
  const det=$('#bagDet');const s=S.inv[selItem];
  if(!s){det.innerHTML=`<span class="ty">Touchez un objet pour l'examiner. Double-clic pour l'utiliser ou l'équiper. Les artéfacts se revendent chez Gérard.</span>`;return}
  const it=ITEMS[s.id],nm=nearMerchant(),v=sellValue(s);
  det.innerHTML=itemHTML(s)+`<div class="acts">${it.t==='eq'?'<button class="btn" id="a1">Équiper</button>':it.t==='use'?`<button class="btn" id="a1">${s.id==='chouffe'?'Boire':'Manger'}</button>`:''}<button class="btn alt" id="a3" ${nm?'':'disabled'}>${nm?`Vendre (${fmt(v)} po)`:'Vendre (près d\'un marchand)'}</button><button class="btn alt" id="a2">Jeter</button></div>`;
  const a1=$('#a1');if(a1)a1.onclick=()=>it.t==='eq'?send({a:'equip',idx:selItem}):send({a:'useItem',id:s.id});
  $('#a3').onclick=()=>{if(nearMerchant())send({a:'sell',idx:selItem})};
  $('#a2').onclick=()=>send({a:'drop',idx:selItem});
}
// q : instance d'équipement (stats mises à l'échelle) ou pile ; l'entrée de ITEMS seule (aperçu boutique) passe par newItem.
function statLine(q){const it=ITEMS[q.id],v=it.t==='eq'?itemStats(q):it,sts=[];if(v.atk)sts.push(`+${v.atk} Attaque`);if(v.arm)sts.push(`+${v.arm} Protection`);if(v.hp)sts.push(`+${v.hp} PV`);if(it.pct)sts.push(`Rend ${Math.round(it.pct*100)} % des PV`);return sts.join(' · ')}
function deltaLine(q){
  const c=cmpInfo(S,q);if(!c)return'';if(c.same)return'<span class="eqd">Équipé actuellement</span>';
  const parts=c.rows.filter(r=>r.d).map(r=>r.d>0?`<span class="up">▲ +${r.d} ${r.sh}</span>`:`<span class="down">▼ −${-r.d} ${r.sh}</span>`);
  return`<span class="vs">${c.cur?'vs '+esc(c.curIt.n):'Emplacement vide'} :</span> ${parts.length?parts.join(' · '):'<span class="eqd">aucun changement</span>'}`;
}
function compareHTML(q){
  const c=cmpInfo(S,q);if(!c)return'';
  const now=stats(S,P.drunk),after=statsWith(S,c.it.s,q,P.drunk);
  const ar=(a,b,suf)=>{suf=suf||'';return a===b?`${a}${suf}`:`${a}${suf} → <b class="${b>a?'up':'down'}">${b}${suf}</b>`};
  const red=s=>Math.round(s.red*100);
  return`<div class="cmp"><div class="cmph"><span>Comparé à : ${c.cur?`<b class="q-${c.cur.rarete}">${esc(c.curIt.n)}</b> <small>niv. ${c.cur.nObj}</small>`:'<i>emplacement vide</i>'}</span><span class="verdict ${c.cls}">${c.v}</span></div>`+
    `<div class="tw"><table><thead><tr><th></th><th>Équipé</th><th>Celui-ci</th><th>Écart</th></tr></thead><tbody>${c.rows.map(r=>`<tr><th>${r.l}</th><td>${r.a}</td><td>${r.b}</td><td class="${r.d>0?'up':r.d<0?'down':'eqd'}">${r.d>0?'▲ +'+r.d:r.d<0?'▼ −'+(-r.d):'='}</td></tr>`).join('')}</tbody></table></div>`+
    (c.same?'':`<div class="cmpt">Si vous l'équipez : Attaque ${ar(now.atk,after.atk)} · Protection ${ar(now.arm,after.arm)} · Réduction des dégâts ${ar(red(now),red(after),' %')} · PV max ${ar(now.maxhp,after.maxhp)}</div>`)+
    (S.lvl<(c.it.rl||1)?`<div class="down">Niveau ${c.it.rl} requis pour l'équiper (vous êtes niveau ${S.lvl}).</div>`:'')+`</div>`;
}
function itemHTML(q){const it=ITEMS[q.id],n=q.uid?1:q.n||1,sl=statLine(q);
  const ty=it.t==='eq'?SLOTS[it.s]:it.t==='use'?'Consommable':it.t==='art'?'Artéfact · se revend chez Gérard':'Bric-à-brac';
  const price=it.t==='eq'?itemValue(q):it.price;
  return`<div class="nm q-${rar(q)}">${esc(it.n)}${n>1?` ×${n}`:''}</div><div class="ty">${ty} · ${RN[rar(q)]}${it.t==='eq'?` · Niveau d'objet ${q.nObj}`:''}${it.rl>1?` · <span style="color:${S.lvl<it.rl?'var(--bad)':'inherit'}">Niveau ${it.rl} requis</span>`:''}</div>${sl?`<div class="stt">${sl}</div>`:''}${it.t==='eq'?compareHTML(q):''}<div class="fl">« ${esc(it.d)} »</div><div class="pr">Revente : ${fmt(price)} po${n>1?` (×${n} = ${fmt(price*n)} po)`:''}</div>`}
let charTab='eq';
document.querySelectorAll('#ctabs button').forEach(b=>b.onclick=()=>{charTab=b.dataset.tab;renderChar()});
function renderMounts(){
  const box=$('#mntlist');box.innerHTML='';
  for(const [id,m] of Object.entries(MOUNTS)){
    const own=S.mounts.includes(id),sel=S.mount===id,row=document.createElement('div');
    row.className='mrow'+(own?'':' off');
    row.innerHTML=`<b class="q-${m.r}">${esc(m.n)}</b>`;
    const b=document.createElement('button');b.type='button';b.className='btn'+(sel?'':' alt');
    b.textContent=own?(sel?'Choisie':'Choisir'):'Non possédée';b.disabled=!own||sel;b.onclick=()=>send({a:'selectMount',id});row.appendChild(b);
    row.insertAdjacentHTML('beforeend',`<small>+${Math.round(m.speed*100)} % de vitesse${own?'':' · '+(m.seller?`Kévin, Bourg-Forum · niveau ${m.rl} · ${fmt(m.price)} po`:'Battre Maman 10 fois')}</small>`);
    box.appendChild(row);
  }
  box.insertAdjacentHTML('beforeend',`<p class="ty">${esc(keyLabelHint())} pour monter (1 s immobile). On descend en attaquant, en prenant un coup ou en entrant en donjon.</p>`);
}
const keyLabelHint=()=>`Touche ${label(keyOf('mount'))}`;
export function renderChar(){
  if($('#char').hidden)return;
  $('#eqlist').hidden=$('#cstats').hidden=charTab!=='eq';$('#mntlist').hidden=charTab!=='mnt';
  document.querySelectorAll('#ctabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===charTab));
  if(charTab==='mnt'){$('#cname').textContent=S.name;$('#csub').textContent=`Niveau ${S.lvl} · ${classOf(S).nom}`;renderMounts();return}
  $('#cname').textContent=S.name;$('#csub').textContent=`Niveau ${S.lvl} · ${classOf(S).nom} · ${S.titre?`<${S.titre}>`:'<Sous-Sol Éternel>'}`;
  const l=$('#eqlist');l.innerHTML='';
  for(const k in SLOTS){const q=S.eq[k];const b=document.createElement('button');b.type='button';b.className='eqrow';
    if(q){const it=ITEMS[q.id];b.appendChild(iconCanvas(q.id,64));b.insertAdjacentHTML('beforeend',`<span class="in"><span class="sl">${SLOTS[k]} · niv. ${q.nObj} · ${statLine(q)} · toucher pour retirer</span><span class="q-${q.rarete}">${esc(it.n)}</span></span>`);b.onclick=()=>send({a:'unequip',slot:k});tipOn(b,()=>itemHTML(q))}
    else{const c=document.createElement('canvas');c.width=c.height=8;b.appendChild(c);b.insertAdjacentHTML('beforeend',`<span class="in"><span class="sl">${SLOTS[k]}</span><span style="color:var(--muted);font-weight:400;font-style:italic">Vide · Bernard en vend au Bourg-Forum</span></span>`);b.disabled=true}
    l.appendChild(b)}
  renderCharStats();
}
export function renderCharStats(){
  if(charTab!=='eq')return;
  const st=stats(S,P.drunk),dig=Math.max(0,100-S.tips),days=6+Math.floor(S.played/60);
  const rows=[['Points de vie',`${Math.ceil(S.hp)} / ${st.maxhp}`],['Caféine',`${Math.floor(S.caf)} / ${st.maxcaf}`],['Attaque',`${st.atk}${P.drunk>0?' <small>(Pompette +15 %)</small>':''}`],['Protection',`${st.arm} <small>(−${Math.round(st.red*100)} % de dégâts subis)</small>`],['Dignité',`${dig} % <small>${dig===0?'(épuisée)':'(−1 par M\'lady)'}</small>`],['Charisme',`${(S.eq.tete&&S.eq.tete.id)==='fedora'?2:3} <small>${(S.eq.tete&&S.eq.tete.id)==='fedora'?'(−1 fedora)':'(plafonné)'}</small>`],['Herbe touchée','0 <small>(frappée : '+S.herbe+')</small>'],['Dernière douche',`il y a ${days} jours`],['Chouffes bues',fmt(S.chouffes||0)],['Archives terminées',fmt(S.dg||0)],['Duels (victoires / défaites)',`${S.duelWins||0} / ${S.duelLosses||0}`],['Ennemis vaincus',fmt(S.kills)],['Morts',S.deaths],['Or',`${fmt(S.gold)} po`]];
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
  const obj=q.dg!=null?`terminer ${DUNGEONS[q.dgn||'archives'].n} en difficulté ${DIFFS[q.dg].n} ou supérieure`:`vaincre ${q.k} × ${esc(MOBS[q.m].n)}`;
  if(S.q.st==='avail')return{html:`<div class="qt">${esc(q.n)}</div><p>${esc(q.t)}</p><p class="rw">Objectif : ${obj} · Niveau recommandé : ${q.rl}</p>${rw}`,btns:[['Accepter la quête',()=>{closePanel('dlg');send({a:'acceptQuest'})}]]};
  if(S.q.st==='active')return{html:`<div class="qt">${esc(q.n)}</div><p>Alors ? Objectif : ${obj}. Progression : ${S.q.n}/${q.k}. Je ne juge pas. Enfin si, un peu.</p>`,btns:[]};
  return{html:`<div class="qt">${esc(q.n)}</div><p>${esc(q.done)}</p>${rw}`,btns:[['Terminer la quête',()=>{closePanel('dlg');send({a:'completeQuest'})}]]};
}
export function openNpc(n){send({a:'talk',id:n.id});showNpc(n)}
// Séparé d'openNpc : le rafraîchissement après une action rappelle showNpc, et un 'talk' à chaque rafraîchissement bouclerait.
function showNpc(n){
  const qb=questBlock(n);let html=`<p class="greet">« ${esc(n.greet)} »</p>`+n.lines.map(l=>`<p class="greet">« ${esc(l)} »</p>`).join('')+qb.html;const btns=[...qb.btns];
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
  if(n.dungeon)btns.unshift([`Entrer : ${DUNGEONS[n.dungeon].n}`,()=>openDungeonMenu(n)])
  if(n.id==='otaku'){
    for(const id of STOCK.otaku){
      const it=ITEMS[id];
      html+=`<p class="rw"><b class="q-${it.r}">${esc(it.n)}</b> · ${fmt(it.buy)} po<br><span class="ty">${esc(it.d)}</span></p>`;
      btns.push([`Acheter : ${it.n} (${fmt(it.buy)} po)`,()=>send({a:'buy',id,n:1}),true,S.gold<it.buy]);
    }
  }
  if(n.id==='kevin'){
    for(const [id,m] of Object.entries(MOUNTS).filter(([,m])=>m.seller==='kevin')){
      const own=S.mounts.includes(id);
      html+=`<p class="rw"><b class="q-${m.r}">${esc(m.n)}</b> · niveau ${m.rl} · ${fmt(m.price)} po<br><span class="ty">${esc(m.d)}</span></p>`;
      btns.push([own?`${m.n} (possédée)`:`Acheter : ${m.n} (${fmt(m.price)} po)`,()=>send({a:'buyMount',id}),false,own||S.lvl<m.rl||S.gold<m.price]);
    }
  }
  if(n.id==='fanfiqueuse'){btns.unshift(['Fusionner deux objets',()=>{fusSel=[];openFusion(n)}])}
  if(n.id==='conseiller'){btns.unshift(['Changer de classe',()=>openClassMenu(n)])}
  if(n.board)html+=board?board.map(([lbl,rows])=>`<h4>${esc(lbl)}</h4><ol class="board">${rows.map(([nm,v,g],i)=>`<li><span class="ty">${i+1}.</span><b>${esc(nm)}</b>${g?` <span class="ty">&lt;${esc(g)}&gt;</span>`:''}<span>${esc(v)}</span></li>`).join('')}</ol>`).join(''):'<p class="ty">Chargement du classement…</p>';
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
    for(const id of ids){const it=ITEMS[id],pv=newItem(id),c=cmpInfo(S,pv),own=(S.eq[it.s]&&S.eq[it.s].id===id)||S.inv.some(s=>s.id===id),lv=S.lvl<it.rl,short=it.buy-S.gold;
      if(shopUp&&!(c.cls==='up'||(c.cls==='mix'&&c.net>0)))continue;shown++;
      const row=document.createElement('div');row.className='srow q-'+it.r+(own?' own':'')+(shopSel===id?' sel':'');row.tabIndex=0;row.setAttribute('role','button');row.setAttribute('aria-expanded',shopSel===id?'true':'false');
      const ic=document.createElement('span');ic.className='ic';ic.appendChild(iconCanvas(id,64));if(c.better)ic.insertAdjacentHTML('beforeend','<span class="upb" title="Amélioration">▲</span>');row.appendChild(ic);
      row.insertAdjacentHTML('beforeend',`<div class="in"><b class="q-${it.r}">${esc(it.n)}</b><small>${SLOTS[it.s]} · niveau ${it.rl} · ${statLine(pv)}${own?' · déjà possédé':''}</small><span class="dl">${deltaLine(pv)}</span>${!lv&&short>0?`<small class="down">Il vous manque ${fmt(short)} po</small>`:''}</div>`);
      const b=document.createElement('button');b.className='btn';b.type='button';b.textContent=lv?`Niv ${it.rl}`:`${fmt(it.buy)} po`;b.disabled=lv||S.gold<it.buy;
      b.onclick=e=>{e.stopPropagation();if(S.gold>=it.buy)send({a:'buy',id,n:1})};
      const toggle=()=>{shopSel=shopSel===id?null:id;openShop(n)};
      row.onclick=toggle;row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}};
      row.appendChild(b);box.appendChild(row);
      if(shopSel===id){const d=document.createElement('div');d.className='sdet';d.innerHTML=compareHTML(pv)+`<div class="fl">« ${esc(it.d)} »</div>`;box.appendChild(d)}
    }
    if(!shown)box.insertAdjacentHTML('beforeend','<p class="ty">Rien de mieux ici pour vous. Bernard est vexé.</p>');
    wrap.appendChild(box)}
  dialog('Armurerie de Bernard',"Armes et armures de convention · Un achat s'équipe tout seul s'il est meilleur",wrap,[['Retour',()=>{shopSel=null;showNpc(n)},true]],false,n);
  dlgRedo=()=>openShop(n);
  $('#dlg').classList.add('wide');$('#dlg').scrollTop=sc;
  $('#shopUp').onchange=e=>{shopUp=e.target.checked;openShop(n)};
}
// Fusion : deux objets du sac, même emplacement. L'aperçu vient de fuse() (la même fonction que le serveur) et se compare à l'équipement porté ; le bouton final est la confirmation.
let fusSel=[];
function openFusion(n){
  fusSel=fusSel.filter(u=>S.inv.some(s=>s.uid===u));
  const pick=u=>S.inv.find(s=>s.uid===u),slot=fusSel.length?ITEMS[pick(fusSel[0]).id].s:null;
  const wrap=document.createElement('div');
  wrap.innerHTML=`<p class="rw">Deux objets du même emplacement dans votre sac. Même objet et même rareté : rareté +1 et niveau d'objet +2. Sinon : la meilleure base, la meilleure rareté et niveau d'objet +3. Les deux originaux sont détruits. Coût : ${FUSE_PER_LEVEL} po × niveau d'objet du résultat.</p>`;
  const box=document.createElement('div');box.className='trbag';
  for(const q of S.inv.filter(s=>s.uid)){
    const on=fusSel.includes(q.uid),b=document.createElement('button');b.type='button';b.className='trl'+(on?' sel':'');
    b.disabled=!on&&(fusSel.length>=2||(slot&&ITEMS[q.id].s!==slot));
    b.innerHTML=`${itemLink(q.id,q.rarete,q.nObj)} <small>${SLOTS[ITEMS[q.id].s]} · ${statLine(q)}</small>`;
    b.onclick=()=>{fusSel=on?fusSel.filter(u=>u!==q.uid):[...fusSel,q.uid];openFusion(n)};
    box.appendChild(b);
  }
  wrap.appendChild(box);
  const btns=[['Retour',()=>{fusSel=[];showNpc(n)},true]];
  if(fusSel.length===2){
    const r=fuse(pick(fusSel[0]),pick(fusSel[1])),cost=fuseCost(r);
    wrap.insertAdjacentHTML('beforeend',`<h4>Résultat de la fusion</h4>${itemHTML(r)}<p class="rw">Coût : ${fmt(cost)} po (vous avez ${fmt(S.gold)} po).</p>`);
    btns.unshift([`Confirmer la fusion (${fmt(cost)} po)`,()=>{send({a:'fuse',x:fusSel[0],y:fusSel[1]});fusSel=[]},false,S.gold<cost]);
  }
  dialog('La Fanfiqueuse','Fusion d\'équipement',wrap,btns,false,n);
  dlgRedo=()=>openFusion(n);
  $('#dlg').classList.add('wide');
}
function openClassMenu(n){
  const cost=CLASS_COST*S.lvl,wrap=document.createElement('div');
  wrap.innerHTML=`<p class="rw">Reconversion : ${fmt(cost)} po (${CLASS_COST} po × niveau ${S.lvl}). Niveau, équipement et quêtes conservés. Vous avez ${fmt(S.gold)} po.</p>`;
  const box=document.createElement('div');box.className='diff';
  for(const [id,c] of Object.entries(CLASSES)){
    const b=document.createElement('button');b.type='button';b.className='dbtn';b.disabled=id===S.cls||S.gold<cost;
    b.innerHTML=`<b>${esc(c.nom)}${id===S.cls?' (actuelle)':''}</b><span>${esc(c.desc)}</span>`;b.onclick=()=>confirmClass(n,id);box.appendChild(b);
  }
  wrap.appendChild(box);
  dialog("Le Conseiller d'Orientation",'Changement de classe',wrap,[['Retour',()=>showNpc(n),true]],false,n);
}
function confirmClass(n,id){
  const c=CLASSES[id],cost=CLASS_COST*S.lvl;
  dialog('Confirmer la reconversion',c.nom,`<p>Devenir <b>${esc(c.nom)}</b> pour ${fmt(cost)} po ? Vos compétences changent, pas votre niveau. Aucun remboursement : le Conseiller a déjà tout dépensé.</p><p class="rw">${esc(c.desc)}</p>`,[['Confirmer',()=>{closePanel('dlg');send({a:'changeClass',cls:id})}],['Retour',()=>openClassMenu(n),true]],false,n);
}
function openDungeonMenu(n){
  const dg=DUNGEONS[n.dungeon],wrap=document.createElement('div');
  wrap.innerHTML=`<p>${esc(dg.desc)} Plus la difficulté est haute, plus les artéfacts sont rares et chers.</p><p class="rw">Astuce : ${esc(dg.astuce)}</p>`;
  const box=document.createElement('div');box.className='diff';
  wrap.insertAdjacentHTML('beforeend','<p class="rw">Vous entrez seul. Une fois dedans, <b>/inviter &lt;pseudo&gt;</b> fait venir un ami (4 joueurs maximum) ; chaque joueur en plus renforce les ennemis de 60 % de PV.</p>');
  dgDiffs(n.dungeon).forEach((df,i)=>{const b=document.createElement('button');b.type='button';b.className='dbtn';b.disabled=S.lvl<df.rl;
    const rar=Object.keys(df.w).map(k=>RN[k]).join(', ');
    b.innerHTML=`<b>${df.n}</b><span>${esc(df.sub)} · Artéfacts : ${rar}</span><em>Niveau ${df.rl}+<br>Ennemis niv. ${df.L}</em>`;b.onclick=()=>{closePanel('dlg');send({a:'enterDungeon',ti:i,dg:n.dungeon})};box.appendChild(b)});
  wrap.appendChild(box);
  dialog(dg.n,'Donjon instancié · 4 difficultés',wrap,[['Retour',()=>showNpc(n),true]],false,n);
}
export function unlockDlg(){dlgLocked=false;$('#dlg').hidden=true}
export function autoCloseDlg(){if(dlgNpc&&!$('#dlg').hidden&&dist(P,dlgNpc)>3.2)closePanel('dlg')}
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.close;if(id==='dlg'&&dlgLocked){send({a:'respawn'});return}closePanel(id)}));
// Classement envoyé par le serveur quand on parle au Tableau d'Honneur.
let board=null;
export function setBoard(t){board=t;refreshDialog()}
export function refreshDialog(){if(dlgRedo&&!dlgLocked&&!$('#dlg').hidden)dlgRedo()}
export function openPortal(){
  dialog(DUNGEONS[WD.dg].sortie,DUNGEONS[WD.dg].n,`<p>${WD.done?'Le butin est à vous. Gérard rachète tous les artéfacts au Bourg-Forum.':`Vous partez déjà ? ${DUNGEONS[WD.dg].n} n'est pas terminé. Vous ne pourrez pas reprendre cette exploration.`}</p>`,[['Sortir du donjon',()=>{closePanel('dlg');send({a:'leaveDungeon'})}],['Rester',()=>closePanel('dlg'),true]]);
}
export function showChest(e){
  const df=DIFFS[e.ti];
  dialog(DUNGEONS[e.dg].coffre,`Difficulté ${df.n}`,`<div class="loot">${e.got.map(id=>`<div>${itemLink(id)} <span class="ty">· ${RN[ITEMS[id].r]} · revente ${ITEMS[id].price} po</span></div>`).join('')}<div class="goldv">+ ${e.gold} po${e.extra?` · 2 × ${itemLink('chouffe')}`:''}</div></div><p class="rw">Un portail de sortie vient d'apparaître. Gérard rachète les artéfacts au Bourg-Forum.</p>`,[['Fermer',()=>closePanel('dlg')]]);
}
export function showDeath(){
  const inDg=WD.id!=='over';
  dialog('Vous êtes mort',inDg?`Esprit errant · ${DUNGEONS[WD.dg].n}`:'Esprit errant · Sous-sol le plus proche : 1',`<p>${esc(pick(DEATH))}</p><p class="rw">Un Rôliste à proximité peut vous ressusciter avec un Joker MJ. Morts au total : ${S.deaths}. Aucune perte d'objet. La perte de dignité, elle, est permanente.</p>`,inDg?[["Réapparaître à l'entrée du donjon",()=>send({a:'respawn'})],['Attendre un Joker MJ',unlockDlg,true],['Abandonner et sortir du donjon',()=>{send({a:'respawn'});send({a:'leaveDungeon'})},true]]:[['Réapparaître au Sous-Sol',()=>send({a:'respawn'})],['Attendre un Joker MJ',unlockDlg,true]],true);
}
export function showEnd(final){
  if(final)return dialog('Diplômé (enfin)','Fin de la campagne · Le farm continue',`<p>Du Sous-Sol de Maman à la Soutenance : vous avez tout terminé.</p><p class="rw">Temps de jeu : ${Math.round(S.played/60)} min · Ennemis vaincus : ${fmt(S.kills)} · M'lady prononcés : ${fmt(S.tips)} · Chouffes bues : ${fmt(S.chouffes||0)} · Douches prises : 0.</p><p>Le Vieux Sage du Forum a lu votre dernier message. Il est ému. Il vous demande d'aller vous doucher, par pitié.</p>`,[['Continuer à farmer',()=>closePanel('dlg')]]);
  dialog('Chouffinia est sauvée','Fin de la campagne · Le farm continue',`<p>Vous avez terminé Chouffinia Online.</p><p class="rw">Temps de jeu : ${Math.round(S.played/60)} min · Ennemis vaincus : ${fmt(S.kills)} · M'lady prononcés : ${fmt(S.tips)} · Chouffes bues : ${fmt(S.chouffes||0)} · Douches prises : 0.</p><p>Il reste la difficulté Sans Douche des Archives, au niveau 13, puis un Parking, un Supermarché, un Pôle Emploi, une Convention, un DIIAGE. Par pitié le khey, vas-y.</p>`,[['Continuer à farmer',()=>closePanel('dlg')]]);
}

// Fenêtre d'échange : l'état vient entièrement du serveur ({with, mine, theirs}) ; chaque clic renvoie l'offre complète.
// Défi en duel : fenêtre Accepter/Refuser qui se referme toute seule quand l'invitation expire côté serveur.
export function showDuelInvite(e){
  dialog('Défi en duel',`De ${e.from}`,`<p><b>${esc(e.from)}</b> vous défie dans l'Arène du Débat Stérile. Dégâts réduits de moitié, personne ne meurt. Le perdant doit écrire « tu as raison ».</p><p class="rw">Expire dans ${e.ttl} s.</p>`,[['Accepter',()=>{closePanel('dlg');send({a:'duelReply',ok:true})}],['Refuser',()=>{closePanel('dlg');send({a:'duelReply',ok:false})},true]]);
  setTimeout(()=>{if($('#dlgT').textContent==='Défi en duel')closePanel('dlg')},e.ttl*1000);
}
export function showTrade(e){
  if(e.end){if(trade){trade=null;if($('#dlgT').textContent==='Échange')unlockDlg()}return}
  const first=!trade;trade=e;
  // L'offre est renvoyée en entier à chaque clic : instances par uid, piles par {id,n}.
  const wire=items=>items.map(x=>x.uid?{uid:x.uid}:{id:x.id,n:x.n});
  const sendOffer=(items,gold)=>send({a:'tradeOffer',items:wire(items),gold});
  const offered=new Set(e.mine.items.filter(x=>x.uid).map(x=>x.uid));
  const stackLeft=id=>S.inv.filter(s=>!s.uid&&s.id===id).reduce((a,s)=>a+s.n,0)-((e.mine.items.find(x=>!x.uid&&x.id===id)||{}).n||0);
  const label=x=>`${itemLink(x.id,x.rarete,x.nObj)}${x.uid?'':` ×${x.n}`}`;
  const list=(side,mine)=>side.items.map((x,i)=>`<button type="button" class="trl" ${mine?`data-rm="${i}"`:'disabled'}>${label(x)}</button>`).join('')||'<span class="ty">Rien pour l\'instant.</span>';
  const bag=[...S.inv.filter(s=>s.uid&&!offered.has(s.uid)).map(s=>`<button type="button" class="trl" data-adduid="${s.uid}">${label(s)}</button>`),
    ...[...new Set(S.inv.filter(s=>!s.uid).map(s=>s.id))].filter(id=>stackLeft(id)>0).map(id=>`<button type="button" class="trl" data-add="${id}">${itemLink(id)} ×${stackLeft(id)}</button>`)];
  const wrap=document.createElement('div');
  wrap.innerHTML=`<div class="trade"><div><h4>Vous proposez</h4>${list(e.mine,true)}<label class="chk">Or : <input type="number" id="trGold" min="0" max="${S.gold}" value="${e.mine.gold}"> po</label><div class="${e.mine.ok?'up':'ty'}">${e.mine.ok?'✔ Validé':'Pas encore validé'}</div></div>`+
    `<div><h4>${esc(e.with)} propose</h4>${list(e.theirs,false)}<div class="goldv">${fmt(e.theirs.gold)} po</div><div class="${e.theirs.ok?'up':'ty'}">${e.theirs.ok?'✔ Validé':'Pas encore validé'}</div></div></div>`+
    `<h4>Votre sac (toucher pour ajouter)</h4><div class="trbag">${bag.join('')||'<span class="ty">Sac vide.</span>'}</div>`;
  wrap.querySelectorAll('[data-adduid]').forEach(b=>b.onclick=()=>sendOffer([...e.mine.items,{uid:b.dataset.adduid}],e.mine.gold));
  wrap.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const id=b.dataset.add,it=e.mine.items.map(x=>({...x})),x=it.find(y=>!y.uid&&y.id===id);x?x.n++:it.push({id,n:1});sendOffer(it,e.mine.gold)});
  wrap.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.rm,it=e.mine.items.map(x=>({...x})),x=it[i];
    if(x.uid||x.n<=1)it.splice(i,1);else x.n--;
    sendOffer(it,e.mine.gold);
  });
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
  const snd=getSound();$('#optSnd').checked=snd.on;$('#optMus').checked=snd.music;$('#optVol').value=Math.round(snd.vol*100);
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
$('#optSnd').onchange=e=>setSound({on:e.target.checked});
$('#optVol').oninput=e=>setSound({vol:e.target.value/100});
$('#optMus').onchange=e=>setSound({music:e.target.checked});
$('#deadbtn').onclick=()=>send({a:'respawn'});
$('#optsReset').onclick=()=>{resetKeys();waiting=null;renderOpts();refreshKeyLabels()};
