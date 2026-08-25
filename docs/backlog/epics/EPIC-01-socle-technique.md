---
id: EPIC-01
titre: Socle technique
statut: backlog
priorite: P0
---

## Objectif

Un monorepo dans lequel l'architecture est **vérifiée par la machine**, pas seulement écrite dans un
document. À la fin de cet epic, un import interdit (`domain` qui importe NestJS) fait échouer le lint.

## Pourquoi maintenant

C'est le seul epic dont le coût explose si on le repousse. Poser les frontières sur 4 fichiers est
gratuit ; les poser sur 400 est un chantier de refonte.

## Périmètre

Monorepo Nx + pnpm, TypeScript strict, règles de frontières ESLint, environnement local Docker
(Postgres + Redis), socle de tests (Vitest, Testcontainers, horloge injectable), CI, kernel partagé.

## Hors périmètre

Toute logique métier. Aucun endpoint, aucune table de données de match.

## Critères de sortie

- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` vert en local et en CI.
- Un import violant le sens des dépendances échoue au lint, avec un test qui le prouve.
- `docker compose up` donne un Postgres et un Redis exploitables en une commande.

## Tickets

BB-001 a BB-006
