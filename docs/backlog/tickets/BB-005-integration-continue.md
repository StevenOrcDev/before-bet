---
id: BB-005
titre: Intégration continue (typecheck, lint, test, build)
epic: EPIC-01
type: tech
statut: backlog
priorite: P1
estimation: S
depends_on: [BB-001, BB-004]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

Les garanties posées en BB-002 et BB-004 ne valent que si elles sont vérifiées à chaque push. Sur un
projet de portfolio, un badge CI vert est aussi une preuve de sérieux visible sans lire le code.

## Objectif

Toute branche poussée est vérifiée automatiquement, backlog compris.

## Critères d'acceptation

### Scénario : la vérification tourne sur chaque push
- Étant donné une branche poussée sur le dépôt distant
- Quand le workflow se déclenche
- Alors `typecheck`, `lint`, `test` et `build` s'exécutent et le résultat est visible sur la branche

### Scénario : un backlog incohérent casse la CI
- Étant donné un ticket dont le frontmatter référence un epic inexistant
- Quand la CI s'exécute
- Alors `node scripts/backlog.mjs` sort en code 1 et le workflow échoue

### Scénario : seul le code impacté est vérifié
- Étant donné une modification limitée à une seule lib
- Quand la CI s'exécute
- Alors seuls les projets affectés sont testés, via le graphe de dépendances Nx

## Périmètre technique

GitHub Actions, Node 22, cache pnpm, `nx affected`, service Postgres pour les tests d'intégration,
étape de validation du backlog.

## Hors périmètre

Déploiement, environnements de recette, publication d'images Docker.

## Objectif pédagogique

La différence entre une CI qui vérifie tout à chaque fois et une CI qui exploite un graphe de
dépendances. Question à savoir traiter après : que se passe-t-il si `nx affected` se trompe, et
comment s'en protéger sur la branche principale ?

## Journal

_(rempli par dev-senior)_
