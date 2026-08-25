---
id: BB-010
titre: Spike et ADR - modélisation de BettingMarket
epic: EPIC-05
type: spike
statut: done
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

**2026-08-25 — architecte-senior**

Livrable : [`docs/adr/0001-modelisation-betting-market.md`](../../adr/0001-modelisation-betting-market.md),
statut « proposé », en attente de validation. Timebox respectée, aucun code de production écrit.

Les quatre critères d'acceptation sont couverts : la représentation retenue est nommée, trois
alternatives sont écartées avec leur motif, les cas difficiles (quart de balle, marché joueur, trois
issues) sont traités nommément, l'identité et sa forme sérialisée sont définies, et le mécanisme de
versionnement est décrit avec son effet sur les statistiques déjà calculées.

**Découverte non prévue par le ticket.** `BB-021` (dévigging) exige le jeu complet des sélections
d'un même marché. Le modèle initialement envisagé n'offrait aucun objet pour porter cet ensemble.
D'où l'introduction de `MarketFamily`, distincte de `BettingMarket`. Ce n'est pas un raffinement de
confort : sans elle, `BB-021` aurait reconstruit ce concept de son côté, sous un autre nom.

**Impacts backlog signalés à `po-tech`** (non appliqués, ce n'est pas mon rôle) :

- `BB-011` doit intégrer `MarketFamily` et le registre des combinaisons supportées — estimation `M`
  probablement sous-évaluée.
- `BB-021` doit parler de famille et non de marché.
- `BB-014` et `BB-015` : statistiques clés par `marketKey`, portant `ruleVersion`.
- Nouveau ticket à ouvrir : sérialisation et parsing de la clé canonique.

**Reste ouvert.** La question posée en fin d'ADR — garantir qu'un nouveau `kind` fasse échouer la
compilation partout où il doit être traité — doit être tranchée dans `BB-011`, au moment d'écrire
le registre.

## Ce que j'ai appris

Un concept métier manquant se révèle souvent par une contrainte venue d'ailleurs : c'est le besoin
de dévigging qui a fait apparaître `MarketFamily`, pas l'analyse du marché de pari lui-même.
Retenir aussi que l'identité d'un objet exposé dans une URL est un contrat public : sa forme
sérialisée se conçoit en même temps que le modèle, jamais après.
