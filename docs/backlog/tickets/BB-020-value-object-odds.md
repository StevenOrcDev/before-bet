---
id: BB-020
titre: Value object Odds et formats de cote
epic: EPIC-04
type: feature
statut: backlog
priorite: P1
estimation: S
depends_on: [BB-006]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

Une cote circule sous plusieurs formats (décimal en France, fractionnaire au Royaume-Uni, américain)
et se prête à des erreurs silencieuses : une cote de 1.0 est impossible, une cote négative n'a pas
de sens, et un arrondi mal placé décale la probabilité implicite de plusieurs points.

## Objectif

Un value object `Odds` validé, convertible entre formats, sur lequel tout le contexte `odds`
s'appuie.

## Critères d'acceptation

### Scénario : cote décimale valide
- Étant donné la valeur 1.28
- Quand je construis une `Odds`
- Alors l'instance est créée et expose sa valeur décimale

### Scénario : cote impossible refusée
- Étant donné la valeur 1.0, puis la valeur -2
- Quand je construis une `Odds`
- Alors chaque construction échoue explicitement, une cote devant être strictement supérieure à 1

### Scénario : conversion fractionnaire
- Étant donné la cote fractionnaire 7/2
- Quand je la convertis en décimal
- Alors j'obtiens 4.5

### Scénario : aller-retour sans dérive
- Étant donné une cote décimale
- Quand je la convertis vers un autre format puis à nouveau en décimal
- Alors j'obtiens la valeur initiale à la précision documentée près

## Périmètre technique

`libs/odds/domain`. Précision décimale explicite, jamais de comparaison flottante par égalité stricte.

## Hors périmètre

Le dévigging et la probabilité implicite (BB-021). Le stockage et l'historisation des cotes.

## Objectif pédagogique

Value object et gestion de la précision numérique en TypeScript. Question à savoir traiter après :
pourquoi ne pas stocker une cote en flottant sans précision définie ?

## Journal

_(rempli par dev-senior)_
