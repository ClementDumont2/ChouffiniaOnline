import {newSave} from '../shared/rules.js';
import {findEnt} from '../shared/sim.js';

// Vue client du monde : même forme que celle de la sim (maps, players) mais limitée à la carte du joueur, remplie par net.js.
export const world={maps:{},players:{}};
export let me=null,running=false,S=newSave();
// Avant la connexion, la caméra et l'écran de création ont besoin d'un joueur fantôme.
export let P={id:null,x:7.5,y:8.5,face:1,moving:false,step:0,tipT:0,target:null,auto:false,dead:false,cast:null,hgt:1.25,kind:'player',drunk:0,cd:{},mvT:0,group:null};
export let WD=null;
// Pseudos de tous les joueurs connectés (événement 'online'), pour l'autocomplétion.
export const online=[];

// Le transport est branché par net.js.
export const net={act(){},move(){},chat(){}};
export const send=a=>net.act(a);
export const sendMove=(x,y,face)=>net.move(x,y,face);
export const sendChat=t=>net.chat(t);

export function setMap(map){world.maps={[map.id]:map};WD=map;for(const pl of Object.values(world.players))pl.mapId=map.id}
export function bind(id,save){
  me=id;S=save;running=true;
  P={id,n:save.name,x:7.5,y:8.5,face:1,moving:false,step:0,tipT:0,target:null,auto:false,dead:false,cast:null,hgt:1.25,kind:'player',drunk:0,say:'',sayT:0,cd:{},mvT:0,group:null};
  world.players={[id]:{id,S,P,mapId:WD?WD.id:'over'}};
}
export function setS(s){S=s;world.players[me].S=s}
export const targetEnt=()=>P.target&&WD?findEnt(world,WD.id,P.target):null;
