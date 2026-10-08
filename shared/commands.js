import {COMMANDS} from './data/commands.js';
import {hasRight} from './rules.js';

export const findCommand=name=>{name=String(name).toLowerCase();return COMMANDS.find(c=>c.nom===name||c.alias.includes(name))};
// pl : tout objet portant S (joueur de la sim, ou {S} côté client).
export const canUse=(pl,c)=>!c.droit||hasRight(pl,c.droit);
export const visibleCommands=pl=>COMMANDS.filter(c=>canUse(pl,c));

const usage=c=>'/'+c.nom+c.args.map(a=>` <${a}>`).join('');
// Propositions d'autocomplétion pour le texte en cours de saisie : {fill, label, desc}.
export function suggest(text,pl,online=[]){
  if(!text.startsWith('/'))return[];
  const parts=text.slice(1).split(' ');
  if(parts.length===1){
    const w=parts[0].toLowerCase();
    return visibleCommands(pl).filter(c=>[c.nom,...c.alias].some(n=>n.startsWith(w))).map(c=>({fill:'/'+c.nom+(c.args.length?' ':''),label:usage(c),desc:c.description}));
  }
  const c=findCommand(parts[0]);
  if(!c||!canUse(pl,c))return[];
  const i=parts.length-2,cur=parts[i+1];
  if(c.args[i]!=='joueur')return[];
  return online.filter(n=>n.toLowerCase().startsWith(cur.toLowerCase())).slice(0,8).map(n=>({fill:text.slice(0,text.length-cur.length)+n+(i+1<c.args.length?' ':''),label:n,desc:''}));
}
