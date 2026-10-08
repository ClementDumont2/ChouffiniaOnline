// Protocole réseau : JSON sur WebSocket, un message par trame.
//
// Client → serveur
//   {t:'join', name, hat, cls}     une seule fois par connexion (cls : classe, ignorée si la sauvegarde existe) ; le pseudo désigne la sauvegarde saves/<pseudo>.json
//   {t:'move', x, y, face}         ~10 fois/s ; refusé si mur ou vitesse > 5 cases/s (le serveur renvoie alors un 'tp')
//   {t:'act', a, ...args}          a = target, talk, skill, useItem, equip, unequip, drop, buy, sell, sellAll,
//                                  acceptQuest, completeQuest, enterDungeon, leaveDungeon, openChest, respawn,
//                                  mount (monter/descendre), selectMount {id}, buyMount {id}, changeClass {cls}, fuse {x,y} (uid de deux objets du sac),
//                                  tradeOffer {items:[{uid} | {id,n}], gold}, tradeOk, tradeCancel (échange ouvert par /echanger + /accepter)
//   {t:'chat', text}
//
// Serveur → client
//   {t:'welcome', id, seed, save}  réponse au join ; seed = graine de la carte du monde
//   {t:'refused', msg}             join refusé (pseudo déjà connecté) ; le serveur ferme ensuite la connexion
//   {t:'self', save}               état privé complet, envoyé seulement quand il change (avant 'ev' et 'snap')
//   {t:'ev', list}                 événements du joueur : msg, chat, emote, err, toast, banner, float, burst, puff, lvlup,
//                                  ach, died, respawned, tp, stop, approach, chest, campaignEnd, trade, online, announce (voir shared/sim.js)
//                                  announce = {who, text} : bannière dorée pour tous (/annonce, droit « annonce »).
//                                  online = {names} : pseudos de tous les connectés, à chaque arrivée/départ.
//                                  trade = {with, mine:{items,gold,ok}, theirs:{…}} à chaque changement, ou {end:true} à la fermeture
//   {t:'snap', world, tick, ents}  20×/s : world = {id, seed, ti, done} décrit la carte du joueur (le client régénère les
//                                  tuiles avec genOverworld/genDungeon) ; ents = entités de CETTE carte, champs de rendu seulement.
//                                  L'entrée du joueur destinataire porte en plus `priv` (hp, caf, cd, cast, target, auto, group).
import {HATS} from './data.js';
import {CLASSES} from './data/classes.js';
import {stats} from './rules.js';

export const cleanName=n=>String(n||'').trim().replace(/\s+/g,'_').replace(/[^\p{L}\p{N}_-]/gu,'').slice(0,16)||'Sire_Chouffin';
export const cleanCls=c=>CLASSES[c]?c:undefined;
export const cleanHat=h=>HATS.some(x=>x[0]===h)?h:undefined;

const r2=n=>Math.round(n*100)/100;
const mobRec=m=>({id:m.id,kind:'mob',type:m.type,l:m.l,x:r2(m.x),y:r2(m.y),hp:Math.round(m.hp),mhp:m.mhp,alive:m.alive,dieT:r2(m.dieT),st:m.st,stun:m.stun>0?1:0,cast:r2(m.cast),castMax:m.castMax,enr:m.enr,face:m.face,moving:m.moving,step:r2(m.step),ph:r2(m.ph),hgt:m.hgt,say:m.sayT>0?m.say:'',sayT:r2(Math.max(0,m.sayT))});
const objRec=(o,viewer)=>({id:o.id,kind:'obj',type:o.type,n:o.n,x:o.x,y:o.y,hgt:o.hgt,opened:!!o.openedBy&&o.openedBy.includes(viewer),exit:!!o.exit});
const botRec=b=>({id:b.id,kind:'bot',n:b.n,g:b.g,lvl:b.lvl,hat:b.hat,coat:b.coat,shirt:b.shirt,x:r2(b.x),y:r2(b.y),face:b.face,moving:b.moving,step:r2(b.step),tip:r2(Math.max(0,b.tip)),hgt:b.hgt,say:b.sayT>0?b.say:'',sayT:r2(Math.max(0,b.sayT))});
function groupRec(w,pl){
  const g=pl.group&&w.groups[pl.group];if(!g)return null;
  return{leader:g.leader,members:g.members.filter(id=>id!==pl.id).map(id=>{const p=w.players[id];return{id,n:p.S.name,lvl:p.S.lvl,hp:Math.round(p.S.hp),mhp:stats(p.S,p.P.drunk).maxhp,dead:p.P.dead}})};
}
function playerRec(w,pl,mine){
  const {S,P}=pl;
  const rec={id:pl.id,kind:'player',n:P.n,lvl:S.lvl,cls:S.cls,mount:P.mount,hp:Math.round(S.hp),mhp:stats(S,P.drunk).maxhp,look:{hat:S.hat,eq:Object.fromEntries(Object.entries(S.eq).map(([k,q])=>[k,q&&q.id]))},x:r2(P.x),y:r2(P.y),face:P.face,moving:P.moving,step:r2(P.step),tipT:r2(Math.max(0,P.tipT)),dead:P.dead,drunk:r2(Math.max(0,P.drunk)),hgt:P.hgt,say:P.sayT>0?P.say:'',sayT:r2(Math.max(0,P.sayT))};
  if(mine)rec.priv={hp:r2(S.hp),caf:r2(S.caf),buffs:P.buffs,cd:P.cd,cast:P.cast,target:P.target,auto:P.auto,group:groupRec(w,pl)};
  return rec;
}

export function snapshotFor(w,id){
  const pl=w.players[id],map=w.maps[pl.mapId],ents=[];
  for(const m of map.mobs)if(m.alive||m.dieT>0)ents.push(mobRec(m));
  for(const o of map.objs)ents.push(objRec(o,id));
  for(const b of map.bots)ents.push(botRec(b));
  for(const n of map.npcs)if(n.sayT>0)ents.push({id:n.id,kind:'npc',say:n.say,sayT:r2(n.sayT)});
  for(const p of Object.values(w.players))if(p.mapId===pl.mapId)ents.push(playerRec(w,p,p.id===id));
  return{t:'snap',world:{id:map.id,seed:map.seed,ti:map.ti,done:!!map.done},tick:w.tick,ents};
}
