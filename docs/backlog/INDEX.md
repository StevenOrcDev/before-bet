# Board — before-bet

> Fichier **genere** par `node scripts/backlog.mjs`. Ne pas editer a la main :
> toute modification manuelle sera ecrasee. La source de verite est `tickets/` et `epics/`.

**16 tickets** repartis sur **9 epics**.

| backlog | ready | in-progress | review | done | blocked | dropped |
|---|---|---|---|---|---|---|
| 14 | 2 | 0 | 0 | 0 | 0 | 0 |

## Prochains tickets prets

- [BB-001](tickets/BB-001-initialiser-monorepo-nx.md) **Initialiser le monorepo Nx, pnpm et TypeScript strict** — P0, M
- [BB-010](tickets/BB-010-spike-modelisation-betting-market.md) **Spike et ADR - modélisation de BettingMarket** — P0, M

## Par epic

### [EPIC-01 — Socle technique](epics/EPIC-01-socle-technique.md)

Priorite P0 — 0/6 termines.

| id | titre | type | prio | est. | statut | depend de |
|---|---|---|---|---|---|---|
| [BB-001](tickets/BB-001-initialiser-monorepo-nx.md) | Initialiser le monorepo Nx, pnpm et TypeScript strict | tech | P0 | M | ready | — |
| [BB-002](tickets/BB-002-frontieres-de-dependances-lint.md) | Rendre les frontières de dépendances vérifiables par le lint | tech | P0 | S | backlog | BB-001 |
| [BB-003](tickets/BB-003-environnement-local-docker.md) | Environnement local Docker (Postgres, Redis) et configuration typée | tech | P1 | S | backlog | BB-001 |
| [BB-004](tickets/BB-004-socle-de-tests.md) | Socle de tests (Vitest, Testcontainers, horloge injectable) | tech | P0 | M | backlog | BB-001 |
| [BB-005](tickets/BB-005-integration-continue.md) | Intégration continue (typecheck, lint, test, build) | tech | P1 | S | backlog | BB-001, BB-004 |
| [BB-006](tickets/BB-006-kernel-partage.md) | Kernel partagé (Result, Probability, DateRange, SampleSize) | tech | P0 | M | backlog | BB-001 |

### [EPIC-02 — Référentiel (catalog)](epics/EPIC-02-referentiel.md)

Priorite P0 — 0/2 termines.

| id | titre | type | prio | est. | statut | depend de |
|---|---|---|---|---|---|---|
| [BB-030](tickets/BB-030-agregats-catalog-et-schema.md) | Agrégats du référentiel et schéma Postgres | feature | P0 | L | backlog | BB-003, BB-006 |
| [BB-031](tickets/BB-031-reconciliation-identifiants.md) | Réconciliation des identifiants entre sources | feature | P1 | M | backlog | BB-030 |

### [EPIC-03 — Ingestion des faits de match (match-data)](epics/EPIC-03-ingestion-match-data.md)

Priorite P1 — 0/0 termines.

_Aucun ticket redige. A decouper par `po-tech`._

### [EPIC-04 — Cotes et probabilités implicites (odds)](epics/EPIC-04-cotes-et-probabilites.md)

Priorite P1 — 0/2 termines.

| id | titre | type | prio | est. | statut | depend de |
|---|---|---|---|---|---|---|
| [BB-020](tickets/BB-020-value-object-odds.md) | Value object Odds et formats de cote | feature | P1 | S | backlog | BB-006 |
| [BB-021](tickets/BB-021-devigging-probabilite-implicite.md) | Dévigging et probabilité implicite | feature | P1 | M | backlog | BB-020 |

### [EPIC-05 — Moteur de marchés et statistiques (market-analytics)](epics/EPIC-05-moteur-de-marches.md)

Priorite P0 — 0/6 termines.

| id | titre | type | prio | est. | statut | depend de |
|---|---|---|---|---|---|---|
| [BB-010](tickets/BB-010-spike-modelisation-betting-market.md) | Spike et ADR - modélisation de BettingMarket | spike | P0 | M | ready | — |
| [BB-011](tickets/BB-011-resolution-rule-versionnee.md) | ResolutionRule versionnée et son registre | feature | P0 | M | backlog | BB-006, BB-010 |
| [BB-012](tickets/BB-012-regle-over-under-buts.md) | Règle de résolution Over/Under sur les buts | feature | P0 | M | backlog | BB-011 |
| [BB-013](tickets/BB-013-regle-btts.md) | Règle de résolution BTTS (les deux équipes marquent) | feature | P2 | S | backlog | BB-012 |
| [BB-014](tickets/BB-014-comparable-set.md) | ComparableSet - filtres contextuels et seuil de n minimal | feature | P0 | L | backlog | BB-012 |
| [BB-015](tickets/BB-015-market-stat-wilson.md) | MarketStat - fréquence, intervalle de Wilson et base rate | feature | P0 | M | backlog | BB-006 |

### [EPIC-06 — Dossier de pari (brief)](epics/EPIC-06-dossier-de-pari.md)

Priorite P1 — 0/0 termines.

_Aucun ticket redige. A decouper par `po-tech`._

### [EPIC-07 — API publique](epics/EPIC-07-api-publique.md)

Priorite P2 — 0/0 termines.

_Aucun ticket redige. A decouper par `po-tech`._

### [EPIC-08 — Application web](epics/EPIC-08-application-web.md)

Priorite P2 — 0/0 termines.

_Aucun ticket redige. A decouper par `po-tech`._

### [EPIC-09 — Conformité, jeu responsable et observabilité](epics/EPIC-09-conformite-et-observabilite.md)

Priorite P1 — 0/0 termines.

_Aucun ticket redige. A decouper par `po-tech`._

