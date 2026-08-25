#!/usr/bin/env node
// Valide le backlog et regenere docs/backlog/INDEX.md.
// Zero dependance : node scripts/backlog.mjs
// Sort en code 1 si le backlog est incoherent (utilisable en CI).

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BACKLOG = join(ROOT, 'docs', 'backlog');

const STATUTS = ['backlog', 'ready', 'in-progress', 'review', 'done', 'blocked', 'dropped'];
const TYPES = ['feature', 'tech', 'spike', 'bug', 'doc', 'chore'];
const PRIORITES = ['P0', 'P1', 'P2', 'P3'];
const ESTIMATIONS = ['XS', 'S', 'M', 'L', 'XL'];
const REQUIS = ['id', 'titre', 'epic', 'type', 'statut', 'priorite', 'estimation', 'maj'];

const erreurs = [];
const alertes = [];

function parseFrontmatter(contenu, fichier) {
  const m = contenu.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) {
    erreurs.push(fichier + ' : frontmatter absent ou malforme');
    return null;
  }
  const meta = {};
  for (const ligne of m[1].split(/\r?\n/)) {
    const kv = ligne.match(/^([a-z_]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    const cle = kv[1];
    const valeur = kv[2].trim();
    meta[cle] = valeur.startsWith('[')
      ? valeur.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean)
      : valeur;
  }
  return meta;
}

async function charger(sousDossier) {
  let fichiers;
  try {
    fichiers = (await readdir(join(BACKLOG, sousDossier))).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  const items = [];
  for (const f of fichiers) {
    const contenu = await readFile(join(BACKLOG, sousDossier, f), 'utf8');
    const meta = parseFrontmatter(contenu, sousDossier + '/' + f);
    if (meta) items.push({ ...meta, fichier: f, contenu, chemin: sousDossier + '/' + f });
  }
  return items;
}

const epics = await charger('epics');
const tickets = await charger('tickets');
const idsEpics = new Set(epics.map((e) => e.id));
const idsTickets = new Set(tickets.map((t) => t.id));

for (const t of tickets) {
  const ou = t.chemin + ' (' + (t.id || '?') + ')';
  for (const cle of REQUIS) {
    if (!t[cle]) erreurs.push(ou + ' : champ obligatoire manquant "' + cle + '"');
  }
  if (t.statut && !STATUTS.includes(t.statut)) erreurs.push(ou + ' : statut inconnu "' + t.statut + '"');
  if (t.type && !TYPES.includes(t.type)) erreurs.push(ou + ' : type inconnu "' + t.type + '"');
  if (t.priorite && !PRIORITES.includes(t.priorite)) erreurs.push(ou + ' : priorite inconnue "' + t.priorite + '"');
  if (t.estimation && !ESTIMATIONS.includes(t.estimation)) erreurs.push(ou + ' : estimation inconnue "' + t.estimation + '"');
  if (t.estimation === 'XL') erreurs.push(ou + ' : estimation XL, ce ticket doit etre decoupe (cf. README)');
  if (t.epic && !idsEpics.has(t.epic)) erreurs.push(ou + ' : epic inexistant "' + t.epic + '"');
  if (t.id && !t.fichier.startsWith(t.id + '-')) erreurs.push(ou + ' : le nom de fichier ne commence pas par "' + t.id + '-"');

  for (const dep of t.depends_on || []) {
    if (!idsTickets.has(dep)) {
      erreurs.push(ou + ' : dependance inconnue "' + dep + '"');
      continue;
    }
    const cible = tickets.find((x) => x.id === dep);
    if (t.statut === 'in-progress' && ['backlog', 'ready'].includes(cible.statut)) {
      alertes.push(ou + ' : demarre alors que ' + dep + ' est "' + cible.statut + '"');
    }
  }

  if (['ready', 'in-progress', 'review'].includes(t.statut)) {
    if (!/##\s+Crit[eè]res d.acceptation/i.test(t.contenu)) {
      erreurs.push(ou + ' : statut "' + t.statut + '" sans section "Criteres d acceptation" (Definition of Ready)');
    } else if (!/[EÉ]tant donn/i.test(t.contenu)) {
      erreurs.push(ou + ' : criteres d acceptation non ecrits en Gherkin (aucun "Etant donne")');
    }
    if (!/##\s+Hors p[eé]rim[eè]tre/i.test(t.contenu)) {
      alertes.push(ou + ' : pas de section "Hors perimetre", le ticket va gonfler');
    }
  }
  if (t.statut === 'blocked' && !/##\s+Blocage/i.test(t.contenu)) {
    erreurs.push(ou + ' : statut "blocked" sans section "## Blocage" expliquant le motif');
  }
}

const enCours = tickets.filter((t) => t.statut === 'in-progress');
if (enCours.length > 1) {
  alertes.push(enCours.length + ' tickets "in-progress" simultanes (' + enCours.map((t) => t.id).join(', ') + '), un seul a la fois');
}

// --- Generation du board ----------------------------------------------------
const rangPrio = (t) => PRIORITES.indexOf(t.priorite);
const parId = (a, b) => a.id.localeCompare(b.id);
const compte = (s) => tickets.filter((t) => t.statut === s).length;
const lien = (t) => '[' + t.id + '](tickets/' + t.fichier + ')';

const l = [];
l.push('# Board — before-bet', '');
l.push('> Fichier **genere** par `node scripts/backlog.mjs`. Ne pas editer a la main :');
l.push('> toute modification manuelle sera ecrasee. La source de verite est `tickets/` et `epics/`.', '');
l.push('**' + tickets.length + ' tickets** repartis sur **' + epics.length + ' epics**.', '');
l.push('| ' + STATUTS.join(' | ') + ' |');
l.push('|' + STATUTS.map(() => '---').join('|') + '|');
l.push('| ' + STATUTS.map(compte).join(' | ') + ' |', '');

const prets = tickets
  .filter((t) => t.statut === 'ready')
  .sort((a, b) => rangPrio(a) - rangPrio(b) || parId(a, b));
if (prets.length) {
  l.push('## Prochains tickets prets', '');
  for (const t of prets.slice(0, 8)) {
    l.push('- ' + lien(t) + ' **' + t.titre + '** — ' + t.priorite + ', ' + t.estimation);
  }
  l.push('');
}
if (enCours.length) {
  l.push('## En cours', '');
  for (const t of enCours) l.push('- ' + lien(t) + ' **' + t.titre + '** — ' + (t.assigne || '?'));
  l.push('');
}
const enRevue = tickets.filter((t) => t.statut === 'review');
if (enRevue.length) {
  l.push('## En attente de ta validation', '');
  for (const t of enRevue) l.push('- ' + lien(t) + ' **' + t.titre + '**');
  l.push('');
}
const bloques = tickets.filter((t) => t.statut === 'blocked');
if (bloques.length) {
  l.push('## Bloques', '');
  for (const t of bloques) l.push('- ' + lien(t) + ' **' + t.titre + '**');
  l.push('');
}

l.push('## Par epic', '');
for (const e of epics.sort(parId)) {
  const siens = tickets.filter((t) => t.epic === e.id).sort(parId);
  const finis = siens.filter((t) => t.statut === 'done').length;
  l.push('### [' + e.id + ' — ' + e.titre + '](epics/' + e.fichier + ')', '');
  l.push('Priorite ' + (e.priorite || '?') + ' — ' + finis + '/' + siens.length + ' termines.', '');
  if (!siens.length) {
    l.push('_Aucun ticket redige. A decouper par `po-tech`._', '');
    continue;
  }
  l.push('| id | titre | type | prio | est. | statut | depend de |');
  l.push('|---|---|---|---|---|---|---|');
  for (const t of siens) {
    l.push(
      '| ' + lien(t) + ' | ' + t.titre + ' | ' + t.type + ' | ' + t.priorite +
      ' | ' + t.estimation + ' | ' + t.statut + ' | ' + ((t.depends_on || []).join(', ') || '—') + ' |'
    );
  }
  l.push('');
}

await writeFile(join(BACKLOG, 'INDEX.md'), l.join('\n') + '\n', 'utf8');

console.log('INDEX.md regenere : ' + tickets.length + ' tickets, ' + epics.length + ' epics.');
for (const a of alertes) console.log('  alerte  ' + a);
for (const e of erreurs) console.error('  ERREUR  ' + e);
if (erreurs.length) {
  console.error('');
  console.error(erreurs.length + ' erreur(s) : backlog invalide.');
  process.exit(1);
}
console.log('Backlog valide.');
