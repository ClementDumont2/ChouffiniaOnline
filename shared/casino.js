// Règles du Casino, pures (ni DOM ni Math.random : le paquet se mélange avec le générateur du monde). Les mises et les gains sont tranchés dans sim.js.
// Carte = entier 0–51 : valeur c % 13 (0 = 2 … 8 = 10, 9 = Valet, 10 = Dame, 11 = Roi, 12 = As), couleur c / 13.
const RANKS=['2','3','4','5','6','7','8','9','10','V','D','R','A'],SUITS=['♠','♥','♦','♣'];
export const cardName=c=>RANKS[c%13]+SUITS[c/13|0];
export function deck(rnd){const d=[...Array(52).keys()];for(let i=51;i>0;i--){const j=Math.floor(rnd()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d}

// Blackjack : l'As vaut 11, ou 1 tant que la main dépasserait 21.
export function bjValue(h){let v=0,a=0;for(const c of h){const r=c%13;v+=r===12?11:r>=8?10:r+2;if(r===12)a++}while(v>21&&a){v-=10;a--}return v}
export const isBlackjack=h=>h.length===2&&bjValue(h)===21;

// Roulette européenne : 0 à 36, le zéro n'est ni rouge ni noir, ni pair ni impair, ni manque ni passe.
export const ROUGES=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
export const ROUL_BETS={rouge:'Rouge',noir:'Noir',pair:'Pair',impair:'Impair',manque:'Manque (1–18)',passe:'Passe (19–36)'};
// Multiplicateur de la mise (mise comprise) : 0 = perdue, 2 sur une chance simple, 36 sur un numéro plein.
export function roulPays(bet,n){
  if(Number.isInteger(bet))return bet===n?36:0;
  if(n===0)return 0;
  const ok={rouge:ROUGES.has(n),noir:!ROUGES.has(n),pair:n%2===0,impair:n%2===1,manque:n<=18,passe:n>=19}[bet];
  return ok?2:0;
}

// Poker à 5 cartes : [catégorie, départages…], comparées dans l'ordre (cmpRank). La quinte As-2-3-4-5 vaut une quinte au 5.
export const HANDS=['Hauteur (comme votre ego)','Paire','Double paire','Brelan','Quinte','Couleur','Full','Carré','Quinte flush'];
export function pokerRank(h){
  const r=h.map(c=>c%13).sort((a,b)=>b-a),cnt={};for(const x of r)cnt[x]=(cnt[x]||0)+1;
  const g=Object.entries(cnt).map(([k,n])=>[n,+k]).sort((a,b)=>b[0]-a[0]||b[1]-a[1]),tb=g.map(x=>x[1]);
  const flush=h.every(c=>(c/13|0)===(h[0]/13|0)),five=g.length===5;
  const hi=five&&r[0]-r[4]===4?r[0]:five&&r[0]===12&&r[1]===3?3:-1;
  if(hi>=0&&flush)return[8,hi];
  if(g[0][0]===4)return[7,...tb];
  if(g[0][0]===3&&g[1][0]===2)return[6,...tb];
  if(flush)return[5,...r];
  if(hi>=0)return[4,hi];
  if(g[0][0]===3)return[3,...tb];
  if(g[0][0]===2&&g[1][0]===2)return[2,...tb];
  if(g[0][0]===2)return[1,...tb];
  return[0,...r];
}
export function cmpRank(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]??-1)-(b[i]??-1);if(d)return d}return 0}
