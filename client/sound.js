// Sons générés en Web Audio : aucun fichier audio dans le projet. Réglages par appareil (localStorage).
const STORE='chouffinia-son';
const cfg={on:true,vol:.6,music:true};
try{Object.assign(cfg,JSON.parse(localStorage.getItem(STORE)))}catch(e){}
export const getSound=()=>cfg;
export function setSound(patch){Object.assign(cfg,patch);try{localStorage.setItem(STORE,JSON.stringify(cfg))}catch(e){}if(mus)mus.gain.setTargetAtTime(musicVol(),ctx.currentTime,.1)}

let ctx=null,gain=null,mus=null,fx=null;
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
    mus=ctx.createGain();mus.gain.value=musicVol();mus.connect(ctx.destination);
    fx=ctx.createGain();fx.connect(ctx.destination);
  }catch(e){ctx=null}
}
// Le navigateur n'autorise le son qu'après un geste de l'utilisateur.
const wake=()=>{init();if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{})};
addEventListener('pointerdown',wake);addEventListener('keydown',wake);

// Appelé à chaque image : roulettes audibles tant que la chaise avance.
export function wheels(rolling){
  const on=rolling&&cfg.on&&cfg.vol>0;
  if(on)init();
  if(!ctx)return;
  gain.gain.setTargetAtTime(on?cfg.vol*.3:0,ctx.currentTime,.05);
}

const hz=m=>440*2**((m-69)/12);
// Une note : oscillateur(s) → filtre passe-bas → enveloppe. type 'acc' = deux dents de scie désaccordées (accordéon de taverne).
function note(dest,m,t,dur,type,vol,slide){
  const env=ctx.createGain(),f=ctx.createBiquadFilter();
  f.type='lowpass';f.frequency.value=type==='acc'?1700:4000;
  env.gain.setValueAtTime(0,t);env.gain.linearRampToValueAtTime(vol,t+.015);env.gain.setTargetAtTime(0,t+dur*.7,dur*.25);
  f.connect(env);env.connect(dest);
  for(const det of type==='acc'?[-7,7]:[0]){
    const o=ctx.createOscillator();o.type=type==='acc'?'sawtooth':type;o.frequency.setValueAtTime(hz(m),t);o.detune.value=det;
    if(slide)o.frequency.exponentialRampToValueAtTime(hz(m+slide),t+dur);
    o.connect(f);o.start(t);o.stop(t+dur+.3);
  }
}

// Musique : valse oum-pa-pa de taverne belge. En donjon, la même partition en mineur et plus lente : c'est la même soirée qui tourne mal.
// Degrés de la gamme (0 = tonique), un par temps ; null = la note précédente continue.
const MEL=[0,2,4, 7,4,2, 1,3,4, 6,4,1, 1,3,6, 8,6,4, 7,4,2, 0,null,null,
           3,5,7, 9,7,5, 4,7,9, 11,9,7, 8,6,4, 3,4,6, 7,2,4, 0,null,null];
const BARS=[0,0,4,4,4,4,0,0, 3,3,0,0,4,4,0,0];
const MAJ=[0,2,4,5,7,9,11],MIN=[0,2,3,5,7,8,10];
const deg=(d,sc,base)=>base+12*Math.floor(d/7)+sc[((d%7)+7)%7];
const MODES={over:{sc:MAJ,bpm:168,base:67,lead:'acc'},dg:{sc:MIN,bpm:104,base:62,lead:'triangle'}};
const musicVol=()=>cfg.on&&cfg.music?cfg.vol*.32:0;
let mode=null,beat=0,nextT=0;
setInterval(()=>{
  if(!ctx||!mode||ctx.state!=='running')return;
  const M=MODES[mode],spb=60/M.bpm;
  if(nextT<ctx.currentTime)nextT=ctx.currentTime+.05;
  while(nextT<ctx.currentTime+.3){
    const i=beat%MEL.length,bar=Math.floor(i/3),root=BARS[bar],t=nextT;
    if(i%3===0)note(mus,deg(bar%2?root-3:root,M.sc,M.base-24),t,spb*.9,'triangle',.5);
    else for(const k of [0,2,4])note(mus,deg(root+k,M.sc,M.base-12),t,spb*.35,'square',.06);
    if(MEL[i]!=null){let n=1;while(MEL[(i+n)%MEL.length]===null)n++;note(mus,deg(MEL[i],M.sc,M.base),t,spb*n*.95,M.lead,.22)}
    nextT+=spb;beat++;
  }
},100);
// Appelé à chaque image avec la carte courante ; ne fait quelque chose qu'au changement.
export function music(m){if(m!==mode){mode=m;beat=0;nextT=0}}

// Effets : quelques notes chacun. Un même effet ne se rejoue pas avant 60 ms (une rafale de dégâts resterait un mur de bruit).
const last={};
const FX={
  hit:t=>note(fx,45,t,.07,'square',.12,-12),
  crit:t=>{note(fx,57,t,.09,'square',.16,-12);note(fx,76,t,.12,'triangle',.1)},
  hurt:t=>note(fx,40,t,.12,'sawtooth',.14,-7),
  heal:t=>[72,76,79].forEach((m,i)=>note(fx,m,t+i*.05,.15,'sine',.1)),
  coin:t=>{note(fx,83,t,.06,'square',.08);note(fx,88,t+.07,.18,'square',.08)},
  ding:t=>{note(fx,81,t,.25,'sine',.14);note(fx,88,t+.12,.4,'sine',.12)},
  lvlup:t=>[0,4,7,12,16].forEach((s,i)=>note(fx,67+s,t+i*.08,i===4?.5:.12,'square',.09)),
  // Trombone triste : la mort, version 18-25.
  died:t=>[[58,0],[57,.32],[56,.64],[55,.96]].forEach(([m,d],i)=>note(fx,m,t+d,i===3?1:.3,'sawtooth',.13,i===3?-1:0)),
  err:t=>note(fx,38,t,.15,'square',.1),
  pop:t=>note(fx,79,t,.05,'sine',.07),
};
export function sfx(id){
  if(!cfg.on||!cfg.vol)return;
  init();if(!ctx||ctx.state!=='running')return;
  const now=ctx.currentTime;if(last[id]>now-.06)return;last[id]=now;
  fx.gain.value=cfg.vol;
  FX[id](now);
}
