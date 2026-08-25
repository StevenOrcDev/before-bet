---
id: BB-002
titre: Rendre les frontières de dépendances vérifiables par le lint
epic: EPIC-01
type: tech
statut: backlog
priorite: P0
estimation: S
depends_on: [BB-001]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

Une architecture décrite dans un document se dégrade en silence. Une architecture vérifiée par un
lint qui casse la CI ne se dégrade pas. C'est le ticket qui transforme `CLAUDE.md` en contrainte
exécutable, et c'est un des meilleurs arguments à présenter en entretien sur ce projet.

## Objectif

Un import qui viole le sens des dépendances fait échouer `pnpm lint`.

## Critères d'acceptation

### Scénario : le domaine ne peut pas importer un framework
- Étant donné un fichier dans `libs/market-analytics/domain`
- Quand il importe `@nestjs/common`
- Alors `pnpm lint` échoue avec un message nommant la règle de frontière violée

### Scénario : une couche ne peut pas remonter
- Étant donné un fichier dans `libs/market-analytics/domain`
- Quand il importe depuis `libs/market-analytics/infrastructure`
- Alors `pnpm lint` échoue

### Scénario : deux contextes ne se voient pas directement
- Étant donné un fichier dans `libs/market-analytics/application`
- Quand il importe une entité de `libs/match-data/domain`
- Alors `pnpm lint` échoue, l'échange devant passer par un port

### Scénario : la règle est prouvée par un test
- Étant donné le dépôt
- Quand j'exécute la suite de tests
- Alors un test exécute le lint sur des fixtures d'imports interdits et vérifie qu'il échoue bien

## Périmètre technique

Tags Nx (`type:domain`, `type:application`, `type:infrastructure`, `context:<nom>`) posés dans les
`project.json`. Règle `@nx/enforce-module-boundaries` dans la config ESLint racine. Fixtures
d'imports interdits sous un dossier exclu du build.

## Hors périmètre

Les ports et interfaces réels entre contextes (ils viendront avec chaque contexte). Le CI (BB-005).

## Objectif pédagogique

Le concept de *fitness function* architecturale : une contrainte de conception automatiquement
vérifiée. Question à savoir traiter après : quelles autres règles de ce projet mériteraient d'être
transformées en test plutôt qu'en convention ?

## Journal

_(rempli par dev-senior)_
