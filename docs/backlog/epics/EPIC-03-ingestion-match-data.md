---
id: EPIC-03
titre: Ingestion des faits de match (match-data)
statut: backlog
priorite: P1
---

## Objectif

Disposer des faits bruts et horodatés d'un match : score, buts avec leur minute, cartons,
compositions, statistiques par équipe et par joueur.

## Pourquoi

C'est la matière première. La qualité du produit final est plafonnée par la qualité de cette couche :
un but mal horodaté fausse tous les marchés temporels.

## Périmètre

Port `MatchDataSource`, adapter football-data.co.uk, jobs d'import **idempotents et rejouables**,
validation de schéma, rapport de qualité, détection des anomalies (score incohérent avec les buts).

## Hors périmètre

Calcul de statistiques dérivées. L'ingestion stocke des faits, pas des interprétations.

## Critères de sortie

- Rejouer deux fois le même import ne crée ni doublon ni écart.
- Un fichier source corrompu est rejeté avec un diagnostic exploitable, sans corrompre la base.
- Chaque enregistrement porte sa source, sa date d'ingestion et sa version de schéma.

## Tickets

BB-040 a BB-046
