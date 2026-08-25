---
id: BB-021
titre: Dévigging et probabilité implicite
epic: EPIC-04
type: feature
statut: backlog
priorite: P1
estimation: M
depends_on: [BB-020]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

C'est le ticket qui décide de la crédibilité du produit. `1 / 1.28 = 78 %` est faux : la somme des
inverses des cotes d'un même marché dépasse 1, l'excédent étant la marge du bookmaker (overround).
Comparer une fréquence observée à `1/cote` fabrique un avantage qui n'existe pas, et c'est
exactement l'erreur que commettent les outils gratuits que ce produit veut dépasser.

## Objectif

Convertir un jeu de cotes complet en probabilités implicites sommant à 1, par une méthode nommée
dans toute sortie.

## Critères d'acceptation

### Scénario : l'overround est calculé
- Étant donné les cotes 1.28 et 3.75 sur un marché à deux issues
- Quand je calcule l'overround
- Alors j'obtiens environ 5.8 %, et la valeur est exposée séparément des probabilités

### Scénario : les probabilités dévigguées somment à 1
- Étant donné un jeu de cotes complet sur un marché
- Quand j'applique le dévigging multiplicatif
- Alors la somme des probabilités vaut 1 à 1e-9 près

### Scénario : jeu de cotes incomplet refusé
- Étant donné une seule cote d'un marché à trois issues
- Quand je demande la probabilité implicite
- Alors l'opération échoue explicitement, le dévigging exigeant le marché complet

### Scénario : la méthode voyage avec le résultat
- Étant donné une probabilité implicite calculée
- Quand je lis le résultat
- Alors il porte le nom de la méthode appliquée et la valeur de l'overround retiré

### Scénario : deux méthodes disponibles et comparables
- Étant donné un même jeu de cotes fortement déséquilibré
- Quand j'applique la méthode multiplicative puis la méthode de Shin
- Alors les deux produisent des probabilités valides, et l'écart entre elles est exposé

## Périmètre technique

`libs/odds/domain` : `ImpliedProbability` portant méthode et overround, implémentations
multiplicative et Shin, tests sur des jeux de cotes réels de Ligue 1.

## Hors périmètre

Comparaison avec nos fréquences observées et calcul d'un écart exploitable (EPIC-06). Détection des
mouvements de cote. Agrégation multi-bookmakers.

## Objectif pédagogique

Overround, favorite-longshot bias, et la différence entre une probabilité de marché et une
probabilité estimée. Question à savoir traiter après : pourquoi la méthode multiplicative
sous-estime-t-elle systématiquement la probabilité des outsiders ?

## Journal

_(rempli par dev-senior)_
