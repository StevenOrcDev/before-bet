---
id: EPIC-07
titre: API publique
statut: backlog
priorite: P2
---

## Objectif

Exposer les dossiers de pari via une API HTTP stable, documentée et versionnée.

## Périmètre

NestJS 11, validation zod aux frontières, DTO distincts des entités de domaine, OpenAPI généré,
authentification, quotas par utilisateur, cache Redis dont la clé inclut la version des règles et l'`asOf`.

## Hors périmètre

Calcul lourd dans le chemin de la requête : l'API lit des résultats précalculés par le worker.

## Critères de sortie

- Aucune entité de domaine ni entité ORM n'apparaît dans une réponse HTTP.
- Un dossier est servi en moins de 300 ms au p95 sur données chaudes.
- Le contrat OpenAPI est généré à partir des schémas, jamais écrit à la main.

## Tickets

BB-060 a BB-066
