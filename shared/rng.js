export function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

export function rngTools(rnd){
  const rr=(a,b)=>a+rnd()*(b-a),ri=(a,b)=>Math.floor(a+rnd()*(b-a+1)),pick=a=>a[Math.floor(rnd()*a.length)];
  return{rr,ri,pick};
}
