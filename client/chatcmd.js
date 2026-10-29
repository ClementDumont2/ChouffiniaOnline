import {suggest} from '../shared/commands.js';
import {$,esc} from './util.js';
import {S,online} from './state.js';

const input=$('#chatin'),box=$('#cmdlist');
let items=[],sel=0;

function render(){
  box.hidden=!items.length;
  box.innerHTML=items.map((it,i)=>`<div class="ci${i===sel?' on':''}" data-i="${i}"><b>${esc(it.label)}</b>${it.desc?` <span>${esc(it.desc)}</span>`:''}</div>`).join('');
}
function refresh(){
  items=suggest(input.value,{S},online.filter(n=>n!==S.name));
  sel=Math.min(sel,Math.max(0,items.length-1));
  render();
}
const apply=it=>{input.value=it.fill;sel=0;refresh();input.focus()};

input.addEventListener('input',()=>{sel=0;refresh()});
input.addEventListener('blur',()=>{items=[];render()});
// mousedown plutôt que click : le blur du champ viendrait vider la liste avant le clic.
box.addEventListener('mousedown',e=>{e.preventDefault();const r=e.target.closest('.ci');if(r)apply(items[+r.dataset.i])});
input.addEventListener('keydown',e=>{
  if(!items.length)return;
  const n=items.length;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:n-1))%n;render()}
  // Entrée sur une commande déjà complète doit l'envoyer, sinon on ne pourrait jamais lancer « /qui ».
  else if(e.key==='Tab'||(e.key==='Enter'&&items[sel].fill.trimEnd()!==input.value.trimEnd())){e.preventDefault();apply(items[sel])}
  else if(e.key==='Escape'){e.stopPropagation();items=[];render()}
});
$('#chatf').addEventListener('submit',()=>{items=[];render()});
