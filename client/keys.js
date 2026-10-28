// Touches par appareil (localStorage). On stocke des e.code, jamais e.key : ZQSD et WASD occupent les mêmes touches physiques.
const STORE='chouffinia-touches';
export const ACTIONS=[['up','Haut'],['down','Bas'],['left','Gauche'],['right','Droite'],['s1','Compétence 1'],['s2','Compétence 2'],['s3','Compétence 3'],['s4','Compétence 4'],['s5','Compétence 5'],['chouffe','Chouffe'],['chips','Chips'],['target','Cibler'],['bag','Sac'],['char','Personnage'],['chat','Chat'],['map','Carte'],['mount','Monture'],['opts','Options']];
export const DEFAULT_KEYS={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',s1:'Digit1',s2:'Digit2',s3:'Digit3',s4:'Digit4',s5:'Digit5',chouffe:'Digit6',chips:'Digit7',target:'Tab',bag:'KeyI',char:'KeyC',chat:'Enter',map:'KeyM',mount:'KeyN',opts:'KeyO'};
const DEFAULTS=DEFAULT_KEYS;

// Fusion pure (testable sans DOM) de la config enregistrée et des défauts. Une action absente de la config reprend son défaut,
// sauf si une autre action occupe déjà cette touche (ex. Monture sur KeyM chez un joueur d'avant la touche Carte) : elle reste alors sans touche (null).
export function mergeBinds(s){
  const b={...DEFAULTS},has={};
  if(s&&typeof s==='object')for(const id in DEFAULTS)if(typeof s[id]==='string'||(id==='map'&&s[id]===null)){b[id]=s[id];has[id]=1}
  for(const id in DEFAULTS)if(!has[id]&&Object.keys(b).some(o=>o!==id&&b[o]===b[id]&&has[o]))b[id]=null;
  // Une sauvegarde bricolée à la main avec deux actions sur la même touche : on repart des défauts plutôt que d'avoir une touche ambiguë.
  const used=Object.values(b).filter(Boolean);
  return new Set(used).size===used.length?b:{...DEFAULTS};
}
function load(){let s=null;try{s=JSON.parse(localStorage.getItem(STORE))}catch(e){}return mergeBinds(s)}
const binds=load();
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(binds))}catch(e){}};

export const keyOf=id=>binds[id];
export const actionOf=code=>{code=code.replace(/^Numpad(\d)$/,'Digit$1');return Object.keys(binds).find(id=>binds[id]===code)};
export function rebind(id,code){
  const other=actionOf(code);
  if(other&&other!==id)binds[other]=binds[id];
  binds[id]=code;save();
}
export function resetKeys(){Object.assign(binds,DEFAULTS);save()}

// Disposition réelle du clavier (AZERTY affiche Z là où le code dit KeyW) ; indisponible hors Chrome, on retombe sur le code.
let layout=null;
try{navigator.keyboard.getLayoutMap().then(m=>{layout=m})}catch(e){}
const NAMES={Tab:'Tab',Enter:'Entrée',Space:'Espace',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Backquote:'²'};
export function label(code){
  if(!code)return'—';
  const l=layout&&layout.get(code);
  return l?l.toUpperCase():NAMES[code]||code.replace(/^(Key|Digit)/,'');
}

export const helpHTML=()=>{const k=id=>`<kbd>${label(keyOf(id))}</kbd>`;
  return`${['up','left','down','right'].map(k).join('')} / flèches ou toucher le sol pour bouger · toucher un ennemi pour l'attaquer · ${k('s1')}–${k('s5')} compétences · ${k('chouffe')} Chouffe · ${k('chips')} Chips · ${k('target')} cibler · ${k('bag')} sac · ${k('char')} personnage · ${k('chat')} chat · ${k('opts')} options`};
