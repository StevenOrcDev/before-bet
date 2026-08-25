---
id: BB-001
titre: Initialiser le monorepo Nx, pnpm et TypeScript strict
epic: EPIC-01
type: tech
statut: ready
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

_(rempli par dev-senior)_
