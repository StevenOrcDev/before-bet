# before-bet

## Ce qu'on construit

Une application d'aide à la décision pour parieurs sportifs, marché français.

L'utilisateur ne part pas d'un match, il part d'un **marché de pari précis** — « plus de 1,5 but sur
PSG–Lens », « les deux équipes marquent », « Mbappé + de 2,5 tirs cadrés ». En retour il obtient un
**dossier statistique honnête** : à quelle fréquence ce pari s'est réalisé dans des contextes
comparables, sur quel échantillon, avec quelle incertitude, et comment cette fréquence se situe face
à la probabilité implicite de la cote proposée.

On ne vend pas un pronostic. On vend de la **lisibilité statistique**.

### Le contre-exemple qui définit le produit

Ce que font les autres : « +1,5 but : 8 des 10 derniers matchs → 80 % ✅ ».

Ce qu'on fait :

> **+1,5 but — PSG vs Lens**
> Fréquence observée : **78 %** sur **41 matchs comparables** (IC 95 % Wilson : 63 %–88 %).
> Cote 1,28 → probabilité implicite **75 %** après retrait de la marge bookmaker (overround 6,2 %).
> Écart estimé : **+3 pts**, non significatif au vu de l'intervalle.
> ⚠️ 12 des 41 matchs se sont joués sans le buteur principal de Lens. Sur l'échantillon restreint
> (29 matchs), la fréquence tombe à 71 %.
> Base de référence Ligue 1 2024-25 : 74 % — cette affiche n'est pas atypique.

La valeur du produit est dans les **avertissements**, la **taille d'échantillon** et l'**incertitude**,
pas dans le pourcentage.

## Principes non négociables

1. **Aucun chiffre sans son échantillon ni son incertitude.** Un taux affiché sans `n` ni intervalle
   de confiance est un bug produit, pas un détail d'UI.
2. **Aucune fuite temporelle.** Une statistique calculée pour un match du 12 mars n'utilise que des
   données connues avant le coup d'envoi. Toute requête d'analyse est bornée par un `asOf`.
3. **Une cote n'est pas une probabilité.** `1/cote` inclut la marge du bookmaker. Toute comparaison
   passe par un dévigging explicite et documenté (méthode nommée dans la réponse API).
4. **Un marché a des règles de résolution écrites.** « +1,5 but » = buts du temps réglementaire,
   prolongations exclues. Ces règles vivent dans le domaine, sont testées, et sont opposables.
5. **Traçabilité.** Toute statistique servie expose : source des données, période couverte, filtres
   appliqués, version de la règle de résolution, date de dernier rafraîchissement.
6. **Pas de conseil de pari.** Le produit décrit le passé et l'incertitude. Il ne dit jamais « parie ».
   Mentions légales, 18+, message de jeu responsable, cadre ANJ : traités comme des exigences
   fonctionnelles, pas comme du décor.

## Découpage en bounded contexts (DDD)

| Contexte | Type | Responsabilité |
|---|---|---|
| `catalog` | supporting | Référentiel : Sport, Competition, Season, Team, Player, Fixture. Réconciliation des identifiants entre sources. |
| `match-data` | supporting | Faits d'un match : score, événements horodatés, compositions, stats joueurs. Ingestion + qualité de la donnée. |
| `odds` | supporting | Cotes par bookmaker, historique des mouvements, dévigging, probabilités implicites. |
| `market-analytics` | **core** | Définition des marchés, règles de résolution, calcul des fréquences, splits contextuels, intervalles de confiance, base rates. C'est ici que se trouve la valeur. |
| `brief` | core | Composition du dossier utilisateur : sélection des angles pertinents, génération des avertissements, hiérarchisation. |
| `identity` | generic | Comptes, favoris, quotas, abonnement. |

Règle : les contextes communiquent par **contrats explicites** (use-cases ou événements), jamais par
imports croisés d'entités. `market-analytics` ne connaît pas les tables de `match-data`, il connaît
un port.

## Architecture cible

Monorepo **Nx** (choix assumé : les frontières de dépendances sont vérifiées par
`@nx/enforce-module-boundaries` — une archi qu'un lint fait respecter ne pourrit pas).

```
apps/
  api/                    NestJS — composition root, HTTP, auth, DTO d'entrée/sortie
  worker/                 NestJS standalone — jobs BullMQ (ingestion, recalculs, snapshots)
  web/                    React 19 + Vite + TanStack Router/Query
libs/
  <context>/domain        entités, value objects, agrégats, invariants. AUCUNE dépendance framework.
  <context>/application   use-cases, ports (interfaces), DTO applicatifs
  <context>/infrastructure adapters : repositories Drizzle, clients HTTP, cache Redis
  shared/kernel           Result<T,E>, Probability, Odds, DateRange, SampleSize, ConfidenceInterval
  shared/testing          builders, fixtures, horloge figée
```

Sens des dépendances : `infrastructure -> application -> domain`. Jamais l'inverse. `domain` n'importe
ni NestJS, ni Drizzle, ni zod. Les décorateurs Nest s'arrêtent à la couche `infrastructure` et aux
controllers.

## Stack et conventions

- Node 22 LTS, TypeScript strict (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), ESM.
- Back : NestJS 11. Validation d'entrée : zod (+ pipe custom), pas de `class-validator` sur le domaine.
- Données : PostgreSQL 17 + **Drizzle** (SQL-first, aucune magie qui fuit dans le domaine). Redis (cache + BullMQ).
- Front : React 19, Vite, TanStack Router + TanStack Query, Tailwind. Dataviz : Visx ou Observable Plot.
- Tests : Vitest partout. Testcontainers pour l'intégration Postgres. Playwright pour l'E2E critique.
- Erreurs : `Result<T, E>` dans domain/application ; exceptions uniquement aux frontières HTTP.
- Interdits : `any`, `as` sans commentaire justificatif, `catch {}` muet, classes `*Manager`/`*Helper`.
- Commandes : `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`. Une tâche n'est pas terminée
  tant que `pnpm typecheck && pnpm lint && pnpm test` n'est pas vert.
- Commits : Conventional Commits, atomiques (`feat(market-analytics): add wilson interval`).

## Données

Démarrage sur sources ouvertes (football-data.co.uk pour les résultats et cotes de clôture,
StatsBomb Open Data pour les événements détaillés) avant tout contrat payant. Toute source est
encapsulée derrière un port : changer de fournisseur ne doit toucher que `infrastructure`.
Scraper un bookmaker est hors sujet — conditions d'utilisation et fiabilité.

## Méthode de travail

1. Explorer avant d'écrire. Les décisions déjà prises vivent dans `docs/adr/`.
2. Toute tâche non triviale commence par un plan (fichiers touchés, impacts, risques) validé par moi.
3. Petits incréments testables. Tests unitaires sur `domain`/`application`, intégration sur `infrastructure`.
4. Toute décision structurante donne lieu à un ADR court : contexte, décision, alternatives écartées, conséquences.
5. Jamais supprimer un test ou désactiver une règle de lint pour « faire passer ». Expliquer le problème.

## Objectif secondaire assumé : montée en compétence

Je suis développeur JS confirmé. Ce projet est aussi une vitrine et un support de formation sur
DDD, clean architecture, systèmes data et rigueur statistique. Les agents doivent **expliquer le
pourquoi**, nommer les patterns, exposer les alternatives écartées — pas seulement produire du code.

## Pilotage par tickets

Le projet avance ticket par ticket, façon Jira, mais dans le repo. La convention fait autorité :
`docs/backlog/README.md`. Le board est généré : `docs/backlog/INDEX.md`.

Règles valables pour toute session de travail :

- **Un seul ticket en cours à la fois.** On ouvre le ticket, on le fait, on le passe en `review`.
- **Aucun agent ne ferme un ticket.** Le passage `review` vers `done` est ma décision, à moi seul.
- Toute découverte hors périmètre ouvre un **nouveau ticket** en `backlog`. On ne l'ajoute jamais au
  ticket en cours : c'est ainsi que les estimations restent honnêtes.
- Une branche par ticket (`feat/BB-012-...`), un identifiant dans chaque commit
  (`feat(market-analytics): résout les marchés over/under [BB-012]`).
- Après toute modification du backlog : `node scripts/backlog.mjs` (régénère l'index et valide).
- Si un ticket n'est pas `ready`, on ne l'implémente pas : on le fait passer par `po-tech` d'abord.

## Délégation

| Besoin | Agent |
|---|---|
| Créer, découper, estimer, prioriser un ticket ; critères d'acceptation ; état d'avancement | **`po-tech`** |
| Conception, agrégats, ports, contrats, schéma de données, ADR, choix technos | **`architecte-senior`** |
| Implémentation, tests, refacto, debug, revue de code | **`dev-senior`** |

Ordre habituel sur un ticket non trivial : `po-tech` (le quoi) puis `architecte-senior` (le comment)
puis `dev-senior` (le faire) puis moi (la validation).
