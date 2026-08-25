---
id: EPIC-04
titre: Cotes et probabilités implicites (odds)
statut: backlog
priorite: P1
---

## Objectif

Transformer une cote de bookmaker en probabilité comparable à nos fréquences observées.

## Pourquoi

`1 / 1.28 = 78 %` est **faux**. La somme des inverses des cotes d'un même marché dépasse 1 : c'est
l'overround, la marge du bookmaker. Comparer une fréquence observée à `1/cote` compare deux choses
différentes et fabrique un avantage qui n'existe pas. C'est l'erreur qui décrédibilise le produit.

## Périmètre

Value objects `Odds` et `ImpliedProbability`, calcul d'overround, dévigging (méthode multiplicative
puis Shin), stockage historisé des cotes, mouvements de cote dans le temps.

## Hors périmètre

Comparaison avec nos fréquences (EPIC-06) et intégration d'un fournisseur payant.

## Critères de sortie

- La méthode de dévigging appliquée est nommée dans toute sortie exposant une probabilité implicite.
- Les probabilités dévigguées d'un marché somment à 1 (tolérance flottante près), prouvé par test.
- Une cote historisée est interrogeable à une date donnée (`asOf`).

## Tickets

BB-020 a BB-024
