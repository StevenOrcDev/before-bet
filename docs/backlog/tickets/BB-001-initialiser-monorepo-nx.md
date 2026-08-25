---
id: BB-001
titre: Initialiser le monorepo Nx, pnpm et TypeScript strict
epic: EPIC-01
type: tech
statut: done
priorite: P0
estimation: M
depends_on: []
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

Rien n'existe encore. Le choix du monorepo Nx n'est pas cosmétique : il apporte le graphe de
dépendances entre libs et la règle de lint qui interdira les imports interdits (BB-002). Poser cette
structure sur 4 fichiers coûte une demi-journée, la poser sur 400 est une refonte.

## Objectif

Un dépôt où `pnpm typecheck && pnpm lint && pnpm test && pnpm build` passe sur une structure vide
mais correctement découpée.

## Critères d'acceptation

### Scénario : le squelette existe et compile
- Étant donné un dépôt fraîchement cloné
- Quand j'exécute `pnpm install` puis `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
- Alors les quatre commandes sortent en code 0

### Scénario : le TypeScript est réellement strict
- Étant donné un fichier qui indexe un tableau sans vérifier la borne
- Quand j'exécute `pnpm typecheck`
- Alors la compilation échoue, car `noUncheckedIndexedAccess` est actif

### Scénario : la structure reflète les bounded contexts
- Étant donné le dépôt initialisé
- Quand je liste `apps/` et `libs/`
- Alors j'y trouve `apps/api`, `apps/worker`, `apps/web` et un dossier par contexte sous `libs/`,
  chacun découpé en `domain`, `application`, `infrastructure`

## Périmètre technique

Nx + pnpm workspaces, Node 22, ESM. `tsconfig.base.json` avec `strict`,
`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`. Générateurs Nx
pour les apps NestJS et React. Prettier et ESLint de base. Les libs sont créées vides (un
`index.ts` exportant un placeholder suffit).

## Hors périmètre

Les règles de frontières ESLint (BB-002). Docker (BB-003). Testcontainers (BB-004). Toute logique
métier. Le CI (BB-005).

## Objectif pédagogique

Comprendre pourquoi le découpage physique en libs précède le code : c'est lui qui rend les
frontières vérifiables. Question à savoir traiter après : pourquoi `libs/<contexte>/domain` plutôt
qu'un unique `libs/domain` partagé par tous les contextes ?

## Journal

**2026-08-25 — dev-senior**

Les trois critères d'acceptation sont couverts. Sortie de vérification :

```
$ pnpm typecheck && pnpm lint && pnpm test && pnpm build
$ tsc -p tsconfig.json --noEmit
$ eslint .
$ vitest run
 Test Files  1 passed (1)
      Tests  1 passed (1)
$ tsc -p tsconfig.build.json
```

Structure créée : `apps/api`, `apps/worker`, `apps/web`, et `libs/<contexte>/{domain,application,
infrastructure}` pour les six contextes, plus `libs/shared/{kernel,testing}`. 23 projets Nx déclarés
avec leurs tags (`type:domain`, `context:market-analytics`, …) — c'est ce que `BB-002` consommera.

Le critère 2 (« le TypeScript est réellement strict ») est prouvé par un test, pas par la présence
d'options dans un fichier : `tools/strictness-fixtures/` contient un fichier conçu pour échouer, et
`strictness.spec.ts` compile ce fichier et vérifie que `tsc` renvoie bien `TS18048`. Une option de
compilation non prouvée peut disparaître d'un refactoring sans que personne ne le voie.

**Trois écarts par rapport au plan initial, tous imposés par l'écosystème :**

1. **TypeScript 6, pas 7.** TS 7 (compilateur natif) est sorti, mais `typescript-eslint` ne le
   supporte pas encore et `eslint .` plante à l'import. Comme toute l'architecture du projet repose
   sur des règles de lint (`BB-002`), c'est le compilateur qui recule. Noté dans `CLAUDE.md`,
   à réévaluer plus tard.
2. **`baseUrl` supprimé.** TS 7 l'a retiré ; j'avais déjà migré les `paths` en relatif avant de
   redescendre en TS 6, et je garde cette forme — elle marche sur les deux versions.
3. **`allowBuilds` dans `pnpm-workspace.yaml`.** pnpm 11 ne lit plus le champ `pnpm` de
   `package.json`. Sans cette autorisation, chaque `pnpm run` échoue avant même de lancer la commande.

**Écarts de périmètre assumés :**

- Monorepo Nx en style *integrated* : un seul `package.json` à la racine, les libs sont résolues par
  alias TypeScript (`@bb/market-analytics-domain`). Pas de `package.json` par lib tant qu'aucune n'a
  ses propres dépendances — vingt manifestes à maintenir pour rien.
- `pnpm build` compile les sources TypeScript vers `dist/`. Les vrais builds d'applications (NestJS,
  Vite) viendront quand les apps seront câblées ; aujourd'hui ce sont des placeholders.
- Les fichiers `*.spec.ts` ne sont pas encore couverts par `pnpm typecheck` (exclus du tsconfig).
  C'est le périmètre de `BB-004`, qui doit ajouter un `tsconfig.spec.json`.

**Bonus non demandé, mais gratuit :** la règle de lint interdisant `new Date()` et `Date.now()` dans
`libs/*/domain` est déjà en place. Elle était un critère d'acceptation de `BB-004` — à signaler à
`po-tech` pour qu'il l'y retire.

## Ce que j'ai appris

Une option de compilation stricte n'a de valeur que si un test prouve qu'elle est active : sinon
elle disparaît silencieusement au premier réglage de config. C'est le principe de la *fitness
function* — une contrainte d'architecture vérifiée automatiquement.

Retenir aussi l'arbitrage du jour : entre la dernière version du compilateur et un linter qui
fonctionne, on garde le linter, parce que c'est lui qui protège l'architecture. Choisir une version
d'outil, c'est choisir ce qu'on accepte de perdre.
