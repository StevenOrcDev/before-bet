---
id: BB-012
titre: Règle de résolution Over/Under sur les buts
epic: EPIC-05
type: feature
statut: backlog
priorite: P0
estimation: M
depends_on: [BB-011]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

C'est le marché de référence du produit, celui de l'exemple fondateur (`+1.5 but`). Il a l'air
trivial et ne l'est pas : prolongations, buts contre son camp, buts annulés par la VAR, match
abandonné, ligne entière donnant un remboursement. Chacun de ces cas est une source de chiffre faux.

## Objectif

Une règle correcte et exhaustivement testée pour `OVER_UNDER` sur les buts totaux du temps
réglementaire.

## Critères d'acceptation

### Scénario : au-dessus de la ligne
- Étant donné un match terminé 2-1 en 90 minutes
- Quand j'applique le marché OVER 1.5
- Alors le verdict est `WON`

### Scénario : en dessous de la ligne
- Étant donné un match terminé 1-0
- Quand j'applique le marché OVER 1.5
- Alors le verdict est `LOST`

### Scénario : ligne entière atteinte exactement
- Étant donné un match terminé 1-1
- Quand j'applique le marché OVER 2.0
- Alors le verdict est `VOID`, le pari étant remboursé

### Scénario : les prolongations sont exclues
- Étant donné un match à 1-0 après 90 minutes et 3-0 après prolongation
- Quand j'applique le marché OVER 1.5
- Alors le verdict est `LOST`

### Scénario : les buts contre son camp comptent
- Étant donné un match dont l'unique but est un but contre son camp
- Quand j'applique le marché OVER 0.5
- Alors le verdict est `WON`

### Scénario : un but annulé ne compte pas
- Étant donné un match dont un but a été annulé après recours à la VAR
- Quand j'applique la règle
- Alors ce but est exclu du total

### Scénario : match abandonné
- Étant donné un match interrompu et non rejoué
- Quand j'applique la règle
- Alors le verdict est `VOID` et le motif est explicite

## Périmètre technique

Implémentation dans `libs/market-analytics/domain`, enregistrée dans le registre de BB-011. Tests
en table de cas couvrant les scénarios ci-dessus, bornes comprises.

## Hors périmètre

Over/Under sur d'autres statistiques (corners, cartons, tirs). Marchés par mi-temps. Marchés joueur.
Ces variantes réutiliseront la même mécanique dans des tickets dédiés.

## Objectif pédagogique

Pourquoi la richesse d'un domaine se révèle dans les cas limites, et comment une table de cas
protège une règle métier mieux qu'une batterie de tests rédigés au fil de l'eau. Question à savoir
traiter après : où doit vivre la règle "les prolongations sont exclues", et pourquoi pas dans le
service qui appelle la règle ?

## Journal

_(rempli par dev-senior)_
