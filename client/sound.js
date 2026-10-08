// Sons générés en Web Audio : aucun fichier audio dans le projet. Réglages par appareil (localStorage).
const STORE='chouffinia-son';
const cfg={on:true,vol:.6};
try{Object.assign(cfg,JSON.parse(localStorage.getItem(STORE)))}catch(e){}
export const getSound=()=>cfg;
export function setSound(patch){Object.assign(cfg,patch);try{localStorage.setItem(STORE,JSON.stringify(cfg))}catch(e){}}

let ctx=null,gain=null;
// Bruit blanc en boucle passé dans un filtre : on n'ouvre ou ferme que le volume, ce qui donne le grondement des roulettes sans cliquetis de démarrage.
function init(){
  if(ctx)return;
  try{
    ctx=new AudioContext();
    const buf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const src=ctx.createBufferSource(),f=ctx.createBiquadFilter();
    src.buffer=buf;src.loop=true;f.type='bandpass';f.frequency.value=650;f.Q.value=.9;
    gain=ctx.createGain();gain.gain.value=0;
    src.connect(f);f.connect(gain);gain.connect(ctx.destination);src.start();
  }catch(e){ctx=null}
}
// Appelé à chaque image : roulettes audibles tant que la chaise avance.
export function wheels(rolling){
  const on=rolling&&cfg.on&&cfg.vol>0;
  if(on)init();
  if(!ctx)return;
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  gain.gain.setTargetAtTime(on?cfg.vol*.3:0,ctx.currentTime,.05);
}
