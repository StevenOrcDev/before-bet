---
id: BB-011
titre: ResolutionRule versionnée et son registre
epic: EPIC-05
type: feature
statut: backlog
priorite: P0
estimation: M
depends_on: [BB-006, BB-010]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

Une règle de résolution dit, à partir des faits d'un match terminé, si un pari s'est réalisé. Elle
doit être versionnée : si la règle change (par exemple sur le traitement d'un match abandonné),
toutes les statistiques calculées avec l'ancienne version deviennent incomparables. Sans
versionnement, on sert des chiffres mélangés sans pouvoir le détecter.

## Objectif

Un contrat de règle de résolution, un registre qui associe chaque type de marché à sa règle, et une
version propagée jusqu'aux statistiques produites.

## Critères d'acceptation

### Scénario : une règle est une fonction pure
- Étant donné les faits d'un match terminé et un marché
- Quand j'applique la règle correspondante deux fois
- Alors j'obtiens le même verdict, sans accès à la base, au réseau ni à l'horloge système

### Scénario : le verdict couvre les cas non binaires
- Étant donné un marché résolu
- Quand je lis le verdict
- Alors il vaut `WON`, `LOST`, `VOID`, `HALF_WON` ou `HALF_LOST`, et jamais un booléen

### Scénario : données insuffisantes ne vaut pas perdu
- Étant donné un match dont les événements sont incomplets
- Quand j'applique une règle qui en a besoin
- Alors elle retourne un échec explicite de type "données insuffisantes", distinct de `LOST`

### Scénario : un marché sans règle est détecté au démarrage
- Étant donné un type de marché absent du registre
- Quand l'application démarre
- Alors le démarrage échoue en nommant le type manquant, plutôt que d'échouer à la première requête

### Scénario : la version voyage avec le résultat
- Étant donné un verdict produit par une règle en version 2
- Quand je lis le résultat
- Alors il porte l'identifiant et la version de la règle appliquée

## Périmètre technique

`libs/market-analytics/domain` : type `ResolutionRule`, type `MatchFacts` (contrat d'entrée minimal,
indépendant du schéma de `match-data`), verdicts, registre avec vérification d'exhaustivité à la
compilation.

## Hors périmètre

Les règles concrètes (BB-012, BB-013). La persistance des verdicts. La migration des statistiques
existantes lors d'un changement de version.

## Objectif pédagogique

Le pattern registre plus fonctions pures, et pourquoi le domaine définit son propre contrat
d'entrée (`MatchFacts`) au lieu de dépendre des entités d'un autre contexte. Question à savoir
traiter après : en quoi est-ce une couche anti-corruption ?

## Journal

_(rempli par dev-senior)_
