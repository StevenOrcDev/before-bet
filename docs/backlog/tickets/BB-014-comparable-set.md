---
id: BB-014
titre: ComparableSet - filtres contextuels et seuil de n minimal
epic: EPIC-05
type: feature
statut: backlog
priorite: P0
estimation: L
depends_on: [BB-012]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

Dire "78 % sur les matchs comparables" n'a de sens que si "comparable" est défini de façon
reproductible et opposable. C'est aussi l'endroit exact où le produit peut mentir sans le vouloir :
plus on empile de filtres, plus on trouve un angle à 100 % sur quatre matchs. Le seuil de `n`
minimal n'est pas un garde-fou technique, c'est une promesse produit.

## Objectif

Un agrégat qui décrit un ensemble de matchs comparables, sait s'il est exploitable, et refuse par
construction toute lecture non bornée dans le temps.

## Critères d'acceptation

### Scénario : la borne temporelle est obligatoire
- Étant donné un développeur qui écrit une requête d'analyse sans `asOf`
- Quand il compile
- Alors la compilation échoue, la borne étant exigée par le typage et non par convention

### Scénario : aucune donnée postérieure n'est incluse
- Étant donné un `ComparableSet` borné au 12 mars 2025
- Quand je liste les matchs retenus
- Alors aucun match postérieur à cette date n'y figure, y compris dans la même saison

### Scénario : échantillon sous le seuil
- Étant donné un jeu de filtres ne retenant que 4 matchs, pour un seuil minimal de 15
- Quand j'évalue l'ensemble
- Alors il est marqué non exploitable, et le motif nomme la contrainte responsable

### Scénario : relâchement documenté
- Étant donné un ensemble non exploitable
- Quand je demande une alternative
- Alors le système propose le jeu de filtres relâché le plus proche qui atteint le seuil, en
  indiquant précisément quelle contrainte a été retirée

### Scénario : la définition est reproductible
- Étant donné deux évaluations du même `ComparableSet` sur les mêmes données
- Quand je compare les résultats
- Alors les matchs retenus sont identiques et l'ensemble expose une empreinte stable de ses filtres

## Périmètre technique

Agrégat `ComparableSet` dans `libs/market-analytics/domain` : filtres domicile/extérieur, fenêtre de
N derniers matchs, compétition, saison, tier de l'adversaire, absences. Read model dédié côté
`infrastructure` : les analyses lisent des projections, jamais des agrégats reconstitués.

## Hors périmètre

Sélection automatique des angles à présenter (EPIC-06). Filtres avancés (météo, arbitre, repos)
qui viendront ensuite. Le calcul de la fréquence lui-même (BB-015).

## Objectif pédagogique

La fuite temporelle et le `look-ahead bias`, la séparation lecture/écriture (CQRS) sur un domaine
analytique, et le p-hacking par empilement de filtres. Question à savoir traiter après : pourquoi
un read model plutôt qu'un repository d'agrégats pour agréger des milliers de matchs ?

## Journal

_(rempli par dev-senior)_
