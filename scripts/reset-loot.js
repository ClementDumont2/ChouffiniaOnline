// Remet à zéro le butin (sac et équipement) de toutes les sauvegardes, en gardant niveau, XP, or, quêtes, montures, hauts faits et droits.
//   npm run reset-loot             réinitialise saves/ (après avoir copié chaque fichier dans saves-backup/)
//   npm run reset-loot -- --dry    montre ce qui serait fait, sans rien écrire
//   npm run reset-loot -- <dossier> autre dossier de sauvegardes
// À lancer serveur ARRÊTÉ : un serveur en marche réécrit les sauvegardes des joueurs connectés toutes les 10 s.
import {copyFileSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {basename, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resetLoot} from '../shared/rules.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const count = sv => (Array.isArray(sv && sv.inv) ? sv.inv.length : 0) + Object.values((sv && sv.eq) || {}).filter(Boolean).length;

export function resetDir(dir, {dry = false, backupDir = null} = {}) {
  const rapport = [];
  for (const f of readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
    const file = join(dir, f);
    let sv;
    // Un fichier illisible n'est jamais touché : mieux vaut le signaler qu'écraser ce qui reste.
    try { sv = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { rapport.push({f, ignore: `illisible (${e.message})`}); continue; }
    const out = resetLoot(sv);
    rapport.push({f, lvl: out.lvl, gold: out.gold, avant: count(sv), apres: count(out)});
    if (dry) continue;
    mkdirSync(backupDir, {recursive: true});
    copyFileSync(file, join(backupDir, f));
    writeFileSync(file + '.tmp', JSON.stringify(out));
    renameSync(file + '.tmp', file);
  }
  return rapport;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2), dry = args.includes('--dry'), dir = args.find(a => !a.startsWith('--')) || join(ROOT, 'saves');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
  const backupDir = join(ROOT, 'saves-backup', 'loot-' + stamp);
  console.log(`${dry ? '[simulation] ' : ''}Réinitialisation du butin dans ${dir} (serveur arrêté ?)`);
  for (const r of resetDir(dir, {dry, backupDir}))
    console.log(r.ignore ? `  ${r.f} : IGNORÉ, ${r.ignore}` : `  ${r.f} : niveau ${r.lvl}, ${r.gold} po conservés · objets ${r.avant} → ${r.apres}`);
  if (!dry) console.log(`Copies d'origine : ${basename(join(ROOT, 'saves-backup'))}/${basename(backupDir)}/`);
}
