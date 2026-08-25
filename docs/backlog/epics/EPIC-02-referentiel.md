---
id: EPIC-02
titre: Référentiel (catalog)
statut: backlog
priorite: P0
---

## Objectif

Savoir de quoi on parle : compétitions, saisons, équipes, joueurs, matchs — avec des identifiants
stables et une réconciliation explicite entre sources.

## Pourquoi

Deux sources n'ont ni le même identifiant pour le PSG, ni la même orthographe pour un joueur. Sans
référentiel maître, toute statistique agrège des entités qui ne sont pas les mêmes. C'est le bug
silencieux le plus coûteux de ce type de projet.

## Périmètre

Agrégats `Competition`, `Season`, `Team`, `Player`, `Fixture`. Schéma Postgres. Table de mapping
`source_ref` versionnée. Import du référentiel Ligue 1 sur 5 saisons.

## Hors périmètre

Statistiques, événements de match, cotes.

## Critères de sortie

- Une équipe a un identifiant interne unique, relié à N identifiants de sources externes.
- Un rapport listant les entités non réconciliées est produit à chaque import.
- Le référentiel Ligue 1 (5 saisons) est importé et testé.

## Tickets

BB-030 a BB-035
