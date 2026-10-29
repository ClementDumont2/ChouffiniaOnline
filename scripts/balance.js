// Simule un joueur moyen contre les monstres de chaque zone, pour régler xpNeed, les stats de base et le butin.
//   npm run balance            une ligne par niveau (meilleure zone supportable)
//   npm run balance -- --zones tous les couples niveau × zone
//   npm run balance -- --ideal monstres du niveau du joueur partout (calibrage de la courbe)
// Hypothèses (à relire avant de se fier aux chiffres) : Chouffin, équipement le plus fort de chaque emplacement dont le rl est atteint,
// au niveau d'objet du joueur ; solo ; attaque de base en boucle (rotation = bonus forfaitaire) ; régénération naturelle entre deux combats.
import {pathToFileURL} from 'node:url';
import {ITEMS, MAXLVL, MOBS, SPAWNS, ZONES} from '../shared/data.js';
import {genOverworld, zoneAt} from '../shared/map.js';
import {newItem, newSave, stats, statsDeMob, xpNeed} from '../shared/rules.js';

const ROTATION = 1.25;      // compétences en plus de l'attaque de base (Enfait, Copypasta…), forfaitaire
const CRIT = 1 + .12 * .8;  // 12 % de critiques à ×1,8
const BASE_CD = 1.4;        // recharge du Tip du Fedora
const TRAVEL = 6;           // s entre deux monstres : trouver, viser, s'approcher
const REGEN = .06;          // part des PV/s récupérée après 5 s hors combat
const SAFE = .5;            // au-delà de 50 % des PV perdus par combat, la zone est jugée trop dure

export function joueurMoyen(lvl) {
  const S = {...newSave(), lvl};
  for (const slot of Object.keys(S.eq)) {
    const best = Object.keys(ITEMS).filter(id => ITEMS[id].t === 'eq' && ITEMS[id].s === slot && ITEMS[id].rl <= lvl).sort((a, b) => ITEMS[b].rl - ITEMS[a].rl || ITEMS[b].price - ITEMS[a].price)[0];
    if (best) S.eq[slot] = newItem(best, lvl);
  }
  return {S, st: stats(S)};
}

// Types de monstres non-boss par zone, d'après le centre de chaque rectangle de SPAWNS.
export function monstresParZone() {
  const map = genOverworld(20111), zones = {};
  for (const [type, , x0, x1, y0, y1] of SPAWNS) {
    const z = zoneAt(map, (x0 + x1) / 2, (y0 + y1) / 2);
    (zones[z] ||= new Set()).add(type);
  }
  return Object.fromEntries(Object.entries(zones).map(([z, set]) => [z, [...set].filter(t => !MOBS[t].boss)]));
}

export function simuler(lvl, type, niveauMonstre) {
  const {st} = joueurMoyen(lvl), m = statsDeMob(type, niveauMonstre), d = MOBS[type];
  const dps = st.atk * CRIT * ROTATION / BASE_CD;
  const ttk = m.hp / dps;
  const mobDps = (m.atk[0] + m.atk[1]) / 2 * (1 - st.red) / d.cd;
  const perte = Math.min(1, mobDps * ttk / st.maxhp);
  const repos = perte / REGEN + 5 * Math.min(1, perte / .05); // continu : la régénération ne démarre qu'après 5 s hors combat
  const parKill = ttk + TRAVEL + repos;
  const minParNiveau = lvl >= MAXLVL ? 0 : xpNeed(lvl) / m.xp * parKill / 60;
  return {ttk, perte, minParNiveau, parKill, niveauMonstre: niveauMonstre || d.l};
}

function main() {
  // --ideal : une zone fictive dont les monstres ont toujours le niveau du joueur, pour régler la courbe sans attendre les zones des lots 8 et 9.
  const ideal = process.argv.includes('--ideal');
  const zones = ideal ? {ideale: ['normie']} : monstresParZone();
  const all = process.argv.includes('--zones');
  const f = (x, n = 1) => x.toFixed(n);
  console.log(`Joueur moyen, Chouffin solo. Niveau max : ${MAXLVL}. xpNeed : ${[1, 5, 10, 15, 20, 30, 50, 70, 90, 99].filter(l => l < MAXLVL).map(l => `${l}→${xpNeed(l)}`).join(' ')}`);
  console.log(all ? 'niveau | zone | niv. monstre | s/kill | PV perdus | min/niveau' : 'niveau | meilleure zone | niv. monstre | s/kill | PV perdus/combat | min pour ce niveau');
  let total = 0;
  for (let lvl = 1; lvl < MAXLVL; lvl++) {
    const rows = [];
    for (const [z, types] of Object.entries(zones)) {
      const sims = types.map(t => simuler(lvl, t, ideal ? lvl : undefined));
      const avg = k => sims.reduce((a, s) => a + s[k], 0) / sims.length;
      rows.push({z, niv: avg('niveauMonstre'), ttk: avg('ttk'), perte: avg('perte'), min: avg('minParNiveau'), parKill: avg('parKill')});
    }
    if (all) { for (const r of rows) console.log(`${lvl} | ${(ZONES[r.z] || {n: 'Zone idéale'}).n} | ${f(r.niv, 0)} | ${f(r.ttk)} | ${f(r.perte * 100, 0)} % | ${f(r.min)}`); continue; }
    const ok = rows.filter(r => r.perte <= SAFE).sort((a, b) => a.min - b.min)[0];
    const r = ok || rows.sort((a, b) => a.perte - b.perte)[0];
    total += r.min;
    console.log(`${String(lvl).padStart(3)} | ${(ZONES[r.z] || {n: 'Zone idéale'}).n.padEnd(34)} | ${f(r.niv, 0).padStart(3)} | ${f(r.ttk).padStart(6)} | ${f(r.perte * 100, 0).padStart(4)} %${ok ? '  ' : ' !'} | ${f(r.min).padStart(8)}${r.min > 45 ? '  <- mur' : ''}`);
  }
  if (!all) console.log(`Total estimé jusqu'au niveau ${MAXLVL} : ${f(total / 60)} h (« ! » : aucune zone supportable, « mur » : plus de 45 min pour un niveau).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
