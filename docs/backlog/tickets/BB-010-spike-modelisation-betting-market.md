---
id: BB-010
titre: Spike et ADR - modélisation de BettingMarket
epic: EPIC-05
type: spike
statut: ready
priorite: P0
estimation: M
depends_on: []
assigne: architecte-senior
maj: 2026-08-25
---

## Contexte

`BettingMarket` est le concept central du produit : tout le reste en dépend. Un mauvais choix de
modélisation ici se paie sur chaque ticket suivant. Les marchés sont hétérogènes (avec ou sans
ligne, sur l'équipe ou sur un joueur, à trois issues ou binaires, avec remboursement partiel sur
handicap asiatique), et une modélisation trop générique (`type: string`, `params: object`) rendrait
impossible toute vérification à la compilation.

Timebox : une session. Livrable = un ADR, aucun code de production.

## Objectif

Trancher la représentation de `BettingMarket` et de son identité, avec les conséquences assumées.

## Critères d'acceptation

### Scénario : l'ADR existe et tranche
- Étant donné le spike terminé
- Quand je lis `docs/adr/`
- Alors un ADR nomme la représentation retenue, au moins deux alternatives écartées avec leur motif,
  et les conséquences négatives acceptées

### Scénario : les cas difficiles sont traités explicitement
- Étant donné l'ADR
- Quand je cherche comment sont représentés le handicap asiatique quart de balle (-0.25), un marché
  joueur, et un marché à trois issues
- Alors chacun est traité nommément, ou explicitement exclu de la v1 avec la raison

### Scénario : l'identité d'un marché est définie
- Étant donné deux instances décrivant le même pari
- Quand je les compare
- Alors l'ADR précise la clé d'égalité et sa forme sérialisée stable, utilisable en clé de cache et
  en identifiant d'URL

### Scénario : le versionnement est anticipé
- Étant donné l'ADR
- Quand je cherche ce qui se passe si une règle de résolution change
- Alors le mécanisme de versionnement et son effet sur les statistiques déjà calculées sont décrits

## Périmètre technique

Analyse comparée : union discriminée typée, hiérarchie de classes, table de configuration.
Signatures TypeScript à titre d'illustration uniquement.

## Hors périmètre

Toute implémentation (BB-011, BB-012). Le stockage en base. La liste exhaustive des marchés à couvrir.

## Objectif pédagogique

Modélisation par union discriminée et exhaustivité vérifiée à la compilation, versus polymorphisme
objet. Question à savoir traiter après : comment garantir qu'ajouter un type de marché fasse
échouer la compilation partout où il faut le traiter ?

## Journal

_(rempli par architecte-senior)_
